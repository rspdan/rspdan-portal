import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readdir, readFile, writeFile, cp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';
import { ProductionStudyError, validateStudy, MAX_STUDY_BYTES, MAX_ASSET_BYTES } from './productionStudySchema.js';
import { createProductionStudyStore } from './productionStudyStore.js';
import { createProductionStudyService } from './productionStudyService.js';

const actor = { kind: 'operator', user: 'dan' };
const other = { kind: 'operator', user: 'another-operator' };
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGP4/x8AAwAB//wl3FEAAAAASUVORK5CYII=', 'base64');
const dataUrl = `data:image/png;base64,${png.toString('base64')}`;
const descriptor = { sha256: createHash('sha256').update(png).digest('hex'), mime: 'image/png', bytes: png.length };
// Synthetic one-pixel fixtures independently encoded and decoded when authored.
// These constants add no image-codec dependency to the test runtime.
const otherRasters = [
  ['image/jpeg', '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwAooooA/9k='],
  ['image/webp', 'UklGRiQAAABXRUJQVlA4IBgAAABQAQCdASoBAAEAAUAmJaQABHQAAORAAAA='],
];
const errorStatus = (status) => (error) => error instanceof ProductionStudyError && error.status === status;

function card(id = 'card-1', parentId = null) {
  return { id, parentId, origin: 'operator', observations: 'A supplied reference remains a reference.',
    proposal: 'Consider one fill adjustment; no value chosen.', keepFixed: 'Camera, materials and geometry.',
    imageCheck: 'Compare after an actual preview exists.', limits: 'No preview or inference has run.', sourceIds: ['text-1'] };
}
function study() {
  return { schema: 'nest-production-study/v1', title: 'Untested <light> & camera study',
    target: { kind: 'external-native', name: 'invented-fixture.blend', sha256: 'a'.repeat(64) },
    evidence: [
      { id: 'text-1', title: 'Direction', kind: 'text', source: 'Invented local test source', asset: null, text: 'Keep this camera.' },
      { id: 'image-1', title: 'Image not attached yet', kind: 'image', source: 'Unresolved test image', asset: null, text: null },
    ], cards: [card()], corrections: [], selectedCardId: 'card-1', acceptedCardId: null, preview: null,
    nextAction: 'Review the draft. Do not render automatically.' };
}
function input(value = study(), studyId = `study_${randomUUID()}`, baseRevisionId = null, requestId = randomUUID()) {
  return { action: 'save', requestId, studyId, baseRevisionId, study: value };
}
async function fixture(t) {
  const directory = await mkdtemp(join(tmpdir(), 'nest-production-study-test-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const service = createProductionStudyService({ store: createProductionStudyStore(directory) });
  return { directory, service };
}
function revised(value) {
  const next = structuredClone(value);
  next.cards.push({ ...card('card-2', 'card-1'), proposal: 'Only the independent fill may change.' });
  next.corrections.push({ id: 'correction-1', fromCardId: 'card-1', toCardId: 'card-2', text: 'Preserve the camera exactly.' });
  next.selectedCardId = 'card-2';
  return next;
}
async function filesContaining(directory, bytes) {
  const matches = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) matches.push(...await filesContaining(path, bytes));
    else if (entry.isFile() && (await readFile(path)).equals(bytes)) matches.push(path);
  }
  return matches;
}

test('drafts retain null preview and unresolved images without inventing acceptance', () => {
  const value = study();
  assert.deepEqual(validateStudy(value), value);
  const empty = study(); empty.cards = []; empty.selectedCardId = null; empty.target.sha256 = null;
  assert.deepEqual(validateStudy(empty), empty);
  assert.equal(validateStudy(value).acceptedCardId, null);
  assert.equal(validateStudy(value).preview, null);
});

