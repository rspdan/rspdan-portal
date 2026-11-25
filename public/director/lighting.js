/* Editable shot lights. Proxy transforms are the saved source of truth.
 * Every aimed light points along its proxy's local -Z axis. The proxy is the
 * object attached to Director's existing move/rotate gizmos and hold-drag.
 */
(() => {
  'use strict';
  const B = globalThis.BABYLON;
  const clone = value => structuredClone(value);
  const clamp = (value, low, high) => Number.isFinite(Number(value)) ? Math.min(high, Math.max(low, Number(value))) : low;
  const color = value => typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value) ? value.toLowerCase() : '#ffffff';
  const attachments = ['world', 'head', 'hand.L', 'hand.R'];
  const effectDefault = { shape: 'none', radius: .06, length: 1, strength: .5 };
  function effectState(value = {}) {
    return { shape: ['none', 'ball', 'beam'].includes(value.shape) ? value.shape : 'none',
      radius: clamp(value.radius ?? .06, .005, 1), length: clamp(value.length ?? 1, .05, 10), strength: clamp(value.strength ?? .5, 0, 1) };
  }
  function lensState(value) {
    const preset = ['glow', 'starburst', 'anamorphic', 'glass'].includes(value.preset) ? value.preset : 'glow';
    return { preset, glow: clamp(value.glow, 0, 1), rays: clamp(value.rays, 0, 1),
      streak: clamp(value.streak, 0, 1), ghosts: clamp(value.ghosts, 0, 1),
      spread: clamp(value.spread, .25, 2), rotation: clamp(value.rotation, -180, 180),
      rayCount: Math.round(clamp(value.rayCount, 4, 16)) };
  }
  function rotationFor(direction) {
    const v = B.Vector3.FromArray(direction).normalize();
    return [Math.asin(v.y), Math.atan2(-v.x, -v.z), 0];
  }
  function defaults() {
    return {
      ambient: { intensity: .65, color: '#ffffff' },
      lights: [
        { id: 'light-key', name: 'Key light', type: 'directional', enabled: true, color: '#ffffff', intensity: 2.3, position: [-3, 4, 3], rotation: rotationFor([.75, -1, -.7]), angle: Math.PI / 3, range: 20 },
        { id: 'light-rim', name: 'Rim light', type: 'directional', enabled: true, color: '#ffffff', intensity: 2, position: [3, 1.2, -4], rotation: rotationFor([-.6, -.2, 1]), angle: Math.PI / 3, range: 20 },
      ],
    };
  }
  function create(scene) {
    if (!B || !scene) throw new Error('The light editor needs a Babylon scene.');
    const entries = new Map(), anchors = new Map();
    const fill = new B.HemisphericLight('Director ambient fill', new B.Vector3(0, 1, 0), scene);
    fill.groundColor = new B.Color3(.55, .58, .54);
    fill.metadata = { directorLight: true, directorAmbient: true };
    let ambient = { intensity: .65, color: '#ffffff' };
    let editing = false, selected = null, shadow = null, shadowOwner = null, disposed = false;
    let casterSignature = '', appliedAmbientColor = null;

    function anchorFor(id) {
      if (!id || id === 'world') return null;
      if (anchors.has(id)) return anchors.get(id);
      const parent = scene.getTransformNodeByName(id === 'head' ? 'head' : 'lower_arm.' + id.slice(-1));
      if (!parent) throw new Error('This character has no ' + id + ' light attachment.');
      const anchor = new B.TransformNode('Director light attachment ' + id, scene);
      anchor.metadata = { directorLightAttachment: id };
      anchor.parent = parent;
      if (id === 'head') {
        // Match the optical flare's head center, rather than the neck pivot.
        // Read the existing skin binding; no geometry or bones are changed.
        let min = new B.Vector3(Infinity, Infinity, Infinity), max = new B.Vector3(-Infinity, -Infinity, -Infinity), found = false;
        for (const mesh of scene.meshes.filter(m => m.metadata?.directorCharacter && m.skeleton)) {
          const bone = mesh.skeleton.bones.find(b => b.getTransformNode() === parent);
          if (!bone) continue;
          const positions = mesh.getVerticesData(B.VertexBuffer.PositionKind), indices = mesh.getVerticesData(B.VertexBuffer.MatricesIndicesKind), weights = mesh.getVerticesData(B.VertexBuffer.MatricesWeightsKind);
          if (!positions || !indices || !weights) continue;
          const boneIndex = bone.getIndex(), inverse = bone.getInvertedAbsoluteTransform();
          for (let i = 0; i < positions.length / 3; i++) for (let j = 0; j < 4; j++) {
            if (indices[i * 4 + j] !== boneIndex || weights[i * 4 + j] <= .75) continue;
            const p = B.Vector3.TransformCoordinates(B.Vector3.FromArray(positions, i * 3), inverse);
            min = B.Vector3.Minimize(min, p); max = B.Vector3.Maximize(max, p); found = true; break;
          }
        }
        if (found) anchor.position.copyFrom(B.Vector3.Center(min, max));
      } else {
        anchor.position.y = id === 'hand.L' ? .2222248911857605 : .22601574659347534;
        // Light local -Z points out of the mitten along the forearm's +Y.
        anchor.rotation.x = Math.PI / 2;
      }
      anchors.set(id, anchor);
      return anchor;
    }
    function destroyEffect(entry) {
      if (!entry.effect) return;
      entry.effect.core.dispose(); entry.effect.fringe.dispose();
      entry.effect.material.dispose(); entry.effect.fringeMaterial.dispose(); entry.effect = null;
    }
    function createEffect(entry, shape) {
      const stem = 'Director light effect ' + entry.state.id;
      const core = shape === 'ball' ? B.MeshBuilder.CreateSphere(stem, { diameter: 2, segments: 24 }, scene) : B.MeshBuilder.CreateCylinder(stem, { height: 1, diameterTop: 2, diameterBottom: .35, tessellation: 24, cap: B.Mesh.CAP_ALL }, scene);
      const fringe = core.clone(stem + ' fringe');
      // Bounded geometry is intentional: this is a stylized visible ball/beam,
      // not a volume simulation or a fog layer over the image.
      for (const mesh of [core, fringe]) {
        mesh.parent = entry.node; mesh.isPickable = false; mesh.receiveShadows = false;
        mesh.metadata = { directorLightEffect: true, directorLightId: entry.state.id };
      }
      const material = new B.StandardMaterial(stem + ' material', scene);
      material.disableLighting = true; material.specularColor = B.Color3.Black();
      material.emissiveFresnelParameters = new B.FresnelParameters();
      material.emissiveFresnelParameters.bias = 0; material.emissiveFresnelParameters.power = 2;
      core.material = material; core.renderOutline = shape === 'ball';
      core.outlineColor = new B.Color3(.055, .055, .055);
      const fringeMaterial = new B.StandardMaterial(stem + ' short fringe', scene);
      fringeMaterial.disableLighting = true; fringeMaterial.backFaceCulling = false;
      fringeMaterial.alphaMode = B.Constants.ALPHA_ADD; fringeMaterial.disableDepthWrite = true;
      fringeMaterial.opacityFresnelParameters = new B.FresnelParameters();
      fringeMaterial.opacityFresnelParameters.leftColor = B.Color3.White();
      fringeMaterial.opacityFresnelParameters.rightColor = B.Color3.Black();
      fringeMaterial.opacityFresnelParameters.power = 5;
      fringe.material = fringeMaterial;
      entry.effect = { core, fringe, material, fringeMaterial, shape };
    }
    function applyEffect(entry) {
      const s = entry.state, e = effectState(s.effect || effectDefault);
      if (entry.effect?.shape !== e.shape) destroyEffect(entry);
      if (e.shape === 'none') return;
      if (!entry.effect) createEffect(entry, e.shape);
      const { core, fringe, material, fringeMaterial } = entry.effect;
      const tint = B.Color3.FromHexString(s.color);
      const active = s.enabled && e.strength > 0;
      core.setEnabled(active); fringe.setEnabled(active);
      // Outline offset is in the unit sphere's local space; radius already
      // scales the mesh. Applying radius twice makes the contour subpixel and
      // lets the expanded shell fight the visible surface in the depth buffer.
      core.outlineWidth = .025;
      if (e.shape === 'ball') {
        core.scaling.setAll(e.radius); fringe.scaling.setAll(e.radius * 1.075);
        core.position.setAll(0); fringe.position.setAll(0);
        core.rotation.setAll(0); fringe.rotation.setAll(0);
      } else {
        core.scaling.set(e.radius, e.length, e.radius);
        fringe.scaling.set(e.radius * 1.06, e.length, e.radius * 1.06);
        core.position.set(0, 0, -e.length / 2); fringe.position.copyFrom(core.position);
        core.rotation.x = fringe.rotation.x = -Math.PI / 2;
      }
      // Babylon's Fresnel term is abs(dot(view, normal))^power: right is the
      // face-on center, left is the grazing edge. Keep the center near white
      // while strength changes the fringe, rather than graying the whole ball.
      const coreBrightness = .9 + .1 * e.strength;
      material.emissiveColor.set(coreBrightness, coreBrightness, coreBrightness);
      material.emissiveFresnelParameters.leftColor.copyFrom(tint.scale(.65));
      material.emissiveFresnelParameters.rightColor.copyFrom(B.Color3.White());
      material.alpha = e.shape === 'ball' ? 1 : .15 + .55 * e.strength;
      fringeMaterial.emissiveColor.copyFrom(tint.scale(e.strength));
      fringeMaterial.alpha = .14 * e.strength;
    }

    function destroy(entry) {
      if (shadowOwner === entry.state.id) { shadow?.dispose(); shadow = null; shadowOwner = null; casterSignature = ''; }
      entry.optics?.dispose(); entry.optics = null;
      destroyEffect(entry);
      entry.handle.dispose(); entry.aim.dispose(); entry.material.dispose(); entry.light.dispose(); entry.node.dispose();
    }
    function make(state) {
      const node = new B.TransformNode('Director light ' + state.id, scene);
      node.metadata = { directorLightId: state.id };
      let light;
      if (state.type === 'point') light = new B.PointLight(state.name, B.Vector3.Zero(), scene);
      else if (state.type === 'spot') light = new B.SpotLight(state.name, B.Vector3.Zero(), new B.Vector3(0, 0, -1), state.angle, 2, scene);
      else light = new B.DirectionalLight(state.name, new B.Vector3(0, 0, -1), scene);
      light.parent = node;
      light.position = B.Vector3.Zero();
      light.metadata = { directorLight: true, directorLightId: state.id };
      light.shadowMinZ = .05; light.shadowMaxZ = 100;
      if (state.type === 'directional') {
        // Derive the shadow extent from actual casters as the set grows.
        light.shadowFrustumSize = 0; light.shadowOrthoScale = .15;
        light.autoUpdateExtends = true; light.autoCalcShadowZBounds = true;
      }
      const material = new B.StandardMaterial('Light marker ' + state.id, scene);
      material.disableLighting = true;
      const handle = B.MeshBuilder.CreateSphere('Light handle ' + state.id, { diameter: .07, segments: 12 }, scene);
      handle.parent = node; handle.material = material;
      handle.metadata = { joint: state.id, directorLightId: state.id, directorEditorHelper: true };
      handle.renderingGroupId = 2; handle.isPickable = true;
      // Keep the marker's fill faithful to its light color, while its boundary
      // remains visible on both pale and dark sets. This is editor ink only.
      handle.renderOutline = true;
      handle.outlineColor = B.Color3.FromHexString('#26322b');
      handle.outlineWidth = .0045;
      const points = [B.Vector3.Zero(), new B.Vector3(0, 0, -.35), new B.Vector3(-.055, 0, -.27), new B.Vector3(0, 0, -.35), new B.Vector3(.055, 0, -.27)];
      const aim = B.MeshBuilder.CreateLines('Light aim ' + state.id, { points }, scene);
      aim.parent = node; aim.renderingGroupId = 2; aim.isPickable = false;
      aim.metadata = { directorEditorHelper: true };
      const entry = { state: clone(state), node, light, material, handle, aim, effect: null, optics: null };
      entries.set(state.id, entry);
      return entry;
    }
    function apply(entry, value) {
      entry.state = clone(value);
      entry.node.parent = anchorFor(value.attachment || 'world');
      entry.node.position.copyFromFloats(...value.position);
      entry.node.rotationQuaternion = null;
      entry.node.rotation.copyFromFloats(...value.rotation);
      entry.node.scaling.setAll(1);
      applyProperties(entry);
    }
    function applyProperties(entry) {
      const s = entry.state;
      entry.light.name = s.name;
      entry.light.diffuse = B.Color3.FromHexString(s.color);
      entry.light.specular.copyFrom(entry.light.diffuse);
      entry.light.intensity = s.intensity;
      entry.light.range = s.range;
      if (s.type === 'spot') entry.light.angle = s.angle;
      entry.light.setEnabled(s.enabled);
      const markerColor = s.enabled ? entry.light.diffuse : new B.Color3(.4, .4, .4);
      entry.material.emissiveColor = markerColor;
      entry.handle.setEnabled(editing);
      entry.aim.setEnabled(editing && s.type !== 'point');
      applyEffect(entry);
      const flare = clamp(s.flare ?? 0, 0, 1);
      if (flare > 0 && !entry.optics) {
        if (!globalThis.DirectorOptics) throw new Error('Optical effects did not load. Reload to try again.');
        entry.optics = globalThis.DirectorOptics.create(scene, entry.node, { name: 'Director light optics ' + s.id });
      }
      entry.optics?.apply({ strength: s.enabled ? flare : 0, color: entry.light.diffuse.asArray(),
        sourceRadius: s.effect?.shape === 'ball' ? s.effect.radius : .025, lens: s.lens });
      updateHelper(entry);
    }
    function updateHelper(entry) {
      if (!editing) return;
      const camera = scene.activeCamera, canvas = scene.getEngine().getRenderingCanvas();
      if (!camera || !canvas) return;
      const height = canvas.clientHeight * camera.viewport.height;
      const width = canvas.clientWidth * camera.viewport.width;
      if (!height || !width) return;
      entry.node.computeWorldMatrix(true);
      let worldPerPixel;
      if (camera.mode === B.Camera.ORTHOGRAPHIC_CAMERA) {
        worldPerPixel = Math.abs(camera.orthoTop - camera.orthoBottom) / height;
      } else {
        const p = entry.node.getAbsolutePosition(), m = camera.getViewMatrix().m;
        const depth = Math.abs(p.x * m[2] + p.y * m[6] + p.z * m[10] + m[14]);
        const pixels = camera.fovMode === B.Camera.FOVMODE_HORIZONTAL_FIXED ? width : height;
        worldPerPixel = 2 * depth * Math.tan(camera.fov / 2) / pixels;
      }
      if (!Number.isFinite(worldPerPixel) || worldPerPixel <= 0) return;
      // Scale only the child editor meshes: the actual light/proxy transform,
      // saved shot, and hold-drag target never move or grow with the camera.
      entry.handle.scaling.setAll(Math.max(1, 8 * worldPerPixel / .07) * (selected === entry.state.id ? 1.4 : 1));
      entry.aim.scaling.setAll(Math.max(1, 20 * worldPerPixel / .35));
      const backdrop = scene.clearColor;
      const luminance = .2126 * backdrop.r + .7152 * backdrop.g + .0722 * backdrop.b;
      const ink = luminance > .4 ? .24 : .76;
      entry.aim.color.set(ink, ink, ink);
    }
    function snapshot() {
      return {
        ambient: clone(ambient),
        lights: [...entries.values()].map(({ state, node }) => ({
          ...clone(state),
          position: node.position.asArray(),
          rotation: (node.rotationQuaternion ? node.rotationQuaternion.toEulerAngles() : node.rotation).asArray(),
        })),
      };
    }
    function restore(value) {
      const next = clone(value || defaults());
      if (!Array.isArray(next.lights) || next.lights.length > 8) throw new Error('A shot supports up to eight lights.');
      const ids = new Set(next.lights.map(light => light.id));
      for (const [id, entry] of entries) if (!ids.has(id)) { destroy(entry); entries.delete(id); }
      ambient = clone(next.ambient);
      for (const state of next.lights) {
        let entry = entries.get(state.id);
        if (entry && entry.state.type !== state.type) { destroy(entry); entries.delete(state.id); entry = null; }
        apply(entry || make(state), state);
      }
      if (!entries.has(selected)) selected = entries.keys().next().value || null;
      // Preserve serialized order: it also determines the single shadow light.
      const ordered = next.lights.map(state => [state.id, entries.get(state.id)]);
      entries.clear(); ordered.forEach(([id, entry]) => entries.set(id, entry));
      for (const entry of entries.values()) applyProperties(entry);
      sync();
    }
    function sync() {
      if (disposed) return;
      fill.intensity = ambient.intensity;
      if (ambient.color !== appliedAmbientColor) {
        fill.diffuse = B.Color3.FromHexString(ambient.color);
        fill.specular.copyFrom(fill.diffuse); appliedAmbientColor = ambient.color;
      }
      for (const entry of entries.values()) {
        entry.node.computeWorldMatrix(true);
        // Babylon transforms the child light's local position and -Z direction
        // through its proxy, including rotations made by a quaternion gizmo.
        updateHelper(entry);
      }
      // Eight editable lights, ambient fill, and one optional derived light
      // emitted by Trip's appearance controller must all reach the material.
      for (const material of scene.materials) if ('maxSimultaneousLights' in material && material.maxSimultaneousLights < 10) material.maxSimultaneousLights = 10;
      const owner = [...entries.values()].find(entry => entry.state.enabled && entry.state.intensity > 0 && entry.state.type !== 'point');
      if ((owner?.state.id || null) !== shadowOwner) {
        shadow?.dispose(); shadow = null; shadowOwner = owner?.state.id || null; casterSignature = '';
        if (owner) {
          shadow = new B.ShadowGenerator(1024, owner.light);
          shadow.usePercentageCloserFiltering = true;
          shadow.filteringQuality = B.ShadowGenerator.QUALITY_HIGH;
          shadow.setDarkness(.25); shadow.bias = .001;
        }
      }
      if (shadow) {
        const casters = scene.meshes.filter(mesh => !mesh.isDisposed() && mesh.getTotalVertices() && !mesh.metadata?.directorEditorHelper && (mesh.metadata?.directorCharacter || mesh.metadata?.directorStageId));
        const signature = casters.map(mesh => mesh.uniqueId).join(',');
        if (signature !== casterSignature) {
          shadow.getShadowMap().renderList = casters;
          casterSignature = signature;
        }
      }
    }
    function updateAmbient(patch) {
      if ('intensity' in patch) ambient.intensity = clamp(patch.intensity, 0, 3);
      if ('color' in patch) ambient.color = color(patch.color);
      sync();
    }
    function update(id, patch) {
      const entry = entries.get(id); if (!entry) return false;
      const state = snapshot().lights.find(light => light.id === id);
      if ('name' in patch) state.name = String(patch.name).slice(0, 60);
      if ('enabled' in patch) state.enabled = Boolean(patch.enabled);
      if ('color' in patch) state.color = color(patch.color);
      if ('intensity' in patch) state.intensity = clamp(patch.intensity, 0, 20);
      if ('angle' in patch) state.angle = clamp(patch.angle, .1, 3.14);
      if ('range' in patch) state.range = clamp(patch.range, .1, 100);
      if ('flare' in patch) state.flare = clamp(patch.flare, 0, 1);
      if ('lens' in patch) {
        const base = state.lens || globalThis.DirectorOptics?.defaults?.('glow') ||
          { preset: 'glow', glow: 1, rays: 0, streak: 0, ghosts: 0, spread: 1, rotation: 0, rayCount: 8 };
        state.lens = lensState({ ...base, ...patch.lens });
      }
      if ('attachment' in patch && attachments.includes(patch.attachment)) {
        const changed = (state.attachment || 'world') !== patch.attachment;
        if (changed && patch.attachment === 'world') {
          const scale = new B.Vector3(), rotation = new B.Quaternion(), position = new B.Vector3();
          entry.node.computeWorldMatrix(true).decompose(scale, rotation, position);
          state.position = position.asArray(); state.rotation = rotation.toEulerAngles().asArray();
        } else if (changed) { anchorFor(patch.attachment); state.position = [0, 0, 0]; state.rotation = [0, 0, 0]; }
        state.attachment = patch.attachment;
      }
      if ('effect' in patch) state.effect = effectState({ ...(state.effect || effectDefault), ...patch.effect });
      for (const name of ['position', 'rotation']) if (name in patch) state[name] = patch[name].map(value => clamp(value, -100, 100));
      if ('type' in patch && ['point', 'spot', 'directional'].includes(patch.type)) state.type = patch.type;
      if (state.type !== entry.state.type) {
        const data = snapshot(); data.lights[data.lights.findIndex(light => light.id === id)] = state; restore(data);
      } else { apply(entry, state); sync(); }
      return true;
    }
    function add(type = 'spot', options = {}) {
      if (entries.size >= 8) throw new Error('This shot already has eight lights.');
      if (!['point', 'spot', 'directional'].includes(type)) throw new Error('Choose a point, spot or directional light.');
      const id = 'light-' + crypto.randomUUID();
      const state = { id, name: ({ point: 'Point', spot: 'Spot', directional: 'Directional' })[type] + ' light', type, enabled: true, color: '#ffffff', intensity: 1, position: [1, 1.5, 1], rotation: rotationFor([-1, -.9, -1]), angle: Math.PI / 3, range: 10 };
      selected = id; apply(make(state), state); update(id, options); sync(); return id;
    }
    function remove(id) {
      const entry = entries.get(id); if (!entry) return false;
      destroy(entry); entries.delete(id);
      if (selected === id) selected = entries.keys().next().value || null;
      sync(); return true;
    }
    function setEditing(value) { editing = Boolean(value); for (const entry of entries.values()) applyProperties(entry); }
    function select(id) { selected = entries.has(id) ? id : null; for (const entry of entries.values()) applyProperties(entry); return selected ? entries.get(selected).node : null; }
    const observer = scene.onBeforeRenderObservable.add(sync);
    restore(null);
    return Object.freeze({
      snapshot, restore, update, updateAmbient, add, remove, sync, setEditing, select,
      getSelected: () => selected,
      nodes: () => Object.fromEntries([...entries].map(([id, entry]) => [id, entry.node])),
      handles: () => [...entries.values()].map(entry => entry.handle),
      dispose() {
        if (disposed) return;
        disposed = true; scene.onBeforeRenderObservable.remove(observer);
        shadow?.dispose(); shadow = null; shadowOwner = null;
        for (const entry of entries.values()) destroy(entry);
        entries.clear(); for (const anchor of anchors.values()) anchor.dispose(); anchors.clear(); fill.dispose();
      },
    });
  }
  globalThis.DirectorLighting = Object.freeze({ create });
})();
