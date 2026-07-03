/**
 * WRD · Operating Room live chat API
 * rspdan.com/api/wrd
 *
 * The live OR chat backing rspdan.com/wrd. Every seat (Dan, BLNCH, Chad on TRP0, Olo)
 * logs in as the Operating Room with one shared token and chats in near-real-time.
 * Replaces the git-file + Gmail hand-relay for live coordination.
 *
 * GET  /api/wrd?since=<ts>&token=<OR token>
 *      Returns messages with ts > since (all messages if since omitted/0).
 *      Response: { ok, messages: [{id, seat, text, ts}], count, latest }
 *      Poll with since=<latest from previous response> for a near-real-time feed.
 *
 * THE LOG (Pass-2 · the floor · NOTHING-GETS-LOST · Dan-direct 070326 "WRD
 * needs a Log. If we start working there and SpecTrap ourselves out of a
 * floor I'll shit"):
 *
 * GET  /api/wrd?log=full&token=...&start=<ts>&limit=<n>
 *      The COMPLETE history from Redis (never trimmed), oldest first.
 *      Paginate with start=<latest from previous page>. Default limit 1000.
 * GET  /api/wrd?log=md&token=...
 *      The complete history as a markdown transcript (text/markdown), ready
 *      to fold into the Bridge as substrate-of-record.
 * GET  /api/wrd?log=blob&token=...&cursor=<c>
 *      Rebuilds the history from the Vercel Blob mirror. This path works even
 *      after a total Redis wipe; it is the second, independent floor.
 * GET  /api/wrd?log=status&token=...
 *      Floor health: Redis message count + whether the Blob mirror is armed.
 *
 * POST /api/wrd   body: {"seat": "...", "text": "...", "token": "..."}
 *      Appends one message. Response: { ok, id, ts, floor }
 *
 * Token may also arrive via x-or-token header, Authorization: Bearer, or ?token=.
 *
 * Auth ("log in as the Operating Room"): one shared token compared against
 * OR_SHARED_TOKEN (set in the Vercel dashboard). Until OR_SHARED_TOKEN is set,
 * falls back to NEST_API_KEY (already provisioned for /api/relay and /api/search)
 * so the room works day one. Fails closed if neither env var is set.
 *
 * Store (Pass-2, the DRW pattern mirrored): Upstash Redis sorted set
 * `wrd:or:messages` (score = ts, member = JSON), same store that backs
 * /api/relay and /api/drw. The Pass-1 trim is REMOVED: the relay channels
 * (ch:*) are never trimmed and DRW's index is never trimmed; WRD now matches.
 * Redis holds the full history. AND, exactly like /api/drw persists every
 * drawing to Vercel Blob (`drw/<day>/<user>_<ts>.png` + JSON sidecar), every
 * WRD message is mirrored to Blob at `wrd/<day>/<ts>_<seat>.json` when
 * BLOB_READ_WRITE_TOKEN is set. Two independent floors + a documented export:
 * if Redis is wiped, ?log=blob still returns the conversation; if Blob is not
 * yet provisioned, Redis still holds everything and ?log=md folds it to the
 * Bridge. The Blob mirror is additive and never blocks a send.
 *
 * Olo 070326 · Pass-2 (Pass-1 was polling live chat; Pass-2 adds the log floor)
 */

export const prerender = false;

import { Redis } from '@upstash/redis';
import { put, list } from '@vercel/blob';

const JSON_HEADERS = { 'Content-Type': 'application/json' };
const KEY = 'wrd:or:messages';
const MAX_SEAT_LEN = 32;
const MAX_TEXT_LEN = 4000;
const GET_LIMIT = 200; // max messages returned per live-feed GET
const LOG_PAGE_LIMIT = 1000; // max messages per ?log=full page
const BLOB_PREFIX = 'wrd/'; // mirror namespace, sibling of drw/

function getRedis() {
  const url = import.meta.env.UPSTASH_REDIS_REST_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = import.meta.env.UPSTASH_REDIS_REST_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error('redis not configured');
  return new Redis({ url, token });
}

function blobToken() {
  return import.meta.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN || '';
}