test('schema rejects malformed data and broken evidence, card and correction references', () => {
  const cases = [
    ['unknown target field', (v) => { v.target.path = '/private/source.blend'; }],
    ['unknown root field', (v) => { v.modelSaysSaved = true; }],
    ['non-string card text', (v) => { v.cards[0].proposal = { command: 'render' }; }],
    ['text evidence posing as attached image', (v) => { v.evidence[0].asset = descriptor; }],
    ['image evidence with text payload', (v) => { v.evidence[1].text = 'not image bytes'; }],
    ['duplicate evidence ID', (v) => { v.evidence[1].id = v.evidence[0].id; }],
    ['duplicate card ID', (v) => { v.cards.push(structuredClone(v.cards[0])); }],
    ['unknown cited source', (v) => { v.cards[0].sourceIds = ['unseen']; }],
    ['unknown selected card', (v) => { v.selectedCardId = 'unseen'; }],
    ['unknown accepted card', (v) => { v.acceptedCardId = 'unseen'; }],
    ['unknown parent card', (v) => { v.cards[0].parentId = 'unseen'; }],
    ['correction lacks its child', (v) => { v.corrections.push({ id: 'c-1', fromCardId: 'card-1', toCardId: 'unseen', text: 'Hold camera.' }); }],
    ['a correction targets its own source', (v) => { v.corrections.push({ id: 'c-1', fromCardId: 'card-1', toCardId: 'card-1', text: 'Hold camera.' }); }],
    ['unknown asset property', (v) => { v.evidence[1].asset = { ...descriptor, url: 'https://example.invalid/image.png' }; }],
  ];
  for (const [label, mutate] of cases) {
    const value = study(); mutate(value);
    assert.throws(() => validateStudy(value), errorStatus(400), label);
  }
  assert.throws(() => validateStudy({ ...study(), title: 'x'.repeat(MAX_STUDY_BYTES + 1) }), errorStatus(413));
});

test('a preview requires the known target, accepted card and actual settings', () => {
  const valid = revised(study()); valid.acceptedCardId = 'card-2';
  valid.preview = { asset: descriptor, cardId: 'card-2', settingsText: 'Test-only settings receipt.', targetSha256: valid.target.sha256 };
  assert.deepEqual(validateStudy(valid), valid);
  for (const mutate of [
    (v) => { v.acceptedCardId = null; },
    (v) => { v.preview.cardId = 'card-1'; },
    (v) => { v.preview.targetSha256 = 'b'.repeat(64); },
    (v) => { v.target.sha256 = null; },
    (v) => { v.preview.settingsText = ''; },
  ]) {
    const value = structuredClone(valid); mutate(value);
    assert.throws(() => validateStudy(value), errorStatus(400));
  }
});

test('save and fresh-process reopen preserve unfinished work and owner boundaries', async (t) => {
  const { directory, service } = await fixture(t);
  const request = input(); const saved = await service.save(request, actor);
  assert.equal(saved.storage, 'local-workspace'); assert.equal(saved.shared, false);
  assert.equal(saved.saved.id, request.studyId); assert.equal(saved.saved.revisionId, `rev_${request.requestId}`);
  assert.equal(saved.saved.baseRevisionId, null); assert.deepEqual(saved.study, request.study);
  const script = `import {createProductionStudyStore} from ${JSON.stringify(new URL('./productionStudyStore.js', import.meta.url).href)};
    import {createProductionStudyService} from ${JSON.stringify(new URL('./productionStudyService.js', import.meta.url).href)};
    const service=createProductionStudyService({store:createProductionStudyStore(process.argv[1])});
    process.stdout.write(JSON.stringify(await service.get(process.argv[2],{kind:'operator',user:'dan'})));`;
  const child = spawnSync(process.execPath, ['--input-type=module', '-e', script, directory, request.studyId], { encoding: 'utf8', timeout: 10000 });
  assert.equal(child.status, 0, child.stderr);
  assert.deepEqual(JSON.parse(child.stdout), saved);
  assert.equal((await service.list(actor)).studies.length, 1);
  assert.deepEqual((await service.list(other)).studies, []);
  await assert.rejects(service.get(request.studyId, other), errorStatus(404));
  await assert.rejects(service.save(input(), { kind: 'crew' }), errorStatus(403));
});

