export const prerender = false;
import type { APIRoute } from 'astro';
import { verifySession } from '../../lib/pspt.js';
import { ProductionStudyError, MAX_BODY_BYTES } from '../../lib/productionStudySchema.js';
import { createProductionStudyService } from '../../lib/productionStudyService.js';
import { createProductionStudyStore } from '../../lib/productionStudyStore.js';

const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status, headers });
function actor(request: Request) {
  const secret = import.meta.env.PSPT_SECRET;
  if (typeof secret !== 'string' || secret.length < 32) throw new ProductionStudyError('Study session authentication is not configured', 503);
  const session = verifySession(request.headers.get('cookie'));
  if (!session || typeof session.user !== 'string' || !Number.isFinite(session.exp) || session.exp <= Date.now()) throw new ProductionStudyError('session expired; sign in to save or load', 401);
  return { kind: 'operator', user: session.user };
}
function service() {
  const directory = import.meta.env.DIRECTOR_STUDY_STORE_DIR || process.env.DIRECTOR_STUDY_STORE_DIR;
  if (!import.meta.env.DEV || typeof directory !== 'string' || !directory.trim()) throw new ProductionStudyError('Local study storage requires development mode and DIRECTOR_STUDY_STORE_DIR', 503);
  return createProductionStudyService({ store: createProductionStudyStore(directory) });
}
async function body(request: Request) {
  if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') throw new ProductionStudyError('JSON content type required', 415);
  const length = request.headers.get('content-length');
  if (length && /^\d+$/.test(length) && Number(length) > MAX_BODY_BYTES) throw new ProductionStudyError('study request is too large', 413);
  const reader = request.body?.getReader();
  if (!reader) throw new ProductionStudyError('JSON body required');
  const chunks: Uint8Array[] = []; let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) { await reader.cancel(); throw new ProductionStudyError('study request is too large', 413); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw new ProductionStudyError('invalid JSON'); }
}
function failure(error: any) {
  if (error instanceof ProductionStudyError) return json({ ok: false, error: error.message }, error.status);
  console.error('Local production study operation failed', error?.name || 'Error');
  return json({ ok: false, error: 'Local study storage did not confirm the operation; retry a save with the same requestId' }, 503);
}
export const GET: APIRoute = async ({ request, url }) => {
  try {
    const who = actor(request), study = service();
    const keys = [...url.searchParams.keys()];
    if (keys.some((key) => !['id', 'revision', 'asset'].includes(key)) || new Set(keys).size !== keys.length) throw new ProductionStudyError('invalid study query');
    const asset = url.searchParams.get('asset'), id = url.searchParams.get('id'), revision = url.searchParams.get('revision');
    if (asset !== null) {
      if (id !== null || revision !== null) throw new ProductionStudyError('asset query cannot include a study');
      const image = await study.getAsset(asset, who);
      return new Response(new Uint8Array(image.buffer), { headers: { 'Content-Type': image.asset.mime, 'Content-Length': String(image.asset.bytes), 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff', 'Cross-Origin-Resource-Policy': 'same-origin' } });
    }
    if (id === null && revision !== null) throw new ProductionStudyError('revision requires a study id');
    return json(id !== null ? await study.get(id, who, revision) : await study.list(who));
  } catch (error) { return failure(error); }
};
export const POST: APIRoute = async ({ request, url }) => {
  try {
    const who = actor(request);
    if (request.headers.get('origin') !== url.origin) throw new ProductionStudyError('same-origin request required', 403);
    const study = service(), input = await body(request);
    if (!input || typeof input !== 'object' || Array.isArray(input)) throw new ProductionStudyError('request object required');
    if (input.action === 'asset') return json(await study.asset(input, who));
    if (input.action === 'save') return json(await study.save(input, who));
    throw new ProductionStudyError('unknown study action');
  } catch (error) { return failure(error); }
};
