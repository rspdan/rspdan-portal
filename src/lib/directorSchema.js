// The editable document is the saved artifact. Asset bytes and rig names are
// selected by the server registry, never by an arbitrary URL in a browser save.
import { validatePlan, compilePlan } from '../../public/director/floorplan-model.js';
export const TAKE_SCHEMA = 'nest-director-take/v1';
export const TAKE_SCHEMA_V2 = 'nest-director-take/v2';
export const MAX_BODY_BYTES = 2 * 1024 * 1024;
export const TAKE_ID = /^dir_[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const HASH = /^[0-9a-f]{64}$/;
const NAME = /^[A-Za-z0-9][A-Za-z0-9 _.:|()\-]{0,95}$/;
const TRANSITIONS = ['hold', 'linear', 'ease-in', 'ease-out', 'ease-in-out'];

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
function boolean(value, path) {
  requireValue(typeof value === 'boolean', `${path} must be a boolean`);
  return value;
}
function color(value, path) {
  requireValue(typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value), `${path} must be a six-digit hex color`);
  return value;
}
function sceneId(value, used, path) {
  requireValue(typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/.test(value), `${path} must be a simple token of at most 64 characters`);
  requireValue(!used.has(value), `${path} duplicates a scene or rig ID`);
  used.add(value);
  return value;
}
function lensSettings(value, path) {
  keys(value, ['preset', 'glow', 'rays', 'streak', 'ghosts', 'spread', 'rotation', 'rayCount'], path);
  return {
    preset: member(value.preset, ['glow', 'starburst', 'anamorphic', 'glass'], `${path}.preset`),
    glow: number(value.glow, 0, 1, `${path}.glow`), rays: number(value.rays, 0, 1, `${path}.rays`),
    streak: number(value.streak, 0, 1, `${path}.streak`), ghosts: number(value.ghosts, 0, 1, `${path}.ghosts`),
    spread: number(value.spread, .25, 2, `${path}.spread`), rotation: number(value.rotation, -180, 180, `${path}.rotation`),
    rayCount: number(value.rayCount, 4, 16, `${path}.rayCount`, true),
  };
}
function lightColor(value) {
  keys(value, ['mode', 'hue', 'saturation', 'lightness', 'periodSeconds'], 'tripLightColor');
  return {
    mode: member(value.mode, ['temperature', 'hsl', 'cycle'], 'tripLightColor.mode'),
    hue: number(value.hue, 0, 360, 'tripLightColor.hue'),
    saturation: number(value.saturation, 0, 1, 'tripLightColor.saturation'),
    lightness: number(value.lightness, 0, 1, 'tripLightColor.lightness'),
    periodSeconds: number(value.periodSeconds, .5, 3600, 'tripLightColor.periodSeconds'),
  };
}
function lighting(value, used) {
  keys(value, ['ambient', 'lights'], 'lighting');
  keys(value.ambient, ['intensity', 'color'], 'lighting.ambient');
  requireValue(Array.isArray(value.lights) && value.lights.length <= 8, 'lighting.lights supports at most 8 lights');
  return {
    ambient: { intensity: number(value.ambient.intensity, 0, 3, 'lighting.ambient.intensity'), color: color(value.ambient.color, 'lighting.ambient.color') },
    lights: value.lights.map((light, i) => {
      const path = `lighting.lights[${i}]`;
      keys(light, ['id', 'name', 'type', 'enabled', 'color', 'intensity', 'position', 'rotation', 'angle', 'range', 'attachment', 'effect', 'flare', 'lens'], path);
      const normalized = {
        id: sceneId(light.id, used, `${path}.id`), name: text(light.name, 60, `${path}.name`),
        type: member(light.type, ['point', 'spot', 'directional'], `${path}.type`),
        enabled: boolean(light.enabled, `${path}.enabled`), color: color(light.color, `${path}.color`),
        intensity: number(light.intensity, 0, 20, `${path}.intensity`),
        position: vector(light.position, 3, -100, 100, `${path}.position`),
        rotation: vector(light.rotation, 3, -100, 100, `${path}.rotation`),
        angle: number(light.angle, .1, 3.14, `${path}.angle`), range: number(light.range, .1, 100, `${path}.range`),
      };
      // Omission retains the identity of already saved scene lights.
      if (Object.hasOwn(light, 'attachment')) normalized.attachment = member(light.attachment, ['world', 'head', 'hand.L', 'hand.R'], `${path}.attachment`);
      if (Object.hasOwn(light, 'flare')) normalized.flare = number(light.flare, 0, 1, `${path}.flare`);
      if (Object.hasOwn(light, 'lens')) normalized.lens = lensSettings(light.lens, `${path}.lens`);
      if (Object.hasOwn(light, 'effect')) {
        keys(light.effect, ['shape', 'radius', 'length', 'strength'], `${path}.effect`);
        normalized.effect = {
          shape: member(light.effect.shape, ['none', 'ball', 'beam'], `${path}.effect.shape`),
          radius: number(light.effect.radius, .005, 1, `${path}.effect.radius`),
          length: number(light.effect.length, .05, 10, `${path}.effect.length`),
          strength: number(light.effect.strength, 0, 1, `${path}.effect.strength`),
        };
      }
      return normalized;
    }),
  };
}
function backdropImage(value) {
  if (value === null) return null;
  keys(value, ['dataUrl', 'name'], 'stage.design.backdrop.image');
  const dataUrl = text(value.dataUrl, 400000, 'stage.design.backdrop.image.dataUrl');
  const prefix = /^data:image\/(png|jpeg|webp);base64,/.exec(dataUrl);
  const encoded = prefix ? dataUrl.slice(prefix[0].length) : '';
  requireValue(prefix && encoded.length > 0 && encoded.length % 4 === 0 && /^[A-Za-z0-9+/]+={0,2}$/.test(encoded), 'backdrop image must be a base64 PNG, JPEG or WebP data URL');
  // This is a bounded serialized raster input, not a decoded-image guarantee.
  // Browser import resizes local images; rendering must handle decode failure.
  return { dataUrl, name: text(value.name, 100, 'stage.design.backdrop.image.name') };
}
function stageDesign(value, used) {
  keys(value, ['backdrop', 'floor', 'objects', 'floorplan'], 'stage.design');
  keys(value.backdrop, ['type', 'color', 'image', 'fit'], 'stage.design.backdrop');
  keys(value.floor, ['enabled', 'color', 'size', 'height'], 'stage.design.floor');
  requireValue(Array.isArray(value.objects) && value.objects.length <= 32, 'stage.design.objects supports at most 32 objects');
  let floorplan;
  if (Object.hasOwn(value, 'floorplan')) {
    try { floorplan = validatePlan(value.floorplan); compilePlan(floorplan); }
    catch (error) { throw new DirectorError(`stage.design.floorplan: ${error.message}`); }
  }
  return {
    ...(floorplan ? { floorplan } : {}),
    backdrop: {
      type: member(value.backdrop.type, ['color', 'image'], 'stage.design.backdrop.type'),
      color: color(value.backdrop.color, 'stage.design.backdrop.color'), image: backdropImage(value.backdrop.image),
      fit: member(value.backdrop.fit, ['cover', 'contain'], 'stage.design.backdrop.fit'),
    },
    floor: {
      enabled: boolean(value.floor.enabled, 'stage.design.floor.enabled'), color: color(value.floor.color, 'stage.design.floor.color'),
      size: number(value.floor.size, 1, 200, 'stage.design.floor.size'), height: number(value.floor.height, -10, 10, 'stage.design.floor.height'),
    },
    objects: value.objects.map((item, i) => {
      const path = `stage.design.objects[${i}]`;
      keys(item, ['id', 'name', 'type', 'color', 'position', 'rotation', 'scale'], path);
      return {
        id: sceneId(item.id, used, `${path}.id`), name: text(item.name, 60, `${path}.name`),
        type: member(item.type, ['box', 'sphere', 'plane'], `${path}.type`), color: color(item.color, `${path}.color`),
        position: vector(item.position, 3, -100, 100, `${path}.position`), rotation: vector(item.rotation, 3, -100, 100, `${path}.rotation`),
        scale: vector(item.scale, 3, .01, 100, `${path}.scale`),
      };
    }),
  };
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
  const isV2 = input?.schema === TAKE_SCHEMA_V2;
  keys(input, ['schema', 'asset', 'name', 'notes', 'look', 'fps', 'frame', 'range', 'stage', 'camera', 'pose', 'keyframes', ...(isV2 ? ['animation', 'output', 'tripGlow', 'tripFlare', 'tripTemperature', 'tripBodyTemperature', 'tripLightColor', 'tripLens', 'outline', 'lighting'] : [])], 'take');
  requireValue(input.schema === TAKE_SCHEMA || isV2, 'unsupported take schema');
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
  keys(input.stage, ['background', ...(isV2 ? ['design'] : [])], 'stage');
  keys(input.camera, ['mode', 'position', 'target', 'fov', 'orthoSize'], 'camera');
  // Plan extents, narrow output frames and small FOVs can require a distant
  // camera. Keep the legacy bounds for takes without a floor plan.
  const hasFloorplan = isV2 && Object.hasOwn(input.stage.design || {}, 'floorplan');
  const cameraLimit = hasFloorplan ? 1e9 : 1000;
  const cameraPosition = vector(input.camera.position, 3, -cameraLimit, cameraLimit, 'camera.position');
  const cameraTarget = vector(input.camera.target, 3, -cameraLimit, cameraLimit, 'camera.target');
  requireValue(Math.hypot(...cameraPosition.map((x, i) => x - cameraTarget[i])) > .001, 'camera position and target must differ');
  requireValue(Array.isArray(input.keyframes) && input.keyframes.length <= 600, 'at most 600 keyframes are supported');
  let lastFrame = start - 1;
  const keyframes = input.keyframes.map((keyframe, index) => {
    keys(keyframe, ['frame', 'pose', ...(isV2 ? ['transition'] : [])], `keyframes[${index}]`);
    const frame = number(keyframe.frame, start, end, `keyframes[${index}].frame`, true);
    requireValue(frame > lastFrame, 'keyframes must have distinct increasing frames');
    lastFrame = frame;
    const key = { frame, pose: pose(keyframe.pose, `keyframes[${index}].pose`) };
    // A key override governs the interval starting at this key. Omission is
    // retained so changing the take default still affects inherited intervals.
    if (isV2 && Object.hasOwn(keyframe, 'transition')) key.transition = member(keyframe.transition, TRANSITIONS, `keyframes[${index}].transition`);
    return key;
  });
  const take = {
    schema: input.schema,
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
      orthoSize: number(input.camera.orthoSize, .01, hasFloorplan ? 1e8 : 1000, 'camera.orthoSize'),
    },
    pose: pose(input.pose, 'pose'), keyframes,
  };
  // Keep the v1 object shape and ordering unchanged: existing immutable takes
  // retain their hashes and stepped playback, without injected v2 defaults.
  if (isV2) {
    keys(input.animation, ['transition', 'loop'], 'animation');
    requireValue(typeof input.animation.loop === 'boolean', 'animation.loop must be a boolean');
    keys(input.output, ['width', 'height'], 'output');
    const width = number(input.output.width, 64, 4096, 'output.width', true);
    const height = number(input.output.height, 64, 4096, 'output.height', true);
    requireValue(width * height <= 4096 * 2160, 'output pixel area is outside its supported range');
    take.animation = { transition: member(input.animation.transition, TRANSITIONS, 'animation.transition'), loop: input.animation.loop };
    take.output = { width, height };
    // Global Trip appearance, not an animated pose channel. Missing means zero
    // at display time; retain omission here to preserve existing take hashes.
    if (Object.hasOwn(input, 'tripGlow')) take.tripGlow = number(input.tripGlow, 0, 1, 'tripGlow');
    // Optional head flare is independent of body glow and defaults off in the UI.
    if (Object.hasOwn(input, 'tripFlare')) take.tripFlare = number(input.tripFlare, 0, 1, 'tripFlare');
    // Kelvin for Trip's global light treatment. UI defaults stay out of older
    // serialized takes, just as for glow and the other optional controls.
    if (Object.hasOwn(input, 'tripTemperature')) take.tripTemperature = number(input.tripTemperature, 1800, 10000, 'tripTemperature');
    // Missing body temperature links to the external light temperature at render time.
    if (Object.hasOwn(input, 'tripBodyTemperature')) take.tripBodyTemperature = number(input.tripBodyTemperature, 1800, 10000, 'tripBodyTemperature');
    if (Object.hasOwn(input, 'tripLightColor')) take.tripLightColor = lightColor(input.tripLightColor);
    if (Object.hasOwn(input, 'tripLens')) take.tripLens = lensSettings(input.tripLens, 'tripLens');
    // Global browser outline for either character. Width is in world units;
    // appearance rendering in other receivers is a separate capability.
    if (Object.hasOwn(input, 'outline')) {
      keys(input.outline, ['enabled', 'tone', 'width'], 'outline');
      requireValue(typeof input.outline.enabled === 'boolean', 'outline.enabled must be a boolean');
      take.outline = {
        enabled: input.outline.enabled,
        tone: number(input.outline.tone, 0, 1, 'outline.tone'),
        width: number(input.outline.width, .0005, .01, 'outline.width'),
      };
    }
    const sceneIds = new Set([...boneNames, '__proto__', 'constructor', 'prototype']);
    if (Object.hasOwn(input, 'lighting')) take.lighting = lighting(input.lighting, sceneIds);
    if (Object.hasOwn(input.stage, 'design')) take.stage.design = stageDesign(input.stage.design, sceneIds);
  }
  requireValue(new TextEncoder().encode(JSON.stringify(take)).length <= MAX_BODY_BYTES - 1024, 'take is too large');
  return take;
}
