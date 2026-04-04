export const prerender = false;
import type { APIRoute } from 'astro';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: import.meta.env.UPSTASH_REDIS_REST_URL,
  token: import.meta.env.UPSTASH_REDIS_REST_TOKEN,
});

export const POST: APIRoute = async ({ request }) => {
  const key = request.headers.get('x-nest-key');
  if (key !== import.meta.env.NEST_API_KEY) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'invalid json' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { from = 'unknown', to = 'bridge', content, type = 'message', context = '' } = body;
  if (!content) {
    return new Response(JSON.stringify({ error: 'content required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const ts = Date.now();
  const msg = JSON.stringify({ id: `${ts}_${from}`, from, to, content, type, context, ts });

  await redis.zadd(`ch:${to}`, { score: ts, member: msg });
  if (to !== 'all') {
    await redis.zadd('ch:all', { score: ts, member: msg });
  }

  return new Response(JSON.stringify({ ok: true, id: `${ts}_${from}`, ts }), {
    headers: { 'Content-Type': 'application/json' }
  });
};
