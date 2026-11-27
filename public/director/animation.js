/* Nest Director animation math. Classic-script safe; no DOM or Babylon dependency.
 * Browser: window.DirectorAnimation. Node: import this file, then read globalThis.DirectorAnimation.
 *
 * samplePose(keys, frame, defaultTransition = 'hold') -> cloned pose, or null for no keys.
 * Keys must have distinct, increasing finite frames. Exact keys and clamped endpoints
 * are returned unchanged; the starting key controls the outgoing segment. V1 callers
 * retain hold timing. V2 callers explicitly pass their default, normally 'ease-in-out'.
 *
 * ease(t, transition = 'linear') -> eased t, clamped to [0,1].
 * retimeKeyframes(keys, start, oldEnd, newEnd) -> {ok:true,keyframes} or
 * {ok:false,error,code,collision?}. Frames are affine-scaled about start and rounded;
 * a collision never merges or drops a key. No API mutates its arguments.
 * An empty or single-frame original range keeps its existing start key in place.
 */
(() => {
  'use strict';
  const transitions = Object.freeze(['hold', 'linear', 'ease-in', 'ease-out', 'ease-in-out']);
  const clone = value => structuredClone(value);
  function finite(value, name) {
    if (typeof value !== 'number' || !Number.isFinite(value)) throw new TypeError(`${name} must be finite.`);
    return value;
  }
  function transitionName(value) {
    if (!transitions.includes(value)) throw new RangeError(`Unsupported transition: ${String(value)}.`);
    return value;
  }
  function ease(t, transition = 'linear') {
    t = Math.max(0, Math.min(1, finite(t, 'Interpolation time')));
    transitionName(transition);
    if (transition === 'hold') return t === 1 ? 1 : 0;
    if (transition === 'ease-in') return t * t * t;
    if (transition === 'ease-out') return 1 - (1 - t) ** 3;
    if (transition === 'ease-in-out') return t < .5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
    return t;
  }
  function validateKeys(keys) {
    if (!Array.isArray(keys)) throw new TypeError('Keyframes must be an array.');
    let previous = -Infinity;
    for (const key of keys) {
      if (!key || typeof key !== 'object' || !key.pose || typeof key.pose !== 'object') throw new TypeError('Every key needs a pose.');
      finite(key.frame, 'Keyframe');
      if (key.frame <= previous) throw new RangeError('Keyframes must have distinct increasing frames.');
      previous = key.frame;
      if (key.transition != null) transitionName(key.transition);
    }
  }
  function vector(value, size, name) {
    if (!Array.isArray(value) || value.length !== size) throw new TypeError(`${name} must have ${size} components.`);
    value.forEach(component => finite(component, name));
    return value;
  }
  function normalizeQuaternion(value) {
    vector(value, 4, 'Quaternion');
    const length = Math.hypot(...value);
    if (!(length > 0) || !Number.isFinite(length)) throw new RangeError('A quaternion must have a finite nonzero length.');
    return value.map(component => component / length);
  }
  function slerp(a, b, t) {
    a = normalizeQuaternion(a); b = normalizeQuaternion(b);
    let dot = a.reduce((sum, value, index) => sum + value * b[index], 0);
    if (dot < 0) { b = b.map(value => -value); dot = -dot; }
    dot = Math.max(-1, Math.min(1, dot));
    if (dot > .9995) return normalizeQuaternion(a.map((value, index) => value + (b[index] - value) * t));
    const angle = Math.acos(dot), denominator = Math.sin(angle);
    const fromWeight = Math.sin((1 - t) * angle) / denominator, toWeight = Math.sin(t * angle) / denominator;
    return normalizeQuaternion(a.map((value, index) => fromWeight * value + toWeight * b[index]));
  }
  function sameNames(a, b, name) {
    if (!a || !b || typeof a !== 'object' || typeof b !== 'object' || Array.isArray(a) || Array.isArray(b)) throw new TypeError(`${name} must be maps.`);
    const names = Object.keys(a);
    if (names.length !== Object.keys(b).length || names.some(key => !Object.hasOwn(b, key))) throw new RangeError(`The two poses have different ${name}.`);
    return names;
  }
  function lerpVector(a, b, t, name) {
    vector(a, 3, name); vector(b, 3, name);
    return a.map((value, index) => value + (b[index] - value) * t);
  }
  function interpolatePose(a, b, t) {
    const bones = Object.fromEntries(sameNames(a.bones, b.bones, 'bones').map(name => {
      const from = a.bones[name], to = b.bones[name];
      return [name, { position: lerpVector(from.position, to.position, t, 'Position'),
        rotation: slerp(from.rotation, to.rotation, t), scale: lerpVector(from.scale, to.scale, t, 'Scale') }];
    }));
    const morphs = Object.fromEntries(sameNames(a.morphs, b.morphs, 'morphs').map(name => {
      const from = finite(a.morphs[name], 'Morph'), to = finite(b.morphs[name], 'Morph');
      return [name, from + (to - from) * t];
    }));
    return { bones, morphs };
  }
  function samplePose(keys, frame, defaultTransition = 'hold') {
    finite(frame, 'Sample frame'); transitionName(defaultTransition); validateKeys(keys);
    if (!keys.length) return null;
    if (frame <= keys[0].frame) return clone(keys[0].pose);
    if (frame >= keys[keys.length - 1].frame) return clone(keys[keys.length - 1].pose);
    let right = 1;
    while (keys[right].frame < frame) right++;
    if (keys[right].frame === frame) return clone(keys[right].pose);
    const from = keys[right - 1], to = keys[right];
    const transition = from.transition || defaultTransition;
    if (transition === 'hold') return clone(from.pose);
    return interpolatePose(from.pose, to.pose, ease((frame - from.frame) / (to.frame - from.frame), transition));
  }
  function retimeKeyframes(keys, start, oldEnd, newEnd) {
    try {
      validateKeys(keys);
      if (![start, oldEnd, newEnd].every(value => Number.isSafeInteger(value) && value >= 1) || oldEnd < start || newEnd < start) {
        return { ok: false, code: 'invalid-range', error: 'Frame ranges need positive integers with end at or after start.' };
      }
      if (keys.some(key => !Number.isSafeInteger(key.frame) || key.frame < start || key.frame > oldEnd)) {
        return { ok: false, code: 'key-outside-range', error: 'Every key must be an integer frame inside the original range.' };
      }
      const mapped = [];
      for (const key of keys) {
        const frame = key.frame === start ? start : key.frame === oldEnd ? newEnd
          : Math.round(start + ((key.frame - start) / (oldEnd - start)) * (newEnd - start));
        const previous = mapped[mapped.length - 1];
        if (previous && frame === previous.frame) {
          const sourceFrames = [keys[mapped.length - 1].frame, key.frame];
          return { ok: false, code: 'frame-collision', error: `Frames ${sourceFrames[0]} and ${sourceFrames[1]} both round to frame ${frame}. Use a longer duration.`, collision: { frame, sourceFrames } };
        }
        mapped.push({ ...clone(key), frame });
      }
      return { ok: true, keyframes: mapped };
    } catch (error) {
      return { ok: false, code: 'invalid-keyframes', error: error.message };
    }
  }
  globalThis.DirectorAnimation = Object.freeze({ samplePose, ease, retimeKeyframes, transitions });
})();
