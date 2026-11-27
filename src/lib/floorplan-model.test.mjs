import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createPlan, validatePlan, compilePlan, createPlanPackage, roomBounds, nearestEdge,
  FloorplanValidationError, LIMITS } from '../../public/director/floorplan-model.js';

const clone = value => structuredClone(value);
function room(id = 'room-one', points = [[0, 0], [4, 0], [4, 4], [0, 4]], levelId = 'level-ground') {
  return { id, levelId, name: id, points, wallThickness: .12, wallColor: '#abc', floorColor: '#bda98a', openings: [] };
}
function planWithRoom() { const plan = createPlan(); plan.rooms.push(room()); return plan; }
function opening(id, patch = {}) { return { id, type: 'door', edge: 1, at: .5, width: 1, height: 2.1, sill: 0, ...patch }; }
function levelPlan() {
  const plan = planWithRoom(); plan.levels.push({ id: 'level-upper', name: 'Ground', elevation: 3, height: 2.7 });
  plan.connectors.push({ id: 'stair-one', type: 'stairs', name: 'Up', fromLevelId: 'level-ground', toLevelId: 'level-upper', position: [1, 1], size: [1, 2], rotation: 30 });
  return plan;
}
function wallsAt(geometry, [x, y, z]) {
  return geometry.walls.filter(box => {
    const dx = x - box.position[0], dy = y - box.position[1], dz = z - box.position[2];
    const c = Math.cos(box.rotation[1]), s = Math.sin(box.rotation[1]);
    const local = [c * dx - s * dz, dy, s * dx + c * dz];
    return local.every((n, i) => Math.abs(n) < box.size[i] / 2 - 1e-6);
  });
}
function floorTopTriangles(floor, y = 0) {
  const triangles = [];
  for (let i = 0; i < floor.indices.length; i += 3) {
    const points = floor.indices.slice(i, i + 3).map(index => floor.vertices.slice(index * 3, index * 3 + 3));
    if (points.every(p => Math.abs(p[1] - y) < 1e-7)) triangles.push(points);
  }
  return triangles;
}
const triangleCrossY = ([a, b, c]) => (b[2] - a[2]) * (c[0] - a[0]) - (b[0] - a[0]) * (c[2] - a[2]);
function coversXZ(triangle, point) {
  const cross = (a, b, c) => (b[0] - a[0]) * (c[2] - a[2]) - (b[2] - a[2]) * (c[0] - a[0]);
  const p = [point[0], 0, point[1]], signs = triangle.map((a, i) => cross(a, triangle[(i + 1) % 3], p));
  return signs.every(v => v >= -1e-7) || signs.every(v => v <= 1e-7);
}

test('canonical plan and portable package roundtrip retain edits without input aliases', () => {
  const input = levelPlan(); input.rooms[0].openings.push(opening('door-one'));
  const untouched = clone(input), canonical = validatePlan(input);
  assert.deepEqual(input, untouched);
  assert.equal(canonical.rooms[0].wallColor, '#aabbcc');
  canonical.rooms[0].name = 'Library'; canonical.rooms[0].points[0][0] = -.5;
  assert.equal(input.rooms[0].points[0][0], 0);
  const exported = createPlanPackage(canonical), reopened = JSON.parse(JSON.stringify(exported));
  assert.equal(exported.schema, 'nest-floorplan-package/v1');
  assert.deepEqual(validatePlan(reopened.plan), canonical);
  assert.deepEqual(compilePlan(reopened.plan), reopened.geometry);
  assert.throws(() => validatePlan(exported), FloorplanValidationError, 'packages must be explicitly unwrapped');
});

test('empty plans compile to bounded empty geometry and new plans are independent', () => {
  const plan = createPlan(), other = createPlan(); plan.levels[0].name = 'Changed';
  assert.equal(other.levels[0].name, 'Ground');
  const geometry = compilePlan(other);
  assert.deepEqual(geometry.bounds, { min: [0, 0, 0], max: [0, 0, 0] });
  assert.deepEqual([geometry.walls.length, geometry.floors.length, geometry.connectors.length], [0, 0, 0]);
});

