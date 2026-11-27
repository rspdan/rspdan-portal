# ODK floorplan data contract

The browser editor stores an editable plan and derives its preview geometry from
that plan. The portable package carries both for the ODK Blender importer. This is
a set-blockout format: room outlines, real wall openings, levels, and connection
footprints. It does not establish the canonical OHC/CHO floorplan or infer missing
lore from a generic room layout.

## Schemas and API

The dependency-free implementation is
[`public/director/floorplan-model.js`](../../public/director/floorplan-model.js).

| Export | Result |
| --- | --- |
| `createPlan()` | Independent blank `nest-floorplan/v1` plan with one Ground level |
| `validatePlan(value)` | Validated, normalized, detached canonical plan |
| `compilePlan(value)` | Validated `nest-floorplan-geometry/v1` geometry |
| `createPlanPackage(value)` | `nest-floorplan-package/v1` envelope containing `plan` and `geometry` |
| `roomBounds(room)` | `{minX, minZ, maxX, maxZ, width, depth, center}` for a valid room |
| `nearestEdge(room, [x,z])` | `{edge, at, point, distance}` projected onto a valid room's nearest edge |

Validation never mutates its input. Failure throws `FloorplanValidationError` with
`code: "FLOORPLAN_INVALID"`, `path`, and a descriptive message. `validatePlan`
accepts a plan, not a package; callers must explicitly select a package's `plan`.
The browser should regenerate geometry after importing the plan. Geometry in an
untrusted package must be independently validated by a native consumer before it
creates scene objects.

`validatePlan` checks source structure and counts. `compilePlan` additionally
checks that derived wall pieces fit the geometry budget. Use the latter before
accepting a document that must be renderable.

## Canonical plan

```json
{
  "schema": "nest-floorplan/v1",
  "name": "Set blockout",
  "units": "unit",
  "grid": 0.25,
  "activeLevelId": "level-ground",
  "levels": [
    { "id": "level-ground", "name": "Ground", "elevation": 0, "height": 2.7 }
  ],
  "rooms": [
    {
      "id": "room-library",
      "levelId": "level-ground",
      "name": "Library blockout",
      "points": [[0, 0], [4, 0], [4, 4], [0, 4]],
      "wallThickness": 0.12,
      "wallColor": "#e8e2d8",
      "floorColor": "#bda98a",
      "openings": [
        { "id": "door-entry", "type": "door", "edge": 1, "at": 0.5,
          "width": 0.9, "height": 2.1, "sill": 0 }
      ]
    }
  ],
  "connectors": []
}
```

Plan points are `[x,z]`, with Y vertical. Room points describe the wall centerline
and the floor boundary. Coordinates, heights, and widths use the selected unit.
`units` is either `"m"` or `"unit"`; changing this label does not scale data.

Levels have stable IDs independent of their display names. Names may be repeated.
The active level and every room or connector reference must resolve to a level.
IDs are globally unique across levels, rooms, openings, and connectors. They begin
with a letter, contain only letters, digits, `_` and `-`, and have at most 64
characters. `constructor`, `prototype`, and `__proto__` are reserved.

Unknown fields are rejected at every object level. Numbers must be finite numeric
values, not strings. Names are trimmed, nonempty text of at most 120 characters,
without U+0000–U+001F control characters. Colors accept `#rgb` or `#rrggbb` and
normalize to lowercase six-digit hex. Optional values normalize to the defaults
in the implementation; export always writes the full normalized form.

### Room outlines and openings

Room polygons may be concave and use either winding. They must be simple, without
self-crossings, repeated closing points, retraced adjacent edges, or touching
nonadjacent edges. Each edge is at least 0.001 units long; area is at least 0.0001
square units. Extra collinear points are allowed.

An opening references zero-based `edge`, from `points[edge]` to the next point
(wrapping at the end). `at` is its center as a fraction along that directed edge;
`width / 2` extends on either side. `sill` and `height` are measured from the
level's floor elevation. The whole opening must fit within its edge and wall.
Doors and passages start at sill zero. A passage may occupy an entire wall edge.

