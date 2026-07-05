/**
 * RWD · Operating Room audio takes + the linked-worlds REWIND · rspdan.com/api/rwd
 *
 * The third face of the rspdan.com Operating System (Dan-direct 070426 6:47pm:
 * "rspdan.com/rwd is the 3rd version of this rspdan.com Operating System: use
 * the rspdan.com/drw and rspdan.com/wrd work... RWD is like rewind, and in my
 * mind we need an Audio tool to link up the worlds we have explored so far...
 * it also functions... as a console"). DRW draws, WRD is the room's words, RWD
 * is the room's SOUND and the REWIND across everything.
 *
 * Built from the WRD API pattern EXACTLY (same shared-OR-token auth, same
 * Redis-sorted-set + Vercel-Blob two-floor store never-trimmed, same log
 * endpoints), so one shared token opens all three live surfaces (the unify Dan
 * asked for). "messages" become "takes"; a take carries an audio blob.
 *
 * GET  /api/rwd?since=<ts>&token=<OR token>
 *      Live feed of takes with ts > since. { ok, takes:[{id,seat,caption,ts,url,
 *      storage,durationMs,mime,bytes,coordinateId}], count, latest, now }.
 *
 * GET  /api/rwd?timeline=<full|sinceTs>&worlds=rwd,wrd,drw&limit=<n>
 *      THE REWIND: a ts-ordered merge of the three never-trimmed room indexes
 *      (rwd:or:takes + wrd:or:messages + drw:items) on one clock. This is how
 *      RWD "links up the worlds we have explored so far" on one rewindable
 *      strip. Bounded per-world tail + clamped limit (never a full-union scan).
 *
 * GET  /api/rwd?take=<id>&token=...   one take record (the browser plays its
 *      public blob url directly; a server streaming proxy is a later option).
 *
 * THE LOG (the floor, the WRD pattern, NOTHING-GETS-LOST):
 * GET  /api/rwd?log=full&start=<ts>&limit=<n>   complete history, oldest first.
 * GET  /api/rwd?log=md      the take log as a markdown transcript for the Bridge.
 * GET  /api/rwd?log=blob&cursor=<c>   rebuilt from the Blob mirror (survives a
 *      Redis wipe; the per-take .coordinate.json sidecars are the second floor).
 * GET  /api/rwd?log=status  floor health: take count + whether Blob is armed.
 *
 * POST /api/rwd  body: {seat, audio:"data:audio/*;base64,...", caption?,
 *      coordinate?, durationMs?, mime?, token}
 *      Records one take. Response: { ok, take, coordinate, relay, floor, storage }.
 *
 * Token may also arrive via x-or-token header, Authorization: Bearer, or ?token=.
 * Auth: OR_SHARED_TOKEN primary -> NEST_API_KEY fallback -> fail closed (401).
 *
 * STN2 Doc-Olo 070426 · Pass-1 (audio + linked-worlds REWIND + the log floor)
 */

export const prerender = false;

import { Redis } from '@upstash/redis';
import { put, list } from '@vercel/blob';
import { decodeAudioDataUrl } from '../../lib/rwdAudio.js';

const JSON_HEADERS = { 'Content-Type': 'application/json' };
const KEY = 'rwd:or:takes';            // this face's index (sibling of wrd:or:messages, drw:items)
const WRD_KEY = 'wrd:or:messages';     // the words world, for the timeline merge
const DRW_KEY = 'drw:items';           // the drawings world, for the timeline merge
const MAX_SEAT_LEN = 32;
const MAX_CAPTION_LEN = 500;
const MAX_AUDIO_BYTES = 6 * 1024 * 1024; // ~6 min of opus; over -> 413. Matches DRW's proven Vercel body envelope (a larger audio's base64 body would exceed the serverless request limit). Prefer blob; inline is the fallback.
const GET_LIMIT = 200;                 // max takes returned per live-feed GET
const LOG_PAGE_LIMIT = 1000;           // max takes per ?log=full page
const TIMELINE_PER_WORLD = 200;        // bounded tail read per world (never a full scan)
const TIMELINE_DEFAULT_LIMIT = 300;    // merged events returned by default
const TIMELINE_MAX_LIMIT = 1000;
const BLOB_PREFIX = 'rwd/';            // mirror namespace, sibling of wrd/ + drw/

function getRedis() {
  const url = import.meta.env.UPSTASH_REDIS_REST_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = import.meta.env.UPSTASH_REDIS_REST_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error('redis not configured');
  return new Redis({ url, token });
}