// Shared OR token. Primary: OR_SHARED_TOKEN. Fallback: NEST_API_KEY (already live
// in Vercel for /api/relay + /api/search) so the room works before Dan sets the
// dedicated var. Fails closed: if neither is set, every request 401s.
function expectedToken() {
  return (
    import.meta.env.OR_SHARED_TOKEN || process.env.OR_SHARED_TOKEN ||
    import.meta.env.NEST_API_KEY || process.env.NEST_API_KEY ||
    ''
  );
}

function extractToken(request, url, body) {
  return (
    (body && typeof body.token === 'string' && body.token) ||
    request.headers.get('x-or-token') ||
    request.headers.get('authorization')?.replace('Bearer ', '') ||
    url.searchParams.get('token') ||
    ''
  );
}

function authorized(request, url, body) {
  const expected = expectedToken();
  if (!expected) return false; // fail closed
  return extractToken(request, url, body) === expected;
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}

function clampText(value, max) {
  return (value ?? '').toString().slice(0, max);
}

function parseMember(r) {
  try { return typeof r === 'string' ? JSON.parse(r) : r; } catch { return null; }
}

// ---- THE LOG (the floor) ---------------------------------------------------

async function logFull(redis, url) {
  const start = parseInt(url.searchParams.get('start') || '0', 10) || 0;
  const limitRaw = parseInt(url.searchParams.get('limit') || String(LOG_PAGE_LIMIT), 10);
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), LOG_PAGE_LIMIT) : LOG_PAGE_LIMIT;
  const raw = await redis.zrange(KEY, start + 1, '+inf', { byScore: true });
  const page = raw.slice(0, limit).map(parseMember).filter(Boolean);
  const total = await redis.zcard(KEY);
  const latest = page.length ? page[page.length - 1].ts : start;
  return json({
    ok: true,
    log: 'full',
    messages: page,
    count: page.length,
    total,
    latest,
    complete: raw.length <= limit,
    next: raw.length > limit ? `/api/wrd?log=full&start=${latest}` : null,
  });
}

async function logMarkdown(redis) {
  const raw = await redis.zrange(KEY, 0, '+inf', { byScore: true });
  const messages = raw.map(parseMember).filter(Boolean);
  const lines = [
    '# WRD · Operating Room · full transcript',
    '',
    `Exported ${new Date().toISOString()} from rspdan.com/api/wrd?log=md`,
    `Messages: ${messages.length} · store: Upstash Redis \`${KEY}\` (never trimmed)`,
    '',
    'Fold this file into the Bridge (LOG/ or RELAY/) as substrate-of-record.',
    '',
    '---',
    '',
  ];
  let day = '';
  for (const m of messages) {
    const d = new Date(m.ts).toISOString();
    const mDay = d.slice(0, 10);
    if (mDay !== day) {
      day = mDay;
      lines.push(`## ${day}`, '');
    }
    lines.push(`**${m.seat}** \`${d.slice(11, 19)}Z\``, '', m.text, '');
  }
  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': `inline; filename="WRD_OR_transcript_${new Date().toISOString().slice(0, 10)}.md"`,
    },
  });
}

async function logFromBlob(url) {
  const token = blobToken();
  if (!token) {
    return json({ ok: false, error: 'blob mirror not armed · set BLOB_READ_WRITE_TOKEN in Vercel (already live for /api/drw)' }, 503);
  }
  const cursor = url.searchParams.get('cursor') || undefined;
  const { blobs, cursor: next, hasMore } = await list({ prefix: BLOB_PREFIX, limit: 500, cursor, token });
  const messages = [];
  for (const b of blobs) {
    if (!b.pathname.endsWith('.json')) continue;
    try {
      const res = await fetch(b.url);
      if (res.ok) {
        const m = await res.json();
        if (m && m.ts) messages.push(m);
      }
    } catch {}
  }
  messages.sort((a, b) => a.ts - b.ts);
  return json({
    ok: true,
    log: 'blob',
    note: 'rebuilt from the Vercel Blob mirror · survives a Redis wipe',
    messages,
    count: messages.length,
    hasMore: Boolean(hasMore),
    cursor: hasMore ? next : null,
  });
}