Collinear room edges on the same level share a wall, including partial overlaps
and reversed edge directions. Floating-point tolerance is `1e-7`; rounded ordering
keys do not decide whether edges share a line. All openings along the shared wall
are unioned as voids, so a neighboring room cannot fill a doorway. Remaining
vertical intervals preserve window sills, headers, and solid rails between holes.
Overlapping solid pieces are emitted once. Shared solids use the maximum covering
wall thickness and the color of the lexicographically first covering room ID.

Room overlap is permitted. The compiler does not resolve intersecting room
interiors, noncollinear wall crossings, or floor overlap. Use the editor to make
the intended arrangement explicit.

### Connections between levels

```json
{
  "id": "connection-stairs",
  "type": "stairs",
  "name": "Stairs to upper",
  "fromLevelId": "level-ground",
  "toLevelId": "level-upper",
  "position": [1, 1],
  "size": [1.2, 2.4],
  "rotation": 30
}
```

`type` is `"stairs"` or `"elevator"`. Source and destination must be distinct,
existing levels with different elevations. `position` is the footprint center;
`size` is `[width,depth]`. Canonical rotation is degrees around the vertical axis.
Connections are thin planning markers at the source level, carrying destination
metadata. They do not create engineered stairs, lift shafts, floor holes, or a
traversable route. A footprint is not required to fit inside a room.

## Portable package and derived geometry

```text
{
  schema: "nest-floorplan-package/v1",
  plan: <canonical plan>,
  geometry: {
    schema: "nest-floorplan-geometry/v1",
    units,
    walls: [<box>],
    floors: [<triangle mesh>],
    connectors: [<planning marker box>],
    bounds: { min: [x,y,z], max: [x,y,z] }
  }
}
```

Wall boxes have `id`, `kind: "wall"`, `levelId`, `roomIds`, `position`, `rotation`,
`size`, and `color`. Position is the center, size is `[width,height,depth]`, and
rotation is `[0,yaw,0]` in **radians**. The compiler emits separate solids around
openings; it does not add door leaves, window glass, or trim.

Floor meshes have `id`, `kind: "floor"`, `roomId`, `levelId`, flat XYZ `vertices`,
triangle `indices`, and `color`. Their top is at the level elevation and their
bottom is 0.08 units below it. Simple concave polygons are triangulated with the
empty recess retained. There are `2n` vertices for `n` source points. Collinear
points may be omitted from top/bottom triangles but remain in the boundary faces,
so triangle count is not invariably `4n - 4`. Surfaces use outward winding.

Connector boxes have `id`, `kind: "connector"`, `type`, `name`, `levelId` (source),
`fromLevelId`, `toLevelId`, `position`, `rotation`, `size`, `color`, and
`toElevation`. Their center Y is source elevation + 0.04, height is 0.08, and yaw
uses radians. Bounds include rotated boxes, wall thickness, and floor depth;
empty plans have zero bounds.

The browser uses Y up; Blender imports each point as `(x, -z, y)`. The receiver
must preserve the plan's unit label and leave an existing scene's unit settings
alone. Source IDs preserve editable identity. Derived wall IDs identify one
compilation and may change when topology changes. Recompiling unchanged data is
deterministic; input room order does not change the derived geometry.

## Limits

| Item | Limit |
| --- | --- |
| Levels | 1–16 |
| Rooms | 0–128 |
| Vertices per room / overall | 3–128 / 4,096 |
| Openings per room / overall | 0–64 / 512 |
| Connections | 0–64 |
| Derived wall pieces | 16,384 |
| Plan X/Z and level elevation | −10,000 to 10,000 |
| Level wall height | 0.1–1,000 |
| Grid spacing | 0.01–100 |
| Wall thickness | 0.01–5 |
| Opening width | 0.02–20,000, also constrained to its edge |
| Opening height | 0.02 to level height, also constrained by sill |
| Connection width/depth | 0.1–1,000 each |
| Connection rotation | −360 to 360 degrees |

Derived mesh coordinates may extend beyond the plan-coordinate limit by wall or
marker half extents. Wall tops can reach elevation + height (up to 11,000). Bounds
must be calculated from the resulting geometry rather than clamped to the plan
coordinate range.

[`floorplan-fixture.json`](floorplan-fixture.json) is the shared browser/Blender
receiving fixture. Its two levels intentionally both display as Ground and have
different IDs. The fixture includes a partial shared wall, real openings, a
concave floor, and a stair marker. Verify with:

```sh
node --test src/lib/floorplan-model.test.mjs
```
