import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, readFile, writeFile, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID, createHash } from 'node:crypto';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { createMtr0ContinuationService } from './mtr0ContinuationService.js';
import { createMtr0Service } from './mtr0Service.js';
import { createMtr0OperationStore } from './mtr0OperationStore.js';
import { operationHash } from './mtr0OperationSchema.js';
import { createProductionStudyStore } from './productionStudyStore.js';
import { createProductionStudyService } from './productionStudyService.js';

const actor = { kind: 'operator', user: 'dan' }, other = { kind: 'operator', user: 'other' };
const conflict = error => error.status === 409;
const card = () => ({ schema: 'mtr0-production-card/v1',
  observations: [{ text: 'The invented source asks for unchanged framing.', sourceIds: ['direction'] }],
  proposal: { domain: 'lighting', text: 'Reduce the synthetic key light by one stop.', sourceIds: ['direction'] },
  keepFixed: ['Keep the camera fixed.'], imageCheck: { text: 'No image was supplied.', sourceIds: ['direction'] },
  limits: ['Synthetic fixture; no scene effect.'] });

async function fixture(t, { model = 'fixture-model', failComplete = false, disconnect = false, historical = false } = {}) {
  const directory = await mkdtemp(join(tmpdir(), 'nest-continuation-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  let calls = 0;
  const server = createServer(async (req, res) => {
    for await (const chunk of req) { /* consume the bounded synthetic request */ }
    calls++;
    if (disconnect) { res.destroy(); return; }
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ model, choices: [{ finish_reason: 'stop', message: { role: 'assistant', content: JSON.stringify(card()) } }] }));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => { server.closeAllConnections(); server.close(resolve); }));
  const studyService = createProductionStudyService({ store: createProductionStudyStore(directory) });
  const study = { schema: 'nest-production-study/v1', title: 'Invented continuation',
    target: { kind: 'external-native', name: 'Synthetic target', sha256: null },
    evidence: [{ id: 'direction', title: 'Synthetic instruction', kind: 'text', source: 'Invented fixture', asset: null, text: 'Change lighting only; keep framing.' }],
    cards: [], corrections: [], selectedCardId: null, acceptedCardId: null, preview: null, nextAction: 'Authored continuation remains literal.' };
  const saved = await studyService.save({ action: 'save', requestId: randomUUID(), studyId: 'study_' + randomUUID(), baseRevisionId: null, study }, actor);
  const input = { action: 'generate', operationId: 'op_' + randomUUID(), studyId: saved.saved.id, revisionId: saved.saved.revisionId,
    sourceIds: ['direction'], instruction: 'Propose one bounded lighting change.', allowedDomains: ['lighting'] };
  const selection = { action: 'select', input, previousOperationId: null, previousResultHash: null };
  const config = { endpoint: 'http://127.0.0.1:' + server.address().port + '/v1/chat/completions',
    serviceId: 'synthetic-provider', model: 'fixture-model', imageInput: false, allowLoopbackHttp: true };
  const store = createMtr0OperationStore(directory);
  const engineStore = historical ? { ...store, async complete(user, value) { const old = structuredClone(value); old.outcome.validation = 'structural-only'; old.outcome.providerReportedModel = null; return store.complete(user, old); } } : failComplete ? { ...store, async complete() { throw new Error('Synthetic failure before result installation'); } } : store;
  const engine = createMtr0Service({ store: engineStore, studyService, provider: config });
  const service = (options = {}) => createMtr0ContinuationService({ store: createMtr0OperationStore(directory), studyService, engine, ...options });
  return { directory, store, studyService, saved, input, selection, engine, config, service, calls: () => calls };
}
const resume = f => ({ studyId: f.input.studyId, operationId: f.input.operationId });
async function completed(f) {
  await f.service().select(f.selection, actor);
  return f.service().resume(resume(f), actor);
}
function successor(f, result) {
  return { action: 'select', input: { ...f.input, operationId: 'op_' + randomUUID(),
    instruction: 'Check the retained proposal: ' + result.operation.outcome.card.proposal.text },
    previousOperationId: result.operation.id, previousResultHash: result.continuation.resultHash };
}
async function reopened(f) {
  const code = `
    import {createMtr0ContinuationService} from ${JSON.stringify(new URL('./mtr0ContinuationService.js', import.meta.url).href)};
    import {createMtr0OperationStore} from ${JSON.stringify(new URL('./mtr0OperationStore.js', import.meta.url).href)};
    const [directory,studyId]=process.argv.slice(1);
    const service=createMtr0ContinuationService({store:createMtr0OperationStore(directory),studyService:null,engine:null});
    console.log(JSON.stringify(await service.get(studyId,{kind:'operator',user:'dan'})));
  `;
  const child = spawn(process.execPath, ['--input-type=module', '-e', code, f.directory, f.input.studyId], { stdio: ['ignore', 'pipe', 'pipe'] });
  let out = '', err = '';
  child.stdout.on('data', b => out += b); child.stderr.on('data', b => err += b);
  const exit = await new Promise((resolve, reject) => { child.once('error', reject); child.once('exit', resolve); });
  assert.equal(exit, 0, err); return JSON.parse(out);
}

