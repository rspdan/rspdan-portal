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
 * POST /api/wrd   body: {"seat": "...", "text": "...", "token": "..."}
 *      Appends one message. Response: { ok, id, ts }
 *
 * Token may also arrive via x-or-token header, Authorization: Bearer, or ?token=.
 *
 * Auth ("log in as the Operating Room"): one shared token compared against
 * OR_SHARED_TOKEN (set in the Vercel dashboard). Until OR_SHARED_TOKEN is set,
 * falls back to NEST_API_KEY (already provisioned for /api/relay and /api/search)
 * so the room works day one. Fails closed if neither env var is set.
 *
 * Store: Upstash Redis sorted set `wrd:or:messages` (score = ts, member = JSON),
 * same UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN store that already backs
 * /api/relay and /api/drw. Persists across serverless invocations; feed is trimmed
 * to the most recent MAX_MESSAGES so the key stays bounded.
 *
 * Olo 070326 · Pass-1 (polling; SSE/websocket is a stretch goal, see PR body)
 */

export const prerender = false;

import { Redis } from '@upstash/redis';

const JSON_HEADERS = { 'Content-Type': 'application/json' };
const KEY = 'wrd:or:messages';
const MAX_MESSAGES = 500; // keep the room bounded; older messages roll off
const MAX_SEAT_LEN = 32;
const MAX_TEXT_LEN = 4000;
const GET_LIMIT = 200; // max messages returned per GET

function getRedis() {
  const url = import.meta.env.UPSTASH_REDIS_REST_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = import.meta.env.UPSTASH_REDIS_REST_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error('redis not configured');
  return new Redis({ url, token });
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

export async function GET({ request, url }) {
  if (!authorized(request, url, null)) {
    return json({ ok: false, error: 'unauthorized · pass the OR shared token' }, 401);
  }

  let redis;
  try { redis = getRedis(); }
  catch { return json({ ok: false, error: 'store not configured · set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN in Vercel' }, 503); }

  const since = parseInt(url.searchParams.get('since') || '0', 10) || 0;

  try {
    const raw = await redis.zrange(KEY, since + 1, '+inf', { byScore: true });
    const messages = [];
    for (const r of raw.slice(-GET_LIMIT)) {
      try { messages.push(typeof r === 'string' ? JSON.parse(r) : r); } catch {}
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
  const id = `${ts}_${seat.toLowerCase().replace(/[^a-z0-9_-]/g, '-')}`;
  const msg = JSON.stringify({ id, seat, text, ts });

  try {
    await redis.zadd(KEY, { score: ts, member: msg });
    // Trim: keep only the newest MAX_MESSAGES members.
    await redis.zremrangebyrank(KEY, 0, -(MAX_MESSAGES + 1));
    return json({ ok: true, id, ts });
  } catch (err) {
    return json({ ok: false, error: 'store write failed: ' + (err?.message || 'unknown') }, 502);
  }
}