test('saved wording is append-only; correction creates a child and leaves earlier revisions readable', async (t) => {
  const { service } = await fixture(t);
  const firstRequest = input(); const first = await service.save(firstRequest, actor);
  for (const mutate of [
    (v) => { v.cards[0].proposal = 'Replace the earlier wording.'; },
    (v) => { v.cards = []; v.selectedCardId = null; },
  ]) {
    const changed = study(); mutate(changed);
    await assert.rejects(service.save(input(changed, firstRequest.studyId, first.saved.revisionId), actor), errorStatus(409));
  }
  const secondRequest = input(revised(study()), firstRequest.studyId, first.saved.revisionId);
  const second = await service.save(secondRequest, actor);
  assert.deepEqual((await service.get(firstRequest.studyId, actor, first.saved.revisionId)).study, first.study);
  assert.deepEqual((await service.get(firstRequest.studyId, actor)).study, second.study);
  for (const mutate of [
    (v) => { v.corrections[0].text = 'Changed historical correction'; },
    (v) => { v.corrections = []; },
  ]) {
    const changed = structuredClone(second.study); mutate(changed);
    await assert.rejects(service.save(input(changed, firstRequest.studyId, second.saved.revisionId), actor), errorStatus(409));
  }
});

test('saved evidence cannot be replaced or removed; resolution uses a new ID and child citation', async (t) => {
  const { directory, service } = await fixture(t);
  const { asset: originalImage } = await service.asset({ action: 'asset', dataUrl }, actor);
  const [mime, encoded] = otherRasters[0];
  const { asset: differentImage } = await service.asset({ action: 'asset', dataUrl: `data:${mime};base64,${encoded}` }, actor);
  const initial = study();
  initial.evidence.push({ id: 'image-attached', title: 'Initial exact image', kind: 'image', source: 'First synthetic source', asset: originalImage, text: null });
  initial.cards[0].sourceIds = ['text-1', 'image-attached'];
  const request = input(initial); const first = await service.save(request, actor);
  const cases = [
    ['replace citation under the same ID', (v) => { v.evidence[0].source = 'A different source with the same ID'; }],
    ['replace text under the same ID', (v) => { v.evidence[0].text = 'Move the camera instead.'; }],
    ['replace attached bytes under the same ID', (v) => { v.evidence[2].asset = differentImage; }],
    ['resolve a saved null-asset placeholder in place', (v) => { v.evidence[1].asset = originalImage; }],
    ['remove even an uncited saved placeholder', (v) => { v.evidence.splice(1, 1); }],
  ];
  for (const [label, mutate] of cases) {
    const changed = structuredClone(initial); mutate(changed);
    assert.doesNotThrow(() => validateStudy(changed), `${label}: the document itself is structurally valid`);
    await assert.rejects(service.save(input(changed, request.studyId, first.saved.revisionId), actor), errorStatus(409), label);
    assert.deepEqual((await service.get(request.studyId, actor)).saved, first.saved, 'a rejected replacement must not advance the head');
  }
  const next = structuredClone(initial);
  next.evidence.push(
    { id: 'text-2', title: 'Later direction', kind: 'text', source: 'Second synthetic source', asset: null, text: 'Adjust only the fill.' },
    { id: 'image-resolved', title: 'Resolved image-1', kind: 'image', source: 'New evidence resolving the earlier placeholder', asset: differentImage, text: null },
  );
  next.cards.push({ ...card('card-2', 'card-1'), sourceIds: ['text-2', 'image-resolved'] });
  next.corrections.push({ id: 'correction-1', fromCardId: 'card-1', toCardId: 'card-2', text: 'Use the later evidence without rewriting the earlier reading.' });
  next.selectedCardId = 'card-2';
  const second = await service.save(input(next, request.studyId, first.saved.revisionId), actor);
  const reopenedService = createProductionStudyService({ store: createProductionStudyStore(directory) });
  const reopened = await reopenedService.get(request.studyId, actor);
  assert.deepEqual(reopened, second);
  assert.deepEqual(reopened.study.evidence.slice(0, initial.evidence.length), initial.evidence);
  assert.deepEqual(reopened.study.cards[0], initial.cards[0]);
  assert.equal(reopened.study.evidence.find((item) => item.id === 'image-1').asset, null);
  assert.deepEqual(reopened.study.cards[1].sourceIds, ['text-2', 'image-resolved']);
  assert.deepEqual((await reopenedService.get(request.studyId, actor, first.saved.revisionId)).study, initial);
});