function blobToken() {
  return import.meta.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN || '';
}

// Shared OR token, byte-equal to /api/wrd: OR_SHARED_TOKEN primary, NEST_API_KEY
// fallback (already live in Vercel for /api/relay + /api/search + /api/wrd), so
// one token opens all three faces. Fails closed: neither set -> every request 401s.
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

function safeSeat(seat) {
  return seat.toLowerCase().replace(/[^a-z0-9_-]/g, '-') || 'anon';
}

// decodeAudioDataUrl is imported from ../../lib/rwdAudio.js (extracted so the
// codecs-parameter behavior is unit-tested in src/lib/rwdAudio.test.mjs).

// Derive the file extension from the recorded mime (Chrome: audio/webm;codecs=opus,
// Safari: audio/mp4). Never hardcoded (SR23 open-risk: recorder mime varies by browser).
function extForMime(mime) {
  const m = (mime || '').toLowerCase();
  if (m.includes('webm')) return 'webm';
  if (m.includes('ogg') || m.includes('opus')) return 'ogg';
  if (m.includes('mp4') || m.includes('m4a') || m.includes('aac')) return 'm4a';
  if (m.includes('mpeg') || m.includes('mp3')) return 'mp3';
  if (m.includes('wav')) return 'wav';
  if (m.includes('flac')) return 'flac';
  return 'audio';
}

function dataUrlFor(bytes, contentType) {
  return `data:${contentType};base64,${bytes.toString('base64')}`;
}

// Best-effort announce to the Bridge relay (the DRW writeRelay pattern), type
// 'audio'. Wrapped so a relay failure NEVER blocks the take (the WRD "the mirror
// never blocks the send" law applied to the announce too).
async function announce(redis, from, content) {
  try {
    const ts = Date.now();
    const id = `${ts}_${from}`;
    const msg = JSON.stringify({ id, from, to: 'bridge', content, type: 'audio', context: 'rspdan.com/rwd', ts });
    await redis.zadd('ch:bridge', { score: ts, member: msg });
    await redis.zadd('ch:all', { score: ts, member: msg });
    return { id, ts, ok: true };
  } catch {
    return { ok: false };
  }
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
    takes: page,
    count: page.length,
    total,
    latest,
    complete: raw.length <= limit,
    next: raw.length > limit ? `/api/rwd?log=full&start=${latest}` : null,
  });
}

async function logMarkdown(redis) {
  const raw = await redis.zrange(KEY, 0, '+inf', { byScore: true });
  const takes = raw.map(parseMember).filter(Boolean);
  const lines = [
    '# RWD · Operating Room · audio-take log',
    '',
    `Exported ${new Date().toISOString()} from rspdan.com/api/rwd?log=md`,
    `Takes: ${takes.length} · store: Upstash Redis \`${KEY}\` (never trimmed)`,
    '',
    'Fold this file into the Bridge (LOG/ or RELAY/) as substrate-of-record.',
    '',
    '---',
    '',
  ];
  let day = '';
  for (const t of takes) {
    const d = new Date(t.ts).toISOString();
    const tDay = d.slice(0, 10);
    if (tDay !== day) {
      day = tDay;
      lines.push(`## ${day}`, '');
    }
    const dur = t.durationMs ? ` · ${Math.round(t.durationMs / 1000)}s` : '';
    const cap = t.caption ? ` · ${t.caption}` : '';
    lines.push(`**${t.seat}** \`${d.slice(11, 19)}Z\`${dur}${cap}`, '', t.url ? `audio: ${t.url}` : '(inline audio)', '');
  }
  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': `inline; filename="RWD_OR_takes_${new Date().toISOString().slice(0, 10)}.md"`,
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
  const takes = [];
  for (const b of blobs) {
    if (!b.pathname.endsWith('.coordinate.json')) continue; // the sidecar is the rebuild floor
    try {
      const res = await fetch(b.url);
      if (res.ok) {
        const p = await res.json();
        if (p && p.ts) takes.push(p);
      }
    } catch {}
  }
  takes.sort((a, b) => a.ts - b.ts);
  return json({
    ok: true,
    log: 'blob',
    note: 'rebuilt from the Vercel Blob mirror · survives a Redis wipe',
    takes,
    count: takes.length,
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
    export: { full: '/api/rwd?log=full', markdown: '/api/rwd?log=md', blob: '/api/rwd?log=blob', timeline: '/api/rwd?timeline=full' },
  });
}

