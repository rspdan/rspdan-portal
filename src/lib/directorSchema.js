// The editable document is the saved artifact. Asset bytes and rig names are
// selected by the server registry, never by an arbitrary URL in a browser save.
export const TAKE_SCHEMA = 'nest-director-take/v1';
export const MAX_BODY_BYTES = 2 * 1024 * 1024;
export const TAKE_ID = /^dir_[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const HASH = /^[0-9a-f]{64}$/;
const NAME = /^[A-Za-z0-9][A-Za-z0-9 _.:|()\-]{0,95}$/;

export class DirectorError extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}
function requireValue(condition, message) {
  if (!condition) throw new DirectorError(message);
}
function object(value, path) {
  requireValue(value !== null && typeof value === 'object' && !Array.isArray(value), `${path} must be an object`);
  return value;
}
function keys(value, allowed, path) {
  object(value, path);
  requireValue(Object.keys(value).every((key) => allowed.includes(key)), `${path} has unknown fields`);
}
function number(value, min, max, path, integer = false) {
  requireValue(typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max && (!integer || Number.isInteger(value)), `${path} is outside its supported range`);
  return value;
}
function text(value, max, path) {
  requireValue(typeof value === 'string' && value.length <= max, `${path} must be text of at most ${max} characters`);
  return value;
}
function vector(value, size, min, max, path) {
  requireValue(Array.isArray(value) && value.length === size, `${path} must have ${size} components`);
  return value.map((v, i) => number(v, min, max, `${path}[${i}]`));
}
function member(value, choices, path) {
  requireValue(choices.includes(value), `${path} is unsupported`);
  return value;
}
function registryNames(values, path) {
  if (!Array.isArray(values) || values.length > 96 || values.some((v) => typeof v !== 'string' || !NAME.test(v)) || new Set(values).size !== values.length) {
    throw new DirectorError(`Director ${path} registry is unavailable`, 503);
  }
  return values;
}
export function validateRequestId(value) {
  requireValue(typeof value === 'string' && UUID.test(value), 'requestId must be a lowercase UUID');
  return value;
}
export function validateTakeId(value) {
  requireValue(typeof value === 'string' && TAKE_ID.test(value), 'invalid take id');
  return value;
}
export function validateOwner(value) {
  if (typeof value !== 'string' || !/^[a-z0-9][a-z0-9_-]{0,31}$/.test(value)) throw new DirectorError('valid operator session required', 401);
  return value;
}

export function validateTake(input, registry) {
  keys(input, ['schema', 'asset', 'name', 'notes', 'look', 'fps', 'frame', 'range', 'stage', 'camera', 'pose', 'keyframes'], 'take');
  requireValue(input.schema === TAKE_SCHEMA, 'unsupported take schema');
  keys(input.asset, ['id', 'sha256'], 'asset');
  requireValue(typeof input.asset.id === 'string' && typeof input.asset.sha256 === 'string' && HASH.test(input.asset.sha256), 'asset id and SHA256 are required');
  const asset = registry?.assets?.find((candidate) => candidate.id === input.asset.id && candidate.sha256 === input.asset.sha256);
  requireValue(Boolean(asset), 'asset edition is not registered');
  const boneNames = registryNames(asset.bones, 'bone');
  const morphNames = registryNames(asset.morphs, 'morph');
  if (!boneNames.length) throw new DirectorError('Director rig registry is unavailable', 503);

  function pose(value, path) {
    keys(value, ['bones', 'morphs'], path);
    object(value.bones, `${path}.bones`);
    requireValue(Object.keys(value.bones).length === boneNames.length && boneNames.every((name) => Object.hasOwn(value.bones, name)), `${path} must contain every registered bone`);
    const bones = Object.create(null);
    for (const name of boneNames) {
      const bone = value.bones[name];
      keys(bone, ['position', 'rotation', 'scale'], `${path}.${name}`);
      const rotation = vector(bone.rotation, 4, -1, 1, `${path}.${name}.rotation`);
      requireValue(Math.abs(Math.hypot(...rotation) - 1) < .001, `${path}.${name}.rotation must be a unit quaternion`);
      bones[name] = {
        position: vector(bone.position, 3, -1000, 1000, `${path}.${name}.position`),
        rotation,
        scale: vector(bone.scale, 3, .01, 20, `${path}.${name}.scale`),
      };
    }
    object(value.morphs, `${path}.morphs`);
    requireValue(Object.keys(value.morphs).length === morphNames.length && morphNames.every((name) => Object.hasOwn(value.morphs, name)), `${path} must contain every registered morph`);
    const morphs = Object.create(null);
    for (const name of morphNames) morphs[name] = number(value.morphs[name], -2, 2, `${path}.${name}`);
    return { bones, morphs };
  }

  keys(input.range, ['start', 'end'], 'range');
  const start = number(input.range.start, 1, 36000, 'range.start', true);
  const end = number(input.range.end, start, Math.min(start + 10000, 36000), 'range.end', true);
  keys(input.stage, ['background'], 'stage');
  keys(input.camera, ['mode', 'position', 'target', 'fov', 'orthoSize'], 'camera');
  const cameraPosition = vector(input.camera.position, 3, -1000, 1000, 'camera.position');
  const cameraTarget = vector(input.camera.target, 3, -1000, 1000, 'camera.target');
  requireValue(Math.hypot(...cameraPosition.map((x, i) => x - cameraTarget[i])) > .001, 'camera position and target must differ');
  requireValue(Array.isArray(input.keyframes) && input.keyframes.length <= 600, 'at most 600 keyframes are supported');
  let lastFrame = start - 1;
  const keyframes = input.keyframes.map((keyframe, index) => {
    keys(keyframe, ['frame', 'pose'], `keyframes[${index}]`);
    const frame = number(keyframe.frame, start, end, `keyframes[${index}].frame`, true);
    requireValue(frame > lastFrame, 'keyframes must have distinct increasing frames');
    lastFrame = frame;
    return { frame, pose: pose(keyframe.pose, `keyframes[${index}].pose`) };
  });
  const take = {
    schema: TAKE_SCHEMA,
    asset: { id: asset.id, sha256: asset.sha256 },
    name: text(input.name, 100, 'name'), notes: text(input.notes, 4000, 'notes'),
    look: member(input.look, ['ouch', 'trip'], 'look'),
    fps: number(input.fps, 1, 60, 'fps', true),
    frame: number(input.frame, start, end, 'frame', true),
    range: { start, end },
    stage: { background: member(input.stage.background, ['white', 'green', 'transparent'], 'stage.background') },
    camera: {
      mode: member(input.camera.mode, ['perspective', 'orthographic'], 'camera.mode'),
      position: cameraPosition, target: cameraTarget,
      fov: number(input.camera.fov, .05, 3, 'camera.fov'),
      orthoSize: number(input.camera.orthoSize, .01, 1000, 'camera.orthoSize'),
    },
    pose: pose(input.pose, 'pose'), keyframes,
  };
  requireValue(new TextEncoder().encode(JSON.stringify(take)).length <= MAX_BODY_BYTES - 1024, 'take is too large');
  return take;
}