test('selected input survives reopening; retained result informs one next step without repeating its effect', async t => {
  const f = await fixture(t);
  const selected = await f.service().select(f.selection, actor);
  assert.equal(selected.continuation.status, 'unclaimed'); assert.equal(f.calls(), 0);
  assert.deepEqual(await reopened(f), selected);
  const result = await f.service().resume(resume(f), actor);
  assert.equal(result.operation.status, 'completed'); assert.equal(result.continuation.next, 'select-next');
  const row = await f.store.get(actor.user, f.input.operationId);
  assert.equal(result.continuation.resultHash, operationHash(row.result));
  assert.equal(result.operation.outcome.validation, 'structural-and-model-identity');
  assert.deepEqual(await f.service({ engine: null }).resume(resume(f), actor), result);
  // At this boundary the result exists, but no successor has been installed.
  assert.equal((await f.store.continuations(actor.user, f.input.studyId)).length, 1);
  const next = successor(f, result), advanced = await f.service().select(next, actor);
  assert.ok(advanced.continuation.selection.input.instruction.includes(result.operation.outcome.card.proposal.text));
  assert.equal(advanced.continuation.selection.previousResultHash, operationHash(row.result));
  assert.equal(advanced.continuation.currentOperationId, next.input.operationId);
  assert.equal(advanced.continuation.status, 'unclaimed'); assert.equal(advanced.operation, null);
  assert.deepEqual(await reopened(f), advanced);
  assert.deepEqual(await f.service().select(next, actor), advanced);
  assert.equal((await f.store.continuations(actor.user, f.input.studyId)).length, 2);
  await assert.rejects(f.service().resume(resume(f), actor), conflict);
  assert.equal(f.calls(), 1);
  assert.deepEqual(await f.studyService.get(f.input.studyId, actor), f.saved);
});

test('lost advancement acknowledgement recovers the same atomic consumption and successor', async t => {
  const f = await fixture(t), result = await completed(f), next = successor(f, result);
  const faulty = { ...f.store, async appendContinuation(...args) {
    await f.store.appendContinuation(...args); throw new Error('Synthetic acknowledgement loss after installation');
  } };
  await assert.rejects(f.service({ store: faulty }).select(next, actor), /acknowledgement/);
  const recovered = await f.service().select(next, actor);
  assert.deepEqual(await reopened(f), recovered);
  assert.equal((await f.store.continuations(actor.user, f.input.studyId)).length, 2);
  assert.equal(f.calls(), 1);
});

test('identical concurrent advances converge and conflicting successors cannot both win', async t => {
  for (const identical of [true, false]) {
    const f = await fixture(t), result = await completed(f), a = successor(f, result), b = identical ? structuredClone(a) : successor(f, result);
    const answers = await Promise.allSettled([f.service().select(a, actor), f.service().select(b, actor)]);
    assert.equal(answers.filter(r => r.status === 'fulfilled').length, identical ? 2 : 1);
    if (identical) assert.deepEqual(answers[0].value, answers[1].value);
    else assert.equal(answers.find(r => r.status === 'rejected').reason.status, 409);
    assert.equal((await f.store.continuations(actor.user, f.input.studyId)).length, 2);
    assert.equal(f.calls(), 1);
  }
});

