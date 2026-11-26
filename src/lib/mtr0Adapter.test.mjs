// Real disposable loopback HTTP receiving. All images, text, credentials and
// provider responses are invented fixtures; no real model endpoint is called.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdtemp, readdir, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { createMtr0Adapter } from './mtr0Adapter.js';
import { createProductionStudyStore } from './productionStudyStore.js';
import { createProductionStudyService } from './productionStudyService.js';

const actor = { kind: 'operator', user: 'dan' };
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGP4/x8AAwAB//wl3FEAAAAASUVORK5CYII=', 'base64');
const webp = Buffer.from('UklGRiQAAABXRUJQVlA4IBgAAABQAQCdASoBAAEAAUAmJaQABHQAAORAAAA=', 'base64');
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const selectedText = 'Selected source: an amber desk and a quiet green wall.\nLiteral “quoted” text.';
const secret = 'invented-adapter-auth-token';
const selectedIds = ['image-b', 'text-a', 'image-a'];
const hidden = ['MANUAL_CARD_CANARY', 'CORRECTION_CANARY', 'PREVIEW_SETTINGS_CANARY', 'NEXT_ACTION_CANARY', 'UNSELECTED_TEXT_CANARY', 'PRIVATE_LOCATOR_CANARY', 'NATIVE_FILENAME_CANARY'];

function card(refs = ['image-b', 'text-a']) {
  return { schema: 'mtr0-production-card/v1', observations: [{ text: 'A bounded synthetic observation.', sourceIds: [...refs] }],
    proposal: { domain: 'lighting', text: 'Consider one independently controlled fill change.', sourceIds: [...refs] },
    keepFixed: ['Hold camera and materials.'], imageCheck: { text: 'Compare only after an actual preview exists.', sourceIds: [...refs] },
    limits: ['This fixture does not establish visual usefulness.'] };
}
function completion(value = card()) {
  return { model: 'fixture-configured-model', choices: [{ index: 0, finish_reason: 'stop', message: { role: 'assistant', content: JSON.stringify(value) } }],
    usage: { prompt_tokens: 12, completion_tokens: 7, total_tokens: 19 } };
}
function sendJson(res, value, status = 200) {
  res.writeHead(status, { 'content-type': 'application/json' }); res.end(JSON.stringify(value));
}
const typed = (code) => (error) => error instanceof Error && error.name === 'Mtr0Error' && error.code === code;
function failed(result, code) {
  assert.equal(result.outcome.status, 'failed'); assert.equal(result.outcome.code, code);
  assert.equal(Object.hasOwn(result.outcome, 'card'), false);
}
function deeplyFrozen(value) {
  if (value && typeof value === 'object') {
    assert.ok(Object.isFrozen(value)); Object.values(value).forEach(deeplyFrozen);
  }
}

async function provider(t, handler = ({ res }) => sendJson(res, completion())) {
  const calls = []; const waiters = [];
  const server = createServer(async (req, res) => {
    try {
      const chunks = []; for await (const chunk of req) chunks.push(chunk);
      const bytes = Buffer.concat(chunks);
      const record = { path: req.url, method: req.method, headers: req.headers, bytes, body: JSON.parse(bytes.toString('utf8')) };
      calls.push(record);
      for (const waiter of [...waiters]) if (calls.length >= waiter.count) waiter.resolve(record);
      await handler({ req, res, record, calls });
    } catch {
      if (!res.destroyed) { res.writeHead(500); res.end(); }
    }
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  t.after(async () => { server.closeAllConnections(); await new Promise((resolve) => server.close(resolve)); });
  const endpoint = `http://127.0.0.1:${server.address().port}/v1/chat/completions`;
  function waitForCalls(count) {
    if (calls.length >= count) return Promise.resolve(calls[count - 1]);
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Synthetic provider request did not arrive')), 3000);
      waiters.push({ count, resolve(value) { clearTimeout(timer); resolve(value); } });
    });
  }
  return { endpoint, calls, waitForCalls };
}

