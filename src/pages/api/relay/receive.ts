export const prerender = false;
import type { APIRoute } from 'astro';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: import.meta.env.UPSTASH_REDIS_REST_URL,
  token: import.meta.env.UPSTASH_REDIS_REST_TOKEN,
});

export const GET: APIRoute = async ({ url }) => {
  const key = url.searchParams.get('key');
  if (key !== import.meta.env.NEST_API_KEY) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const crew    = url.searchParams.get('crew') || 'all';
  const since   = parseInt(url.searchParams.get('since') || '0');
  const chParam = url.searchParams.get('channels');
  const channels = chParam ? chParam.split(',') : [crew, 'bridge', 'all'];

  const allMsgs: any[] = [];

  for (const ch of channels) {
    const raw = await redis.zrange(`ch:${ch}`, since + 1, '+inf', { byScore: true });
    for (const r of raw) {
      try {
        allMsgs.push(typeof r === 'string' ? JSON.parse(r) : r);
      } catch {}
    }
  }

  const seen = new Set<string>();
  const msgs = allMsgs
    .filter(m => { if (!m?.id || seen.has(m.id)) return false; seen.add(m.id); return true; })
    .sort((a, b) => (a.ts ?? 0) - (b.ts ?? 0));

  const latest = msgs.length ? msgs[msgs.length - 1].ts : since;

  return new Response(JSON.stringify({ ok: true, messages: msgs, count: msgs.length, latest }), {
    headers: { 'Content-Type': 'application/json' }
  });
};
