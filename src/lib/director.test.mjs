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
const pixelPng = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a7gAAAABJRU5ErkJggg==';
function sceneTake() {
  const value = animatedTake(); value.tripGlow = .35;
  value.tripFlare = .6;
  value.tripTemperature = 2700;
  value.outline = { enabled: true, tone: 0, width: .0025 };
  value.lighting = {
    ambient: { intensity: .4, color: '#ffffff' },
    lights: ['point', 'spot', 'directional'].map((type, i) => ({
      id: `light-${i}`, name: `Light ${i}`, type, enabled: i !== 1, color: '#c0ddee', intensity: 2,
      position: [i, 2, -3], rotation: [0, .5, 0], angle: .8, range: 20,
    })),
  };
  value.stage.design = {
    backdrop: { type: 'image', color: '#ffffff', image: { dataUrl: pixelPng, name: 'Local test.png' }, fit: 'contain' },
    floor: { enabled: true, color: '#eeeeee', size: 200, height: -.005 },
    objects: ['box', 'sphere', 'plane'].map((type, i) => ({
      id: `stage-${i}`, name: `Set piece ${i}`, type, color: '#445566',
      position: [i, 0, 0], rotation: [0, .2, 0], scale: [1, 2, .5],
    })),
  };
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

test('v2 Trip glow is an optional bounded global value, retained while Ouch is selected', () => {
  for (const look of ['ouch', 'trip']) {
    for (const tripGlow of [0, .375, 1]) {
      const value = animatedTake(); value.look = look; value.tripGlow = tripGlow;
      assert.deepEqual(JSON.parse(JSON.stringify(validateTake(value, registry))), value);
    }
  }
  for (const tripGlow of [-.001, 1.001, NaN, Infinity, -Infinity, '0.5', null, undefined, true, {}, []]) {
    const value = animatedTake(); value.tripGlow = tripGlow;
    assert.throws(() => validateTake(value, registry), errorStatus(400));
  }
  const legacy = take(); legacy.tripGlow = 0;
  assert.throws(() => validateTake(legacy, registry), /unknown fields/);
  for (const target of ['key', 'pose', 'stage']) {
    const value = animatedTake();
    (target === 'key' ? value.keyframes[0] : value[target]).tripGlow = .5;
    assert.throws(() => validateTake(value, registry), /unknown fields/);
  }
});

test('v2 Trip head flare is optional, bounded and independent of body glow', () => {
  for (const look of ['ouch', 'trip']) {
    for (const tripFlare of [0, .375, 1]) {
      const value = animatedTake(); value.look = look; value.tripFlare = tripFlare; value.tripGlow = 0;
      assert.deepEqual(JSON.parse(JSON.stringify(validateTake(value, registry))), value);
    }
  }
  for (const tripFlare of [-.001, 1.001, NaN, Infinity, -Infinity, '0.5', null, undefined, true, {}, []]) {
    const value = animatedTake(); value.tripFlare = tripFlare;
    assert.throws(() => validateTake(value, registry), errorStatus(400));
  }
  const legacy = take(); legacy.tripFlare = 0;
  assert.throws(() => validateTake(legacy, registry), /unknown fields/);
  for (const target of ['key', 'pose', 'stage']) {
    const value = animatedTake();
    (target === 'key' ? value.keyframes[0] : value[target]).tripFlare = .5;
    assert.throws(() => validateTake(value, registry), /unknown fields/);
  }
});

test('v2 Trip temperature is finite bounded Kelvin and only a global take setting', () => {
  for (const look of ['ouch', 'trip']) {
    for (const tripTemperature of [1800, 2700, 6500, 10000]) {
      const value = animatedTake(); value.look = look; value.tripTemperature = tripTemperature;
      assert.deepEqual(JSON.parse(JSON.stringify(validateTake(value, registry))), value);
    }
  }
  for (const tripTemperature of [1799.9, 10000.1, NaN, Infinity, -Infinity, '2700', null, undefined, true, {}, []]) {
    const value = animatedTake(); value.tripTemperature = tripTemperature;
    assert.throws(() => validateTake(value, registry), errorStatus(400));
  }
  const legacy = take(); legacy.tripTemperature = 6500;
  assert.throws(() => validateTake(legacy, registry), /unknown fields/);
  for (const target of ['key', 'pose', 'stage']) {
    const value = animatedTake();
    (target === 'key' ? value.keyframes[0] : value[target]).tripTemperature = 2700;
    assert.throws(() => validateTake(value, registry), /unknown fields/);
  }
});

test('old v2 takes retain their pre-appearance serialized identity without injected defaults', () => {
  const normalized = validateTake(animatedTake(), registry);
  // Captured by running the existing validator before tripGlow support.
  assert.equal(createHash('sha256').update(JSON.stringify(normalized)).digest('hex'), '7ffed9e385743ecd24ea57933d8b09c346de66a15bd261a2303b75b81fb72bb6');
  assert.equal(Object.hasOwn(normalized, 'tripGlow'), false);
  assert.equal(Object.hasOwn(normalized, 'tripFlare'), false);
  assert.equal(Object.hasOwn(normalized, 'tripTemperature'), false);
  assert.equal(Object.hasOwn(normalized, 'tripBodyTemperature'), false);
  assert.equal(Object.hasOwn(normalized, 'tripLightColor'), false);
  assert.equal(Object.hasOwn(normalized, 'tripLens'), false);
  assert.equal(Object.hasOwn(normalized, 'outline'), false);
  assert.equal(Object.hasOwn(normalized, 'lighting'), false);
  assert.equal(Object.hasOwn(normalized.stage, 'design'), false);
  assert.deepEqual(JSON.parse(JSON.stringify(normalized)), animatedTake());
});

test('Trip glow survives a fresh-process reopen and contributes to immutable save identity', async (t) => {
  const { directory, service } = await fixture(t);
  const value = animatedTake(); value.tripGlow = .625;
  const requestId = randomUUID();
  const saved = await service.save({ take: value, requestId }, actor);
  assert.equal(saved.shared, false);
  const childScript = `import {createLocalDirectorStore} from ${JSON.stringify(new URL('./directorLocalStore.js', import.meta.url).href)}; const r=await createLocalDirectorStore(process.argv[1]).get(process.argv[2]); process.stdout.write(JSON.stringify(r));`;
  const child = spawnSync(process.execPath, ['--input-type=module', '-e', childScript, directory, saved.saved.id], { encoding: 'utf8' });
  assert.equal(child.status, 0, child.stderr);
  const reopened = JSON.parse(child.stdout);
  assert.deepEqual(reopened.take, value);
  assert.equal(reopened.takeHash, saved.saved.takeHash);
  assert.deepEqual(await service.save({ take: value, requestId }, actor), saved);
  const changed = structuredClone(value); changed.tripGlow = .25;
  await assert.rejects(service.save({ take: changed, requestId }, actor), errorStatus(409));
  const revised = await service.save({ take: changed, requestId: randomUUID() }, actor);
  assert.notEqual(revised.saved.takeHash, saved.saved.takeHash);
  assert.equal((await service.get(saved.saved.id, actor)).take.tripGlow, .625);
});

test('v2 outline requires exactly enabled, bounded tone and world-unit width for either character', () => {
  for (const look of ['ouch', 'trip']) {
    for (const outline of [
      { enabled: true, tone: 0, width: .0005 },
      { enabled: true, tone: .5, width: .0025 },
      { enabled: false, tone: 1, width: .01 },
    ]) {
      const value = animatedTake(); value.look = look; value.outline = outline;
      assert.deepEqual(JSON.parse(JSON.stringify(validateTake(value, registry))), value);
    }
  }
  const invalid = [null, undefined, [], true, 'outline', {},
    { enabled: true, tone: .5 }, { enabled: true, width: .0025 }, { tone: .5, width: .0025 },
    { enabled: true, tone: .5, width: .0025, opacity: .5 },
    ...['true', 1, null].map(enabled => ({ enabled, tone: .5, width: .0025 })),
    ...[-.001, 1.001, NaN, Infinity, '0.5', null].map(tone => ({ enabled: true, tone, width: .0025 })),
    ...[0, .00049, .01001, NaN, Infinity, '0.0025', null].map(width => ({ enabled: false, tone: .5, width })),
  ];
  for (const outline of invalid) {
    const value = animatedTake(); value.outline = outline;
    assert.throws(() => validateTake(value, registry), errorStatus(400));
  }
  const legacy = take(); legacy.outline = { enabled: false, tone: 0, width: .0025 };
  assert.throws(() => validateTake(legacy, registry), /unknown fields/);
  for (const target of ['key', 'pose', 'stage']) {
    const value = animatedTake();
    (target === 'key' ? value.keyframes[0] : value[target]).outline = legacy.outline;
    assert.throws(() => validateTake(value, registry), /unknown fields/);
  }
});

test('outline and glow coexist across fresh-process reopen, with every outline control in save identity', async (t) => {
  const { directory, service } = await fixture(t);
  const value = animatedTake(); value.tripGlow = .25;
  value.outline = { enabled: true, tone: .5, width: .0025 };
  const requestId = randomUUID();
  const saved = await service.save({ take: value, requestId }, actor);
  const childScript = `import {createLocalDirectorStore} from ${JSON.stringify(new URL('./directorLocalStore.js', import.meta.url).href)}; const r=await createLocalDirectorStore(process.argv[1]).get(process.argv[2]); process.stdout.write(JSON.stringify(r));`;
  const child = spawnSync(process.execPath, ['--input-type=module', '-e', childScript, directory, saved.saved.id], { encoding: 'utf8' });
  assert.equal(child.status, 0, child.stderr);
  const reopened = JSON.parse(child.stdout);
  assert.deepEqual(reopened.take, value);
  assert.equal(reopened.takeHash, saved.saved.takeHash);
  assert.deepEqual(await service.save({ take: value, requestId }, actor), saved);
  for (const [field, next] of [['enabled', false], ['tone', 1], ['width', .01]]) {
    const changed = structuredClone(value); changed.outline[field] = next;
    await assert.rejects(service.save({ take: changed, requestId }, actor), errorStatus(409));
    const revised = await service.save({ take: changed, requestId: randomUUID() }, actor);
    assert.notEqual(revised.saved.takeHash, saved.saved.takeHash, field);
  }
  assert.deepEqual((await service.get(saved.saved.id, actor)).take, value);
});

test('v2 lighting and stage preserve complete scene controls and accept bounded empty/maximal scenes', () => {
  for (const background of ['white', 'green', 'transparent']) {
    const value = sceneTake(); value.stage.background = background;
    assert.deepEqual(JSON.parse(JSON.stringify(validateTake(value, registry))), value);
  }
  const empty = sceneTake(); empty.lighting.lights = []; empty.stage.design.objects = [];
  empty.stage.design.backdrop.image = null;
  assert.deepEqual(JSON.parse(JSON.stringify(validateTake(empty, registry))), empty);
  const value = sceneTake();
  value.lighting.ambient.intensity = 3;
  value.lighting.lights = Array.from({ length: 8 }, (_, i) => ({ ...value.lighting.lights[0], id: `light-max-${i}`, intensity: 20, position: [-100, 0, 100], rotation: [-100, 0, 100], angle: 3.14, range: 100 }));
  value.stage.design.floor.height = -10;
  value.stage.design.objects = Array.from({ length: 32 }, (_, i) => ({ ...value.stage.design.objects[0], id: `stage-max-${i}`, position: [-100, 0, 100], rotation: [-100, 0, 100], scale: [.01, 1, 100] }));
  assert.deepEqual(JSON.parse(JSON.stringify(validateTake(value, registry))), value);
  value.lighting.lights[0].angle = .1; value.lighting.lights[0].range = .1; value.lighting.lights[0].intensity = 0;
  value.lighting.ambient.intensity = 0; value.stage.design.floor.size = 1; value.stage.design.floor.height = 10;
  value.stage.design.backdrop.type = 'color'; value.stage.design.backdrop.fit = 'cover';
  assert.deepEqual(JSON.parse(JSON.stringify(validateTake(value, registry))), value);
  for (const field of ['lighting', 'design']) {
    const legacy = take();
    if (field === 'lighting') legacy.lighting = value.lighting; else legacy.stage.design = value.stage.design;
    assert.throws(() => validateTake(legacy, registry), /unknown fields/);
  }
});

test('scene nodes require all declared fields, reject nested extras and keep IDs unambiguous', () => {
  const selectors = [
    v => v.lighting, v => v.lighting.ambient, v => v.lighting.lights[0],
    v => v.stage.design, v => v.stage.design.backdrop, v => v.stage.design.backdrop.image,
    v => v.stage.design.floor, v => v.stage.design.objects[0],
  ];
  for (const select of selectors) {
    for (const field of Object.keys(select(sceneTake()))) {
      const value = sceneTake(); delete select(value)[field];
      assert.throws(() => validateTake(value, registry), errorStatus(400), `missing ${field}`);
    }
    const value = sceneTake(); select(value).url = 'https://example.com/extra';
    assert.throws(() => validateTake(value, registry), errorStatus(400));
  }
  for (const id of ['', 'has space', '../path', '__proto__', 'constructor', 'a'.repeat(65), 'root', 'head']) {
    for (const select of [v => v.lighting.lights[0], v => v.stage.design.objects[0]]) {
      const value = sceneTake(); select(value).id = id;
      assert.throws(() => validateTake(value, registry), errorStatus(400));
    }
  }
  for (const collide of [
    v => { v.lighting.lights[1].id = v.lighting.lights[0].id; },
    v => { v.stage.design.objects[1].id = v.stage.design.objects[0].id; },
    v => { v.stage.design.objects[0].id = v.lighting.lights[0].id; },
  ]) {
    const value = sceneTake(); collide(value);
    assert.throws(() => validateTake(value, registry), /duplicates/);
  }
});

test('light attachments and visible effects are optional and independently bounded', () => {
  const old = sceneTake(), normalized = validateTake(old, registry);
  assert.deepEqual(JSON.parse(JSON.stringify(normalized)), old);
  for (const light of normalized.lighting.lights) {
    assert.equal(Object.hasOwn(light, 'attachment'), false);
    assert.equal(Object.hasOwn(light, 'effect'), false);
    assert.equal(Object.hasOwn(light, 'flare'), false);
    assert.equal(Object.hasOwn(light, 'lens'), false);
  }
  for (const attachment of ['world', 'head', 'hand.L', 'hand.R']) {
    for (const shape of ['none', 'ball', 'beam']) {
      for (const [radius, length, strength] of [[.005, .05, 0], [.06, 1, .5], [1, 10, 1]]) {
        const value = sceneTake(); Object.assign(value.lighting.lights[0], { attachment, effect: { shape, radius, length, strength } });
        assert.deepEqual(JSON.parse(JSON.stringify(validateTake(value, registry))), value);
      }
    }
  }
  for (const attachment of [null, undefined, 0, {}, 'hand', 'hand.l', 'foot.L', '__proto__']) {
    const value = sceneTake(); value.lighting.lights[0].attachment = attachment;
    assert.throws(() => validateTake(value, registry), errorStatus(400));
  }
  const effect = { shape: 'ball', radius: .06, length: 1, strength: .5 };
  for (const invalid of [null, undefined, [], {}, true, 'ball',
    ...Object.keys(effect).map(key => { const missing = { ...effect }; delete missing[key]; return missing; }),
    { ...effect, bloom: 1 }, { ...effect, shape: 'flare' },
    ...[.0049, 1.001, NaN, Infinity, '.06', null].map(radius => ({ ...effect, radius })),
    ...[.049, 10.001, NaN, Infinity, '1', null].map(length => ({ ...effect, length })),
    ...[-.001, 1.001, NaN, Infinity, '.5', null].map(strength => ({ ...effect, strength })),
  ]) {
    const value = sceneTake(); value.lighting.lights[0].effect = invalid;
    assert.throws(() => validateTake(value, registry), errorStatus(400));
  }
});

test('per-light glass flare is optional, finite and independent of visible effect and brightness', () => {
  for (const flare of [0, .5, 1]) {
    const value = sceneTake(); Object.assign(value.lighting.lights[0], { flare, intensity: 0, effect: { shape: 'none', radius: .06, length: 1, strength: 0 } });
    assert.deepEqual(JSON.parse(JSON.stringify(validateTake(value, registry))), value);
  }
  for (const flare of [-.001, 1.001, NaN, Infinity, -Infinity, '.5', null, undefined, true, {}, []]) {
    const value = sceneTake(); value.lighting.lights[0].flare = flare;
    assert.throws(() => validateTake(value, registry), errorStatus(400));
  }
});

test('independent Trip body temperature is optional bounded Kelvin and global only', () => {
  for (const tripBodyTemperature of [1800, 2700, 6500, 10000]) {
    const value = sceneTake(); value.tripTemperature = 2700; value.tripBodyTemperature = tripBodyTemperature;
    assert.deepEqual(JSON.parse(JSON.stringify(validateTake(value, registry))), value);
  }
  for (const tripBodyTemperature of [1799, 10001, NaN, Infinity, '6500', null, undefined, true, {}]) {
    const value = animatedTake(); value.tripBodyTemperature = tripBodyTemperature;
    assert.throws(() => validateTake(value, registry), errorStatus(400));
  }
  const legacy = take(); legacy.tripBodyTemperature = 6500;
  assert.throws(() => validateTake(legacy, registry), /unknown fields/);
  for (const target of ['key', 'pose', 'stage']) {
    const value = animatedTake(); (target === 'key' ? value.keyframes[0] : value[target]).tripBodyTemperature = 6500;
    assert.throws(() => validateTake(value, registry), /unknown fields/);
  }
});

test('Trip HSL source recipes are optional, complete and bounded without saved preview clock state', () => {
  const recipe = { mode: 'hsl', hue: 30, saturation: 1, lightness: .5, periodSeconds: 60 };
  for (const mode of ['temperature', 'hsl', 'cycle']) {
    for (const config of [{ ...recipe, mode }, { mode, hue: 0, saturation: 0, lightness: 0, periodSeconds: .5 }, { mode, hue: 360, saturation: 1, lightness: 1, periodSeconds: 3600 }]) {
      const value = sceneTake(); value.tripLightColor = config; value.tripBodyTemperature = 6500;
      assert.deepEqual(JSON.parse(JSON.stringify(validateTake(value, registry))), value);
    }
  }
  const invalid = [null, undefined, [], true, 'hsl', {}, { ...recipe, mode: 'rainbow' }, { ...recipe, elapsedSeconds: 4 }, { ...recipe, paused: true },
    ...Object.keys(recipe).map(key => { const partial = { ...recipe }; delete partial[key]; return partial; })];
  for (const [field, values] of [
    ['hue', [-.01, 360.01, NaN, Infinity, '30', null]],
    ['saturation', [-.001, 1.001, NaN, Infinity, '1', null]],
    ['lightness', [-.001, 1.001, NaN, Infinity, '.5', null]],
    ['periodSeconds', [.499, 3600.001, NaN, Infinity, '60', null]],
  ]) for (const value of values) invalid.push({ ...recipe, [field]: value });
  for (const config of invalid) {
    const value = sceneTake(); value.tripLightColor = config;
    assert.throws(() => validateTake(value, registry), errorStatus(400));
  }
  const legacy = take(); legacy.tripLightColor = recipe;
  assert.throws(() => validateTake(legacy, registry), /unknown fields/);
  for (const target of ['key', 'pose', 'stage']) {
    const value = animatedTake(); (target === 'key' ? value.keyframes[0] : value[target]).tripLightColor = recipe;
    assert.throws(() => validateTake(value, registry), /unknown fields/);
  }
});

test('Trip cycle recipe survives fresh-process reopen and immutable saves without a runtime phase', async (t) => {
  const { directory, service } = await fixture(t);
  const value = sceneTake(); value.tripLightColor = { mode: 'cycle', hue: 120, saturation: .8, lightness: .4, periodSeconds: 60 }; value.tripBodyTemperature = 6500;
  const requestId = randomUUID(), saved = await service.save({ take: value, requestId }, actor);
  const childScript = `import {createLocalDirectorStore} from ${JSON.stringify(new URL('./directorLocalStore.js', import.meta.url).href)}; const r=await createLocalDirectorStore(process.argv[1]).get(process.argv[2]); process.stdout.write(JSON.stringify(r));`;
  const child = spawnSync(process.execPath, ['--input-type=module', '-e', childScript, directory, saved.saved.id], { encoding: 'utf8' });
  assert.equal(child.status, 0, child.stderr);
  const reopened = JSON.parse(child.stdout);
  assert.deepEqual(reopened.take, value); assert.equal(reopened.takeHash, saved.saved.takeHash);
  assert.deepEqual(await service.save({ take: value, requestId }, actor), saved);
  for (const [field, next] of [['mode','hsl'],['hue',240],['saturation',.5],['lightness',.6],['periodSeconds',10]]) {
    const changed = structuredClone(value); changed.tripLightColor[field] = next;
    await assert.rejects(service.save({ take: changed, requestId }, actor), errorStatus(409));
    const revised = await service.save({ take: changed, requestId: randomUUID() }, actor);
    assert.notEqual(revised.saved.takeHash, saved.saved.takeHash, field);
  }
  assert.deepEqual((await service.get(saved.saved.id, actor)).take, value);
});

test('head and per-light lenses validate full independent component settings', () => {
  const lens = { preset: 'glow', glow: 1, rays: 0, streak: 0, ghosts: 0, spread: 1, rotation: 0, rayCount: 8 };
  const assign = (value, target, settings) => { if (target === 'trip') value.tripLens = settings; else value.lighting.lights[0].lens = settings; };
  for (const target of ['trip', 'light']) {
    for (const preset of ['glow', 'starburst', 'anamorphic', 'glass']) {
      for (const settings of [{ ...lens, preset }, { preset, glow: 0, rays: 1, streak: 1, ghosts: 1, spread: .25, rotation: -180, rayCount: 4 }, { preset, glow: 1, rays: 1, streak: 1, ghosts: 1, spread: 2, rotation: 180, rayCount: 16 }]) {
        const value = sceneTake(); assign(value, target, settings);
        assert.deepEqual(JSON.parse(JSON.stringify(validateTake(value, registry))), value);
      }
    }
    const invalid = [null, undefined, [], true, 'glow', {}, { ...lens, preset: 'sun' }, { ...lens, unknown: 0 },
      ...Object.keys(lens).map(key => { const partial = { ...lens }; delete partial[key]; return partial; })];
    for (const field of ['glow', 'rays', 'streak', 'ghosts']) for (const v of [-.001, 1.001, NaN, Infinity, null, '.5']) invalid.push({ ...lens, [field]: v });
    for (const [field, values] of [['spread', [.249, 2.001, NaN, null]], ['rotation', [-181, 181, Infinity, '0']], ['rayCount', [3, 17, 4.5, NaN, null, '8']]]) for (const v of values) invalid.push({ ...lens, [field]: v });
    for (const settings of invalid) {
      const value = sceneTake(); assign(value, target, settings);
      assert.throws(() => validateTake(value, registry), errorStatus(400));
    }
  }
  const legacy = take(); legacy.tripLens = lens;
  assert.throws(() => validateTake(legacy, registry), /unknown fields/);
});

test('body temperature and independent lens recipes survive fresh-process reopen with immutable identity', async (t) => {
  const { directory, service } = await fixture(t);
  const value = sceneTake(); value.tripBodyTemperature = 6500;
  value.tripLens = { preset: 'starburst', glow: .5, rays: 1, streak: 0, ghosts: 0, spread: 1, rotation: 45, rayCount: 12 };
  value.lighting.lights[0].lens = { preset: 'glass', glow: .7, rays: .15, streak: 0, ghosts: 1, spread: 1.5, rotation: 0, rayCount: 8 };
  const requestId = randomUUID(), saved = await service.save({ take: value, requestId }, actor);
  const childScript = `import {createLocalDirectorStore} from ${JSON.stringify(new URL('./directorLocalStore.js', import.meta.url).href)}; const r=await createLocalDirectorStore(process.argv[1]).get(process.argv[2]); process.stdout.write(JSON.stringify(r));`;
  const child = spawnSync(process.execPath, ['--input-type=module', '-e', childScript, directory, saved.saved.id], { encoding: 'utf8' });
  assert.equal(child.status, 0, child.stderr);
  const reopened = JSON.parse(child.stdout);
  assert.deepEqual(reopened.take, value); assert.equal(reopened.takeHash, saved.saved.takeHash);
  assert.deepEqual(await service.save({ take: value, requestId }, actor), saved);
  for (const mutate of [
    v => { delete v.tripBodyTemperature; },
    v => { v.tripLens.rays = .5; },
    v => { v.tripLens.rotation = -45; },
    v => { v.tripLens.rayCount = 6; },
    v => { v.lighting.lights[0].lens.preset = 'anamorphic'; },
    v => { v.lighting.lights[0].lens.ghosts = 0; },
  ]) {
    const changed = structuredClone(value); mutate(changed);
    await assert.rejects(service.save({ take: changed, requestId }, actor), errorStatus(409));
    const revised = await service.save({ take: changed, requestId: randomUUID() }, actor);
    assert.notEqual(revised.saved.takeHash, saved.saved.takeHash);
  }
  assert.deepEqual((await service.get(saved.saved.id, actor)).take, value);
});

test('attached hand effects survive fresh-process reopen and immutable save identity', async (t) => {
  const { directory, service } = await fixture(t);
  const value = sceneTake();
  Object.assign(value.lighting.lights[0], { attachment: 'hand.L', flare: .65, effect: { shape: 'ball', radius: .06, length: 1, strength: .5 } });
  Object.assign(value.lighting.lights[1], { attachment: 'hand.R', effect: { shape: 'beam', radius: .1, length: 2, strength: .8 } });
  const requestId = randomUUID(), saved = await service.save({ take: value, requestId }, actor);
  const childScript = `import {createLocalDirectorStore} from ${JSON.stringify(new URL('./directorLocalStore.js', import.meta.url).href)}; const r=await createLocalDirectorStore(process.argv[1]).get(process.argv[2]); process.stdout.write(JSON.stringify(r));`;
  const child = spawnSync(process.execPath, ['--input-type=module', '-e', childScript, directory, saved.saved.id], { encoding: 'utf8' });
  assert.equal(child.status, 0, child.stderr);
  const reopened = JSON.parse(child.stdout);
  assert.deepEqual(reopened.take, value); assert.equal(reopened.takeHash, saved.saved.takeHash);
  assert.deepEqual(await service.save({ take: value, requestId }, actor), saved);
  for (const mutate of [
    v => { v.lighting.lights[0].attachment = 'world'; },
    v => { v.lighting.lights[0].flare = 0; },
    v => { v.lighting.lights[0].effect.shape = 'none'; },
    v => { v.lighting.lights[0].effect.radius = .1; },
    v => { v.lighting.lights[0].effect.length = 3; },
    v => { v.lighting.lights[0].effect.strength = 1; },
  ]) {
    const changed = structuredClone(value); mutate(changed);
    await assert.rejects(service.save({ take: changed, requestId }, actor), errorStatus(409));
    const revised = await service.save({ take: changed, requestId: randomUUID() }, actor);
    assert.notEqual(revised.saved.takeHash, saved.saved.takeHash);
  }
  assert.deepEqual((await service.get(saved.saved.id, actor)).take, value);
});

test('scene bounds reject malformed arrays, booleans, transforms, colors and excessive nodes', () => {
  const mutations = [
    v => { v.lighting = null; }, v => { v.stage.design = []; },
    v => { v.lighting.lights = {}; }, v => { v.stage.design.objects = null; },
    v => { v.lighting.lights = Array(9).fill(v.lighting.lights[0]); },
    v => { v.stage.design.objects = Array(33).fill(v.stage.design.objects[0]); },
    v => { v.lighting.ambient.intensity = 3.01; }, v => { v.lighting.ambient.intensity = -.01; },
    v => { v.lighting.ambient.color = 'white'; }, v => { v.lighting.lights[0].color = '#fff'; },
    v => { v.lighting.lights[0].enabled = 'true'; }, v => { v.lighting.lights[0].name = 'x'.repeat(61); },
    v => { v.lighting.lights[0].type = 'area'; }, v => { v.lighting.lights[0].intensity = Infinity; },
    v => { v.lighting.lights[0].intensity = 20.01; }, v => { v.lighting.lights[0].angle = .099; },
    v => { v.lighting.lights[0].angle = 3.141; }, v => { v.lighting.lights[0].range = 0; },
    v => { v.lighting.lights[0].range = 101; }, v => { v.lighting.lights[0].position = [0, 0]; },
    v => { v.lighting.lights[0].rotation = [0, NaN, 0]; },
    v => { v.stage.design.floor.enabled = 1; }, v => { v.stage.design.floor.color = '#gggggg'; },
    v => { v.stage.design.floor.size = 201; }, v => { v.stage.design.floor.size = .99; },
    v => { v.stage.design.floor.height = -10.01; }, v => { v.stage.design.floor.height = 10.01; },
    v => { v.stage.design.objects[0].type = 'url'; }, v => { v.stage.design.objects[0].name = 'x'.repeat(61); },
    v => { v.stage.design.objects[0].scale = [1, 0, 1]; }, v => { v.stage.design.objects[0].scale = [1, 101, 1]; },
    v => { v.stage.design.objects[0].position = [0, 101, 0]; }, v => { v.stage.design.objects[0].rotation = [0, -101, 0]; },
    v => { v.stage.design.backdrop.fit = 'stretch'; }, v => { v.stage.design.backdrop.type = 'video'; },
    v => { v.stage.design.backdrop.color = '#ffffff00'; },
  ];
  for (const mutate of mutations) {
    const value = sceneTake(); mutate(value);
    assert.throws(() => validateTake(value, registry), errorStatus(400));
  }
});

test('backdrop data is bounded local raster base64, never an external URL or executable image type', () => {
  for (const mime of ['png', 'jpeg', 'webp']) {
    const value = sceneTake(); value.stage.design.backdrop.image.dataUrl = `data:image/${mime};base64,AQIDBA==`;
    assert.equal(validateTake(value, registry).stage.design.backdrop.image.dataUrl, value.stage.design.backdrop.image.dataUrl);
  }
  const nearLimit = sceneTake(); nearLimit.stage.design.backdrop.image.dataUrl = 'data:image/png;base64,' + 'AAAA'.repeat(99994);
  assert.ok(nearLimit.stage.design.backdrop.image.dataUrl.length <= 400000);
  assert.equal(validateTake(nearLimit, registry).stage.design.backdrop.image.dataUrl, nearLimit.stage.design.backdrop.image.dataUrl);
  for (const dataUrl of ['https://example.com/image.png', 'file:///image.png', 'data:image/svg+xml;base64,PHN2Zz4=',
    'data:text/html;base64,AAAA', 'data:image/png,AAAA', 'data:image/png;base64,', 'data:image/png;base64,A===',
    'data:image/png;base64,AAA', 'data:image/png;base64,AA A=', 'data:image/png;base64,AAAA\n',
    'data:image/png;base64,' + 'AAAA'.repeat(100000)]) {
    const value = sceneTake(); value.stage.design.backdrop.image.dataUrl = dataUrl;
    assert.throws(() => validateTake(value, registry), errorStatus(400));
  }
  const longName = sceneTake(); longName.stage.design.backdrop.image.name = 'x'.repeat(101);
  assert.throws(() => validateTake(longName, registry), errorStatus(400));
});

test('complete scene survives fresh-process reopen and immutable retries without losing appearance or motion', async (t) => {
  const { directory, service } = await fixture(t);
  const value = sceneTake(); const requestId = randomUUID();
  const saved = await service.save({ take: value, requestId }, actor);
  const childScript = `import {createLocalDirectorStore} from ${JSON.stringify(new URL('./directorLocalStore.js', import.meta.url).href)}; const r=await createLocalDirectorStore(process.argv[1]).get(process.argv[2]); process.stdout.write(JSON.stringify(r));`;
  const child = spawnSync(process.execPath, ['--input-type=module', '-e', childScript, directory, saved.saved.id], { encoding: 'utf8' });
  assert.equal(child.status, 0, child.stderr);
  const reopened = JSON.parse(child.stdout);
  assert.deepEqual(reopened.take, value); assert.equal(reopened.takeHash, saved.saved.takeHash);
  assert.deepEqual(await service.save({ take: value, requestId }, actor), saved);
  for (const mutate of [
    v => { v.tripFlare = 0; },
    v => { v.tripTemperature = 6500; },
    v => { v.lighting.lights[0].position[0] = 5; },
    v => { v.stage.design.objects[0].rotation[1] = .9; },
    v => { v.stage.design.backdrop.image = null; },
  ]) {
    const changed = structuredClone(value); mutate(changed);
    await assert.rejects(service.save({ take: changed, requestId }, actor), errorStatus(409));
    const revised = await service.save({ take: changed, requestId: randomUUID() }, actor);
    assert.notEqual(revised.saved.takeHash, saved.saved.takeHash);
  }
  assert.deepEqual((await service.get(saved.saved.id, actor)).take, value);
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