async function fixture(t, text = selectedText) {
  const directory = await mkdtemp(join(tmpdir(), 'nest-mtr0-test-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const studyService = createProductionStudyService({ store: createProductionStudyStore(directory) });
  const imageA = (await studyService.asset({ action: 'asset', dataUrl: `data:image/png;base64,${png.toString('base64')}` }, actor)).asset;
  const imageB = (await studyService.asset({ action: 'asset', dataUrl: `data:image/webp;base64,${webp.toString('base64')}` }, actor)).asset;
  const manual = { id: 'manual-1', parentId: null, origin: 'operator', observations: 'MANUAL_CARD_CANARY', proposal: 'Retained manual proposal.',
    keepFixed: 'No implicit authority.', imageCheck: 'A manual check.', limits: 'No generated authorship.', sourceIds: ['unselected-text'] };
  const study = { schema: 'nest-production-study/v1', title: 'Synthetic adapter study',
    target: { kind: 'external-native', name: '/private/NATIVE_FILENAME_CANARY.blend', sha256: 'a'.repeat(64) },
    evidence: [
      { id: 'image-a', title: 'Synthetic image A', kind: 'image', source: '/private/PRIVATE_LOCATOR_CANARY-a.png', asset: imageA, text: null },
      { id: 'text-a', title: 'Selected text', kind: 'text', source: '/private/PRIVATE_LOCATOR_CANARY-text.txt', asset: null, text },
      { id: 'image-b', title: 'Synthetic image B', kind: 'image', source: '/private/PRIVATE_LOCATOR_CANARY-b.webp', asset: imageB, text: null },
      { id: 'unselected-text', title: 'Unused', kind: 'text', source: 'Unused locator', asset: null, text: 'UNSELECTED_TEXT_CANARY' },
      { id: 'missing-image', title: 'Unresolved', kind: 'image', source: 'No attached bytes', asset: null, text: null },
    ], cards: [manual, { ...manual, id: 'manual-2', parentId: 'manual-1' }],
    corrections: [{ id: 'manual-correction', fromCardId: 'manual-1', toCardId: 'manual-2', text: 'CORRECTION_CANARY' }],
    selectedCardId: 'manual-2', acceptedCardId: 'manual-2',
    preview: { asset: imageA, cardId: 'manual-2', settingsText: 'PREVIEW_SETTINGS_CANARY', targetSha256: 'a'.repeat(64) }, nextAction: 'NEXT_ACTION_CANARY' };
  const saved = await studyService.save({ action: 'save', requestId: randomUUID(), studyId: `study_${randomUUID()}`, baseRevisionId: null, study }, actor);
  const input = { actor, studyId: saved.saved.id, revisionId: saved.saved.revisionId, sourceIds: [...selectedIds],
    instruction: 'Use the selected sources for one lighting proposal.', allowedDomains: ['lighting'] };
  const configuration = (endpoint, extra = {}) => ({ studyService, endpoint, serviceId: 'local-fixture-service', model: 'fixture-configured-model', apiKey: secret,
    imageInput: true, allowLoopbackHttp: true, ...extra });
  return { directory, studyService, saved, input, configuration, imageA, imageB };
}

// Find only an exact invented asset inside this test's disposable store. No
// private storage layout or production directory is assumed by the receiving.
async function corruptFixtureAsset(directory, bytes) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) { if (await corruptFixtureAsset(path, bytes)) return true; }
    else if (entry.isFile() && (await readFile(path)).equals(bytes)) {
      const altered = Buffer.from(bytes); altered[bytes.length - 1] ^= 1;
      await writeFile(path, altered); return true;
    }
  }
  return false;
}