test('a copied local workspace reopens study history and exact raster bytes without its original path', async (t) => {
  const { directory, service } = await fixture(t);
  const { asset } = await service.asset({ action: 'asset', dataUrl }, actor);
  const initial = study(); initial.evidence[1].asset = asset;
  const request = input(initial); const first = await service.save(request, actor);
  const next = revised(initial); next.acceptedCardId = 'card-2';
  next.preview = { asset, cardId: 'card-2', settingsText: 'Synthetic test fixture settings, not an actual native preview.', targetSha256: next.target.sha256 };
  const second = await service.save(input(next, request.studyId, first.saved.revisionId), actor);
  const recipient = await mkdtemp(join(tmpdir(), 'nest-production-study-copy-'));
  t.after(() => rm(recipient, { recursive: true, force: true }));
  const copied = join(recipient, 'received-workspace');
  await cp(directory, copied, { recursive: true });
  await rm(directory, { recursive: true, force: true }); // Only this test's original disposable store.
  const script = `import {createProductionStudyStore} from ${JSON.stringify(new URL('./productionStudyStore.js', import.meta.url).href)};
    import {createProductionStudyService} from ${JSON.stringify(new URL('./productionStudyService.js', import.meta.url).href)};
    const service=createProductionStudyService({store:createProductionStudyStore(process.argv[1])});
    const actor={kind:'operator',user:'dan'};
    const latest=await service.get(process.argv[2],actor);
    const earlier=await service.get(process.argv[2],actor,process.argv[3]);
    const image=await service.getAsset(process.argv[4],actor);
    process.stdout.write(JSON.stringify({latest,earlier,asset:image.asset,base64:image.buffer.toString('base64')}));`;
  const child = spawnSync(process.execPath, ['--input-type=module', '-e', script, copied, request.studyId, first.saved.revisionId, asset.sha256], { encoding: 'utf8', timeout: 10000 });
  assert.equal(child.status, 0, child.stderr);
  const reopened = JSON.parse(child.stdout);
  assert.deepEqual(reopened.latest, second); assert.deepEqual(reopened.earlier, first);
  assert.deepEqual(reopened.asset, asset); assert.deepEqual(Buffer.from(reopened.base64, 'base64'), png);
});

test('exact raster bytes remain private; missing or mismatched attachments cannot be saved', async (t) => {
  const { service } = await fixture(t);
  const uploaded = await service.asset({ action: 'asset', dataUrl }, actor);
  assert.deepEqual(uploaded.asset, descriptor); assert.equal(uploaded.shared, false);
  assert.equal(uploaded.storage, 'local-workspace');
  const fetched = await service.getAsset(descriptor.sha256, actor);
  assert.deepEqual(fetched.asset, descriptor); assert.deepEqual(fetched.buffer, png);
  await assert.rejects(service.getAsset(descriptor.sha256, other), errorStatus(404));
  for (const [mime, encoded] of otherRasters) {
    const bytes = Buffer.from(encoded, 'base64');
    const result = await service.asset({ action: 'asset', dataUrl: `data:${mime};base64,${encoded}` }, actor);
    assert.deepEqual(result.asset, { sha256: createHash('sha256').update(bytes).digest('hex'), mime, bytes: bytes.length });
    assert.deepEqual((await service.getAsset(result.asset.sha256, actor)).buffer, bytes);
    await assert.rejects(service.getAsset(result.asset.sha256, other), errorStatus(404));
  }
  await assert.rejects(service.getAsset('../../other-owner', actor), errorStatus(400));
  const attached = study(); attached.evidence[1].asset = descriptor;
  assert.deepEqual((await service.save(input(attached), actor)).study.evidence[1].asset, descriptor);
  await assert.rejects(service.save(input(attached), other), errorStatus(409));
  for (const patch of [{ sha256: 'c'.repeat(64) }, { bytes: png.length + 1 }, { mime: 'image/jpeg' }]) {
    const bad = study(); bad.evidence[1].asset = { ...descriptor, ...patch };
    await assert.rejects(service.save(input(bad), actor), errorStatus(409));
  }
  const preview = revised(study()); preview.acceptedCardId = 'card-2';
  preview.preview = { asset: descriptor, cardId: 'card-2', settingsText: 'Synthetic preview settings.', targetSha256: preview.target.sha256 };
  assert.deepEqual((await service.save(input(preview), actor)).study.preview, preview.preview);
});