test('invalid input fails before normalization can mutate the document', () => {
  const mutations = [
    p => { p.unexpected = true; }, p => { p.rooms[0].code = 'ignore'; },
    p => { p.levels[0].height = Infinity; }, p => { p.levels[0].elevation = NaN; },
    p => { p.grid = '0.25'; }, p => { p.grid = 0; }, p => { p.units = 'ft'; },
    p => { p.rooms[0].points[0][0] = -Infinity; }, p => { p.rooms[0].points[0].push(2); },
    p => { p.rooms[0].wallThickness = 0; }, p => { p.rooms[0].wallColor = 'red'; },
    p => { p.rooms[0].id = '__proto__'; }, p => { p.rooms[0].id = p.levels[0].id; },
    p => { p.rooms[0].levelId = 'missing'; }, p => { p.activeLevelId = 'missing'; },
    p => { p.rooms[0].name = 'bad\nname'; }, p => { p.levels = []; },
  ];
  for (const change of mutations) {
    const input = planWithRoom(); change(input); const before = clone(input);
    assert.throws(() => validatePlan(input), FloorplanValidationError);
    assert.deepEqual(input, before);
  }
  for (const input of [null, [], new Date(), Object.assign(Object.create({ inherited: true }), createPlan())]) {
    assert.throws(() => validatePlan(input), FloorplanValidationError);
  }
});

test('non-simple, repeated and collapsed room boundaries are rejected', () => {
  const outlines = [
    [[0, 0], [4, 4], [0, 4], [4, 0]],
    [[0, 0], [4, 0], [4, 4], [0, 4], [0, 0]],
    [[0, 0], [4, 0], [2, 0], [2, 4], [0, 4]],
    [[0, 0], [4, 0], [4, 4], [2, 0], [0, 4]],
    [[0, 0], [.0001, 0], [0, .0001]],
  ];
  for (const points of outlines) { const plan = planWithRoom(); plan.rooms[0].points = points; assert.throws(() => validatePlan(plan), FloorplanValidationError); }
});

test('concave floors retain their recess, upward winding and correct area in either outline direction', () => {
  const outline = [[0, 0], [4, 0], [4, 1], [1, 1], [1, 4], [0, 4]];
  for (const points of [outline, [...outline].reverse(), [[0, 0], [2, 0], ...outline.slice(1)]]) {
    const plan = createPlan(); plan.rooms.push(room('concave', points));
    const floor = compilePlan(plan).floors[0], top = floorTopTriangles(floor);
    assert.ok(top.length >= 4);
    assert.ok(top.every(triangle => triangleCrossY(triangle) > 0));
    const area = top.reduce((sum, triangle) => sum + triangleCrossY(triangle) / 2, 0);
    assert.ok(Math.abs(area - 7) < 1e-7, `top area ${area}`);
    assert.equal(top.some(t => coversXZ(t, [2, 2])), false, 'the L-shaped recess must stay empty');
    assert.equal(top.some(t => coversXZ(t, [.5, 3])), true);
    assert.equal(Math.min(...floor.vertices.filter((_, i) => i % 3 === 1)), -.08);
    assert.ok(floor.indices.every(i => i >= 0 && i < floor.vertices.length / 3));
  }
});

test('doors and windows create real gaps with retained sill/header solids', () => {
  const plan = planWithRoom();
  plan.rooms[0].openings = [opening('door-one'), opening('window-one', { type: 'window', edge: 0, sill: .8, height: 1 })];
  const geometry = compilePlan(plan);
  assert.equal(wallsAt(geometry, [4, 1, 2]).length, 0, 'doorway is open at body height');
  assert.equal(wallsAt(geometry, [4, 2.4, 2]).length, 1, 'door header remains');
  assert.equal(wallsAt(geometry, [2, 1.2, 0]).length, 0, 'window is open');
  assert.equal(wallsAt(geometry, [2, .4, 0]).length, 1, 'window sill remains');
  assert.equal(wallsAt(geometry, [2, 2.2, 0]).length, 1, 'window header remains');
});

test('passages may occupy a whole edge while invalid edge/vertical extents are rejected', () => {
  const plan = planWithRoom();
  plan.rooms[0].openings = [opening('full-passage', { type: 'passage', width: 4, height: 2.7 })];
  assert.equal(wallsAt(compilePlan(plan), [4, 2.6, 2]).length, 0);
  for (const patch of [{ at: .1 }, { width: 4.1 }, { edge: 4 }, { edge: 1.5 }, { height: 3 }, { sill: .1 }, { width: NaN }, { extra: 1 }]) {
    const invalid = planWithRoom(); invalid.rooms[0].openings = [opening('bad-opening', patch)];
    assert.throws(() => validatePlan(invalid), FloorplanValidationError);
  }
  const invalid = planWithRoom(); invalid.rooms[0].openings = [opening('high-window', { type: 'window', sill: 2, height: 1 })];
  assert.throws(() => validatePlan(invalid), FloorplanValidationError);
});