test('prepare snapshots caller identity and input before retrieval and detaches verified study metadata', async (t) => {
  const f = await fixture(t); const p = await provider(t);
  const original = structuredClone(f.input); const mutable = structuredClone(original);
  let enterGet, releaseGet, enterAsset, releaseAsset, returnedRecord;
  const getEntered = new Promise((resolve) => { enterGet = resolve; });
  const getGate = new Promise((resolve) => { releaseGet = resolve; });
  const assetEntered = new Promise((resolve) => { enterAsset = resolve; });
  const assetGate = new Promise((resolve) => { releaseAsset = resolve; });
  const observedActors = [];
  const service = { ...f.studyService,
    async get(id, owner, revision) {
      enterGet(); await getGate;
      assert.equal(id, original.studyId); assert.equal(revision, original.revisionId);
      assert.deepEqual(owner, original.actor); assert.notEqual(owner, mutable.actor);
      returnedRecord = await f.studyService.get(id, owner, revision);
      return returnedRecord;
    },
    async getAsset(sha256, owner) {
      observedActors.push(structuredClone(owner)); enterAsset(); await assetGate;
      return f.studyService.getAsset(sha256, owner);
    },
  };
  const adapter = createMtr0Adapter(f.configuration(p.endpoint, { studyService: service }));
  const pending = adapter.prepare(mutable); await getEntered;
  mutable.actor.user = 'changed-owner'; mutable.actor.kind = 'changed-kind';
  mutable.studyId = `study_${randomUUID()}`; mutable.revisionId = `rev_${randomUUID()}`;
  mutable.sourceIds.splice(0, mutable.sourceIds.length, 'unselected-text');
  mutable.allowedDomains.splice(0, mutable.allowedDomains.length, 'camera');
  mutable.instruction = 'MUTATED_INPUT_CANARY'; releaseGet(); await assetEntered;
  returnedRecord.saved.studyHash = 'f'.repeat(64);
  returnedRecord.study.target.sha256 = 'b'.repeat(64);
  returnedRecord.study.evidence.find((s) => s.id === 'text-a').text = 'MUTATED_RECORD_CANARY';
  releaseAsset(); const prepared = await pending;
  assert.deepEqual(prepared.study, { id: original.studyId, revisionId: original.revisionId, studyHash: f.saved.saved.studyHash });
  assert.deepEqual(prepared.target, { kind: 'external-native', sha256: 'a'.repeat(64) });
  assert.equal(prepared.instruction, original.instruction); assert.deepEqual(prepared.allowedDomains, original.allowedDomains);
  assert.deepEqual(prepared.sources.map((s) => s.id), original.sourceIds);
  assert.deepEqual(observedActors, [original.actor, original.actor]);
  assert.equal((await adapter.invoke(prepared)).outcome.status, 'completed');
  assert.equal(p.calls.length, 1);
  for (const excluded of ['MUTATED_INPUT_CANARY', 'MUTATED_RECORD_CANARY', 'changed-owner']) {
    assert.equal(p.calls[0].bytes.includes(Buffer.from(excluded)), false);
    assert.equal(JSON.stringify(prepared).includes(excluded), false);
  }
  assert.equal(prepared.sources.find((s) => s.id === 'text-a').sha256, hash(selectedText));
});

