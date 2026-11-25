import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import '../../public/director/animation.js';

const { samplePose, ease, retimeKeyframes } = globalThis.DirectorAnimation;
const near = (a, b, epsilon = 1e-10) => assert.ok(Math.abs(a - b) <= epsilon, `${a} differs from ${b}`);
const quatZ = degrees => [0, 0, Math.sin(degrees * Math.PI / 360), Math.cos(degrees * Math.PI / 360)];
const sameRotation = (a, b) => near(Math.abs(a.reduce((sum, x, i) => sum + x * b[i], 0)), 1);
function pose(value = 0, rotation = quatZ(0)) {
  return { bones: {
    root: { position: [value, value * 2, -value], rotation: [...rotation], scale: [1 + value, 1, 1 + value / 2] },
    head: { position: [0, 1, 0], rotation: [0, 0, 0, 1], scale: [1, 1, 1] },
  }, morphs: { curl: value, perch: 1 - value, wrap: 0 } };
}
function keys() { return [{ frame: 1, pose: pose(0) }, { frame: 9, pose: pose(1, quatZ(90)) }]; }

test('loads as a classic browser script and a side-effect Node import', async () => {
  const context = vm.createContext({ structuredClone });
  vm.runInContext(await readFile(new URL('../../public/director/animation.js', import.meta.url), 'utf8'), context);
  assert.equal(typeof context.DirectorAnimation.samplePose, 'function');
  assert.equal(typeof samplePose, 'function');
});

test('empty, single, clamped and exact-key samples are independent complete poses', () => {
  assert.equal(samplePose([], 1), null);
  const source = keys(); source[1].pose.bones.root.rotation = quatZ(90).map(x => -x);
  for (const [frame, expected] of [[-100, source[0].pose], [1, source[0].pose], [9, source[1].pose], [100, source[1].pose]]) {
    const sampled = samplePose(source, frame, 'ease-in-out');
    assert.deepEqual(sampled, expected);
    sampled.bones.root.position[0] = 900; sampled.morphs.curl = 900;
    assert.notEqual(expected.bones.root.position[0], 900); assert.notEqual(expected.morphs.curl, 900);
  }
  assert.deepEqual(samplePose([source[1]], 4), source[1].pose);
});

test('v1 holds until the exact next key; v2 default and outgoing overrides differ deliberately', () => {
  const source = keys();
  assert.deepEqual(samplePose(source, 8.999), source[0].pose);
  assert.deepEqual(samplePose(source, 9), source[1].pose);
  near(samplePose(source, 3, 'ease-in-out').morphs.curl, .0625);
  source[0].transition = 'linear'; source[1].transition = 'hold';
  near(samplePose(source, 3, 'ease-in-out').morphs.curl, .25);
  source[0].transition = 'hold';
  assert.deepEqual(samplePose(source, 8, 'ease-in-out'), source[0].pose);
});

test('cubic easing values and endpoints are explicit', () => {
  near(ease(.25, 'linear'), .25); near(ease(.25, 'ease-in'), .015625);
  near(ease(.25, 'ease-out'), .578125); near(ease(.25, 'ease-in-out'), .0625);
  near(ease(.75, 'ease-in-out'), .9375);
  for (const transition of globalThis.DirectorAnimation.transitions) {
    near(ease(-1, transition), 0); near(ease(2, transition), 1);
  }
  near(ease(.999, 'hold'), 0);
});

test('position, scale and every morph share the same eased time; rotation follows the arc', () => {
  const source = keys(), saved = structuredClone(source);
  const sampled = samplePose(source, 5, 'linear');
  assert.deepEqual(sampled.bones.root.position, [.5, 1, -.5]);
  assert.deepEqual(sampled.bones.root.scale, [1.5, 1, 1.25]);
  assert.deepEqual(sampled.morphs, { curl: .5, perch: .5, wrap: 0 });
  sameRotation(sampled.bones.root.rotation, quatZ(45));
  assert.deepEqual(sampled.bones.head, source[0].pose.bones.head);
  assert.deepEqual(source, saved);
});

test('SLERP takes the shortest 190-degree path and treats q and -q as the same rotation', () => {
  const source = keys(); source[1].pose.bones.root.rotation = quatZ(190);
  sameRotation(samplePose(source, 5, 'linear').bones.root.rotation, quatZ(-85));
  const q = quatZ(64); source[0].pose.bones.root.rotation = q; source[1].pose.bones.root.rotation = q.map(x => -x);
  for (const frame of [1.01, 3, 5, 8.99]) sameRotation(samplePose(source, frame, 'linear').bones.root.rotation, q);
});