test('a door on one room cuts through its shared wall, including partial overlap and reverse edge direction', () => {
  const plan = planWithRoom(); plan.rooms[0].openings = [opening('shared-door')];
  plan.rooms.push(room('room-east', [[4, 1], [7, 1], [7, 3], [4, 3]]));
  const geometry = compilePlan(plan);
  assert.equal(wallsAt(geometry, [4, 1, 2]).length, 0, 'the neighboring room must not fill the doorway');
  assert.equal(wallsAt(geometry, [4, 1, 1.25]).length, 1, 'shared solid wall is emitted once');
  assert.equal(wallsAt(geometry, [4, 1, .5]).length, 1, 'nonshared extension remains solid');
  const headers = wallsAt(geometry, [4, 2.4, 2]);
  assert.equal(headers.length, 1); assert.deepEqual(headers[0].roomIds, ['room-east', 'room-one']);
  assert.deepEqual(compilePlan({ ...plan, rooms: [...plan.rooms].reverse() }), geometry, 'room order must not change geometry');
});

test('floating point bucket boundaries cannot split a rotated shared wall and block its door', () => {
  const angle = .15, offset = 5e-8 / Math.cos(angle);
  const transform = ([x, z]) => [offset + Math.cos(angle) * x - Math.sin(angle) * z,
    Math.sin(angle) * x + Math.cos(angle) * z];
  const plan = createPlan();
  const a = room('room-a', [[0, 0], [6, 0], [6, 6], [0, 6]].map(transform));
  a.openings = [opening('shared-door', { width: 1.2, height: 2 })];
  const b = room('room-b', [[6, 1], [9, 1], [9, 5], [6, 5]].map(transform));
  plan.rooms.push(a, b);
  const geometry = compilePlan(plan), [x, z] = transform([6, 3]);
  assert.equal(wallsAt(geometry, [x, 1, z]).length, 0, 'both room boundaries must share the doorway');
  const headers = wallsAt(geometry, [x, 2.4, z]);
  assert.equal(headers.length, 1); assert.deepEqual(headers[0].roomIds, ['room-a', 'room-b']);
  assert.deepEqual(compilePlan({ ...plan, rooms: [b, a] }), geometry);
});

test('overlapping shared openings union their voids without deleting a solid rail between separate windows', () => {
  const plan = planWithRoom(); plan.rooms[0].openings = [opening('lower', { type: 'window', sill: .5, height: .5 })];
  const east = room('room-east', [[4, 0], [8, 0], [8, 4], [4, 4]]);
  east.openings = [opening('upper', { type: 'window', edge: 3, sill: 1.5, height: .5 })]; plan.rooms.push(east);
  const geometry = compilePlan(plan);
  assert.equal(wallsAt(geometry, [4, .75, 2]).length, 0);
  assert.equal(wallsAt(geometry, [4, 1.75, 2]).length, 0);
  assert.equal(wallsAt(geometry, [4, 1.25, 2]).length, 1);
  east.openings[0].sill = .8;
  assert.equal(wallsAt(compilePlan(plan), [4, 1.1, 2]).length, 0, 'overlapping windows have one continuous void');
});

test('identically named levels retain separate geometry and explicit connection targets', () => {
  const plan = levelPlan(); plan.rooms.push(room('upper-room', [[0, 0], [2, 0], [2, 2], [0, 2]], 'level-upper'));
  const geometry = compilePlan(plan), marker = geometry.connectors[0];
  assert.equal(geometry.floors.find(f => f.roomId === 'upper-room').vertices[1], 3);
  assert.equal(marker.fromLevelId, 'level-ground'); assert.equal(marker.toLevelId, 'level-upper');
  assert.equal(marker.toElevation, 3); assert.equal(marker.size[1], .08);
  assert.ok(Math.abs(marker.rotation[1] - Math.PI / 6) < 1e-12);
  for (const mutate of [p => p.connectors[0].toLevelId = 'missing', p => p.connectors[0].toLevelId = 'level-ground',
    p => p.levels[1].elevation = 0, p => p.connectors[0].rotation = 361, p => p.connectors[0].size[0] = 0]) {
    const invalid = clone(plan); mutate(invalid); assert.throws(() => validatePlan(invalid), FloorplanValidationError);
  }
});