test('one frozen receipt binds exact selected wire bytes and excludes manual context without mutating the study', async (t) => {
  const f = await fixture(t); const p = await provider(t); const adapter = createMtr0Adapter(f.configuration(p.endpoint));
  const prepared = await adapter.prepare(f.input);
  assert.equal(p.calls.length, 0, 'prepare does not contact the provider');
  deeplyFrozen(prepared);
  assert.equal(prepared.schema, 'mtr0-request/v1'); assert.equal(prepared.project, 'MTR0');
  assert.deepEqual(prepared.study, { id: f.saved.saved.id, revisionId: f.saved.saved.revisionId, studyHash: f.saved.saved.studyHash });
  assert.deepEqual(prepared.target, { kind: 'external-native', sha256: 'a'.repeat(64) });
  assert.deepEqual(prepared.sources.map((s) => s.id), selectedIds);
  assert.deepEqual(prepared.sources.map((s) => s.sha256), [hash(webp), hash(selectedText), hash(png)]);
  assert.equal(prepared.provider.serviceId, 'local-fixture-service'); assert.equal(prepared.provider.model, 'fixture-configured-model');
  assert.equal(prepared.provider.endpointSha256, hash(p.endpoint));
  assert.throws(() => { prepared.sources[0].sha256 = 'f'.repeat(64); }, TypeError);
  assert.throws(() => { prepared.allowedDomains.push('camera'); }, TypeError);
  const originalInstruction = f.input.instruction;
  f.input.instruction = 'Caller mutation after preparation'; f.input.sourceIds.reverse(); f.input.allowedDomains.push('camera');
  const result = await adapter.invoke(prepared);
  assert.equal(result.outcome.status, 'completed'); assert.deepEqual(result.outcome.card, card());
  assert.equal(result.outcome.validation, 'structural-and-model-identity'); assert.equal(result.outcome.providerReportedModel, 'fixture-configured-model');
  assert.deepEqual(result.request, prepared); deeplyFrozen(result);
  assert.equal(p.calls.length, 1); const sent = p.calls[0];
  assert.equal(sent.method, 'POST'); assert.equal(sent.headers.authorization, `Bearer ${secret}`);
  assert.equal(hash(sent.bytes), prepared.requestSha256); assert.equal(sent.bytes.length, prepared.requestBytes);
  assert.equal(sent.body.model, 'fixture-configured-model'); assert.equal(sent.body.stream, false);
  assert.equal(sent.body.response_format.type, 'json_schema'); assert.equal(sent.body.response_format.json_schema.strict, true);
  assert.deepEqual(sent.body.response_format.json_schema.schema.properties.proposal.properties.domain.enum, ['lighting']);
  const content = sent.body.messages.find((m) => m.role === 'user').content;
  const metadata = content.filter((part) => part.type === 'text').map((part) => JSON.parse(part.text));
  assert.equal(metadata[0].instruction, originalInstruction);
  assert.deepEqual(metadata[0].target, prepared.target); assert.deepEqual(metadata[0].allowedDomains, ['lighting']);
  assert.deepEqual(metadata.filter((item) => item.sourceId).map((item) => item.sourceId), selectedIds);
  assert.equal(metadata.find((item) => item.sourceId === 'text-a').text, selectedText);
  const transmitted = content.filter((part) => part.type === 'image_url'); assert.equal(transmitted.length, 2);
  for (const [part, expected] of [[transmitted[0], webp], [transmitted[1], png]]) {
    const match = /^data:image\/(?:png|webp);base64,(.+)$/.exec(part.image_url.url); assert.ok(match);
    assert.deepEqual(Buffer.from(match[1], 'base64'), expected);
    const prior = JSON.parse(content[content.indexOf(part) - 1].text);
    assert.equal(prior.sha256, hash(expected)); assert.equal(prior.sourceId, expected === webp ? 'image-b' : 'image-a');
  }
  for (const canary of [...hidden, secret, '/private/', 'unselected-text', 'missing-image']) {
    assert.equal(sent.bytes.toString('utf8').includes(canary), false, 'excluded material must not enter the request body');
    assert.equal(JSON.stringify(prepared).includes(canary), false, 'excluded material must not enter the receipt');
  }
  assert.equal(JSON.stringify(prepared).includes('data:image/'), false);
  assert.deepEqual(await f.studyService.get(f.saved.saved.id, actor), f.saved, 'a generated proposal must not become operator-authored saved work');
});