test('near-antipodal and near-equal quaternion samples remain finite and unit length', () => {
  const cases = [
    [[0, 0, 0, 1], [0, 0, 1e-12, -1]],
    [[1, 0, 0, 0], [-1, 1e-10, 0, 0]],
    [[0, 0, 0, 2], [0, 0, 1e-9, 2]],
    [[1, 0, 0, 0], [0, 1, 0, 0]],
  ];
  for (const [a, b] of cases) for (const frame of [1.001, 3, 5, 8.999]) {
    const source = keys(); source[0].pose.bones.root.rotation = a; source[1].pose.bones.root.rotation = b;
    const q = samplePose(source, frame, 'linear').bones.root.rotation;
    assert.ok(q.every(Number.isFinite)); near(Math.hypot(...q), 1);
  }
});

test('a key transition affects the next segment, never the segment arriving at that key', () => {
  const source = [{ frame: 1, transition: 'ease-in', pose: pose(0) }, { frame: 9, transition: 'ease-out', pose: pose(1) }, { frame: 17, pose: pose(0) }];
  near(samplePose(source, 5, 'linear').morphs.curl, .125);
  near(samplePose(source, 13, 'linear').morphs.curl, .125);
  assert.deepEqual(samplePose(source, 9, 'linear'), source[1].pose);
});

test('retiming keeps range endpoints exact and retains transitions and independent pose data', () => {
  const source = [{ frame: 10, transition: 'hold', pose: pose(0) }, { frame: 15, transition: 'ease-out', pose: pose(.5) }, { frame: 20, pose: pose(1) }];
  const saved = structuredClone(source), result = retimeKeyframes(source, 10, 20, 30);
  assert.equal(result.ok, true); assert.deepEqual(result.keyframes.map(k => k.frame), [10, 20, 30]);
  assert.equal(result.keyframes[1].transition, 'ease-out');
  result.keyframes[0].pose.morphs.curl = 100;
  assert.deepEqual(source, saved);
  assert.deepEqual(retimeKeyframes([{ frame: 15, pose: pose() }], 10, 20, 30).keyframes.map(k => k.frame), [20]);
});

test('retiming rounds integer frames and reports a collision instead of merging keys', () => {
  const source = [1, 2, 3, 10].map(frame => ({ frame, pose: pose() })), saved = structuredClone(source);
  const result = retimeKeyframes(source, 1, 10, 3);
  assert.equal(result.ok, false); assert.equal(result.code, 'frame-collision');
  assert.deepEqual(result.collision, { frame: 1, sourceFrames: [1, 2] });
  assert.equal(Object.hasOwn(result, 'keyframes'), false); assert.deepEqual(source, saved);
  assert.deepEqual(retimeKeyframes([1, 5, 10].map(frame => ({ frame, pose: pose() })), 1, 10, 6).keyframes.map(k => k.frame), [1, 3, 6]);
});

test('invalid timelines, mismatched rigs and zero quaternions fail explicitly', () => {
  assert.throws(() => samplePose(keys(), NaN), /finite/);
  assert.throws(() => samplePose(keys().reverse(), 5), /increasing/);
  assert.throws(() => samplePose(keys(), 5, 'unknown'), /Unsupported/);
  const source = keys(); source[1].pose.bones.root.rotation = [0, 0, 0, 0];
  assert.throws(() => samplePose(source, 5, 'linear'), /nonzero/);
  source[1].pose.bones.root.rotation = quatZ(90); delete source[1].pose.morphs.wrap;
  assert.throws(() => samplePose(source, 5, 'linear'), /different morphs/);
  assert.equal(retimeKeyframes(keys(), 1, 9, .5).code, 'invalid-range');
  assert.equal(retimeKeyframes(keys(), 2, 9, 10).code, 'key-outside-range');
  const single = [{ frame: 1, pose: pose() }];
  assert.deepEqual(retimeKeyframes(single, 1, 1, 10), { ok: true, keyframes: single });
  assert.deepEqual(retimeKeyframes([], 1, 1, 10), { ok: true, keyframes: [] });
  assert.deepEqual(retimeKeyframes([], 1, 9, 10), { ok: true, keyframes: [] });
});
