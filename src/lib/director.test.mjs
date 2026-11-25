import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { validateTake, DirectorError, MAX_BODY_BYTES } from './directorSchema.js';
import { createDirectorService } from './directorService.js';
import { createLocalDirectorStore } from './directorLocalStore.js';
import { createRedisDirectorStore } from './directorRedisStore.js';

const registry = { assets: [{ id: 'ouch-test', sha256: 'a'.repeat(64), bones: ['root', 'head'], morphs: ['curl'] }] };
const actor = { kind: 'operator', user: 'dan' };
const crew = { kind: 'crew' };
function pose() { return { bones: Object.fromEntries(registry.assets[0].bones.map((name) => [name, { position: [0, 1, 0], rotation: [0, 0, 0, 1], scale: [1, 1, 1] }])), morphs: { curl: .4 } }; }
function take() { return { schema: 'nest-director-take/v1', asset: { id: 'ouch-test', sha256: 'a'.repeat(64) }, name: 'Dan’s falling take', notes: 'Keep the long pause.', look: 'trip', fps: 12, frame: 12, range: { start: 1, end: 120 }, stage: { background: 'transparent' }, camera: { mode: 'orthographic', position: [2, 2, 4], target: [0, 1, 0], fov: .8, orthoSize: 3 }, pose: pose(), keyframes: [{ frame: 1, pose: pose() }, { frame: 12, pose: pose() }] }; }
function animatedTake() {
  const value = take();
  value.schema = 'nest-director-take/v2';
  value.animation = { transition: 'ease-in-out', loop: false };
  value.output = { width: 1920, height: 1080 };
  value.keyframes[0].transition = 'ease-out';
  value.keyframes[1].pose.bones.root.position[0] = .8;
  value.keyframes[1].pose.morphs.curl = .9;
  value.pose = structuredClone(value.keyframes[1].pose);
  return value;
}
async function fixture(t, now) {
  const directory = await mkdtemp(join(tmpdir(), 'nest-director-test-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const store = createLocalDirectorStore(directory);
  return { directory, store, service: createDirectorService({ store, registry, origin: 'https://director-preview.example', now }) };
}
const errorStatus = (status) => (error) => error instanceof DirectorError && error.status === status;

test('complete take preserves all editable controls and rejects malformed or unregistered data', () => {
  assert.deepEqual(JSON.parse(JSON.stringify(validateTake(take(), registry))), take());
  const mutations = [
    (v) => { v.asset.sha256 = 'b'.repeat(64); },
    (v) => { v.asset.url = 'http://localhost/private'; },
    (v) => { v.pose.bones.root.rotation = [0, 0, 0, 0]; },
    (v) => { v.pose.bones.root.position[0] = Infinity; },
    (v) => { delete v.pose.bones.head; },
    (v) => { v.pose.bones.other = v.pose.bones.root; },
    (v) => { v.pose.morphs.curl = NaN; },
    (v) => { v.pose.morphs.unknown = 0; },
    (v) => { v.keyframes[1].frame = 1; },
    (v) => { v.frame = 121; },
    (v) => { v.stage.background = 'https://example.com'; },
    (v) => { v.camera.target = v.camera.position; },
    (v) => { v.notes = 'x'.repeat(4001); },
    (v) => { v.name = 'x'.repeat(101); },
    (v) => { v.fps = 12.5; },
  ];
  for (const mutate of mutations) { const value = take(); mutate(value); assert.throws(() => validateTake(value, registry), errorStatus(400)); }
});

test('v1 normalization keeps its frozen serialized hash and rejects v2-only fields', () => {
  const normalized = validateTake(take(), registry);
  // Captured from the v1 validator before v2 was added, not recomputed from a
  // second copy of the new normalization implementation.
  assert.equal(createHash('sha256').update(JSON.stringify(normalized)).digest('hex'), '3803ed3c1150d4b3f111bf0d52406ddfa67e344e8a478f642c63aef54c5d15bc');
  assert.equal(Object.hasOwn(normalized, 'animation'), false);
  assert.equal(Object.hasOwn(normalized, 'output'), false);
  assert.ok(normalized.keyframes.every((key) => !Object.hasOwn(key, 'transition')));
  for (const field of ['animation', 'output']) {
    const value = take(); value[field] = animatedTake()[field];
    assert.throws(() => validateTake(value, registry), /unknown fields/);
  }
  const value = take(); value.keyframes[0].transition = 'hold';
  assert.throws(() => validateTake(value, registry), /unknown fields/);
});

test('v2 retains global animation, optional interval overrides and bounded output dimensions', () => {
  for (const transition of ['hold', 'linear', 'ease-in', 'ease-out', 'ease-in-out']) {
    const value = animatedTake(); value.animation.transition = transition; value.keyframes[0].transition = transition;
    const normalized = validateTake(value, registry);
    assert.deepEqual(JSON.parse(JSON.stringify(normalized)), value);
    assert.equal(Object.hasOwn(normalized.keyframes[1], 'transition'), false, 'inherited transition stays omitted');
  }
  for (const [width, height] of [[64, 64], [4096, 2160], [2160, 4096]]) {
    const value = animatedTake(); value.output = { width, height }; value.animation.loop = true;
    assert.deepEqual(validateTake(value, registry).output, value.output);
    assert.equal(validateTake(value, registry).animation.loop, true);
  }
  const mutations = [
    ['missing animation', (v) => { delete v.animation; }],
    ['missing output', (v) => { delete v.output; }],
    ['missing transition', (v) => { delete v.animation.transition; }],
    ['missing loop', (v) => { delete v.animation.loop; }],
    ['invalid transition', (v) => { v.animation.transition = 'spline'; }],
    ['invalid key override', (v) => { v.keyframes[0].transition = 'inherit'; }],
    ['null key override', (v) => { v.keyframes[0].transition = null; }],
    ['string loop', (v) => { v.animation.loop = 'false'; }],
    ['animation unknown field', (v) => { v.animation.duration = 5; }],
    ['output unknown field', (v) => { v.output.url = 'https://example.com'; }],
    ['key unknown field', (v) => { v.keyframes[0].duration = 5; }],
    ['take unknown field', (v) => { v.duration = 5; }],
    ['width below minimum', (v) => { v.output.width = 63; }],
    ['height above maximum', (v) => { v.output.height = 4097; }],
    ['fractional width', (v) => { v.output.width = 1080.5; }],
    ['nonfinite height', (v) => { v.output.height = Infinity; }],
    ['excess pixel area', (v) => { v.output = { width: 4096, height: 2161 }; }],
    ['fps unchanged upper bound', (v) => { v.fps = 61; }],
    ['range unchanged upper bound', (v) => { v.range.end = 36001; }],
  ];
  for (const [label, mutate] of mutations) {
    const value = animatedTake(); mutate(value);
    assert.throws(() => validateTake(value, registry), errorStatus(400), label);
  }
});

test('v2 animation settings and overrides survive another process and immutable retries', async (t) => {
  const { directory, service } = await fixture(t);
  const value = animatedTake(); const requestId = randomUUID();
  const saved = await service.save({ take: value, requestId }, actor);
  const childScript = `import {createLocalDirectorStore} from ${JSON.stringify(new URL('./directorLocalStore.js', import.meta.url).href)}; const r=await createLocalDirectorStore(process.argv[1]).get(process.argv[2]); process.stdout.write(JSON.stringify(r));`;
  const child = spawnSync(process.execPath, ['--input-type=module', '-e', childScript, directory, saved.saved.id], { encoding: 'utf8' });
  assert.equal(child.status, 0, child.stderr);
  const reopened = JSON.parse(child.stdout);
  assert.deepEqual(reopened.take, value); assert.equal(reopened.takeHash, saved.saved.takeHash);
  assert.deepEqual(await service.save({ take: value, requestId }, actor), saved);
  const changed = structuredClone(value); changed.keyframes[0].transition = 'hold';
  await assert.rejects(service.save({ take: changed, requestId }, actor), errorStatus(409));
  const revised = await service.save({ take: changed, requestId: randomUUID() }, actor);
  assert.notEqual(revised.saved.takeHash, saved.saved.takeHash, 'interval override contributes to immutable take identity');
  assert.equal((await service.list(crew)).takes.length, 0);
});

test('save survives another process reading the disk, and local success never claims shared delivery', async (t) => {
  const { directory, service } = await fixture(t);
  const requestId = randomUUID();
  const saved = await service.save({ take: take(), requestId }, actor);
  assert.equal(saved.storage, 'local-workspace'); assert.equal(saved.shared, false);
  assert.equal(saved.saved.id, `dir_${requestId}`);
  const childScript = `import {createLocalDirectorStore} from ${JSON.stringify(new URL('./directorLocalStore.js', import.meta.url).href)}; const r=await createLocalDirectorStore(process.argv[1]).get(process.argv[2]); process.stdout.write(JSON.stringify(r));`;
  const child = spawnSync(process.execPath, ['--input-type=module', '-e', childScript, directory, saved.saved.id], { encoding: 'utf8' });
  assert.equal(child.status, 0, child.stderr);
  const reopened = JSON.parse(child.stdout);
  assert.deepEqual(reopened.take, take());
  assert.equal(reopened.takeHash, saved.saved.takeHash);
  assert.equal((await service.list(crew)).takes.length, 0, 'saving does not send to Crew');
  const sent = await service.send({ id: saved.saved.id, requestId: randomUUID() }, actor);
  assert.equal(sent.delivery, 'local-workspace-only');
  assert.equal((await service.list(crew)).takes[0].id, saved.saved.id);
});

test('owner boundaries, immutable retries and explicit send idempotency', async (t) => {
  const { service, directory } = await fixture(t);
  const requestId = randomUUID();
  const first = await service.save({ take: take(), requestId }, actor);
  assert.deepEqual(await service.save({ take: take(), requestId }, actor), first);
  assert.equal((await readdir(directory)).filter((name) => name.startsWith('dir_')).length, 1);
  const changed = take(); changed.notes = 'Another intention';
  await assert.rejects(service.save({ take: changed, requestId }, actor), errorStatus(409));
  const other = { kind: 'operator', user: 'someone_else' };
  await assert.rejects(service.get(first.saved.id, other), errorStatus(404));
  await assert.rejects(service.send({ id: first.saved.id, requestId: randomUUID() }, other), errorStatus(404));
  await assert.rejects(service.save({ take: take(), requestId: randomUUID() }, crew), errorStatus(403));
  assert.equal((await service.list(other)).takes.length, 0);
  assert.equal((await service.get(first.saved.id, crew)).take.name, take().name);
  const sendRequest = { id: first.saved.id, requestId: randomUUID() };
  assert.deepEqual(await service.send(sendRequest, actor), await service.send(sendRequest, actor));
  assert.equal((await readdir(directory)).filter((name) => name.startsWith('dirsend_')).length, 1);
  await assert.rejects(service.get('../../escape', actor), errorStatus(400));
});

test('concurrent retries publish one complete immutable file, even with different contents', async (t) => {
  const { service, directory } = await fixture(t);
  const requestId = randomUUID(); const changed = take(); changed.name = 'Competing write';
  const results = await Promise.allSettled([
    service.save({ take: take(), requestId }, actor),
    service.save({ take: changed, requestId }, actor),
  ]);
  assert.equal(results.filter((r) => r.status === 'fulfilled').length, 1);
  assert.equal(results.find((r) => r.status === 'rejected').reason.status, 409);
  const files = await readdir(directory); assert.equal(files.length, 1);
  const opened = await service.get(`dir_${requestId}`, actor);
  assert.ok([take().name, changed.name].includes(opened.take.name));
});

test('same-millisecond pagination never loses a take and Crew list contains only explicitly sent items', async (t) => {
  const { service } = await fixture(t, () => '2026-11-25T02:00:00.000Z');
  const ids = [];
  for (let i = 0; i < 5; i++) ids.push((await service.save({ take: take(), requestId: randomUUID() }, actor)).saved.id);
  let before = null; const found = [];
  do { const page = await service.list(actor, { before, limit: 2 }); found.push(...page.takes.map((r) => r.id)); before = page.next; } while (before);
  assert.deepEqual(found.sort(), ids.sort());
  await service.send({ id: ids[1], requestId: randomUUID() }, actor);
  assert.deepEqual((await service.list(crew)).takes.map((r) => r.id), [ids[1]]);
});

test('storage failure cannot become a saved response', async () => {
  const service = createDirectorService({ registry, store: { storage: 'nest-shared', shared: true, async save() { throw new Error('offline'); } } });
  await assert.rejects(service.save({ take: take(), requestId: randomUUID() }, actor), /offline/);
});

test('Redis adapter uses atomic save and explicit route scripts, and lexicographic stable cursor', async () => {
  const calls = [];
  const redis = {
    async eval(script, keys, args) { calls.push({ script, keys, args }); return args[0]; },
    async zrange(...args) { calls.push({ zrange: args }); return []; },
  };
  const service = createDirectorService({ registry, store: createRedisDirectorStore(redis) });
  const saved = await service.save({ take: take(), requestId: randomUUID() }, actor);
  assert.equal(saved.shared, true); assert.equal(calls.length, 1);
  assert.match(calls[0].script, /redis.call\('SET'/); assert.match(calls[0].script, /redis.call\('ZADD'/);
  assert.equal(calls[0].keys.some((key) => key.startsWith('ch:')), false, 'save alone does not route');
  await service.list(actor);
  assert.equal(calls[1].zrange[3].byLex, true);
  // This checks our adapter contract, not an assertion of live Upstash use.
});

test('Crew route uses the API deployment origin and ignores client origin or URL fields', async () => {
  const calls = []; let record;
  const redis = {
    async eval(script, keys, args) { calls.push({ script, keys, args }); if (keys[0].includes(':take:')) record = JSON.parse(args[0]); return args[0]; },
    async get() { return record; },
  };
  const origin = 'https://nest-director-preview.example';
  const service = createDirectorService({ registry, origin, store: createRedisDirectorStore(redis) });
  const saved = await service.save({ take: take(), requestId: randomUUID() }, actor);
  const sent = await service.send({ id: saved.saved.id, requestId: randomUUID(), origin: 'https://untrusted.example', href: 'https://untrusted.example/forged' }, actor);
  const expected = `${origin}/director?take=${saved.saved.id}`;
  assert.equal(sent.relay.href, expected);
  assert.equal(sent.relay.sourceOrigin, origin);
  const message = JSON.parse(calls[1].args[2]);
  assert.ok(message.content.includes(expected));
  assert.equal(message.context, `${origin}/director`);
  assert.equal(JSON.stringify(message).includes('untrusted.example'), false);
  assert.equal(JSON.stringify(message).includes('https://rspdan.com'), false);
});

test('size bound protects oversized animation even when each scalar field is valid', () => {
  const many = structuredClone(registry);
  many.assets[0].bones = Array.from({ length: 96 }, (_, i) => `bone${i}`);
  const value = take(); value.range.end = 1000;
  const fullPose = { bones: Object.fromEntries(many.assets[0].bones.map((name) => [name, pose().bones.root])), morphs: { curl: .4 } };
  value.pose = fullPose;
  value.keyframes = Array.from({ length: 600 }, (_, i) => ({ frame: i + 1, pose: fullPose }));
  assert.ok(JSON.stringify(value).length > MAX_BODY_BYTES);
  assert.throws(() => validateTake(value, many), /too large/);
});