test('asset intake rejects remote URLs, SVG, invalid headers, MIME lies and oversize bytes', async (t) => {
  const { service } = await fixture(t);
  for (const value of [
    'https://example.invalid/never-fetch.png',
    'data:image/svg+xml;base64,PHN2Zy8+',
    'data:image/png;base64,bm90LWEtcG5n',
    `data:image/jpeg;base64,${png.toString('base64')}`,
    `data:image/png;base64,${png.subarray(0, 12).toString('base64')}`,
  ]) await assert.rejects(service.asset({ action: 'asset', dataUrl: value }, actor), errorStatus(400));
  const oversized = Buffer.alloc(MAX_ASSET_BYTES + 1); png.copy(oversized);
  await assert.rejects(service.asset({ action: 'asset', dataUrl: `data:image/png;base64,${oversized.toString('base64')}` }, actor), errorStatus(413));
});

test('corrupted stored bytes cannot be fetched, reopened or reported as a saved attachment', async (t) => {
  const { directory, service } = await fixture(t);
  const { asset } = await service.asset({ action: 'asset', dataUrl }, actor);
  const value = study(); value.evidence[1].asset = asset;
  const request = input(value); const saved = await service.save(request, actor);
  // Discover only inside this test's disposable store; do not depend on its
  // private owner-directory naming or asset filename convention.
  const matches = await filesContaining(directory, png); assert.equal(matches.length, 1);
  const altered = Buffer.from(png); altered[44] ^= 1; // Same length/container, different IDAT bytes.
  await writeFile(matches[0], altered);
  await assert.rejects(service.getAsset(asset.sha256, actor), /integrity/i);
  await assert.rejects(service.get(request.studyId, actor), /integrity/i);
  await assert.rejects(service.save(request, actor), /integrity/i, 'an old successful request cannot mask lost attachment integrity');
  await assert.rejects(service.save(input(value, request.studyId, saved.saved.revisionId), actor), /integrity/i);
});

test('same request retries retain their original receipt; changed request reuse and stale bases conflict', async (t) => {
  const { service } = await fixture(t);
  await assert.rejects(service.save({ ...input(), externalUrl: 'https://example.invalid/never-send' }, actor), errorStatus(400));
  const firstRequest = input(); const first = await service.save(firstRequest, actor);
  const secondRequest = input(revised(study()), firstRequest.studyId, first.saved.revisionId);
  const second = await service.save(secondRequest, actor);
  assert.deepEqual(await service.save(firstRequest, actor), first, 'an old identical retry does not move the head');
  assert.deepEqual(await service.save(secondRequest, actor), second);
  const changed = structuredClone(firstRequest); changed.study.nextAction = 'A different body';
  await assert.rejects(service.save(changed, actor), errorStatus(409));
  await assert.rejects(service.save({ ...firstRequest, baseRevisionId: second.saved.revisionId }, actor), errorStatus(409));
  await assert.rejects(service.save({ ...firstRequest, studyId: `study_${randomUUID()}` }, actor), errorStatus(409));
  await assert.rejects(service.save(input(study(), firstRequest.studyId, first.saved.revisionId), actor), errorStatus(409));
  assert.deepEqual((await service.get(firstRequest.studyId, actor)).saved, second.saved);
});