test('concurrent resume keeps original-ID claim arbitration', async t => {
  const f = await fixture(t); await f.service().select(f.selection, actor);
  await Promise.all([f.service().resume(resume(f), actor), f.service().resume(resume(f), actor)]);
  assert.equal(f.calls(), 1);
  assert.equal((await reopened(f)).operation.status, 'completed');
});

test('unknown claim remains unresolved and cannot advance or be replayed under another ID', async t => {
  const f = await fixture(t, { failComplete: true }); await f.service().select(f.selection, actor);
  const unknown = await f.service().resume(resume(f), actor);
  assert.equal(unknown.operation.status, 'unknown'); assert.equal(unknown.continuation.next, 'reconcile');
  assert.equal(unknown.continuation.resultHash, null);
  assert.deepEqual(await f.service().resume(resume(f), actor), unknown);
  assert.deepEqual(await reopened(f), unknown);
  await assert.rejects(f.service().select({ action: 'select', input: { ...f.input, operationId: 'op_' + randomUUID() },
    previousOperationId: f.input.operationId, previousResultHash: 'a'.repeat(64) }, actor), conflict);
  await assert.rejects(f.service().select({ ...f.selection, input: { ...f.input, operationId: 'op_' + randomUUID() } }, actor), conflict);
  assert.equal(f.calls(), 1);
});

test('failed authoritative read is not absence and sends nothing', async t => {
  const f = await fixture(t); await f.service().select(f.selection, actor);
  const faulty = { ...f.store, async get() { throw new Error('Synthetic unreadable store'); } };
  await assert.rejects(f.service({ store: faulty }).resume(resume(f), actor), /unreadable/);
  assert.equal(f.calls(), 0);
});

test('installed result survives acknowledgement failure and supplies advancement evidence', async t => {
  const f = await fixture(t);
  const faulty = { ...f.store, async complete(...args) { await f.store.complete(...args); throw new Error('Synthetic result acknowledgement loss'); } };
  const engine = createMtr0Service({ store: faulty, studyService: f.studyService, provider: f.config });
  await f.service().select(f.selection, actor);
  const result = await f.service({ engine }).resume(resume(f), actor);
  assert.equal(result.operation.status, 'completed');
  const next = successor(f, result);
  await f.service().select(next, actor);
  assert.equal((await reopened(f)).continuation.currentOperationId, next.input.operationId);
  assert.equal(f.calls(), 1);
});

test('model-identity failure remains failed through reopening and cannot become an advance', async t => {
  const f = await fixture(t, { model: 'wrong-model' }), result = await completed(f);
  assert.equal(result.operation.status, 'failed'); assert.equal(result.operation.outcome.code, 'provider-model-mismatch');
  assert.equal(result.continuation.next, 'inspect-failure');
  assert.deepEqual(await f.service({ engine: null }).resume(resume(f), actor), result);
  await assert.rejects(f.service().select({ action: 'select', input: { ...f.input, operationId: 'op_' + randomUUID() },
    previousOperationId: f.input.operationId, previousResultHash: result.continuation.resultHash }, actor), conflict);
  assert.equal(f.calls(), 1);
});

test('selection reuse conflicts on changed input; owner boundaries and predecessor hashes remain enforced', async t => {
  const f = await fixture(t), result = await completed(f);
  await assert.rejects(f.service().select({ ...f.selection, input: { ...f.input, instruction: 'Changed input' } }, actor), conflict);
  await assert.rejects(f.service().get(f.input.studyId, other), e => e.status === 404);
  await assert.rejects(f.service().resume(resume(f), { kind: 'crew', user: 'dan' }), e => e.status === 403);
  const next = successor(f, result);
  await assert.rejects(f.service().select({ ...next, previousResultHash: result.operation.outcome.responseSha256 }, actor), conflict);
  assert.equal(f.calls(), 1);
});

