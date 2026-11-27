// Canonical, dependency-free floorplan data and deterministic derived geometry.
export const PLAN_SCHEMA = 'nest-floorplan/v1';
export const PACKAGE_SCHEMA = 'nest-floorplan-package/v1';
export const GEOMETRY_SCHEMA = 'nest-floorplan-geometry/v1';
export const LIMITS = Object.freeze({ levels: 16, rooms: 128, pointsPerRoom: 128, points: 4096,
  openingsPerRoom: 64, openings: 512, connectors: 64, walls: 16384, coordinate: 10000,
  height: 1000, floorThickness: 0.08 });
const EPS = 1e-7;
const ID = /^[A-Za-z][A-Za-z0-9_-]{0,63}$/;
const FORBIDDEN_IDS = new Set(['constructor', 'prototype', '__proto__']);
const compare = (a, b) => a < b ? -1 : a > b ? 1 : 0;
const clean = n => Object.is(n, -0) ? 0 : n;

export class FloorplanValidationError extends Error {
  constructor(path, message) {
    super(`${path}: ${message}`); this.name = 'FloorplanValidationError';
    this.code = 'FLOORPLAN_INVALID'; this.path = path;
  }
}
function fail(path, message) { throw new FloorplanValidationError(path, message); }
function object(value, path, keys) {
  if (!value || typeof value !== 'object' || Array.isArray(value) ||
      ![Object.prototype, null].includes(Object.getPrototypeOf(value))) fail(path, 'must be an object');
  for (const key of Object.keys(value)) if (!keys.includes(key)) fail(`${path}.${key}`, 'unknown field');
  return value;
}
function number(value, path, min, max, fallback) {
  const n = value === undefined ? fallback : value;
  if (typeof n !== 'number' || !Number.isFinite(n) || n < min || n > max) fail(path, `must be a finite number from ${min} to ${max}`);
  return clean(n);
}
function integer(value, path, min, max) {
  const n = number(value, path, min, max); if (!Number.isInteger(n)) fail(path, 'must be an integer'); return n;
}
function string(value, path, fallback) {
  const text = value === undefined ? fallback : value;
  if (typeof text !== 'string' || !text.trim() || text.length > 120 || /[\u0000-\u001f]/.test(text)) fail(path, 'must be nonempty text of at most 120 characters');
  return text.trim();
}
function array(value, path, min, max, fallback) {
  const a = value === undefined ? fallback : value;
  if (!Array.isArray(a) || a.length < min || a.length > max) fail(path, `must contain ${min} to ${max} items`);
  return a;
}
function color(value, path, fallback) {
  const s = value === undefined ? fallback : value;
  if (typeof s !== 'string' || !/^#(?:[a-f\d]{3}|[a-f\d]{6})$/i.test(s)) fail(path, 'must be a #rgb or #rrggbb color');
  return (s.length === 4 ? '#' + [...s.slice(1)].map(c => c + c).join('') : s).toLowerCase();
}
function point(value, path) {
  return array(value, path, 2, 2).map((v, i) => number(v, `${path}[${i}]`, -LIMITS.coordinate, LIMITS.coordinate));
}
function id(value, path, seen) {
  if (typeof value !== 'string' || !ID.test(value) || FORBIDDEN_IDS.has(value)) fail(path, 'must be a safe ID beginning with a letter (max 64 characters)');
  if (seen.has(value)) fail(path, `duplicate ID ${value}`); seen.add(value); return value;
}
const cross = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
function area2(points) { return points.reduce((sum, p, i) => { const q = points[(i + 1) % points.length]; return sum + p[0] * q[1] - q[0] * p[1]; }, 0); }
function onSegment(a, b, p) {
  return Math.abs(cross(a, b, p)) <= EPS && p[0] >= Math.min(a[0], b[0]) - EPS && p[0] <= Math.max(a[0], b[0]) + EPS &&
    p[1] >= Math.min(a[1], b[1]) - EPS && p[1] <= Math.max(a[1], b[1]) + EPS;
}
function intersects(a, b, c, d) {
  const x = cross(a, b, c), y = cross(a, b, d), z = cross(c, d, a), w = cross(c, d, b);
  return ((x > EPS && y < -EPS || x < -EPS && y > EPS) && (z > EPS && w < -EPS || z < -EPS && w > EPS)) ||
    onSegment(a, b, c) || onSegment(a, b, d) || onSegment(c, d, a) || onSegment(c, d, b);
}
function polygon(points, path) {
  for (let i = 0; i < points.length; i++) {
    const a = points[i], b = points[(i + 1) % points.length], previous = points[(i + points.length - 1) % points.length];
    if (Math.hypot(b[0] - a[0], b[1] - a[1]) < 0.001) fail(path, 'edges must be at least 0.001 units long; do not repeat the closing point');
    if (Math.abs(cross(previous, a, b)) < EPS &&
        (a[0] - previous[0]) * (b[0] - a[0]) + (a[1] - previous[1]) * (b[1] - a[1]) < 0) fail(path, 'adjacent edges cannot overlap');
    for (let j = i + 1; j < points.length; j++) {
      if (j === i + 1 || i === 0 && j === points.length - 1) continue;
      if (intersects(a, b, points[j], points[(j + 1) % points.length])) fail(path, 'polygon must be simple, without crossings or touching nonadjacent edges');
    }
  }
  if (Math.abs(area2(points)) < 0.0002) fail(path, 'polygon area must be at least 0.0001 square units');
}

export function createPlan() {
  return { schema: PLAN_SCHEMA, name: 'Untitled floorplan', units: 'unit', grid: 0.25, activeLevelId: 'level-ground',
    levels: [{ id: 'level-ground', name: 'Ground', elevation: 0, height: 2.7 }], rooms: [], connectors: [] };
}

/** Validate the whole document before returning a detached canonical clone. Never mutates input. */
export function validatePlan(value) {
  const p = object(value, 'plan', ['schema', 'name', 'units', 'grid', 'activeLevelId', 'levels', 'rooms', 'connectors']);
  if (p.schema !== PLAN_SCHEMA) fail('plan.schema', `must be ${PLAN_SCHEMA}`);
  const seen = new Set(); let pointsCount = 0, openingCount = 0;
  const units = p.units === undefined ? 'unit' : p.units;
  if (!['m', 'unit'].includes(units)) fail('plan.units', 'must be m or unit (no implicit conversion)');
  const levels = array(p.levels, 'plan.levels', 1, LIMITS.levels).map((v, i) => {
    const path = `plan.levels[${i}]`, l = object(v, path, ['id', 'name', 'elevation', 'height']);
    return { id: id(l.id, `${path}.id`, seen), name: string(l.name, `${path}.name`, 'Level'),
      elevation: number(l.elevation, `${path}.elevation`, -LIMITS.coordinate, LIMITS.coordinate, 0),
      height: number(l.height, `${path}.height`, 0.1, LIMITS.height, 2.7) };
  });
  const levelMap = new Map(levels.map(l => [l.id, l]));
  const activeLevelId = p.activeLevelId === undefined ? levels[0].id : p.activeLevelId;
  if (!levelMap.has(activeLevelId)) fail('plan.activeLevelId', 'must reference an existing level');
  const rooms = array(p.rooms, 'plan.rooms', 0, LIMITS.rooms, []).map((v, i) => {
    const path = `plan.rooms[${i}]`, r = object(v, path, ['id', 'levelId', 'name', 'points', 'wallThickness', 'wallColor', 'floorColor', 'openings']);
    const roomId = id(r.id, `${path}.id`, seen), level = levelMap.get(r.levelId);
    if (!level) fail(`${path}.levelId`, 'must reference an existing level');
    const points = array(r.points, `${path}.points`, 3, LIMITS.pointsPerRoom).map((v, j) => point(v, `${path}.points[${j}]`));
    pointsCount += points.length; if (pointsCount > LIMITS.points) fail('plan.rooms', `at most ${LIMITS.points} total points`);
    polygon(points, `${path}.points`);
    const openings = array(r.openings, `${path}.openings`, 0, LIMITS.openingsPerRoom, []).map((v, j) => {
      const op = `${path}.openings[${j}]`, o = object(v, op, ['id', 'type', 'edge', 'at', 'width', 'height', 'sill']);
      const openingId = id(o.id, `${op}.id`, seen);
      if (!['door', 'window', 'passage'].includes(o.type)) fail(`${op}.type`, 'must be door, window or passage');
      const edge = integer(o.edge, `${op}.edge`, 0, points.length - 1);
      const a = points[edge], b = points[(edge + 1) % points.length], length = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const at = number(o.at, `${op}.at`, 0, 1, 0.5), width = number(o.width, `${op}.width`, 0.02, 20000, 0.9);
      const height = number(o.height, `${op}.height`, 0.02, level.height, o.type === 'window' ? 1.2 : Math.min(2.1, level.height));
      const sill = number(o.sill, `${op}.sill`, 0, level.height, o.type === 'window' ? 0.9 : 0);
      if (o.type !== 'window' && sill !== 0) fail(`${op}.sill`, 'doors and passages start at the floor');
      if (at * length - width / 2 < -EPS || at * length + width / 2 > length + EPS) fail(op, 'opening must fit within its edge');
      if (sill + height > level.height + EPS) fail(op, 'opening must fit vertically within its wall');
      return { id: openingId, type: o.type, edge, at, width, height, sill };
    });
    openingCount += openings.length; if (openingCount > LIMITS.openings) fail('plan.rooms', `at most ${LIMITS.openings} total openings`);
    return { id: roomId, levelId: r.levelId, name: string(r.name, `${path}.name`, 'Room'), points,
      wallThickness: number(r.wallThickness, `${path}.wallThickness`, 0.01, 5, 0.12),
      wallColor: color(r.wallColor, `${path}.wallColor`, '#e8e2d8'), floorColor: color(r.floorColor, `${path}.floorColor`, '#bda98a'), openings };
  });
  const connectors = array(p.connectors, 'plan.connectors', 0, LIMITS.connectors, []).map((v, i) => {
    const path = `plan.connectors[${i}]`, c = object(v, path, ['id', 'type', 'name', 'fromLevelId', 'toLevelId', 'position', 'size', 'rotation']);
    const connectorId = id(c.id, `${path}.id`, seen);
    if (!['stairs', 'elevator'].includes(c.type)) fail(`${path}.type`, 'must be stairs or elevator');
    if (!levelMap.has(c.fromLevelId) || !levelMap.has(c.toLevelId) || c.fromLevelId === c.toLevelId) fail(path, 'connector must link two distinct existing levels');
    if (Math.abs(levelMap.get(c.fromLevelId).elevation - levelMap.get(c.toLevelId).elevation) < EPS) fail(path, 'connector levels must have distinct elevations');
    return { id: connectorId, type: c.type, name: string(c.name, `${path}.name`, c.type === 'stairs' ? 'Stairs' : 'Elevator'),
      fromLevelId: c.fromLevelId, toLevelId: c.toLevelId, position: point(c.position, `${path}.position`),
      size: array(c.size, `${path}.size`, 2, 2).map((n, j) => number(n, `${path}.size[${j}]`, 0.1, 1000)),
      rotation: number(c.rotation, `${path}.rotation`, -360, 360, 0) };
  });
  return { schema: PLAN_SCHEMA, name: string(p.name, 'plan.name', 'Untitled floorplan'), units,
    grid: number(p.grid, 'plan.grid', 0.01, 100, 0.25), activeLevelId, levels, rooms, connectors };
}

export function roomBounds(room) {
  const xs = room.points.map(p => p[0]), zs = room.points.map(p => p[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minZ = Math.min(...zs), maxZ = Math.max(...zs);
  return { minX, minZ, maxX, maxZ, width: maxX - minX, depth: maxZ - minZ, center: [(minX + maxX) / 2, (minZ + maxZ) / 2] };
}
export function nearestEdge(room, location) {
  const p = point(location, 'point'); let best;
  room.points.forEach((a, edge) => {
    const b = room.points[(edge + 1) % room.points.length], dx = b[0] - a[0], dz = b[1] - a[1];
    const at = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dz) / (dx * dx + dz * dz)));
    const q = [a[0] + dx * at, a[1] + dz * at], distance = Math.hypot(p[0] - q[0], p[1] - q[1]);
    if (!best || distance < best.distance) best = { edge, at, point: q, distance };
  }); return best;
}

