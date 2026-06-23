export const prerender = false;

import type { APIRoute } from 'astro';
import { Redis } from '@upstash/redis';
import { put } from '@vercel/blob';
import { verifySession } from '../../lib/pspt.js';

const JSON_HEADERS = { 'Content-Type': 'application/json' };
const DRAW_INDEX_KEY = 'drw:items';

function getRedis() {
  const url = import.meta.env.UPSTASH_REDIS_REST_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = import.meta.env.UPSTASH_REDIS_REST_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error('redis not configured');
  return new Redis({ url, token });
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}

function safeUser(user: string) {
  return user.toLowerCase().replace(/[^a-z0-9_-]/g, '-').slice(0, 32) || 'operator';
}

function decodeDataUrl(dataUrl: string): { bytes: Buffer; contentType: string } | null {
  const match = /^data:([^;]+);base64,(.+)$/s.exec(dataUrl);
  if (!match) return null;
  try {
    return { bytes: Buffer.from(match[2], 'base64'), contentType: match[1] };
  } catch {
    return null;
  }
}

async function writeRelay(redis: Redis, from: string, content: string, context: string) {
  const ts = Date.now();
  const id = `${ts}_${from}`;
  const msg = JSON.stringify({ id, from, to: 'bridge', content, type: 'drawing', context, ts });
  await redis.zadd('ch:bridge', { score: ts, member: msg });
  await redis.zadd('ch:all', { score: ts, member: msg });
  return { id, ts };
}

export const GET: APIRoute = async ({ request, url }) => {
  const session = verifySession(request.headers.get('cookie'));
  if (!session) return json({ error: 'unauthorized' }, 401);

  let redis: Redis;
  try {
    redis = getRedis();
  } catch (err: any) {
    return json({ error: 'drawing index not configured', detail: err?.message }, 503);
  }

  const limitRaw = parseInt(url.searchParams.get('limit') || '24', 10);
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 50) : 24;
  const raw = await redis.zrange(DRAW_INDEX_KEY, 0, limit - 1, { rev: true });
  const drawings = raw
    .map((entry: any) => {
      try { return typeof entry === 'string' ? JSON.parse(entry) : entry; }
      catch { return null; }
    })
    .filter(Boolean);

  return json({ ok: true, drawings });
};

export const POST: APIRoute = async ({ request }) => {
  const session = verifySession(request.headers.get('cookie'));
  if (!session) return json({ error: 'unauthorized' }, 401);

  let redis: Redis;
  try {
    redis = getRedis();
  } catch (err: any) {
    return json({ error: 'relay store not configured', detail: err?.message }, 503);
  }

  const blobToken = import.meta.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN;
  if (!blobToken) return json({ error: 'blob store not configured' }, 503);

  let body: any;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'invalid json' }, 400);
  }

  const image: string | undefined = body?.image;
  const caption = (body?.caption || '').toString().slice(0, 500);
  if (!image || typeof image !== 'string') return json({ error: 'image png data url required' }, 400);

  const decoded = decodeDataUrl(image);
  if (!decoded || decoded.contentType !== 'image/png') return json({ error: 'image must be a base64 png data url' }, 400);
  if (decoded.bytes.length > 6 * 1024 * 1024) return json({ error: 'image too large' }, 413);

  const ts = Date.now();
  const user = safeUser(session.user);
  const day = new Date(ts).toISOString().slice(0, 10);
  const key = `drw/${day}/${user}_${ts}.png`;

  let blobUrl: string;
  try {
    const blob = await put(key, decoded.bytes, {
      access: 'public',
      contentType: 'image/png',
      token: blobToken,
    });
    blobUrl = blob.url;
  } catch (err: any) {
    return json({ error: 'blob upload failed', detail: err?.message }, 502);
  }

  const item = {
    id: `drw_${ts}_${user}`,
    url: blobUrl,
    key,
    caption,
    user,
    ts,
    createdAt: new Date(ts).toISOString(),
    bytes: decoded.bytes.length,
  };

  await redis.zadd(DRAW_INDEX_KEY, { score: ts, member: JSON.stringify(item) });
  const relayContent = caption ? `[DRW] ${blobUrl} :: ${caption}` : `[DRW] ${blobUrl}`;
  const relay = await writeRelay(redis, user, relayContent, 'rspdan.com/drw');

  return json({ ok: true, drawing: item, relay });
};
