import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { validateTake, DirectorError } from './directorSchema.js';
import { createLocalDirectorStore } from './directorLocalStore.js';
import { createDirectorService } from './directorService.js';

const registry = { assets: [{ id: 'floorplan-test-body', sha256: 'c'.repeat(64), bones: ['root'], morphs: [] }] };
const actor = { kind: 'operator', user: 'dan' };
const plan = JSON.parse(readFileSync(new URL('../../docs/director/floorplan-fixture.json', import.meta.url))).plan;
function take() {
  return { schema: 'nest-director-take/v2', asset: { id: registry.assets[0].id, sha256: registry.assets[0].sha256 },
    name: 'Reusable set', notes: '', look: 'trip', fps: 24, frame: 1, range: { start: 1, end: 72 },
    stage: { background: 'white', design: {
      backdrop: { type: 'color', color: '#ffffff', image: null, fit: 'cover' },
      floor: { enabled: false, color: '#eeeeee', size: 20, height: 0 },
      objects: [{ id: 'existing-prop', name: 'Existing set piece', type: 'box', color: '#907452', position: [1, .5, 1], rotation: [0, .4, 0], scale: [1, 1, .5] }],
      floorplan: structuredClone(plan),
    } },
    camera: { mode: 'perspective', position: [5, 4, 6], target: [0, 1, 0], fov: .8, orthoSize: 8 },
    pose: { bones: { root: { position: [.1, .02, .3], rotation: [0, 0, 0, 1], scale: [1, 1, 1] } }, morphs: {} },
    keyframes: [], animation: { transition: 'ease-in-out', loop: true }, output: { width: 720, height: 720 },
  };
}

test('floorplan take normalization keeps rooms, openings and levels alongside existing props and pose', () => {
  const value = take();
  assert.deepEqual(JSON.parse(JSON.stringify(validateTake(value, registry))), value);
  const legacy = take(); delete legacy.stage.design.floorplan;
  assert.deepEqual(JSON.parse(JSON.stringify(validateTake(legacy, registry))), legacy, 'old stage documents receive no new defaults');
});

test('invalid floorplan data reports a client error rather than silently dropping a set', () => {
  for (const modify of [
    p => { p.levels[0].elevation = NaN; },
    p => { p.rooms[0].levelId = 'missing-level'; },
    p => { p.rooms[0].points = [[0,0],[2,2],[0,2],[2,0]]; },
    p => { p.geometry = {}; },
  ]) {
    const value = take(); modify(value.stage.design.floorplan);
    assert.throws(() => validateTake(value, registry), error => error instanceof DirectorError && error.status === 400 && /floorplan/.test(error.message));
  }
});

test('large plan framing can be saved without relaxing legacy camera bounds', () => {
  const value = take();
  value.camera.position = [5000, 12000, 15000];
  value.camera.target = [5000, 10000, 5000];
  value.camera.orthoSize = 16000;
  assert.deepEqual(validateTake(value, registry).camera, value.camera);
  const legacy = structuredClone(value); delete legacy.stage.design.floorplan;
  assert.throws(() => validateTake(legacy, registry), /camera.position/);
  for (const bad of [Infinity, NaN, 1e9 + 1]) {
    const invalid = structuredClone(value); invalid.camera.position[0] = bad;
    assert.throws(() => validateTake(invalid, registry), /camera.position/);
  }
});

test('a reusable floorplan survives fresh-process save/reopen and changes immutable take identity', async t => {
  const directory = await mkdtemp(join(tmpdir(), 'odk-floorplan-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const service = createDirectorService({ store: createLocalDirectorStore(directory), registry, origin: 'https://local.example' });
  const value = take(), requestId = randomUUID();
  const saved = await service.save({ take: value, requestId }, actor);
  const script = `import {createLocalDirectorStore} from ${JSON.stringify(new URL('./directorLocalStore.js', import.meta.url).href)}; process.stdout.write(JSON.stringify(await createLocalDirectorStore(process.argv[1]).get(process.argv[2])));`;
  const child = spawnSync(process.execPath, ['--input-type=module', '-e', script, directory, saved.saved.id], { encoding: 'utf8' });
  assert.equal(child.status, 0, child.stderr);
  assert.deepEqual(JSON.parse(child.stdout).take, value);
  const revised = structuredClone(value); revised.stage.design.floorplan.rooms[0].name = 'Renamed room';
  await assert.rejects(service.save({ take: revised, requestId }, actor), error => error instanceof DirectorError && error.status === 409);
  const second = await service.save({ take: revised, requestId: randomUUID() }, actor);
  assert.notEqual(second.saved.takeHash, saved.saved.takeHash);
  assert.deepEqual((await service.get(saved.saved.id, actor)).take, value, 'editing a plan does not overwrite a prior take');
});