test('plan counts and derived geometry are both bounded', () => {
  const tooManyLevels = createPlan(); tooManyLevels.levels = Array.from({ length: LIMITS.levels + 1 }, (_, i) => ({ id: `level-${i}`, name: 'Level', elevation: i * 3, height: 2.7 }));
  assert.throws(() => validatePlan(tooManyLevels), FloorplanValidationError);
  const tooManyRooms = createPlan(); tooManyRooms.rooms = Array.from({ length: LIMITS.rooms + 1 }, (_, i) => room(`room-${i}`));
  assert.throws(() => validatePlan(tooManyRooms), FloorplanValidationError);
  const manyPoints = createPlan(); const circle = Array.from({ length: 128 }, (_, i) => [Math.cos(i * 2 * Math.PI / 128) * 4, Math.sin(i * 2 * Math.PI / 128) * 4]);
  manyPoints.rooms = Array.from({ length: 33 }, (_, i) => room(`room-${i}`, circle));
  assert.throws(() => validatePlan(manyPoints), FloorplanValidationError);
  const manyOpenings = createPlan(); manyOpenings.rooms = Array.from({ length: 9 }, (_, i) => ({ ...room(`room-${i}`), openings: Array.from({ length: 64 }, (_, j) => opening(`opening-${i}-${j}`)) }));
  assert.throws(() => validatePlan(manyOpenings), FloorplanValidationError);
  const dense = createPlan(); dense.levels[0].height = 1000;
  dense.rooms = Array.from({ length: 128 }, (_, i) => ({ ...room(`room-${i}`, [[0, 0], [2000, 0], [2000, 3], [0, 3]]), openings: Array.from({ length: 4 }, (_, j) => {
    const k = i * 4 + j; return opening(`opening-${k}`, { type: 'window', edge: 0, width: 2000 - 2 * k, height: .5, sill: 1 + 1.5 * k });
  }) }));
  assert.equal(validatePlan(dense).rooms.length, 128);
  assert.throws(() => compilePlan(dense), /derived geometry exceeds/, 'valid field counts cannot generate an unbounded mesh set');
});

test('geometry bounds include rotated markers and wall thickness, with no nonfinite coordinates', () => {
  const plan = levelPlan(); plan.connectors[0].position = [-10, 20]; plan.connectors[0].rotation = 45; plan.connectors[0].size = [2, 4];
  const geometry = compilePlan(plan), extent = 3 / Math.sqrt(2);
  assert.ok(Math.abs(geometry.bounds.min[0] - (-10 - extent)) < 1e-7);
  assert.ok(Math.abs(geometry.bounds.max[2] - (20 + extent)) < 1e-7);
  assert.equal(geometry.bounds.min[1], -.08); assert.equal(geometry.bounds.max[1], 2.7);
  assert.ok([...geometry.walls, ...geometry.connectors].every(box => [...box.position, ...box.rotation, ...box.size].every(Number.isFinite)));
  assert.ok(geometry.floors.every(floor => floor.vertices.every(Number.isFinite)));
});

test('spatial helpers use projected edge position and actual room extent', () => {
  const r = room(); assert.deepEqual(roomBounds(r), { minX: 0, minZ: 0, maxX: 4, maxZ: 4, width: 4, depth: 4, center: [2, 2] });
  const edge = nearestEdge(r, [4.2, 2]); assert.equal(edge.edge, 1); assert.equal(edge.at, .5); assert.ok(Math.abs(edge.distance - .2) < 1e-7);
  assert.deepEqual(edge.point, [4, 2]);
});

test('the shared browser/Blender fixture is a current reproducible package', () => {
  const fixture = JSON.parse(readFileSync(new URL('../../docs/director/floorplan-fixture.json', import.meta.url), 'utf8'));
  assert.deepEqual(createPlanPackage(fixture.plan), fixture);
  assert.equal(fixture.plan.levels.length, 2);
  assert.ok(fixture.geometry.walls.some(w => w.roomIds.length > 1));
  assert.ok(fixture.geometry.connectors.some(c => c.type === 'stairs'));
});
