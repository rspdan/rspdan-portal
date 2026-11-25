import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
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
async function fixture(t, now) {
  const directory = await mkdtemp(join(tmpdir(), 'nest-director-test-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const store = createLocalDirectorStore(directory);
  return { directory, store, service: createDirectorService({ store, registry, now }) };
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