test('corrupted continuation cannot dispatch or return trusted advancement', async t => {
  const f = await fixture(t); await f.service().select(f.selection, actor);
  async function find(path) {
    for (const ent of await readdir(path, { withFileTypes: true })) {
      const full = join(path, ent.name);
      if (ent.isDirectory()) { const found = await find(full); if (found) return found; }
      else if (ent.name.endsWith('.json')) {
        const value = JSON.parse(await readFile(full, 'utf8'));
        if (value.payload?.schema === 'mtr0-continuation-step/v1') return { full, value };
      }
    }
  }
  const row = await find(f.directory);
  row.value.payload.selection.input.instruction = 'Changed on disk';
  await writeFile(row.full, JSON.stringify(row.value));
  await assert.rejects(f.service().resume(resume(f), actor), /integrity/);
  assert.equal(f.calls(), 0);
});

test('a retained uncertain failure cannot authorize another effect', async t => {
  const f = await fixture(t, { disconnect: true }), result = await completed(f);
  assert.equal(result.operation.status, 'failed'); assert.equal(result.operation.outcome.uncertain, true);
  assert.equal(result.continuation.next, 'reconcile');
  assert.deepEqual(await f.service({ engine: null }).resume(resume(f), actor), result);
  await assert.rejects(f.service().select({ action: 'select', input: { ...f.input, operationId: 'op_' + randomUUID() },
    previousOperationId: f.input.operationId, previousResultHash: result.continuation.resultHash }, actor), conflict);
  assert.equal(f.calls(), 1);
});

test('historical validation markers survive result use and fresh-process reopening unchanged', async t => {
  const f = await fixture(t, { historical: true }), result = await completed(f);
  assert.equal(result.operation.outcome.validation, 'structural-only');
  assert.equal(result.operation.outcome.providerReportedModel, null);
  const retained = await f.store.get(actor.user, f.input.operationId);
  assert.deepEqual(await reopened(f), result);
  await f.service().select(successor(f, result), actor);
  assert.deepEqual(await f.store.get(actor.user, f.input.operationId), retained);
  assert.equal(f.calls(), 1);
});

async function secondStudy(f) {
  const saved = await f.studyService.save({ action: 'save', requestId: randomUUID(), studyId: 'study_' + randomUUID(),
    baseRevisionId: null, study: { ...f.saved.study, title: 'Second independent synthetic study' } }, actor);
  const input = { ...f.input, studyId: saved.saved.id, revisionId: saved.saved.revisionId };
  return { ...f.selection, input };
}
test('owner-wide selection identity rejects a conflicting second study before either dispatches', async t => {
  const f = await fixture(t), b = await secondStudy(f);
  await f.service().select(f.selection, actor);
  await assert.rejects(f.service().select(b, actor), conflict);
  assert.equal((await f.service().get(f.input.studyId, actor)).continuation.status, 'unclaimed');
  await assert.rejects(f.service().get(b.input.studyId, actor), e => e.status === 404);
  await f.service().resume(resume(f), actor);
  assert.equal((await f.service().get(f.input.studyId, actor)).operation.status, 'completed');
  assert.equal(f.calls(), 1);
});
test('simultaneous conflicting study selections reserve exactly one original input', async t => {
  const f = await fixture(t), b = await secondStudy(f);
  const result = await Promise.allSettled([f.service().select(f.selection, actor), f.service().select(b, actor)]);
  assert.equal(result.filter(r => r.status === 'fulfilled').length, 1);
  assert.equal(result.find(r => r.status === 'rejected').reason.status, 409);
  const winner = result.find(r => r.status === 'fulfilled').value.continuation.selection;
  const loser = winner.input.studyId === f.input.studyId ? b : f.selection;
  await f.service().resume({ studyId: winner.input.studyId, operationId: winner.input.operationId }, actor);
  assert.equal((await f.service().get(winner.input.studyId, actor)).operation.status, 'completed');
  await assert.rejects(f.service().get(loser.input.studyId, actor), e => e.status === 404);
  assert.equal(f.calls(), 1);
});
test('direct engine claims cannot take a selected ID for a different input', async t => {
  const f = await fixture(t);
  await f.service().select(f.selection, actor);
  await assert.rejects(f.engine.generate({ ...f.input, instruction: 'An incompatible direct request.' }, actor), conflict);
  assert.equal(f.calls(), 0);
  assert.equal((await f.service().get(f.input.studyId, actor)).continuation.status, 'unclaimed');
  await f.service().resume(resume(f), actor); assert.equal(f.calls(), 1);
});
test('selection and direct generation arbitrate a simultaneous conflicting input', async t => {
  const f = await fixture(t), direct = { ...f.input, instruction: 'A different simultaneous request.' };
  const result = await Promise.allSettled([f.service().select(f.selection, actor), f.engine.generate(direct, actor)]);
  assert.equal(result.filter(r => r.status === 'fulfilled').length, 1);
  assert.equal(result.find(r => r.status === 'rejected').reason.status, 409);
  if (result[0].status === 'fulfilled') {
    await f.service().resume(resume(f), actor);
    assert.equal((await f.service().get(f.input.studyId, actor)).operation.request.instruction, f.input.instruction);
  } else {
    await assert.rejects(f.service().get(f.input.studyId, actor), e => e.status === 404);
    assert.equal((await f.engine.get(f.input.operationId, actor)).operation.request.instruction, direct.instruction);
  }
  assert.equal(f.calls(), 1);
});
test('a reserved input without a claim remains dispatchable with its exact identity', async t => {
  const f = await fixture(t);
  await f.service().select(f.selection, actor);
  assert.equal(await f.store.get(actor.user, f.input.operationId), null);
  assert.deepEqual(await f.service().select(f.selection, actor), await reopened(f));
  await f.service().resume(resume(f), actor);
  assert.equal(f.calls(), 1);
});

