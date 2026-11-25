export const prerender = false;
import type { APIRoute } from 'astro';
import { timingSafeEqual } from 'node:crypto';
import { Redis } from '@upstash/redis';
import { verifySession } from '../../lib/pspt.js';
import registry from '../../data/director-assets.json';
import { DirectorError, MAX_BODY_BYTES } from '../../lib/directorSchema.js';
import { createDirectorService } from '../../lib/directorService.js';
import { createRedisDirectorStore } from '../../lib/directorRedisStore.js';
import { createLocalDirectorStore } from '../../lib/directorLocalStore.js';

const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };
const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status, headers });
function env(name: string) { return import.meta.env[name] || process.env[name] || ''; }
function safeEqual(left: string, right: string) {
  return Boolean(right) && Buffer.byteLength(left) === Buffer.byteLength(right) && timingSafeEqual(Buffer.from(left), Buffer.from(right));
}
function actor(request: Request, allowCrew = false) {
  const crewKey = request.headers.get('x-nest-key') || '';
  if (allowCrew && safeEqual(crewKey, env('NEST_API_KEY'))) return { kind: 'crew' };
  // Do not inherit PSPT's old temporary signing-secret fallback for this tool.
  // verifySession uses import.meta.env, so the configured value checked here is
  // deliberately that same value, rather than a different fallback source.
  const secret = import.meta.env.PSPT_SECRET;
  if (typeof secret !== 'string' || secret.length < 32) throw new DirectorError('Director session authentication is not configured', 503);
  const session = verifySession(request.headers.get('cookie'));
  if (!session || typeof session.user !== 'string' || !Number.isFinite(session.exp) || session.exp <= Date.now()) throw new DirectorError('session expired; sign in to save or load', 401);
  return { kind: 'operator', user: session.user };
}
function service() {
  const localDirectory = env('DIRECTOR_DEV_STORE_DIR');
  if (import.meta.env.DEV && localDirectory) {
    return createDirectorService({ registry, store: createLocalDirectorStore(localDirectory) });
  }
  const url = env('UPSTASH_REDIS_REST_URL');
  const token = env('UPSTASH_REDIS_REST_TOKEN');
  if (!url || !token) throw new DirectorError('Shared Director storage is not configured', 503);
  return createDirectorService({ registry, store: createRedisDirectorStore(new Redis({ url, token })) });
}
async function body(request: Request) {
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) throw new DirectorError('JSON content type required', 415);
  const reader = request.body?.getReader();
  if (!reader) throw new DirectorError('JSON body required');
  const chunks = []; let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) { await reader.cancel(); throw new DirectorError('take is too large', 413); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw new DirectorError('invalid JSON'); }
}
function failure(error: any) {
  if (error instanceof DirectorError) return json({ ok: false, error: error.message }, error.status);
  // Store errors can contain credentials or internal addresses. Keep those
  // out of the response and leave an uncertain save retryable with the same ID.
  console.error('Director storage operation failed', error?.name || 'Error');
  return json({ ok: false, error: 'Director storage did not confirm the operation; retry with the same requestId' }, 503);
}
export const GET: APIRoute = async ({ request, url }) => {
  try {
    const who = actor(request, true);
    const store = service();
    const id = url.searchParams.get('id');
    return json(id ? await store.get(id, who) : await store.list(who, {
      before: url.searchParams.get('before'),
      limit: url.searchParams.has('limit') ? Number(url.searchParams.get('limit')) : 24,
    }));
  } catch (error) { return failure(error); }
};
export const POST: APIRoute = async ({ request, url }) => {
  try {
    const who = actor(request);
    if (request.headers.get('origin') !== url.origin) throw new DirectorError('same-origin request required', 403);
    const input = await body(request);
    if (!input || typeof input !== 'object' || Array.isArray(input)) throw new DirectorError('request object required');
    const store = service();
    if (input.action === 'send') return json(await store.send(input, who));
    if (input.action !== undefined && input.action !== 'save') throw new DirectorError('unknown Director action');
    return json(await store.save(input, who));
  } catch (error) { return failure(error); }
};
