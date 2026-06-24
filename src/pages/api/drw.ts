export const prerender = false;

import type { APIRoute } from 'astro';
import { Redis } from '@upstash/redis';
import { put } from '@vercel/blob';
import { verifySession } from '../../lib/pspt.js';

const JSON_HEADERS = { 'Content-Type': 'application/json' };
const DRAW_INDEX_KEY = 'drw:items';
const CONFIDENCE_VALUES = new Set(['observed', 'inferred', 'unverified', 'mixed']);
const DIMENSION_VALUES = new Set(['2D', '3D', '4D+', 'EEE']);

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

function clampText(value: unknown, max: number) {
  return (value || '').toString().slice(0, max);
}

function dataJsonUrl(value: unknown) {
  const jsonText = JSON.stringify(value, null, 2);
  return `data:application/json;base64,${Buffer.from(jsonText, 'utf8').toString('base64')}`;
}

function cleanDimensions(value: unknown): string[] {
  if (!Array.isArray(value)) return ['2D'];
  const tags = value
    .map((tag) => tag?.toString())
    .filter((tag): tag is string => Boolean(tag && DIMENSION_VALUES.has(tag)));
  return tags.length ? Array.from(new Set(tags)) : ['2D'];
}

function cleanConfidence(value: unknown) {
  const confidence = value?.toString().toLowerCase();
  return confidence && CONFIDENCE_VALUES.has(confidence) ? confidence : 'observed';
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

  let body: any;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'invalid json' }, 400);
  }

  const image: string | undefined = body?.image;
  const caption = clampText(body?.caption, 500);
  const coordinate = body?.coordinate && typeof body.coordinate === 'object' ? body.coordinate : {};
  if (!image || typeof image !== 'string') return json({ error: 'image png data url required' }, 400);

  const decoded = decodeDataUrl(image);
  if (!decoded || decoded.contentType !== 'image/png') return json({ error: 'image must be a base64 png data url' }, 400);
  if (decoded.bytes.length > 6 * 1024 * 1024) return json({ error: 'image too large' }, 413);

  const ts = Date.now();
  const user = safeUser(session.user);
  const day = new Date(ts).toISOString().slice(0, 10);
  const createdAt = new Date(ts).toISOString();
  const baseKey = `drw/${day}/${user}_${ts}`;
  const key = `${baseKey}.png`;
  const packetKey = `${baseKey}.coordinate.json`;
  const coordinateId = `HCUS-DRW-${day.replace(/-/g, '')}-${user}-${ts}`;

  let blobUrl = image;
  let storage: 'blob' | 'redis-inline' = 'redis-inline';

  if (blobToken) {
    try {
      const blob = await put(key, decoded.bytes, {
        access: 'public',
        contentType: 'image/png',
        token: blobToken,
      });
      blobUrl = blob.url;
      storage = 'blob';
    } catch (err: any) {
      return json({ error: 'blob upload failed', detail: err?.message }, 502);
    }
  }

  const dimensionTags = cleanDimensions(coordinate.dimensionTags);
  const confidence = cleanConfidence(coordinate.confidence);
  const resolver = clampText(coordinate.resolver, 240) || 'Operating Room cross-witness pending';
  const sourceContext = clampText(coordinate.sourceContext, 160) || 'rspdan.com/drw';
  const trace = clampText(coordinate.trace || caption, 500) || 'DRW drawing';
  const activeInk = clampText(coordinate.activeInk, 32);
  const activeTool = clampText(coordinate.activeTool, 24) || 'pen';
  const lineWidth = Number.isFinite(Number(coordinate.lineWidth)) ? Number(coordinate.lineWidth) : null;

  const packet = {
    coordinate_id: coordinateId,
    trace,
    source_surface: 'drw',
    operator: user,
    station: 'rspdan-portal',
    created_at: createdAt,
    dimension_tags: dimensionTags,
    color_or_key: {
      value: '',
      status: 'none',
    },
    source_lenses_read: [
      {
        path_or_id: sourceContext,
        surface: 'web',
        read_status: 'observed',
      },
    ],
    station_expansion: 'Drawing saved from /drw with PNG and Coordinate Packet sidecar.',
    evidence: [
      { kind: storage === 'blob' ? 'url' : 'data-url', value: blobUrl },
      { kind: 'path', value: key },
    ],
    confidence,
    resolver,
    build_gate: 'Promotion requires Operating Room cross-witness; no color/key canon assigned by save.',
    handoff: 'Operating Room relay and DRW recent list.',
    drw: {
      caption,
      activeInk,
      activeTool,
      lineWidth,
      bytes: decoded.bytes.length,
    },
  };

  let packetUrl = dataJsonUrl(packet);
  if (blobToken) {
    try {
      const sidecar = await put(packetKey, Buffer.from(JSON.stringify(packet, null, 2), 'utf8'), {
        access: 'public',
        contentType: 'application/json',
        token: blobToken,
      });
      packetUrl = sidecar.url;
    } catch (err: any) {
      return json({ error: 'coordinate packet upload failed', detail: err?.message }, 502);
    }
  }

  const item = {
    id: `drw_${ts}_${user}`,
    url: blobUrl,
    key,
    packetUrl,
    packetKey,
    storage,
    coordinateId,
    dimensionTags,
    confidence,
    caption,
    user,
    ts,
    createdAt,
    bytes: decoded.bytes.length,
  };

  await redis.zadd(DRAW_INDEX_KEY, { score: ts, member: JSON.stringify(item) });
  const relayContent = caption
    ? `[DRW] ${blobUrl} :: ${caption} :: packet ${packetUrl}`
    : `[DRW] ${blobUrl} :: packet ${packetUrl}`;
  const relay = await writeRelay(redis, user, relayContent, 'rspdan.com/drw');

  return json({ ok: true, drawing: item, coordinate: packet, relay });
};