// Ear clipping handles simple concave outlines, with either winding and redundant straight vertices.
function triangulate(points) {
  let ring = points.map((_, i) => i); if (area2(points) < 0) ring.reverse();
  let changed = true;
  while (changed && ring.length > 3) {
    changed = false;
    for (let i = 0; i < ring.length; i++) if (Math.abs(cross(points[ring[(i + ring.length - 1) % ring.length]], points[ring[i]], points[ring[(i + 1) % ring.length]])) < EPS) {
      ring.splice(i, 1); changed = true; break;
    }
  }
  const triangles = [];
  while (ring.length > 3) {
    let clipped = false;
    for (let i = 0; i < ring.length; i++) {
      const a = ring[(i + ring.length - 1) % ring.length], b = ring[i], c = ring[(i + 1) % ring.length];
      if (cross(points[a], points[b], points[c]) <= EPS) continue;
      if (ring.some(j => j !== a && j !== b && j !== c && cross(points[a], points[b], points[j]) >= -EPS &&
          cross(points[b], points[c], points[j]) >= -EPS && cross(points[c], points[a], points[j]) >= -EPS)) continue;
      triangles.push([a, b, c]); ring.splice(i, 1); clipped = true; break;
    }
    if (!clipped) fail('plan.rooms.points', 'polygon could not be triangulated robustly');
  }
  triangles.push([...ring]); return triangles;
}
function floorMesh(room, elevation) {
  const n = room.points.length, vertices = [], indices = [];
  for (const y of [elevation, elevation - LIMITS.floorThickness]) for (const [x, z] of room.points) vertices.push(x, y, z);
  for (const [a, b, c] of triangulate(room.points)) indices.push(c, b, a, a + n, b + n, c + n);
  const ccw = area2(room.points) > 0;
  for (let a = 0; a < n; a++) {
    const b = (a + 1) % n, sides = [a, b, b + n, a, b + n, a + n];
    if (!ccw) for (let i = 0; i < sides.length; i += 3) [sides[i], sides[i + 2]] = [sides[i + 2], sides[i]];
    indices.push(...sides);
  }
  return { id: `floor-${room.id}`, kind: 'floor', roomId: room.id, levelId: room.levelId, vertices, indices, color: room.floorColor };
}
function unique(values) { return [...values].sort((a, b) => a - b).filter((v, i, a) => !i || v - a[i - 1] > EPS); }
function solidIntervals(openings, height) {
  const holes = openings.map(o => [o.sill, o.sill + o.height]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const result = []; let cursor = 0;
  for (const [a, b] of holes) { if (a > cursor + EPS) result.push([cursor, a]); cursor = Math.max(cursor, b); }
  if (cursor < height - EPS) result.push([cursor, height]); return result;
}

/** Derived geometry is disposable; the plan remains the single editable truth. */
export function compilePlan(value) {
  const plan = validatePlan(value), levelMap = new Map(plan.levels.map(l => [l.id, l]));
  const rooms = [...plan.rooms].sort((a, b) => compare(a.id, b.id)), groups = [], groupsByLevel = new Map(), walls = [], floors = [];
  for (const room of rooms) {
    floors.push(floorMesh(room, levelMap.get(room.levelId).elevation));
    room.points.forEach((a, edge) => {
      const b = room.points[(edge + 1) % room.points.length];
      let ux = b[0] - a[0], uz = b[1] - a[1]; const length = Math.hypot(ux, uz); ux /= length; uz /= length;
      if (ux < -EPS || Math.abs(ux) <= EPS && uz < 0) { ux *= -1; uz *= -1; }
      const offset = -uz * a[0] + ux * a[1], q = n => Math.round(n * 1e7);
      const key = `${room.levelId}/${q(ux)}/${q(uz)}/${q(offset)}`;
      let levelGroups = groupsByLevel.get(room.levelId);
      if (!levelGroups) { levelGroups = []; groupsByLevel.set(room.levelId, levelGroups); }
      // Rounded keys only order output: floating point roundoff can put the same
      // line in neighboring buckets. Compare the line and both endpoints before
      // sharing its openings, including for partially overlapping room edges.
      let group = levelGroups.find(g => Math.abs(g.ux * uz - g.uz * ux) <= EPS &&
        Math.abs(-g.uz * a[0] + g.ux * a[1] - g.offset) <= EPS &&
        Math.abs(-g.uz * b[0] + g.ux * b[1] - g.offset) <= EPS);
      if (!group) {
        group = { key, levelId: room.levelId, ux, uz, offset, edges: [] };
        groups.push(group); levelGroups.push(group);
      }
      const ta = a[0] * group.ux + a[1] * group.uz, tb = b[0] * group.ux + b[1] * group.uz;
      group.edges.push({ room, start: Math.min(ta, tb), end: Math.max(ta, tb), openings: room.openings.filter(o => o.edge === edge).map(o => {
        const center = ta + (tb - ta) * o.at; return { ...o, start: center - o.width / 2, end: center + o.width / 2 };
      }) });
    });
  }
  groups.sort((a, b) => compare(a.key, b.key)).forEach((g, gi) => {
    const level = levelMap.get(g.levelId), openings = g.edges.flatMap(e => e.openings);
    const stops = unique(g.edges.flatMap(e => [e.start, e.end]).concat(openings.flatMap(o => [o.start, o.end])));
    for (let i = 0; i < stops.length - 1; i++) {
      const start = stops[i], end = stops[i + 1], mid = (start + end) / 2;
      const covered = g.edges.filter(e => e.start < mid + EPS && e.end > mid - EPS); if (!covered.length) continue;
      const holes = openings.filter(o => o.start < mid + EPS && o.end > mid - EPS);
      const roomIds = [...new Set(covered.map(e => e.room.id))].sort(compare);
      const chosen = covered.find(e => e.room.id === roomIds[0]).room;
      solidIntervals(holes, level.height).forEach(([bottom, top], j) => {
        if (walls.length >= LIMITS.walls) fail('plan', `derived geometry exceeds ${LIMITS.walls} wall pieces`);
        walls.push({ id: `wall-${g.levelId}-${gi}-${i}-${j}`, kind: 'wall', levelId: g.levelId, roomIds,
          position: [clean(g.ux * mid - g.uz * g.offset), level.elevation + (bottom + top) / 2, clean(g.uz * mid + g.ux * g.offset)],
          rotation: [0, clean(-Math.atan2(g.uz, g.ux)), 0], size: [end - start, top - bottom, Math.max(...covered.map(e => e.room.wallThickness))], color: chosen.wallColor });
      });
    }
  });
  const connectors = [...plan.connectors].sort((a, b) => compare(a.id, b.id)).map(c => ({ id: `connector-${c.id}`, kind: 'connector',
    type: c.type, name: c.name, levelId: c.fromLevelId, fromLevelId: c.fromLevelId, toLevelId: c.toLevelId,
    position: [c.position[0], levelMap.get(c.fromLevelId).elevation + 0.04, c.position[1]], rotation: [0, c.rotation * Math.PI / 180, 0],
    size: [c.size[0], 0.08, c.size[1]], color: c.type === 'stairs' ? '#d4a54a' : '#639cc4', toElevation: levelMap.get(c.toLevelId).elevation }));
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  const include = p => p.forEach((v, i) => { min[i] = Math.min(min[i], v); max[i] = Math.max(max[i], v); });
  for (const f of floors) for (let i = 0; i < f.vertices.length; i += 3) include(f.vertices.slice(i, i + 3));
  for (const b of [...walls, ...connectors]) {
    const c = Math.cos(b.rotation[1]), s = Math.sin(b.rotation[1]);
    for (const x of [-b.size[0] / 2, b.size[0] / 2]) for (const y of [-b.size[1] / 2, b.size[1] / 2]) for (const z of [-b.size[2] / 2, b.size[2] / 2])
      include([b.position[0] + c * x + s * z, b.position[1] + y, b.position[2] - s * x + c * z]);
  }
  return { schema: GEOMETRY_SCHEMA, units: plan.units, walls, floors, connectors,
    bounds: Number.isFinite(min[0]) ? { min: min.map(clean), max: max.map(clean) } : { min: [0, 0, 0], max: [0, 0, 0] } };
}

export function createPlanPackage(value) {
  const plan = validatePlan(value); return { schema: PACKAGE_SCHEMA, plan, geometry: compilePlan(plan) };
}
