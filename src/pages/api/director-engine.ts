export const prerender = false;
import type { APIRoute } from 'astro';
import { createHash } from 'node:crypto';
import { verifySession } from '../../lib/pspt.js';
import { ProductionStudyError } from '../../lib/productionStudySchema.js';
import { createProductionStudyService } from '../../lib/productionStudyService.js';
import { createProductionStudyStore } from '../../lib/productionStudyStore.js';
import { createMtr0OperationStore } from '../../lib/mtr0OperationStore.js';
import { createMtr0ContinuationService } from '../../lib/mtr0ContinuationService.js';
import { createMtr0Service } from '../../lib/mtr0Service.js';
import { MAX_ENGINE_BODY_BYTES } from '../../lib/mtr0OperationSchema.js';

const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status, headers });
function actor(request: Request) {
  const secret = import.meta.env.PSPT_SECRET;
  if (typeof secret !== 'string' || secret.length < 32) throw new ProductionStudyError('session authentication is not configured', 503);
  const session = verifySession(request.headers.get('cookie'));
  if (!session || typeof session.user !== 'string' || !Number.isFinite(session.exp) || session.exp <= Date.now()) throw new ProductionStudyError('session expired; sign in to use MTR0', 401);
  return { kind: 'operator', user: session.user };
}
let cached: { key: string; engine: ReturnType<typeof createMtr0Service>; continuation: ReturnType<typeof createMtr0ContinuationService>; studyService: ReturnType<typeof createProductionStudyService> } | null = null;
function service() {
  const env = (name: string) => import.meta.env[name] || process.env[name] || '';
  const directory = env('DIRECTOR_STUDY_STORE_DIR');
  if (!import.meta.env.DEV || !directory.trim()) throw new ProductionStudyError('MTR0 requires development mode and DIRECTOR_STUDY_STORE_DIR', 503);
  const bool = (value: string) => value === 'true' ? true : value === '' || value === 'false' ? false : value;
  const fields = { endpoint: env('MTR0_ENDPOINT'), serviceId: env('MTR0_SERVICE_ID'), model: env('MTR0_MODEL'), apiKey: env('MTR0_API_KEY'), imageInput: bool(env('MTR0_IMAGE_INPUT')), allowLoopbackHttp: bool(env('MTR0_ALLOW_LOOPBACK_HTTP')) };
  const provider = Object.values(fields).some(value => value !== '' && value !== false) ? fields : null;
  const key = createHash('sha256').update(JSON.stringify({ directory, provider })).digest('hex');
  if (!cached || cached.key !== key) {
    const studyService = createProductionStudyService({ store: createProductionStudyStore(directory) });
    const store = createMtr0OperationStore(directory);
    const engine = createMtr0Service({ store, studyService, provider });
    cached = { key, engine, studyService, continuation: createMtr0ContinuationService({ store, studyService, engine }) };
  }
  return cached;
}
async function continuationView(result: any, runtime: ReturnType<typeof service>, who: ReturnType<typeof actor>) {
  const input = result.continuation.selection.input;
  // Enrichment follows an authoritative durable response, possibly an effect.
  // Its failure must not erase that response or become a pre-effect rejection.
  // Actual selection/dispatch still validates the study and its attachments.
  try {
    const current = await runtime.studyService.get(input.studyId, who);
    return { ...result, studyHead: { status: 'available', revisionId: current.saved.revisionId,
      selectedRevisionCurrent: input.revisionId === current.saved.revisionId } };
  } catch {
    return { ...result, studyHead: { status: 'unavailable', revisionId: null,
      selectedRevisionCurrent: null } };
  }
}
async function body(request: Request) {
  if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') throw new ProductionStudyError('JSON content type required', 415);
  const length = request.headers.get('content-length');
  if (length && /^\d+$/.test(length) && Number(length) > MAX_ENGINE_BODY_BYTES) throw new ProductionStudyError('engine request is too large', 413);
  const reader = request.body?.getReader(); if (!reader) throw new ProductionStudyError('JSON body required');
  const chunks: Uint8Array[] = []; let size = 0;
  try {
    while (true) { const { done, value } = await reader.read(); if (done) break; size += value.byteLength; if (size > MAX_ENGINE_BODY_BYTES) { await reader.cancel(); throw new ProductionStudyError('engine request is too large', 413); } chunks.push(value); }
  } finally { reader.releaseLock(); }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw new ProductionStudyError('invalid JSON'); }
}
function failure(error: any) {
  if (error instanceof ProductionStudyError) return json({ ok: false, error: error.message }, error.status);
  console.error('Local MTR0 operation failed', error?.name || 'Error');
  return json({ ok: false, error: 'Local operation state could not be confirmed. Look up the same operationId; do not automatically start another call.' }, 503);
}
export const GET: APIRoute = async ({ request, url }) => {
  try {
    const who = actor(request), runtime = service(), keys = [...url.searchParams.keys()];
    if (keys.some(key => !['studyId', 'operationId', 'continuationStudyId'].includes(key)) || new Set(keys).size !== keys.length || keys.length > 1) throw new ProductionStudyError('invalid engine query');
    const continuationStudyId = url.searchParams.get('continuationStudyId');
    if (continuationStudyId !== null) return json(await continuationView(await runtime.continuation.get(continuationStudyId, who), runtime, who));
    const operationId = url.searchParams.get('operationId');
    return json(operationId !== null ? await runtime.engine.get(operationId, who) : { ...await runtime.engine.status(who, url.searchParams.get('studyId')), continuationCapability: 'mtr0-continuation/v1' });
  } catch (error) { return failure(error); }
};
export const POST: APIRoute = async ({ request, url }) => {
  try {
    const who = actor(request);
    if (request.headers.get('origin') !== url.origin) throw new ProductionStudyError('same-origin request required', 403);
    if (url.search) throw new ProductionStudyError('engine writes do not accept query parameters');
    const runtime = service(), value = await body(request);
    if (value?.action === 'select') return json(await continuationView(await runtime.continuation.select(value, who), runtime, who));
    if (value?.action === 'resume') {
      const { action, ...resume } = value; // Service rejects every extra resume field.
      return json(await continuationView(await runtime.continuation.resume(resume, who), runtime, who));
    }
    const result = await runtime.engine.generate(value, who);
    return json(result, result.operation.status === 'pending' ? 202 : 200);
  } catch (error) { return failure(error); }
};