test('absent or different reported model fails with exact response evidence and no retry or substitution', async (t) => {
  const f = await fixture(t); let response;
  const p = await provider(t, ({ res }) => sendJson(res, response));
  const adapter = createMtr0Adapter(f.configuration(p.endpoint));
  const missing = completion(); delete missing.model;
  const cases = [
    [missing, 'provider-model-missing'],
    [{ ...completion(), model: null }, 'provider-model-missing'],
    [{ ...completion(), model: 'fixture-reported-model' }, 'provider-model-mismatch'],
    [{ ...completion(), model: 'Fixture-configured-model' }, 'provider-model-mismatch'],
    [{ ...completion(), model: 'fixture-configured-model-version' }, 'provider-model-mismatch'],
  ];
  for (const [value, code] of cases) {
    response = value;
    const prepared = await adapter.prepare(f.input), before = p.calls.length;
    const result = await adapter.invoke(prepared);
    failed(result, code); deeplyFrozen(result);
    assert.equal(result.request, prepared, 'original request identity survives rejection');
    assert.equal(result.outcome.responseSha256, hash(JSON.stringify(value)));
    assert.equal(result.outcome.delivery, 'responded'); assert.equal(result.outcome.httpStatus, 200);
    assert.equal(result.outcome.uncertain, false); assert.equal(result.outcome.retry, 'manual-only');
    assert.match(result.outcome.message, /model/);
    failed(await adapter.invoke(prepared), 'already-invoked');
    assert.equal(p.calls.length, before + 1, 'identity rejection cannot resend the consumed handle');
    assert.equal(p.calls.at(-1).body.model, 'fixture-configured-model', 'no substitute model was requested');
  }
  assert.deepEqual(await f.studyService.get(f.saved.saved.id, actor), f.saved);
});

test('exact revision selection remains pinned when newer evidence is saved', async (t) => {
  const f = await fixture(t); const p = await provider(t); const adapter = createMtr0Adapter(f.configuration(p.endpoint));
  const newer = structuredClone(f.saved.study);
  newer.evidence.push({ id: 'later-source', title: 'Later', kind: 'text', source: 'Later record', asset: null, text: 'LATER_REVISION_CANARY' });
  await f.studyService.save({ action: 'save', requestId: randomUUID(), studyId: f.saved.saved.id, baseRevisionId: f.saved.saved.revisionId, study: newer }, actor);
  const prepared = await adapter.prepare(f.input);
  assert.equal(prepared.study.studyHash, f.saved.saved.studyHash);
  assert.equal((await adapter.invoke(prepared)).outcome.status, 'completed');
  assert.equal(p.calls[0].bytes.includes(Buffer.from('LATER_REVISION_CANARY')), false);
  failed(await adapter.generate({ ...f.input, sourceIds: ['later-source'] }), 'invalid-input');
  assert.equal(p.calls.length, 1);
});

test('invalid inputs and disallowed transmitted text fail before any provider call', async (t) => {
  const f = await fixture(t); const p = await provider(t); const adapter = createMtr0Adapter(f.configuration(p.endpoint));
  for (const patch of [
    { sourceIds: [] }, { sourceIds: ['image-a', 'image-a'] }, { sourceIds: ['not-in-study'] },
    { revisionId: null }, { allowedDomains: [] }, { allowedDomains: ['materials'] },
    { actor: { kind: 'crew' } }, { instruction: '' }, { instruction: 'Read /private/local-source.txt' },
    { instruction: `Use ${secret} as the instruction` }, { extra: 'undeclared field' },
  ]) {
    await assert.rejects(adapter.prepare({ ...f.input, ...patch }), typed('invalid-input'));
    failed(await adapter.generate({ ...f.input, ...patch }), 'invalid-input');
  }
  const unsafe = await fixture(t, 'Load file:///private/source.txt');
  failed(await createMtr0Adapter(unsafe.configuration(p.endpoint)).generate(unsafe.input), 'invalid-input');
  assert.equal(p.calls.length, 0);
});

test('unavailable, wrong-owner and corrupt sources produce no provider request', async (t) => {
  const f = await fixture(t); const p = await provider(t); const adapter = createMtr0Adapter(f.configuration(p.endpoint));
  for (const patch of [
    { sourceIds: ['missing-image'] }, { actor: { kind: 'operator', user: 'other' } }, { revisionId: `rev_${randomUUID()}` },
  ]) {
    await assert.rejects(adapter.prepare({ ...f.input, ...patch }), typed('source-unavailable'));
    failed(await adapter.generate({ ...f.input, ...patch }), 'source-unavailable');
  }
  const wrongReceipt = { ...f.studyService, get: async (...args) => {
    const saved = await f.studyService.get(...args); return { ...saved, saved: { ...saved.saved, studyHash: 'f'.repeat(64) } };
  } };
  failed(await createMtr0Adapter(f.configuration(p.endpoint, { studyService: wrongReceipt })).generate(f.input), 'source-unavailable');
  assert.equal(await corruptFixtureAsset(f.directory, png), true);
  failed(await adapter.generate(f.input), 'source-unavailable');
  assert.equal(p.calls.length, 0);
});

