// Synthetic receiving only: disposable loopback provider, temporary local work,
// and independent processes. No real provider, model or private sources.
import nodeTest from 'node:test';
const test = (name, run) => nodeTest(name, { timeout: 15000 }, run);
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdtemp, readdir, readFile, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { randomUUID, createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { createMtr0Service } from './mtr0Service.js';
import { createMtr0OperationStore } from './mtr0OperationStore.js';
import { operationHash, validateResult } from './mtr0OperationSchema.js';
import { createProductionStudyService } from './productionStudyService.js';
import { createProductionStudyStore } from './productionStudyStore.js';

const actor = { kind: 'operator', user: 'dan' };
const other = { kind: 'operator', user: 'synthetic-other' };
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGP4/x8AAwAB//wl3FEAAAAASUVORK5CYII=', 'base64');
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const status = (expected) => (error) => error instanceof Error && error.status === expected;
function generatedCard() {
  return { schema: 'mtr0-production-card/v1', observations: [{ text: 'A synthetic supplied frame.', sourceIds: ['image-a'] }],
    proposal: { domain: 'lighting', text: 'Consider one controlled fill study.', sourceIds: ['image-a', 'text-a'] },
    keepFixed: ['Hold the camera and materials.'], imageCheck: { text: 'Judge only an actual preview.', sourceIds: ['image-a'] },
    limits: ['Invented provider output does not prove visual usefulness.'] };
}
function completion() {
  return { model: 'synthetic-model', choices: [{ finish_reason: 'stop', message: { role: 'assistant', content: JSON.stringify(generatedCard()) } }] };
}
function send(res, value = completion(), code = 200) { res.writeHead(code, { 'content-type': 'application/json' }); res.end(JSON.stringify(value)); }
function deferred() { let resolve; const promise = new Promise((done) => { resolve = done; }); return { promise, resolve }; }

async function provider(t, handler = ({ res }) => send(res)) {
  const calls = [], waiters = [];
  const server = createServer(async (req, res) => {
    try {
      const chunks = []; for await (const chunk of req) chunks.push(chunk);
      const bytes = Buffer.concat(chunks), record = { bytes, body: JSON.parse(bytes.toString('utf8')) };
      calls.push(record); waiters.forEach(({ count, resolve }) => { if (calls.length >= count) resolve(); });
      await handler({ req, res, record });
    } catch { if (!res.destroyed) send(res, { error: 'fixture handler failed' }, 500); }
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  t.after(async () => { server.closeAllConnections(); await new Promise((resolve) => server.close(resolve)); });
  return { calls, endpoint: `http://127.0.0.1:${server.address().port}/v1/chat/completions`,
    async wait(count = 1) {
      if (calls.length >= count) return;
      let timer;
      try { await Promise.race([new Promise((resolve) => waiters.push({ count, resolve })), new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('Fixture request did not arrive')), 5000); })]); }
      finally { clearTimeout(timer); }
    } };
}
async function fixture(t) {
  const directory = await mkdtemp(join(tmpdir(), 'nest-mtr0-service-test-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const studyService = createProductionStudyService({ store: createProductionStudyStore(directory) });
  const { asset } = await studyService.asset({ action: 'asset', dataUrl: `data:image/png;base64,${png.toString('base64')}` }, actor);
  const study = { schema: 'nest-production-study/v1', title: 'Invented MTR0 service exercise',
    target: { kind: 'external-native', name: '/private/UNSELECTED_TARGET_NAME.blend', sha256: 'a'.repeat(64) },
    evidence: [
      { id: 'image-a', title: 'Invented image', kind: 'image', source: '/private/EXCLUDED_IMAGE_LOCATOR.png', asset, text: null },
      { id: 'text-a', title: 'Synthetic direction', kind: 'text', source: 'Invented source', asset: null, text: 'Keep the exact camera; lighting only.' },
      { id: 'unselected', title: 'Unused', kind: 'text', source: 'Unused fixture source', asset: null, text: 'UNSELECTED_SOURCE_CANARY' },
    ], cards: [], corrections: [], selectedCardId: null, acceptedCardId: null, preview: null, nextAction: 'NEXT_ACTION_CANARY' };
  const saved = await studyService.save({ action: 'save', requestId: randomUUID(), studyId: `study_${randomUUID()}`, baseRevisionId: null, study }, actor);
  const input = { action: 'generate', operationId: `op_${randomUUID()}`, studyId: saved.saved.id, revisionId: saved.saved.revisionId,
    sourceIds: ['image-a', 'text-a'], instruction: 'Propose one small lighting study from the selected sources.', allowedDomains: ['lighting'] };
  const config = (endpoint) => ({ endpoint, serviceId: 'synthetic-service', model: 'synthetic-model', imageInput: true, allowLoopbackHttp: true });
  const service = (providerConfig = null, options = {}) => createMtr0Service({ store: createMtr0OperationStore(directory), studyService, provider: providerConfig, ...options });
  return { directory, studyService, saved, input, config, service };
}
async function jsonFiles(directory) {
  const rows = [];
  for (const entry of await readdir(directory, { withFileTypes: true }).catch((error) => { if (error.code === 'ENOENT') return []; throw error; })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) rows.push(...await jsonFiles(path));
    else if (entry.isFile() && entry.name.endsWith('.json')) {
      const bytes = await readFile(path); rows.push({ path, bytes, value: JSON.parse(bytes.toString('utf8')) });
    }
  }
  return rows;
}
async function newerRevision(f) {
  const study = structuredClone(f.saved.study); study.nextAction = 'A later operator action.';
  return f.studyService.save({ action: 'save', requestId: randomUUID(), studyId: f.saved.saved.id, baseRevisionId: f.saved.saved.revisionId, study }, actor);
}

// IPC gives a real start barrier. Neither worker shares process-local invocation
// state with the other worker or the receiving process.
async function worker(t, f, providerConfig, mode = 'generate') {
  const script = `
    import {createMtr0Service} from ${JSON.stringify(new URL('./mtr0Service.js', import.meta.url).href)};
    import {createMtr0OperationStore} from ${JSON.stringify(new URL('./mtr0OperationStore.js', import.meta.url).href)};
    import {createProductionStudyService} from ${JSON.stringify(new URL('./productionStudyService.js', import.meta.url).href)};
    import {createProductionStudyStore} from ${JSON.stringify(new URL('./productionStudyStore.js', import.meta.url).href)};
    const [directory, rawConfig, rawInput, mode] = process.argv.slice(1);
    const input=JSON.parse(rawInput), actor={kind:'operator',user:'dan'};
    const service=createMtr0Service({store:createMtr0OperationStore(directory),studyService:createProductionStudyService({store:createProductionStudyStore(directory)}),provider:JSON.parse(rawConfig)});
    process.send({type:'ready'});
    process.once('message',async()=>{try {
      const value=mode==='get'?await service.get(input.operationId,actor):await service.generate(input,actor);
      process.send({type:'result',value},()=>process.disconnect());
    } catch(error) {process.send({type:'error',status:error.status,message:error.message},()=>process.disconnect());}});
  `;
  const child = spawn(process.execPath, ['--input-type=module', '-e', script, f.directory, JSON.stringify(providerConfig), JSON.stringify(f.input), mode], { stdio: ['ignore', 'ignore', 'pipe', 'ipc'] });
  const ready = deferred(), result = deferred(), exited = deferred(); let stderr = '';
  child.stderr.on('data', (bytes) => { stderr += bytes; });
  child.on('message', (msg) => { if (msg.type === 'ready') ready.resolve(msg); else result.resolve(msg); });
  child.on('error', (error) => { ready.resolve({ error }); result.resolve({ error }); });
  child.on('exit', (code, signal) => { exited.resolve({ code, signal }); if (code) { ready.resolve({ error: new Error(stderr || 'Worker exited early') }); result.resolve({ error: new Error(stderr || 'Worker exited early') }); } });
  t.after(async () => { if (child.exitCode === null && child.signalCode === null) child.kill('SIGKILL'); await exited.promise; });
  const greeting = await ready.promise; assert.equal(greeting.type, 'ready', stderr);
  return { child, result: result.promise, exited: exited.promise, start() { child.send({ action: 'go' }); } };
}

test('claim exists before provider send; completed receipt preserves exact wire evidence and does not adopt work', async (t) => {
  const f = await fixture(t); const arrival = deferred(), release = deferred(); let durableAtArrival = false;
  const p = await provider(t, async ({ res }) => {
    const fresh = f.service(); const record = await fresh.get(f.input.operationId, actor);
    durableAtArrival = record.operation.status === 'unknown' && record.operation.request?.study.revisionId === f.input.revisionId;
    arrival.resolve(); await release.promise; send(res);
  });
  const service = f.service(f.config(p.endpoint)); const pending = service.generate(f.input, actor);
  await arrival.promise; assert.equal(durableAtArrival, true);
  assert.equal((await service.get(f.input.operationId, actor)).operation.status, 'pending');
  release.resolve(); const result = await pending;
  assert.equal(result.ok, true); assert.equal(result.storage, 'local-workspace'); assert.equal(result.shared, false);
  assert.equal(result.operation.status, 'completed'); assert.equal(result.operation.id, f.input.operationId);
  assert.deepEqual(result.operation.outcome.card, generatedCard()); assert.ok(result.operation.finishedAt);
  assert.equal(hash(p.calls[0].bytes), result.operation.request.requestSha256);
  const content = p.calls[0].body.messages.find((m) => m.role === 'user').content;
  const raster = content.find((part) => part.type === 'image_url'); assert.deepEqual(Buffer.from(raster.image_url.url.split(',')[1], 'base64'), png);
  for (const excluded of ['UNSELECTED_SOURCE_CANARY', 'EXCLUDED_IMAGE_LOCATOR', 'UNSELECTED_TARGET_NAME', 'NEXT_ACTION_CANARY']) assert.equal(p.calls[0].bytes.includes(Buffer.from(excluded)), false);
  assert.deepEqual(await f.studyService.get(f.input.studyId, actor), f.saved);
  const stored = await f.service().get(f.input.operationId, actor); assert.deepEqual(stored, result);
});

test('model identity rejections remain durable under the original operation and never resend', async (t) => {
  for (const [model, code] of [[null, 'provider-model-missing'], ['another-model', 'provider-model-mismatch']]) {
    const f = await fixture(t); const response = { ...completion(), model };
    const p = await provider(t, ({ res }) => send(res, response));
    const service = f.service(f.config(p.endpoint));
    const result = await service.generate(f.input, actor), operation = result.operation;
    assert.equal(operation.status, 'failed'); assert.equal(operation.outcome.code, code);
    assert.equal(operation.id, f.input.operationId); assert.equal(operation.request.provider.model, 'synthetic-model');
    assert.equal(operation.outcome.responseSha256, hash(JSON.stringify(response)));
    assert.equal(Object.hasOwn(operation.outcome, 'card'), false);
    assert.deepEqual(await f.service().get(f.input.operationId, actor), result);
    assert.deepEqual(await f.service({ ...f.config(p.endpoint), model: 'changed-configured-model' }).generate(f.input, actor), result);
    assert.equal(p.calls.length, 1);
    assert.deepEqual(await f.studyService.get(f.input.studyId, actor), f.saved);

    const row = await createMtr0OperationStore(f.directory).get(actor.user, f.input.operationId);
    for (const patch of [{ responseSha256: null }, { delivery: 'not-sent' }, { uncertain: true }, { httpStatus: null }]) {
      const changed = structuredClone(row.result); Object.assign(changed.outcome, patch);
      assert.throws(() => validateResult(changed, row.claim, row.claimHash), /response evidence/);
    }
  }
});

test('stored new completions require exact model identity while historical structural-only receipts stay readable', async (t) => {
  const f = await fixture(t); const p = await provider(t);
  await f.service(f.config(p.endpoint)).generate(f.input, actor);
  const row = await createMtr0OperationStore(f.directory).get(actor.user, f.input.operationId);
  assert.equal(row.result.outcome.validation, 'structural-and-model-identity');
  assert.equal(validateResult(row.result, row.claim, row.claimHash), row.result);
  for (const model of [null, '', 42, 'another-model']) {
    const changed = structuredClone(row.result); changed.outcome.providerReportedModel = model;
    assert.throws(() => validateResult(changed, row.claim, row.claimHash), /model identity/);
  }
  const absent = structuredClone(row.result); delete absent.outcome.providerReportedModel;
  assert.throws(() => validateResult(absent, row.claim, row.claimHash));
  const changedClaim = structuredClone(row.claim); changedClaim.request.provider.model = 'another-configured-model';
  assert.throws(() => validateResult(row.result, changedClaim, row.claimHash), /model identity/);

  const stored = (await jsonFiles(join(f.directory, 'mtr0'))).find(item => item.value.payload?.schema === 'mtr0-operation-result/v1');
  assert.ok(stored);
  for (const model of [null, 'historical-reported-model']) {
    const historical = structuredClone(row.result);
    historical.outcome.validation = 'structural-only'; historical.outcome.providerReportedModel = model;
    await writeFile(stored.path, JSON.stringify({ sha256: operationHash(historical), payload: historical }));
    const reopened = await f.service().get(f.input.operationId, actor);
    assert.deepEqual(reopened.operation.outcome, historical.outcome, 'historical validation is not upgraded');
    assert.deepEqual(await f.service(f.config(p.endpoint)).generate(f.input, actor), reopened);
  }
  assert.equal(p.calls.length, 1, 'reading a historical receipt cannot trigger inference');
});

test('identical pending/completed retries never resend; changed payload conflicts', async (t) => {
  const f = await fixture(t); const release = deferred();
  const p = await provider(t, async ({ res }) => { await release.promise; send(res); });
  const service = f.service(f.config(p.endpoint)); const pending = service.generate(f.input, actor); await p.wait();
  assert.equal((await service.generate(structuredClone(f.input), actor)).operation.status, 'pending');
  await assert.rejects(service.generate({ ...f.input, instruction: 'A different instruction.' }, actor), status(409));
  release.resolve(); const first = await pending;
  assert.deepEqual(await service.generate(f.input, actor), first); assert.equal(p.calls.length, 1);
  await assert.rejects(service.generate({ ...f.input, sourceIds: ['text-a'] }, actor), status(409));
  assert.equal(p.calls.length, 1);
});

test('fresh operation needs current revision; historical result survives newer work and disabled or changed provider', async (t) => {
  const f = await fixture(t); const p = await provider(t); const service = f.service(f.config(p.endpoint));
  const completed = await service.generate(f.input, actor); await newerRevision(f);
  await assert.rejects(service.generate({ ...f.input, operationId: `op_${randomUUID()}` }, actor), status(409));
  const disabled = f.service(); assert.deepEqual(await disabled.generate(f.input, actor), completed);
  const otherProvider = await provider(t); const changed = f.service({ ...f.config(otherProvider.endpoint), serviceId: 'different-service', model: 'different-model' });
  assert.deepEqual(await changed.generate(f.input, actor), completed); assert.equal(otherProvider.calls.length, 0);
  assert.equal(p.calls.length, 1);
  const child = await worker(t, f, null, 'get'); child.start();
  const reopened = await child.result; assert.equal(reopened.type, 'result'); assert.deepEqual(reopened.value, completed);
});

test('failed provider outcome is durably immutable and never retried after restart', async (t) => {
  const f = await fixture(t); const p = await provider(t, ({ res }) => send(res, { error: 'invented provider error' }, 503));
  const result = await f.service(f.config(p.endpoint)).generate(f.input, actor);
  assert.equal(result.operation.status, 'failed'); assert.equal(result.operation.outcome.code, 'provider-http'); assert.ok(result.operation.finishedAt);
  assert.deepEqual(await f.service().get(f.input.operationId, actor), result);
  assert.deepEqual(await f.service().generate(f.input, actor), result); assert.equal(p.calls.length, 1);
  const store = createMtr0OperationStore(f.directory), row = await store.get(actor.user, f.input.operationId);
  assert.equal(await store.complete(actor.user, structuredClone(row.result)), false, 'identical result is already installed');
  const replacement = structuredClone(row.result); replacement.outcome.message = 'Changed historical failure.';
  await assert.rejects(store.complete(actor.user, replacement));
  assert.deepEqual(await f.service().get(f.input.operationId, actor), result);
});

test('claim failure never invokes; an installed but unconfirmed claim remains unknown', async (t) => {
  for (const installed of [false, true]) {
    const f = await fixture(t); const p = await provider(t); const store = createMtr0OperationStore(f.directory);
    const faulty = { ...store, async claim(owner, value) {
      if (installed) await store.claim(owner, value);
      throw new Error('Synthetic claim write failure');
    } };
    await assert.rejects(f.service(f.config(p.endpoint), { store: faulty }).generate(f.input, actor));
    assert.equal(p.calls.length, 0);
    if (installed) {
      const unknown = await f.service().get(f.input.operationId, actor);
      assert.equal(unknown.operation.status, 'unknown'); assert.equal(unknown.operation.outcome, null);
      assert.deepEqual(await f.service(f.config(p.endpoint)).generate(f.input, actor), unknown); assert.equal(p.calls.length, 0);
    } else await assert.rejects(f.service().get(f.input.operationId, actor), status(404));
  }
});

test('independent claim readback is required before any provider invocation', async (t) => {
  const f = await fixture(t); const p = await provider(t); const store = createMtr0OperationStore(f.directory); let claimed = false;
  const faulty = { ...store,
    async claim(owner, value) { const installed = await store.claim(owner, value); claimed = true; return installed; },
    async get(owner, id) { if (claimed) throw new Error('Synthetic readback failure'); return store.get(owner, id); },
  };
  await assert.rejects(f.service(f.config(p.endpoint), { store: faulty }).generate(f.input, actor));
  assert.equal(p.calls.length, 0);
  const unknown = await f.service().get(f.input.operationId, actor); assert.equal(unknown.operation.status, 'unknown');
  assert.deepEqual(await f.service(f.config(p.endpoint)).generate(f.input, actor), unknown); assert.equal(p.calls.length, 0);
});

test('result write failure exposes unknown, while installed result survives an acknowledgement failure', async (t) => {
  for (const installed of [false, true]) {
    const f = await fixture(t); const p = await provider(t); const store = createMtr0OperationStore(f.directory);
    const faulty = { ...store, async complete(owner, value) {
      if (installed) await store.complete(owner, value);
      throw new Error('Synthetic result write failure');
    } };
    const result = await f.service(f.config(p.endpoint), { store: faulty }).generate(f.input, actor);
    assert.equal(result.operation.status, installed ? 'completed' : 'unknown');
    if (!installed) { assert.equal(result.operation.outcome, null); assert.equal(result.operation.finishedAt, null); }
    else assert.deepEqual(result.operation.outcome.card, generatedCard());
    assert.deepEqual(await f.service().get(f.input.operationId, actor), result);
    assert.deepEqual(await f.service(f.config(p.endpoint)).generate(f.input, actor), result);
    assert.equal(p.calls.length, 1, 'completion ambiguity must not initiate another generation');
  }
});

test('study changed during source preparation is rejected before claiming or sending', async (t) => {
  const f = await fixture(t); const p = await provider(t); const entered = deferred(), release = deferred();
  const studyService = { ...f.studyService, async getAsset(...args) { entered.resolve(); await release.promise; return f.studyService.getAsset(...args); } };
  const service = f.service(f.config(p.endpoint), { studyService });
  const result = service.generate(f.input, actor); await entered.promise;
  await newerRevision(f); release.resolve();
  await assert.rejects(result, status(409)); assert.equal(p.calls.length, 0);
  await assert.rejects(f.service().get(f.input.operationId, actor), status(404));
});

test('two independent processes with one operation ID send at most one provider request', async (t) => {
  const f = await fixture(t); const release = deferred();
  const p = await provider(t, async ({ res }) => { await release.promise; send(res); });
  const workers = await Promise.all([worker(t, f, f.config(p.endpoint)), worker(t, f, f.config(p.endpoint))]);
  workers.forEach((w) => w.start()); await p.wait(); release.resolve();
  const results = await Promise.all(workers.map((w) => w.result));
  for (const result of results) { assert.equal(result.type, 'result'); assert.ok(['completed', 'unknown'].includes(result.value.operation.status)); }
  assert.equal(p.calls.length, 1); assert.equal((await f.service().get(f.input.operationId, actor)).operation.status, 'completed');
});

test('independent concurrent operation IDs both survive the owner claim chain', async (t) => {
  const f = await fixture(t); const p = await provider(t);
  const second = { ...f, input: { ...f.input, operationId: `op_${randomUUID()}` } };
  const workers = await Promise.all([worker(t, f, f.config(p.endpoint)), worker(t, second, f.config(p.endpoint))]);
  workers.forEach((w) => w.start());
  for (const result of await Promise.all(workers.map((w) => w.result))) {
    assert.equal(result.type, 'result'); assert.equal(result.value.operation.status, 'completed');
  }
  assert.equal(p.calls.length, 2);
  const listed = await f.service().status(actor, f.input.studyId);
  assert.deepEqual(new Set(listed.operations.map((op) => op.id)), new Set([f.input.operationId, second.input.operationId]));
});

test('interrupted worker leaves unknown durable claim; fresh process never reinvokes it', async (t) => {
  const f = await fixture(t); const p = await provider(t, () => {});
  const first = await worker(t, f, f.config(p.endpoint)); first.start(); await p.wait();
  first.child.kill('SIGKILL'); await first.exited;
  const fresh = f.service(f.config(p.endpoint)); const unknown = await fresh.get(f.input.operationId, actor);
  assert.equal(unknown.operation.status, 'unknown'); assert.equal(unknown.operation.outcome, null); assert.equal(unknown.operation.finishedAt, null);
  assert.deepEqual(await fresh.generate(f.input, actor), unknown);
  const second = await worker(t, f, f.config(p.endpoint)); second.start();
  const result = await second.result; assert.equal(result.type, 'result'); assert.deepEqual(result.value, unknown);
  assert.equal(p.calls.length, 1);
});

test('operation and study access remain owner isolated; invalid input and disabled provider do not send', async (t) => {
  const f = await fixture(t); const p = await provider(t); const service = f.service(f.config(p.endpoint));
  await assert.rejects(f.service().generate(f.input, actor), status(503));
  for (const patch of [{ action: 'execute' }, { operationId: 'op_not-a-uuid' }, { actor }, { endpoint: p.endpoint }, { sourceIds: [] }, { allowedDomains: ['materials'] }]) {
    await assert.rejects(service.generate({ ...f.input, ...patch }, actor), status(400));
  }
  await assert.rejects(service.generate(f.input, { kind: 'crew', user: 'reader' }), status(403));
  await assert.rejects(service.generate(f.input, other)); assert.equal(p.calls.length, 0);
  const completed = await service.generate(f.input, actor);
  await assert.rejects(service.get(f.input.operationId, other), status(404));
  assert.deepEqual((await service.status(other)).operations, []);
  const listing = await service.status(actor, f.input.studyId); assert.equal(listing.operations.length, 1);
  assert.equal(listing.operations[0].id, completed.operation.id);
  assert.equal(JSON.stringify(listing).includes(p.endpoint), false);
  assert.equal(JSON.stringify(listing).includes('data:image'), false);
});

test('corrupted durable operation data cannot become a trusted completion or trigger a resend', async (t) => {
  for (const schema of ['mtr0-operation-result/v1', 'mtr0-operation-claim/v1']) {
    const f = await fixture(t); const p = await provider(t); const service = f.service(f.config(p.endpoint));
    await service.generate(f.input, actor);
    const rows = await jsonFiles(join(f.directory, 'mtr0'));
    const record = rows.find((row) => row.value.payload?.schema === schema);
    assert.ok(record, 'locate the actual disposable record without assuming its filename');
    const changed = structuredClone(record.value);
    if (schema === 'mtr0-operation-result/v1') changed.payload.outcome.card.observations[0].text = 'CORRUPTED_RESULT_CANARY';
    else changed.payload.input.instruction = 'CORRUPTED_CLAIM_CANARY';
    await writeFile(record.path, JSON.stringify(changed));
    await assert.rejects(f.service().get(f.input.operationId, actor));
    await assert.rejects(f.service().status(actor, f.input.studyId));
    await assert.rejects(f.service(f.config(p.endpoint)).generate(f.input, actor));
    assert.equal(p.calls.length, 1);
  }
});