test('interruption after input reservation but before selection recovers without a provider claim', async t => {
  const f = await fixture(t);
  await f.service().select(f.selection, actor);
  const ownerHash = createHash('sha256').update(actor.user).digest('hex');
  // Simulate the publication boundary in this disposable fixture: reservation
  // exists, but the single step record was not installed.
  await rm(join(f.directory, 'mtr0', 'owners', ownerHash, 'continuations', f.input.studyId, 'next_root.json'));
  await assert.rejects(f.service().get(f.input.studyId, actor), e => e.status === 404);
  assert.equal(await f.store.get(actor.user, f.input.operationId), null);
  await assert.rejects(f.engine.generate({ ...f.input, instruction: 'Conflicting interrupted input.' }, actor), conflict);
  const selected = await f.service().select(f.selection, actor);
  assert.equal(selected.continuation.status, 'unclaimed');
  await f.service().resume(resume(f), actor); assert.equal(f.calls(), 1);
});

test('direct store mutation cannot reuse an earlier step ID and poison a valid chain', async t => {
  const f = await fixture(t), a = await completed(f), next = successor(f, a);
  await f.service().select(next, actor);
  const b = await f.service().resume({ studyId: next.input.studyId, operationId: next.input.operationId }, actor);
  const before = await f.service().get(f.input.studyId, actor);
  await assert.rejects(f.store.appendContinuation(actor.user, {
    schema: 'mtr0-continuation-step/v1', createdAt: new Date().toISOString(),
    selection: { action: 'select', input: f.input, previousOperationId: next.input.operationId,
      previousResultHash: b.continuation.resultHash }
  }), conflict);
  assert.deepEqual(await f.service().get(f.input.studyId, actor), before);
  assert.equal((await f.store.continuations(actor.user, f.input.studyId)).length, 2);
  assert.equal(f.calls(), 2);
});

test('view validates the actual returned operation against its selected input', async t => {
  const f = await fixture(t);
  await f.service().select(f.selection, actor);
  const different = { ...f.input, operationId: 'op_' + randomUUID(), instruction: 'A separately authorized synthetic operation.' };
  await f.engine.generate(different, actor);
  const wrongRow = await f.store.get(actor.user, different.operationId);
  // Inject a misbound read after a successful real chain read; view must reject
  // the actual row rather than rely on the earlier validation.
  const store = { ...f.store, continuations: (...args) => f.store.continuations(...args), async get() { return wrongRow; } };
  await assert.rejects(f.service({ store }).get(f.input.studyId, actor), conflict);
  assert.equal((await f.service().get(f.input.studyId, actor)).continuation.status, 'unclaimed');
  assert.equal(f.calls(), 1);
});