test('full-study readback can block selected-only transmission on an unselected image or preview', async (t) => {
  for (const previewOnly of [false, true]) {
    const f = await fixture(t);
    const p = await provider(t, ({ res }) => sendJson(res, completion(card(['text-a']))));
    let input = { ...f.input, sourceIds: ['text-a'] };
    if (previewOnly) {
      const study = structuredClone(f.saved.study);
      // This PNG is referenced only by the retained preview in the new study.
      study.evidence = study.evidence.filter((s) => s.id !== 'image-a');
      const saved = await f.studyService.save({ action: 'save', requestId: randomUUID(), studyId: `study_${randomUUID()}`, baseRevisionId: null, study }, actor);
      input = { ...input, studyId: saved.saved.id, revisionId: saved.saved.revisionId };
    }
    const adapter = createMtr0Adapter(f.configuration(p.endpoint));
    assert.equal((await adapter.generate(input)).outcome.status, 'completed');
    assert.deepEqual(p.calls[0].body.messages.find((m) => m.role === 'user').content.filter((part) => part.type === 'image_url'), []);
    assert.equal(p.calls[0].bytes.includes(Buffer.from('PREVIEW_SETTINGS_CANARY')), false);
    assert.equal(await corruptFixtureAsset(f.directory, previewOnly ? png : webp), true);
    await assert.rejects(adapter.prepare(input), typed('source-unavailable'));
    failed(await adapter.generate(input), 'source-unavailable');
    assert.equal(p.calls.length, 1, 'unselected corrupt attachment prevents a second send through verified readback');
  }
});

test('image capability is explicit while a declared text-only selection can complete', async (t) => {
  const f = await fixture(t); const p = await provider(t, ({ res }) => sendJson(res, completion(card(['text-a']))));
  const config = f.configuration(p.endpoint, { imageInput: false }); const adapter = createMtr0Adapter(config);
  await assert.rejects(adapter.prepare(f.input), typed('image-unsupported'));
  failed(await adapter.generate(f.input), 'image-unsupported'); assert.equal(p.calls.length, 0);
  const result = await adapter.generate({ ...f.input, sourceIds: ['text-a'] });
  assert.equal(result.outcome.status, 'completed'); assert.equal(result.request.provider.declaredImageInput, false);
  assert.ok(p.calls[0].body.messages.find((m) => m.role === 'user').content.every((part) => part.type === 'text'));
  const absentFlag = f.configuration(p.endpoint); delete absentFlag.imageInput;
  failed(await createMtr0Adapter(absentFlag).generate(f.input), 'image-unsupported');
  assert.equal(p.calls.length, 1);
});

test('output rejects unknown or unselected references, forbidden domains and malformed card fields', async (t) => {
  const f = await fixture(t); let response = completion();
  const p = await provider(t, ({ res }) => sendJson(res, response)); const adapter = createMtr0Adapter(f.configuration(p.endpoint));
  const mutations = [
    (v) => { v.observations[0].sourceIds = ['unselected-text']; },
    (v) => { v.proposal.sourceIds = ['unknown']; },
    (v) => { v.imageCheck.sourceIds = ['unknown']; },
    (v) => { v.proposal.domain = 'camera'; },
    (v) => { v.proposal.domain = 'materials'; },
    (v) => { v.observations[0].sourceIds = ['text-a', 'text-a']; },
    (v) => { v.proposal.execute = 'invented tool command'; },
    (v) => { v.keepFixed = 'Not an array'; },
    (v) => { v.proposal.text = `Echo ${secret}`; },
  ];
  for (const mutate of mutations) {
    const value = card(); mutate(value); response = completion(value);
    failed(await adapter.generate(f.input), 'invalid-output');
  }
  assert.equal(p.calls.length, mutations.length, 'one call per rejected result, without automatic retries');
});