test('concurrent saves from one base have exactly one winner, without losing unrelated studies', async (t) => {
  const { service } = await fixture(t);
  const baseRequest = input(); const base = await service.save(baseRequest, actor);
  const contenders = Array.from({ length: 6 }, (_, i) => {
    const value = study(); value.nextAction = `Contender ${i}`;
    return input(value, baseRequest.studyId, base.saved.revisionId);
  });
  const outcomes = await Promise.allSettled(contenders.map((request) => service.save(request, actor)));
  const winners = outcomes.filter((r) => r.status === 'fulfilled');
  assert.equal(winners.length, 1);
  assert.ok(outcomes.filter((r) => r.status === 'rejected').every((r) => errorStatus(409)(r.reason)));
  assert.deepEqual((await service.get(baseRequest.studyId, actor)).saved, winners[0].value.saved);
  const independent = await Promise.all(Array.from({ length: 4 }, () => service.save(input(), actor)));
  assert.equal((await service.list(actor)).studies.length, independent.length + 1);
});

async function concurrentProcesses(t, directory, requests) {
  const script = `import {createProductionStudyStore} from ${JSON.stringify(new URL('./productionStudyStore.js', import.meta.url).href)};
    import {createProductionStudyService} from ${JSON.stringify(new URL('./productionStudyService.js', import.meta.url).href)};
    const service=createProductionStudyService({store:createProductionStudyStore(process.argv[1])});
    process.send({ready:true});
    process.once('message', async ({request}) => {
      try {process.send({ok:true,value:await service.save(request,{kind:'operator',user:'dan'})});}
      catch(error) {process.send({ok:false,status:error.status,message:error.message});}
      process.disconnect();
    });`;
  const workers = requests.map(() => {
    const child = spawn(process.execPath, ['--input-type=module', '-e', script, directory], { stdio: ['ignore', 'ignore', 'pipe', 'ipc'] });
    let diagnostics = ''; child.stderr.on('data', (data) => { diagnostics += data; });
    let readyResolve, resultResolve, reject;
    const ready = new Promise((resolve, rejectReady) => { readyResolve = resolve; reject = rejectReady; });
    const result = new Promise((resolve) => { resultResolve = resolve; });
    child.on('message', (message) => { if (message.ready) readyResolve(); else resultResolve(message); });
    child.on('error', reject);
    child.on('exit', (code) => { if (code !== 0) reject(new Error(`Worker exited ${code}: ${diagnostics}`)); });
    t.after(() => { if (child.exitCode === null) child.kill('SIGKILL'); });
    return { child, ready, result };
  });
  let timeout;
  try {
    return await Promise.race([
      (async () => { await Promise.all(workers.map((w) => w.ready)); workers.forEach((w, i) => w.child.send({ request: requests[i] })); return Promise.all(workers.map((w) => w.result)); })(),
      new Promise((_, reject) => { timeout = setTimeout(() => reject(new Error('Concurrent save workers timed out')), 15000); }),
    ]);
  } finally { clearTimeout(timeout); }
}

test('separate processes contend on the same base and deduplicate identical requests atomically', { timeout: 40000 }, async (t) => {
  const { directory, service } = await fixture(t);
  const baseRequest = input(); const base = await service.save(baseRequest, actor);
  const a = study(); a.nextAction = 'Process A'; const b = study(); b.nextAction = 'Process B';
  const result = await concurrentProcesses(t, directory, [input(a, baseRequest.studyId, base.saved.revisionId), input(b, baseRequest.studyId, base.saved.revisionId)]);
  assert.equal(result.filter((r) => r.ok).length, 1);
  assert.deepEqual(result.filter((r) => !r.ok).map((r) => r.status), [409]);
  assert.deepEqual((await service.get(baseRequest.studyId, actor)).saved, result.find((r) => r.ok).value.saved);
  const duplicate = input();
  const retries = await concurrentProcesses(t, directory, [duplicate, duplicate]);
  assert.ok(retries.every((r) => r.ok)); assert.deepEqual(retries[0].value, retries[1].value);
  assert.equal((await service.list(actor)).studies.length, 2);
});
