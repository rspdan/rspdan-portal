"""Import the Director floor-plan package as independent, editable Blender geometry.

Install this single file as an addon, or import import_plan_package in a Blender
script. No character dependency, network access, source deletion or automatic save.
"""
bl_info = {
    'name': 'ODK Floor Plans', 'author': 'Nest / C.B.', 'version': (0, 1, 0),
    'blender': (4, 4, 0), 'location': '3D View > Sidebar > Director > Sets',
    'description': 'Import portable Director floor plans as editable sets',
    'category': 'Import-Export',
}
import hashlib
import json
import math
from pathlib import Path
import re
import uuid

try:
    import bpy
    from bpy.props import StringProperty
    from bpy_extras.io_utils import ImportHelper
except ImportError:
    bpy = None  # The same validator can run in ordinary Python.

PACKAGE_SCHEMA = 'nest-floorplan-package/v1'
PLAN_SCHEMA = 'nest-floorplan/v1'
GEOMETRY_SCHEMA = 'nest-floorplan-geometry/v1'
MAX_FILE_BYTES = 32 * 1024 * 1024
MAX_ELEMENTS = 20000
MAX_VERTICES = 8192
MAX_TRIANGLES = 16384
ID_PATTERN = re.compile(r'^[A-Za-z][A-Za-z0-9_-]*$')
COLOR_PATTERN = re.compile(r'^#[0-9a-fA-F]{6}$')


def require(condition, message):
    if not condition:
        raise ValueError(message)


def number(value, path, *, minimum=None, maximum=30000, positive=False):
    require(isinstance(value, (int, float)) and not isinstance(value, bool)
            and math.isfinite(value), path + ' must be a finite number')
    require(value <= maximum and value >= -maximum, path + ' is outside supported working coordinates')
    if minimum is not None:
        require(value >= minimum, path + ' is below its minimum')
    if positive:
        require(value > 0, path + ' must be positive')
    return value


def vector(value, size, path, *, positive=False, minimum=None, maximum=30000):
    require(isinstance(value, list) and len(value) == size, path + ' has the wrong size')
    for i, item in enumerate(value):
        number(item, f'{path}[{i}]', positive=positive, minimum=minimum, maximum=maximum)
    return value


def array(value, path, maximum=MAX_ELEMENTS):
    require(isinstance(value, list) and len(value) <= maximum,
            path + ' must be a bounded array')
    return value


def identity(value, path, seen, max_length=64):
    require(isinstance(value, str) and len(value) <= max_length and ID_PATTERN.fullmatch(value), path + ' is not a valid ID')
    require(value not in ('constructor', 'prototype', '__proto__'), path + ' is reserved')
    require(value not in seen, path + ' duplicates an ID')
    seen.add(value)
    return value


def label(value, path):
    require(isinstance(value, str) and 0 < len(value.strip()) <= 120 and not re.search(r'[\x00-\x1f\x7f]', value),
            path + ' must be a nonempty name of at most 120 characters without control characters')


def color(value, path):
    require(isinstance(value, str) and COLOR_PATTERN.fullmatch(value), path + ' must be #rrggbb')


def parse_json(text):
    def invalid_constant(value):
        raise ValueError('Nonfinite JSON constant: ' + value)
    return json.loads(text, parse_constant=invalid_constant)


def fields(value, allowed, path):
    require(isinstance(value, dict), path + ' must be an object')
    require(set(value) == set(allowed.split()), path + ' has unknown or missing fields')