test('malformed JSON, length termination and tool requests are distinct bounded failures', async (t) => {
  const f = await fixture(t); let response = completion(); let raw = null;
  const p = await provider(t, ({ res }) => { if (raw !== null) { res.writeHead(200, { 'content-type': 'application/json' }); res.end(raw); } else sendJson(res, response); });
  const adapter = createMtr0Adapter(f.configuration(p.endpoint));
  raw = '{not-json'; failed(await adapter.generate(f.input), 'invalid-output'); raw = null;
  response = {}; failed(await adapter.generate(f.input), 'invalid-output');
  response = completion(); response.choices[0].message.content = '```json\n{}\n```'; failed(await adapter.generate(f.input), 'invalid-output');
  response = completion(); response.choices[0].finish_reason = 'length'; failed(await adapter.generate(f.input), 'truncated');
  response = completion(); response.choices[0].message.tool_calls = [{ id: 'unused-tool', type: 'function', function: { name: 'do_not_execute', arguments: '{}' } }];
  failed(await adapter.generate(f.input), 'invalid-output');
  response = completion(); response.choices[0].message.function_call = { name: 'do_not_execute', arguments: '{}' };
  failed(await adapter.generate(f.input), 'invalid-output');
  response = completion(); response.choices.push(structuredClone(response.choices[0])); failed(await adapter.generate(f.input), 'invalid-output');
  assert.equal(p.calls.length, 7);
});

test('HTTP errors, redirects and transport failure do not retry or follow another endpoint', async (t) => {
  const f = await fixture(t); let mode = 'http'; const destination = await provider(t);
  const p = await provider(t, ({ req, res }) => {
    if (mode === 'http') sendJson(res, { error: 'Synthetic failure' }, 503);
    else if (mode === 'redirect') { res.writeHead(302, { location: destination.endpoint }); res.end(); }
    else req.socket.destroy();
  });
  const adapter = createMtr0Adapter(f.configuration(p.endpoint));
  const http = await adapter.generate(f.input); failed(http, 'provider-http'); assert.equal(http.outcome.httpStatus, 503);
  mode = 'redirect'; failed(await adapter.generate(f.input), 'redirect'); assert.equal(destination.calls.length, 0);
  mode = 'transport'; const transport = await adapter.generate(f.input); failed(transport, 'transport'); assert.equal(transport.outcome.uncertain, true);
  assert.equal(p.calls.length, 3);
});

test('both advertised and streamed response size limits stop oversized bodies', async (t) => {
  const f = await fixture(t); let advertised = true;
  const p = await provider(t, ({ res }) => {
    if (advertised) { res.writeHead(200, { 'content-type': 'application/json', 'content-length': '1000000' }); res.end('{}'); }
    else { res.writeHead(200, { 'content-type': 'application/json' }); res.write('x'.repeat(600)); res.end('x'.repeat(600)); }
  });
  const adapter = createMtr0Adapter(f.configuration(p.endpoint, { maxResponseBytes: 1024 }));
  failed(await adapter.generate(f.input), 'response-too-large');
  advertised = false; failed(await adapter.generate(f.input), 'response-too-large');
  assert.equal(p.calls.length, 2);
});

test('timeout covers an uncompleted body, not just waiting for response headers', async (t) => {
  const f = await fixture(t);
  const p = await provider(t, ({ res }) => { res.writeHead(200, { 'content-type': 'application/json' }); res.write('{"choices":['); });
  const adapter = createMtr0Adapter(f.configuration(p.endpoint, { timeoutMs: 100 }));
  const result = await adapter.generate(f.input);
  failed(result, 'timeout'); assert.equal(result.outcome.httpStatus, 200); assert.equal(result.outcome.uncertain, true);
  assert.equal(p.calls.length, 1);
});