async function logStatus(redis) {
  const total = await redis.zcard(KEY);
  const oldestRaw = await redis.zrange(KEY, 0, 0);
  const newestRaw = await redis.zrange(KEY, -1, -1);
  const oldest = oldestRaw.length ? parseMember(oldestRaw[0]) : null;
  const newest = newestRaw.length ? parseMember(newestRaw[0]) : null;
  return json({
    ok: true,
    log: 'status',
    redis: { key: KEY, total, trimmed: false, oldest: oldest?.ts || null, newest: newest?.ts || null },
    blob: { armed: Boolean(blobToken()), prefix: BLOB_PREFIX },
    export: { full: '/api/wrd?log=full', markdown: '/api/wrd?log=md', blob: '/api/wrd?log=blob' },
  });
}

// ---- HTTP ------------------------------------------------------------------

export async function GET({ request, url }) {
  if (!authorized(request, url, null)) {
    return json({ ok: false, error: 'unauthorized · pass the OR shared token' }, 401);
  }

  let redis;
  try { redis = getRedis(); }
  catch { return json({ ok: false, error: 'store not configured · set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN in Vercel' }, 503); }

  const log = url.searchParams.get('log');
  try {
    if (log === 'full') return await logFull(redis, url);
    if (log === 'md') return await logMarkdown(redis);
    if (log === 'blob') return await logFromBlob(url);
    if (log === 'status') return await logStatus(redis);
  } catch (err) {
    return json({ ok: false, error: 'log read failed: ' + (err?.message || 'unknown') }, 502);
  }

  const since = parseInt(url.searchParams.get('since') || '0', 10) || 0;

  try {
    const raw = await redis.zrange(KEY, since + 1, '+inf', { byScore: true });
    const messages = [];
    for (const r of raw.slice(-GET_LIMIT)) {
      const m = parseMember(r);
      if (m) messages.push(m);
    }
    const latest = messages.length ? messages[messages.length - 1].ts : since;
    return json({ ok: true, messages, count: messages.length, latest, now: Date.now() });
  } catch (err) {
    return json({ ok: false, error: 'store read failed: ' + (err?.message || 'unknown') }, 502);
  }
}

export async function POST({ request, url }) {
  let body;
  try { body = await request.json(); }
  catch { return json({ ok: false, error: 'body must be JSON: {"seat","text","token"}' }, 400); }

  if (!authorized(request, url, body)) {
    return json({ ok: false, error: 'unauthorized · pass the OR shared token' }, 401);
  }

  const seat = clampText(body.seat, MAX_SEAT_LEN).trim();
  const text = clampText(body.text, MAX_TEXT_LEN).trim();
  if (!seat) return json({ ok: false, error: 'seat required' }, 400);
  if (!text) return json({ ok: false, error: 'text required' }, 400);

  let redis;
  try { redis = getRedis(); }
  catch { return json({ ok: false, error: 'store not configured · set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN in Vercel' }, 503); }

  const ts = Date.now();
  const safeSeat = seat.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  const id = `${ts}_${safeSeat}`;
  const message = { id, seat, text, ts };
  const msg = JSON.stringify(message);

  try {
    // Floor 1: Redis, full history, NEVER trimmed (the Pass-1 trim is removed;
    // this matches the relay ch:* channels and the DRW index, neither trims).
    await redis.zadd(KEY, { score: ts, member: msg });
  } catch (err) {
    return json({ ok: false, error: 'store write failed: ' + (err?.message || 'unknown') }, 502);
  }

  // Floor 2: the Blob mirror (the DRW pattern: one durable blob per item at
  // wrd/<day>/<ts>_<seat>.json). Additive; a mirror failure never blocks the
  // send, the response just says the mirror did not take.
  let mirror = 'off';
  const token = blobToken();
  if (token) {
    try {
      const day = new Date(ts).toISOString().slice(0, 10);
      await put(`${BLOB_PREFIX}${day}/${ts}_${safeSeat}.json`, msg, {
        access: 'public',
        contentType: 'application/json',
        addRandomSuffix: false,
        token,
      });
      mirror = 'mirrored';
    } catch {
      mirror = 'failed';
    }
  }

  return json({ ok: true, id, ts, floor: { redis: 'full', blob: mirror } });
}