def validate_polygon(points):
    # Validation only: triangulation and shared-wall compilation stay in JavaScript.
    def cross(a, b, c):
        return (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])
    def on(a, b, p):
        return abs(cross(a,b,p)) <= 1e-9 and min(a[0],b[0])-1e-9 <= p[0] <= max(a[0],b[0])+1e-9 and min(a[1],b[1])-1e-9 <= p[1] <= max(a[1],b[1])+1e-9
    n = len(points)
    for i, a in enumerate(points):
        b, c = points[(i+1)%n], points[(i+2)%n]
        require(math.dist(a,b) >= .001, 'Room has a duplicate or too-short edge')
        require(not (abs(cross(a,b,c)) < 1e-9 and (b[0]-a[0])*(c[0]-b[0])+(b[1]-a[1])*(c[1]-b[1]) < 0), 'Room backtracks along an edge')
        for j in range(i+1,n):
            if j == i+1 or i == 0 and j == n-1:
                continue
            c, d = points[j], points[(j+1)%n]
            crosses = cross(a,b,c)*cross(a,b,d) < 0 and cross(c,d,a)*cross(c,d,b) < 0
            require(not crosses and not any((on(a,b,c),on(a,b,d),on(c,d,a),on(c,d,b))), 'Room edges cross or touch')
    require(abs(sum(p[0]*points[(i+1)%n][1]-points[(i+1)%n][0]*p[1] for i,p in enumerate(points))) >= .0002, 'Room area is too small')