test('cancellation before sending is certain locally; sent cancellation retains provider uncertainty', async (t) => {
  const f = await fixture(t); const p = await provider(t, ({ res }) => { res.writeHead(200); res.write('{'); });
  const adapter = createMtr0Adapter(f.configuration(p.endpoint));
  const early = new AbortController(); early.abort();
  const before = await adapter.generate(f.input, { signal: early.signal });
  failed(before, 'cancelled'); assert.equal(before.request, null); assert.equal(before.outcome.uncertain, false); assert.equal(p.calls.length, 0);
  const controller = new AbortController();
  const pending = adapter.generate(f.input, { signal: controller.signal });
  await p.waitForCalls(1); controller.abort();
  const sent = await pending;
  failed(sent, 'cancelled'); assert.equal(sent.outcome.uncertain, true); assert.equal(p.calls.length, 1);
  assert.deepEqual(await f.studyService.get(f.saved.saved.id, actor), f.saved);
});

test('a prepared handle sends once, including concurrent invocation, and cannot be forged or transferred', async (t) => {
  const f = await fixture(t); let release;
  const p = await provider(t, ({ res }) => { release = () => sendJson(res, completion()); });
  const adapter = createMtr0Adapter(f.configuration(p.endpoint)); const prepared = await adapter.prepare(f.input);
  const first = adapter.invoke(prepared); await p.waitForCalls(1);
  failed(await adapter.invoke(prepared), 'already-invoked'); assert.equal(p.calls.length, 1);
  release(); assert.equal((await first).outcome.status, 'completed');
  failed(await adapter.invoke(prepared), 'already-invoked');
  failed(await adapter.invoke(structuredClone(prepared)), 'invalid-input');
  const other = createMtr0Adapter(f.configuration(p.endpoint)); failed(await other.invoke(prepared), 'invalid-input');
  assert.equal(p.calls.length, 1);
});

test('configuration requires explicit safe transport and bounded primitive options', async (t) => {
  const f = await fixture(t); const p = await provider(t);
  for (const patch of [
    { allowLoopbackHttp: false }, { endpoint: 'http://192.0.2.1/v1/chat/completions' },
    { endpoint: 'https://user:password@example.invalid/v1/chat/completions' },
    { endpoint: 'https://example.invalid/v1/chat/completions?token=not-used' },
    { endpoint: 'https://example.invalid/v1/chat/completions#fragment' },
    { endpoint: 'file:///private/provider' }, { apiKey: 'line\nbreak' }, { imageInput: 'true' },
    { timeoutMs: 0 }, { maxResponseBytes: 0 },
  ]) assert.throws(() => createMtr0Adapter(f.configuration(p.endpoint, patch)), typed('invalid-config'));
  assert.equal(p.calls.length, 0);
});

test('model identifiers allow provider and tag forms but reject URLs and drive paths in configuration and response', async (t) => {
  const f = await fixture(t); let response = completion();
  const p = await provider(t, ({ res }) => sendJson(res, response));
  const rejected = ['https://example.invalid/model', 'file:///private/model', 'C:/private/model', 'C:\\private\\model'];
  for (const model of rejected) {
    assert.throws(() => createMtr0Adapter(f.configuration(p.endpoint, { model })), typed('invalid-config'));
  }
  assert.equal(p.calls.length, 0);
  for (const model of ['provider/model', 'qwen:tag']) {
    response = { ...completion(), model };
    const result = await createMtr0Adapter(f.configuration(p.endpoint, { model })).generate(f.input);
    assert.equal(result.outcome.status, 'completed');
    assert.equal(result.request.provider.model, model); assert.equal(result.outcome.providerReportedModel, model);
    assert.equal(p.calls.at(-1).body.model, model);
  }
  const adapter = createMtr0Adapter(f.configuration(p.endpoint));
  for (const model of rejected) {
    response = { ...completion(), model };
    failed(await adapter.generate(f.input), 'invalid-output');
  }
  assert.equal(p.calls.length, 2 + rejected.length);
});
