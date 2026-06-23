export const prerender = false;

import type { APIRoute } from 'astro';
import { Redis } from '@upstash/redis';
import { put } from '@vercel/blob';
import { verifySession } from '../../lib/pspt.js';

const redis = new Redis({
  url: import.meta.env.UPSTASH_REDIS_REST_URL,
  token: import.meta.env.UPSTASH_REDIS_REST_TOKEN,
});

const JSON_HEADERS = { 'Content-Type': 'application/json' };

// Mirror the writeMessage shape from api/relay/send.ts: a JSON message
// stored on ch:<to> by zadd, mirrored to ch:all.
async function writeMessage(from: string, to: string, content: string, type: string, context: string) {
  const ts = Date.now();
  const id = `${ts}_${from}`;
  const msg = JSON.stringify({ id, from, to, content, type, context, ts });
  await redis.zadd(`ch:${to}`, { score: ts, member: msg });
  if (to !== 'all') await redis.zadd('ch:all', { score: ts, member: msg });
  return { ok: true, id, ts };
}

// Decode a "data:image/png;base64,...." data URL into raw bytes.
function decodeDataUrl(dataUrl: string): { bytes: Buffer; contentType: string } | null {
  const match = /^data:([^;]+);base64,(.+)$/s.exec(dataUrl);
  if (!match) return null;
  const contentType = match[1];
  try {
    return { bytes: Buffer.from(match[2], 'base64'), contentType };
  } catch {
    return null;
  }
}

export const POST: APIRoute = async ({ request }) => {
  // Auth gate: PSPT session cookie only. The browser never holds NEST_API_KEY.
  const session = verifySession(request.headers.get('cookie'));
  if (!session) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: JSON_HEADERS });
  }

  const blobToken = import.meta.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN;
  if (!blobToken) {
    return new Response(JSON.stringify({ error: 'blob store not configured' }), { status: 503, headers: JSON_HEADERS });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'invalid json' }), { status: 400, headers: JSON_HEADERS });
  }

  const image: string | undefined = body?.image;
  const caption: string = (body?.caption || '').toString().slice(0, 500);
  if (!image || typeof image !== 'string') {
    return new Response(JSON.stringify({ error: 'image (png data url) required' }), { status: 400, headers: JSON_HEADERS });
  }

  const decoded = decodeDataUrl(image);
  if (!decoded || decoded.contentType !== 'image/png') {
    return new Response(JSON.stringify({ error: 'image must be a base64 png data url' }), { status: 400, headers: JSON_HEADERS });
  }

  // Guard against oversized uploads (~6MB of raw bytes).
  if (decoded.bytes.length > 6 * 1024 * 1024) {
    return new Response(JSON.stringify({ error: 'image too large' }), { status: 413, headers: JSON_HEADERS });
  }

  const ts = Date.now();
  const key = `room/${session.user}_${ts}.png`;

  let blobUrl: string;
  try {
    const blob = await put(key, decoded.bytes, {
      access: 'public',
      contentType: 'image/png',
      token: blobToken,
    });
    blobUrl = blob.url;
  } catch (err: any) {
    return new Response(JSON.stringify({ error: 'blob upload failed', detail: err?.message }), { status: 502, headers: JSON_HEADERS });
  }

  const content = caption ? `${blobUrl} ${caption}` : blobUrl;
  const result = await writeMessage(session.user, 'bridge', content, 'drawing', caption);

  return new Response(JSON.stringify({ ...result, url: blobUrl }), { headers: JSON_HEADERS });
};
