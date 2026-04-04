export const prerender = false;
import type { APIRoute } from 'astro';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: import.meta.env.UPSTASH_REDIS_REST_URL,
  token: import.meta.env.UPSTASH_REDIS_REST_TOKEN,
});

export const GET: APIRoute = async ({ url }) => {
  const since = parseInt(url.searchParams.get('since') || '0');
  const ch    = url.searchParams.get('ch') || 'all';

  const count = await redis.zcount(`ch:${ch}`, since + 1, '+inf');

  return new Response(JSON.stringify({ ok: true, hasNew: count > 0, count, ts: Date.now() }), {
    headers: { 'Content-Type': 'application/json' }
  });
};
