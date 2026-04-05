export const prerender = false;
import type { APIRoute } from 'astro';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: import.meta.env.UPSTASH_REDIS_REST_URL,
  token: import.meta.env.UPSTASH_REDIS_REST_TOKEN,
});

const CORS = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

function checkAuth(key: string | null, env: string): boolean {
  return key === env;
}

function extractKey(request: Request, url: URL): string | null {
  // Accept key via: x-nest-key header, x-api-key header,
  // Authorization Bearer token, or key query param (for GET from ACHE)
  return (
    request.headers.get('x-nest-key') ||
    request.headers.get('x-api-key') ||
    request.headers.get('authorization')?.replace('Bearer ', '') ||
    url.searchParams.get('key')
  );
}

async function writeMessage(from: string, to: string, content: string, type: string, context: string) {
  const ts = Date.now();
  const id = `${ts}_${from}`;
  const msg = JSON.stringify({ id, from, to, content, type, context, ts });
  await redis.zadd(`ch:${to}`, { score: ts, member: msg });
  if (to !== 'all') await redis.zadd('ch:all', { score: ts, member: msg });
  return { ok: true, id, ts };
}

// GET — for web_fetch from ACHE (Trip). All params in query string.
// Example: /api/relay/send?key=...&from=trip&to=bridge&content=hello&type=note
export const GET: APIRoute = async ({ request, url }) => {
  const key = extractKey(request, url);
  if (!checkAuth(key, import.meta.env.NEST_API_KEY)) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: CORS });
  }
  const from = url.searchParams.get('from') || 'unknown';
  const to = url.searchParams.get('to') || 'bridge';
  const content = url.searchParams.get('content');
  const type = url.searchParams.get('type') || 'message';
  const context = url.searchParams.get('context') || '';
  if (!content) {
    return new Response(JSON.stringify({ error: 'content required' }), { status: 400, headers: CORS });
  }
  const result = await writeMessage(from, to, content, type, context);
  return new Response(JSON.stringify(result), { headers: CORS });
};

// POST — original path, now with multi-auth support
export const POST: APIRoute = async ({ request, url }) => {
  const key = extractKey(request, url);
  if (!checkAuth(key, import.meta.env.NEST_API_KEY)) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: CORS });
  }
  let body: any;
  try { body = await request.json(); }
  catch {
    return new Response(JSON.stringify({ error: 'invalid json' }), { status: 400, headers: CORS });
  }
  const { from = 'unknown', to = 'bridge', content, type = 'message', context = '' } = body;
  if (!content) {
    return new Response(JSON.stringify({ error: 'content required' }), { status: 400, headers: CORS });
  }
  const result = await writeMessage(from, to, content, type, context);
  return new Response(JSON.stringify(result), { headers: CORS });
};

// OPTIONS — CORS preflight
export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: { ...CORS, 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, x-nest-key, x-api-key, Authorization' }
  });
};