// ---- THE REWIND: the linked-worlds timeline (the three worlds on one clock) --

async function timeline(redis, url) {
  const worldsParam = (url.searchParams.get('worlds') || 'rwd,wrd,drw')
    .split(',').map((w) => w.trim().toLowerCase()).filter(Boolean);
  const worlds = new Set(worldsParam);
  const sinceParam = url.searchParams.get('timeline');
  const sinceTs = sinceParam && sinceParam !== 'full' ? (parseInt(sinceParam, 10) || 0) : 0;
  const limitRaw = parseInt(url.searchParams.get('limit') || String(TIMELINE_DEFAULT_LIMIT), 10);
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), TIMELINE_MAX_LIMIT) : TIMELINE_DEFAULT_LIMIT;

  // Bounded per-world tail (newest TIMELINE_PER_WORLD), never a full-union scan.
  async function tail(key) {
    try {
      const raw = await redis.zrange(key, -TIMELINE_PER_WORLD, -1);
      return raw.map(parseMember).filter(Boolean);
    } catch {
      return [];
    }
  }

  const events = [];
  if (worlds.has('rwd')) {
    for (const t of await tail(KEY)) {
      events.push({ ts: t.ts, world: 'rwd', kind: 'audio', seat: t.seat || '', ref: t.url || '', label: t.caption || '' });
    }
  }
  if (worlds.has('wrd')) {
    for (const m of await tail(WRD_KEY)) {
      events.push({ ts: m.ts, world: 'wrd', kind: 'word', seat: m.seat || '', ref: m.id || '', label: (m.text || '').slice(0, 140) });
    }
  }
  if (worlds.has('drw')) {
    for (const it of await tail(DRW_KEY)) {
      events.push({ ts: it.ts, world: 'drw', kind: 'drawing', seat: it.user || it.seat || '', ref: it.url || '', label: it.caption || '' });
    }
  }

  const merged = events
    .filter((e) => e.ts && e.ts > sinceTs)
    .sort((a, b) => a.ts - b.ts)
    .slice(-limit);
  const span = merged.length ? { from: merged[0].ts, to: merged[merged.length - 1].ts } : { from: null, to: null };
  return json({ ok: true, timeline: merged, count: merged.length, span, worlds: [...worlds] });
}

async function oneTake(redis, url) {
  const id = url.searchParams.get('take');
  const raw = await redis.zrange(KEY, -500, -1);
  const take = raw.map(parseMember).filter(Boolean).find((t) => t && t.id === id);
  if (!take) return json({ ok: false, error: 'take not found (older than the last 500, or wrong id)' }, 404);
  return json({ ok: true, take });
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
    if (url.searchParams.get('timeline') !== null) return await timeline(redis, url);
    if (url.searchParams.get('take')) return await oneTake(redis, url);
  } catch (err) {
    return json({ ok: false, error: 'read failed: ' + (err?.message || 'unknown') }, 502);
  }

  const since = parseInt(url.searchParams.get('since') || '0', 10) || 0;
  try {
    const raw = await redis.zrange(KEY, since + 1, '+inf', { byScore: true });
    const takes = [];
    for (const r of raw.slice(-GET_LIMIT)) {
      const t = parseMember(r);
      if (t) takes.push(t);
    }
    const latest = takes.length ? takes[takes.length - 1].ts : since;
    return json({ ok: true, takes, count: takes.length, latest, now: Date.now() });
  } catch (err) {
    return json({ ok: false, error: 'store read failed: ' + (err?.message || 'unknown') }, 502);
  }
}