def validate_package(package):
    """Validate the entire package before creating any Blender data.

    The browser owns polygon/shared-wall compilation. This receiver validates
    the source structure and supplied mesh/box contract, not a second compiler.
    """
    require(isinstance(package, dict) and package.get('schema') == PACKAGE_SCHEMA,
            'Use Export plan in the Director floor-plan creator; expected ' + PACKAGE_SCHEMA)
    fields(package, 'schema plan geometry', 'package')
    plan, geometry = package.get('plan'), package.get('geometry')
    fields(plan, 'schema name units grid activeLevelId levels rooms connectors', 'plan')
    fields(geometry, 'schema units walls floors connectors bounds', 'geometry')
    require(isinstance(plan, dict) and plan.get('schema') == PLAN_SCHEMA, 'Unsupported plan schema')
    require(isinstance(geometry, dict) and geometry.get('schema') == GEOMETRY_SCHEMA,
            'Unsupported compiled geometry schema')
    label(plan.get('name'), 'plan.name')
    require(plan.get('units') in ('m', 'unit'), 'Plan units must be m or unit')
    require(geometry.get('units') == plan['units'], 'Plan and geometry units disagree')
    number(plan.get('grid'), 'plan.grid', minimum=.01, maximum=100)
    seen = set()
    levels = {}
    for level in array(plan.get('levels'), 'plan.levels',16):
        fields(level, 'id name elevation height', 'level')
        key = identity(level.get('id'), 'level.id', seen)
        label(level.get('name'), 'level.name')
        number(level.get('elevation'), 'level.elevation',maximum=10000)
        number(level.get('height'), 'level.height', minimum=.1,maximum=1000)
        levels[key] = level
    require(levels and plan.get('activeLevelId') in levels, 'Select a valid active level')
    rooms = {}
    point_count = opening_count = 0
    for room in array(plan.get('rooms'), 'plan.rooms',128):
        fields(room, 'id levelId name points wallThickness wallColor floorColor openings', 'room')
        key = identity(room.get('id'), 'room.id', seen)
        label(room.get('name'), 'room.name')
        require(room.get('levelId') in levels, 'Room references an unknown level')
        points = array(room.get('points'), 'room.points',128)
        require(len(points) >= 3, 'A room needs at least three points')
        for point in points:
            vector(point, 2, 'room point',maximum=10000)
        point_count += len(points)
        require(point_count <= 4096, 'Plan point limit exceeded')
        validate_polygon(points)
        area = sum(p[0] * points[(i + 1) % len(points)][1] - points[(i + 1) % len(points)][0] * p[1]
                   for i, p in enumerate(points))
        require(abs(area) > 1e-9, 'Room polygon has zero area')
        number(room.get('wallThickness'), 'room.wallThickness',minimum=.01,maximum=5)
        color(room.get('wallColor'), 'room.wallColor')
        color(room.get('floorColor'), 'room.floorColor')
        for opening in array(room.get('openings'), 'room.openings',64):
            opening_count += 1
            require(opening_count <= 512, 'Plan opening limit exceeded')
            fields(opening, 'id type edge at width height sill', 'opening')
            identity(opening.get('id'), 'opening.id', seen)
            require(opening.get('type') in ('door', 'window', 'passage'), 'Unknown opening type')
            edge = opening.get('edge')
            require(isinstance(edge, int) and not isinstance(edge, bool) and 0 <= edge < len(points),
                    'Opening edge is outside the room polygon')
            at = number(opening.get('at'), 'opening.at', minimum=0)
            require(at <= 1, 'Opening center fraction exceeds 1')
            width = number(opening.get('width'), 'opening.width',minimum=.02,maximum=20000)
            height = number(opening.get('height'), 'opening.height',minimum=.02,maximum=1000)
            sill = number(opening.get('sill'), 'opening.sill', minimum=0)
            require(opening['type'] == 'window' or sill == 0, 'Door and passage sill must be zero')
            length = math.dist(points[edge], points[(edge + 1) % len(points)])
            require(at * length - width / 2 >= -1e-7 and at * length + width / 2 <= length + 1e-7,
                    'Opening extends beyond its wall edge')
            require(sill + height <= levels[room['levelId']]['height'] + 1e-7,
                    'Opening extends above the level wall height')
        rooms[key] = room
    connectors = {}
    for connector in array(plan.get('connectors'), 'plan.connectors',64):
        fields(connector, 'id type name fromLevelId toLevelId position size rotation', 'connector')
        key = identity(connector.get('id'), 'connector.id', seen)
        label(connector.get('name'), 'connector.name')
        require(connector.get('type') in ('stairs', 'elevator'), 'Unknown connector type')
        require(connector.get('fromLevelId') in levels and connector.get('toLevelId') in levels
                and connector['fromLevelId'] != connector['toLevelId'], 'Connector levels must exist and differ')
        require(levels[connector['fromLevelId']]['elevation'] != levels[connector['toLevelId']]['elevation'], 'Connector levels need distinct elevations')
        vector(connector.get('position'), 2, 'connector.position',maximum=10000)
        vector(connector.get('size'), 2, 'connector.size',minimum=.1,maximum=1000)
        number(connector.get('rotation'), 'connector.rotation',maximum=360)
        connectors[key] = connector
    compiled_ids = set()
    walls = array(geometry.get('walls'), 'geometry.walls',16384)
    floors = array(geometry.get('floors'), 'geometry.floors',128)
    markers = array(geometry.get('connectors'), 'geometry.connectors',64)
    require(len(walls) + len(floors) + len(markers) <= MAX_ELEMENTS, 'Compiled element limit exceeded')
    floor_rooms = set()
    total_vertices = total_triangles = 0
    for floor in floors:
        fields(floor, 'id kind roomId levelId vertices indices color', 'floor')
        require(isinstance(floor, dict) and floor.get('kind') == 'floor', 'Invalid compiled floor')
        identity(floor.get('id'), 'floor.id', compiled_ids,160)
        rid = floor.get('roomId')
        require(rid in rooms and rid not in floor_rooms, 'Compiled floor must identify one unique room')
        require(floor.get('levelId') == rooms[rid]['levelId'], 'Floor level does not match its room')
        require(floor['id'] == 'floor-' + rid, 'Floor ID does not match its room')
        color(floor.get('color'), 'floor.color')
        vertices, indices = floor.get('vertices'), floor.get('indices')
        require(isinstance(vertices, list) and len(vertices) >= 9 and len(vertices) % 3 == 0,
                'Floor vertices must be flat xyz triples')
        require(isinstance(indices, list) and len(indices) >= 3 and len(indices) % 3 == 0,
                'Floor indices must be triangles')
        count = len(vertices) // 3
        source_points = rooms[rid]['points']
        elevation = levels[floor['levelId']]['elevation']
        require(count == 2 * len(source_points), 'Floor vertex count differs from its room')
        require(2 * len(source_points) + 2 <= len(indices) // 3 <= 4 * len(source_points) - 4, 'Floor triangle count differs from its room')
        expected = [[x, y, z] for y in (elevation, elevation - .08) for x, z in source_points]
        for value in vertices:
            number(value, 'floor vertex')
        require(all(abs(a-b) <= 1e-7 for a,b in zip(vertices, (v for p in expected for v in p))), 'Floor vertices differ from source footprint')
        require(floor['color'] == rooms[rid]['floorColor'], 'Floor color differs from source')
        total_vertices += count
        total_triangles += len(indices) // 3
        require(total_vertices <= MAX_VERTICES and total_triangles <= MAX_TRIANGLES, 'Compiled mesh limit exceeded')
        for index in indices:
            require(isinstance(index, int) and not isinstance(index, bool) and 0 <= index < count,
                    'Floor triangle index is outside its vertices')
        for i in range(0, len(indices), 3):
            require(len(set(indices[i:i + 3])) == 3, 'Floor contains a degenerate index triangle')
        floor_rooms.add(rid)
    require(floor_rooms == set(rooms), 'Compiled floors do not cover the plan rooms')
    for wall in walls:
        fields(wall, 'id kind levelId roomIds position rotation size color', 'wall')
        require(isinstance(wall, dict) and wall.get('kind') == 'wall', 'Invalid compiled wall')
        identity(wall.get('id'), 'wall.id', compiled_ids,160)
        require(wall.get('levelId') in levels, 'Wall references an unknown level')
        owners = wall.get('roomIds')
        require(isinstance(owners, list) and 0 < len(owners) <= 128 and all(isinstance(r,str) for r in owners) and len(set(owners)) == len(owners)
                and all(r in rooms and rooms[r]['levelId'] == wall['levelId'] for r in owners),
                'Wall room owners do not match its level')
        validate_box(wall)
        elevation = levels[wall['levelId']]['elevation']
        require(wall['size'][2] <= 5 and wall['position'][1] - wall['size'][1]/2 >= elevation - 1e-7 and wall['position'][1] + wall['size'][1]/2 <= elevation + levels[wall['levelId']]['height'] + 1e-7, 'Wall extends outside level height or thickness')
    marker_sources = set()
    for marker in markers:
        fields(marker, 'id kind type name levelId fromLevelId toLevelId position rotation size color toElevation', 'marker')
        require(isinstance(marker, dict) and marker.get('kind') == 'connector', 'Invalid connector marker')
        identity(marker.get('id'), 'marker.id', compiled_ids,160)
        # Compiler marker IDs explicitly prefix their canonical connector ID.
        require(marker['id'].startswith('connector-'), 'Invalid connector marker ID')
        cid = marker['id'][len('connector-'):]
        require(cid in connectors and cid not in marker_sources, 'Unknown or repeated connector marker')
        source = connectors[cid]
        require(marker.get('type') == source['type'] and marker.get('fromLevelId') == source['fromLevelId']
                and marker.get('toLevelId') == source['toLevelId'] and marker.get('levelId') == source['fromLevelId'],
                'Connector marker does not match its source route')
        number(marker.get('toElevation'), 'marker.toElevation')
        require(abs(marker['toElevation'] - levels[source['toLevelId']]['elevation']) < 1e-7,
                'Connector target elevation differs from plan')
        validate_box(marker)
        require(marker['name'] == source['name'], 'Marker name differs from source')
        expected = (source['position'][0], levels[source['fromLevelId']]['elevation']+.04, source['position'][1])
        require(all(abs(a-b) < 1e-7 for a,b in zip(marker['position'],expected)), 'Marker position differs from source')
        require(all(abs(a-b) < 1e-7 for a,b in zip(marker['size'],(source['size'][0],.08,source['size'][1]))), 'Marker footprint differs from source')
        require(abs(marker['rotation'][1] - math.radians(source['rotation'])) < 1e-7, 'Marker rotation differs from source')
        marker_sources.add(cid)
    require(marker_sources == set(connectors), 'Compiled markers do not cover the plan connectors')
    bounds = geometry.get('bounds')
    fields(bounds, 'min max', 'geometry.bounds')
    vector(bounds.get('min'),3,'bounds.min'); vector(bounds.get('max'),3,'bounds.max')
    require(all(a <= b for a,b in zip(bounds['min'],bounds['max'])), 'Bounds minimum exceeds maximum')
    return {'plan': plan, 'geometry': geometry, 'levels': levels, 'rooms': rooms,
            'counts': {'levels': len(levels), 'rooms': len(rooms), 'walls': len(walls),
                       'floors': len(floors), 'markers': len(markers)}}


def validate_box(box):
    vector(box.get('position'), 3, 'box.position')
    rotation = vector(box.get('rotation'), 3, 'box.rotation')
    require(abs(rotation[0]) < 1e-7 and abs(rotation[2]) < 1e-7, 'Only plan-yaw rotations are supported')
    vector(box.get('size'), 3, 'box.size', positive=True)
    color(box.get('color'), 'box.color')


def native_position(position):
    return (position[0], -position[2], position[1])


def import_plan_package(package, *, source_text=None):
    """Create one new independent set. Validate first; never save or replace data."""
    validated = validate_package(package)
    require(bpy is not None, 'Blender is required to create native geometry')
    if source_text is None:
        source_text = json.dumps(package, ensure_ascii=False, separators=(',', ':'))
    require(isinstance(source_text,str) and len(source_text.encode('utf-8')) <= MAX_FILE_BYTES, 'Source JSON must be under 32 MiB')
    require(parse_json(source_text) == package, 'Source JSON text does not match the supplied package')
    source_sha = hashlib.sha256(source_text.encode('utf-8')).hexdigest()
    plan, geometry = validated['plan'], validated['geometry']
    instance = uuid.uuid4().hex
    objects, meshes, materials, collections, texts = [], [], [], [], []
    def collection(name, parent):
        c = bpy.data.collections.new(name); collections.append(c); parent.children.link(c)
        c['odk_set_instance'] = instance
        return c
    def obj(name, data, col):
        o = bpy.data.objects.new(name, data); objects.append(o); col.objects.link(o)
        o['odk_set_instance'] = instance
        return o
    material_cache = {}
    def material(hex_color):
        if hex_color not in material_cache:
            m = bpy.data.materials.new('Plan ' + hex_color); materials.append(m); m.use_nodes = True
            rgb = [int(hex_color[i:i + 2], 16) / 255 for i in (1, 3, 5)]
            # Editor colors are sRGB; Blender shader colors are linear.
            linear = [v / 12.92 if v <= .04045 else ((v + .055) / 1.055) ** 2.4 for v in rgb]
            m.diffuse_color = (*linear, 1)
            shader = m.node_tree.nodes.get('Principled BSDF')
            shader.inputs['Base Color'].default_value = m.diffuse_color
            shader.inputs['Roughness'].default_value = .82
            material_cache[hex_color] = m
        return material_cache[hex_color]
    def mesh_object(name, vertices, faces, col, parent, hex_color):
        m = bpy.data.meshes.new(name); meshes.append(m); m.from_pydata(vertices, [], faces); m.update()
        o = obj(name, m, col); o.parent = parent; m.materials.append(material(hex_color)); return o
    try:
        top = collection(plan['name'], bpy.context.scene.collection)
        top['asset_id'] = 'set.floorplan'; top['odk_set_instance'] = instance
        root = obj(plan['name'], None, top); root.empty_display_type = 'PLAIN_AXES'; root.empty_display_size = .4
        root['asset_id'] = 'set.floorplan'; root['floorplan_schema'] = PLAN_SCHEMA
        root['floorplan_units'] = plan['units']; root['floorplan_source_sha256'] = source_sha
        root['floorplan_note'] = 'Imported geometry is independently editable. Reimport creates another set. Connector footprints are planning markers.'
        level_objects = {}
        for level in plan['levels']:
            c = collection(level['name'], top); c['floorplan_level_id'] = level['id']
            o = obj(level['name'], None, c); o.parent = root; o.location.z = level['elevation']
            o['floorplan_level_id'] = level['id']; o['floorplan_elevation'] = level['elevation']; o['floorplan_height'] = level['height']
            level_objects[level['id']] = (c, o, level['elevation'])
        for floor in geometry['floors']:
            c, parent, elevation = level_objects[floor['levelId']]
            points = [native_position(floor['vertices'][i:i + 3]) for i in range(0, len(floor['vertices']), 3)]
            points = [(x, y, z - elevation) for x, y, z in points]
            faces = [floor['indices'][i:i + 3] for i in range(0, len(floor['indices']), 3)]
            o = mesh_object(validated['rooms'][floor['roomId']]['name'] + ' floor', points, faces, c, parent, floor['color'])
            o['floorplan_element_id'] = floor['id']; o['floorplan_kind'] = 'floor'; o['floorplan_room_id'] = floor['roomId']
        cube_faces = [(0, 3, 2, 1), (4, 5, 6, 7), (0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)]
        for box in geometry['walls'] + geometry['connectors']:
            c, parent, elevation = level_objects[box['levelId']]
            w, height, depth = box['size']
            points = [(x * w / 2, y * depth / 2, z * height / 2)
                      for x, y, z in [(-1, -1, -1), (1, -1, -1), (1, 1, -1), (-1, 1, -1),
                                      (-1, -1, 1), (1, -1, 1), (1, 1, 1), (-1, 1, 1)]]
            is_marker = box['kind'] == 'connector'
            name = (box.get('name', box.get('type', 'Connection')) + ' marker') if is_marker else 'Wall'
            o = mesh_object(name, points, cube_faces, c, parent, box['color'])
            position = native_position(box['position']); o.location = (position[0], position[1], position[2] - elevation)
            o.rotation_euler.z = box['rotation'][1]
            o['floorplan_element_id'] = box['id']; o['floorplan_kind'] = box['kind']
            if is_marker:
                o['floorplan_connector_type'] = box['type']; o['floorplan_from_level'] = box['fromLevelId']; o['floorplan_to_level'] = box['toLevelId']
                o['floorplan_marker_only'] = True
            else:
                o['floorplan_room_ids'] = json.dumps(box['roomIds'], separators=(',', ':'))
        text = bpy.data.texts.new(plan['name'] + ' · floor plan.json'); texts.append(text); text.write(source_text)
        root['floorplan_source_text'] = text.name
        bpy.context.view_layer.update()
        return {'collection': top, 'root': root, 'levels': level_objects, 'objects': objects,
                'source_sha256': source_sha, 'counts': validated['counts']}
    except Exception:
        for o in reversed(objects):
            bpy.data.objects.remove(o, do_unlink=True)
        for c in reversed(collections):
            bpy.data.collections.remove(c)
        for m in meshes:
            if m.users == 0: bpy.data.meshes.remove(m)
        for m in materials:
            if m.users == 0: bpy.data.materials.remove(m)
        for t in texts:
            bpy.data.texts.remove(t)
        raise


def import_plan_file(filepath):
    path = Path(filepath)
    require(path.is_file() and path.stat().st_size <= MAX_FILE_BYTES, 'Choose a plan JSON file under 32 MiB')
    source_text = path.read_text(encoding='utf-8')
    return import_plan_package(parse_json(source_text), source_text=source_text)


if bpy is not None:
    class ODKFLOORPLAN_OT_import(bpy.types.Operator, ImportHelper):
        bl_idname = 'odk_floorplan.import_plan'
        bl_label = 'Import floor plan'
        bl_description = 'Create a new editable set from a Director Export plan JSON file'
        bl_options = {'REGISTER', 'UNDO'}
        filename_ext = '.json'
        filter_glob: StringProperty(default='*.json', options={'HIDDEN'})
        def execute(self, context):
            try:
                result = import_plan_file(self.filepath)
            except (ValueError, OSError, KeyError, TypeError) as error:
                self.report({'ERROR'}, str(error)); return {'CANCELLED'}
            self.report({'INFO'}, f"Imported {result['counts']['rooms']} rooms into a new set")
            return {'FINISHED'}
    class ODKFLOORPLAN_PT_sets(bpy.types.Panel):
        bl_label = 'Sets'
        bl_idname = 'ODKFLOORPLAN_PT_sets'
        bl_space_type = 'VIEW_3D'
        bl_region_type = 'UI'
        bl_category = 'Director'
        def draw(self, context):
            self.layout.operator('odk_floorplan.import_plan', icon='IMPORT')
            self.layout.label(text='Each import creates a new editable set.')
    CLASSES = (ODKFLOORPLAN_OT_import, ODKFLOORPLAN_PT_sets)
    def register():
        for cls in CLASSES: bpy.utils.register_class(cls)
    def unregister():
        for cls in reversed(CLASSES): bpy.utils.unregister_class(cls)
else:
    def register(): raise RuntimeError('Blender is required')
    def unregister(): pass

if __name__ == '__main__' and bpy is not None:
    register()