export async function POST({ request, url }) {
  let body;
  try { body = await request.json(); }
  catch { return json({ ok: false, error: 'body must be JSON: {"seat","audio","token"}' }, 400); }

  if (!authorized(request, url, body)) {
    return json({ ok: false, error: 'unauthorized · pass the OR shared token' }, 401);
  }

  const seat = clampText(body.seat, MAX_SEAT_LEN).trim();
  const caption = clampText(body.caption, MAX_CAPTION_LEN).trim();
  if (!seat) return json({ ok: false, error: 'seat required' }, 400);

  const decoded = decodeAudioDataUrl(body.audio);
  if (!decoded) return json({ ok: false, error: 'audio must be a base64 data url with an audio/* mime' }, 400);
  if (decoded.bytes.length > MAX_AUDIO_BYTES) {
    return json({ ok: false, error: `audio too large (${decoded.bytes.length} bytes > ${MAX_AUDIO_BYTES} cap)` }, 413);
  }

  let redis;
  try { redis = getRedis(); }
  catch { return json({ ok: false, error: 'store not configured · set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN in Vercel' }, 503); }

  const ts = Date.now();
  const safe = safeSeat(seat);
  const day = new Date(ts).toISOString().slice(0, 10);
  const createdAt = new Date(ts).toISOString();
  const ext = extForMime(decoded.contentType);
  const baseKey = `${BLOB_PREFIX}${day}/${ts}_${safe}`;
  const audioKey = `${baseKey}.${ext}`;
  const packetKey = `${baseKey}.coordinate.json`;
  const coordinateId = `HCUS-RWD-${day.replace(/-/g, '')}-${safe}-${ts}`;
  const durationMs = Number.isFinite(Number(body.durationMs)) ? Number(body.durationMs) : null;

  // Floor 1a: the audio blob (CANONICAL, blocking; a real failure is a 502).
  // Blob-absent -> the take is held redis-inline as a data url (the DRW fallback;
  // honest in the response as storage:'redis-inline').
  const token = blobToken();
  let audioUrl = dataUrlFor(decoded.bytes, decoded.contentType);
  let storage = 'redis-inline';
  if (token) {
    try {
      const blob = await put(audioKey, decoded.bytes, {
        access: 'public',
        contentType: decoded.contentType,
        addRandomSuffix: false,
        token,
      });
      audioUrl = blob.url;
      storage = 'blob';
    } catch (err) {
      return json({ ok: false, error: 'audio blob upload failed: ' + (err?.message || 'unknown') }, 502);
    }
  }

  const item = {
    id: `rwd_${ts}_${safe}`,
    seat,
    url: audioUrl,
    key: storage === 'blob' ? audioKey : null,
    storage,
    caption,
    durationMs,
    mime: decoded.contentType,
    bytes: decoded.bytes.length,
    coordinateId,
    ts,
    createdAt,
  };

  // The HCUS-RWD coordinate packet, which doubles as the ?log=blob rebuild
  // floor. ADDITIVE + never blocks (diverges from DRW's blocking packet on
  // purpose: the audio blob is the canonical proof; the packet is the second
  // floor and must not fail a take).
  const packet = {
    coordinate_id: coordinateId,
    source_surface: 'rwd',
    operator: safe,
    seat,
    station: 'rspdan-portal',
    created_at: createdAt,
    caption,
    durationMs,
    mime: decoded.contentType,
    bytes: decoded.bytes.length,
    storage,
    url: audioUrl,
    key: item.key,
    ts,
    handoff: 'Operating Room relay (ch:bridge + ch:all) and the RWD take log.',
  };
  let packetUrl = null;
  let floorBlob = token ? 'mirrored' : 'off';
  if (token) {
    try {
      const sidecar = await put(packetKey, Buffer.from(JSON.stringify(packet, null, 2), 'utf8'), {
        access: 'public',
        contentType: 'application/json',
        addRandomSuffix: false,
        token,
      });
      packetUrl = sidecar.url;
    } catch {
      floorBlob = 'failed';
    }
  }
  item.packetUrl = packetUrl;

  // Floor 1b: the Redis take index, never trimmed (sibling of wrd/drw).
  try {
    await redis.zadd(KEY, { score: ts, member: JSON.stringify(item) });
  } catch (err) {
    return json({ ok: false, error: 'take index write failed: ' + (err?.message || 'unknown') }, 502);
  }

  // Announce to the Bridge relay (best-effort; never blocks the take).
  // Never put a multi-MB inline data: URL on the shared relay (ch:bridge/ch:all):
  // in the redis-inline fallback audioUrl IS the full data url, which would flood
  // the cross-surface relay ~16MB per take. Announce the coordinate id instead so
  // the relay stays light; the take itself carries the audio (external cross-witness
  // catch 070426). When storage is blob, audioUrl is a short URL and is fine to relay.
  const relayAudioRef = storage === 'blob' ? audioUrl : coordinateId;
  const content = caption
    ? `[RWD] ${relayAudioRef} :: ${caption}${packetUrl ? ` :: packet ${packetUrl}` : ''}`
    : `[RWD] ${relayAudioRef}${packetUrl ? ` :: packet ${packetUrl}` : ''}`;
  const relay = await announce(redis, safe, content);

  return json({
    ok: true,
    take: item,
    coordinate: packet,
    relay,
    floor: { redis: 'full', blob: floorBlob },
    storage,
  });
}
