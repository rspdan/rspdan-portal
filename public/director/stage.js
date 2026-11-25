/* Director stage design. Classic script; Babylon is the only dependency.
 * create(scene, {floor, onBackdropStatus?}) returns a controller. snapshot()
 * reads live proxy transforms, so the shared gizmo/hold-drag tools need no
 * special persistence path. setDesign() merges backdrop/floor fields; image
 * and objects are replaced atomically. Backdrops are rendered into the canvas.
 */
(() => {
  'use strict';
  const TYPES = ['box', 'sphere', 'plane'];
  const MODES = ['white', 'green', 'transparent'];
  const clone = value => structuredClone(value);
  const own = (value, name) => Object.prototype.hasOwnProperty.call(value, name);
  const color = (value, label) => {
    if (typeof value !== 'string' || !/^#[0-9a-f]{6}$/i.test(value)) throw new TypeError(`${label} needs a six-digit color.`);
    return value;
  };
  const number = (value, min, max, label) => {
    if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) throw new RangeError(`${label} is outside its supported range.`);
    return value;
  };
  const vector = (value, min, max, label) => {
    if (!Array.isArray(value) || value.length !== 3) throw new TypeError(`${label} needs three components.`);
    return value.map(v => number(v, min, max, label));
  };
  function record(value, label) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError(`${label} must be an object.`);
    return value;
  }
  function text(value, max, label) {
    if (typeof value !== 'string' || value.length > max) throw new TypeError(`${label} is too long or missing.`);
    return value;
  }
  function validateObject(value) {
    record(value, 'Stage object');
    if (typeof value.id !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/.test(value.id)) throw new TypeError('Stage object needs a safe id.');
    if (!TYPES.includes(value.type)) throw new TypeError('Unsupported stage object.');
    return { id: value.id, name: text(value.name, 60, 'Object name'), type: value.type,
      color: color(value.color, 'Object color'), position: vector(value.position, -100, 100, 'Object position'),
      rotation: vector(value.rotation, -100, 100, 'Object rotation'), scale: vector(value.scale, .01, 100, 'Object scale') };
  }
  function validateDesign(value, validateFloorplan) {
    record(value, 'Stage design');
    const b = record(value.backdrop, 'Backdrop'), f = record(value.floor, 'Floor');
    if (!['color', 'image'].includes(b.type) || !['cover', 'contain'].includes(b.fit)) throw new TypeError('Unsupported backdrop or image fit.');
    let image = null;
    if (b.image !== null) {
      record(b.image, 'Backdrop image');
      const dataUrl = b.image.dataUrl;
      if (typeof dataUrl !== 'string' || dataUrl.length > 400000 || !/^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(dataUrl)) throw new TypeError('Use a bounded PNG, JPEG or WebP data image.');
      image = { dataUrl, name: text(b.image.name, 100, 'Image name') };
    }
    if (typeof f.enabled !== 'boolean') throw new TypeError('Floor enabled must be a boolean.');
    if (!Array.isArray(value.objects) || value.objects.length > 32) throw new RangeError('A stage supports up to 32 objects.');
    const objects = value.objects.map(validateObject);
    if (new Set(objects.map(o => o.id)).size !== objects.length) throw new TypeError('Stage object ids must be unique.');
    if (own(value, 'floorplan') && typeof validateFloorplan !== 'function') throw new TypeError('Floor-plan tools are unavailable.');
    return { backdrop: { type: b.type, color: color(b.color, 'Backdrop color'), image, fit: b.fit },
      floor: { enabled: f.enabled, color: color(f.color, 'Floor color'), size: number(f.size, 1, 200, 'Floor size'), height: number(f.height, -10, 10, 'Floor height') }, objects,
      ...(own(value, 'floorplan') ? { floorplan: validateFloorplan(value.floorplan) } : {}) };
  }

  function create(scene, options = {}) {
    const B = globalThis.BABYLON, floor = options.floor;
    if (!B || !scene || !floor) throw new Error('A Babylon scene and existing floor are required.');
    const engine = scene.getEngine(), entries = new Map();
    const original = { material: floor.material, position: floor.position.clone(), scaling: floor.scaling.clone(),
      enabled: floor.isEnabled(), receiveShadows: floor.receiveShadows, pickable: floor.isPickable, clear: scene.clearColor.clone() };
    const bounds = floor.getBoundingInfo().boundingBox;
    const baseX = Math.max(.001, bounds.maximum.x - bounds.minimum.x), baseZ = Math.max(.001, bounds.maximum.z - bounds.minimum.z);
    const originalFloorColor = original.material?.diffuseColor || original.material?.albedoColor || new B.Color3(.95, .955, .94);
    const defaults = { backdrop: { type: 'color', color: '#f3f4f0', image: null, fit: 'cover' },
      floor: { enabled: original.enabled, color: originalFloorColor.toHexString().toLowerCase(), size: Math.min(200, Math.max(1, baseX * original.scaling.x)), height: original.position.y }, objects: [] };
    let design = clone(defaults), order = [], selected = null, editing = false, mode = 'white', disposed = false, legacyFloor = true;
    let floorMaterial = null, layer = null, texture = null, textureUrl = null, imageEpoch = 0, lastRenderSize = '';
    let backdropStatus = { state: 'empty', error: null, width: 0, height: 0 };

    function status(value) {
      backdropStatus = value;
      // A UI callback must not turn an asynchronous image failure into an
      // unhandled renderer exception.
      try { options.onBackdropStatus?.({ ...value }); } catch {}
    }
    function layerVisibility() {
      if (layer) layer.isEnabled = mode === 'white' && design.backdrop.type === 'image' && backdropStatus.state === 'ready';
    }
    function fitImage() {
      if (!layer || !texture || backdropStatus.state !== 'ready') return;
      const width = engine.getRenderWidth(), height = engine.getRenderHeight();
      if (!(width > 0 && height > 0)) return;
      const viewAspect = width / height, imageAspect = backdropStatus.width / backdropStatus.height;
      let sx = 1, sy = 1, u = 1, v = 1;
      if (design.backdrop.fit === 'contain') {
        if (imageAspect > viewAspect) sy = viewAspect / imageAspect;
        else sx = imageAspect / viewAspect;
        // Layer's shader applies its scale to BOTH geometry and initial UVs.
        // Undo that UV scaling so contain shows the entire image, not a crop.
        u = 1 / sx; v = 1 / sy;
      } else if (imageAspect > viewAspect) u = viewAspect / imageAspect;
      else v = imageAspect / viewAspect;
      layer.scale.copyFromFloats(sx, sy); layer.offset.copyFromFloats(0, 0);
      texture.uScale = u; texture.vScale = v; texture.uOffset = (1 - u) / 2; texture.vOffset = (1 - v) / 2;
    }
    function clearTexture() {
      imageEpoch++;
      if (layer) { layer.texture = null; layer.isEnabled = false; }
      texture?.dispose(); texture = null; textureUrl = null;
    }
    function setImage() {
      const image = design.backdrop.image;
      if (!image) { clearTexture(); status({ state: 'empty', error: null, width: 0, height: 0 }); return; }
      if (textureUrl === image.dataUrl && texture) { fitImage(); layerVisibility(); return; }
      clearTexture(); textureUrl = image.dataUrl;
      const epoch = imageEpoch;
      if (!layer) layer = new B.Layer('Director stage backdrop', null, scene, true, new B.Color4(1, 1, 1, 1));
      layer.isEnabled = false;
      status({ state: 'loading', error: null, width: 0, height: 0 });
      const failed = () => {
        if (disposed || epoch !== imageEpoch) return;
        if (layer) { layer.texture = null; layer.isEnabled = false; }
        texture?.dispose(); texture = null;
        status({ state: 'error', error: 'The backdrop image could not be decoded. Choose another image.', width: 0, height: 0 });
      };
      try {
        texture = new B.Texture(image.dataUrl, scene, true, true, B.Texture.BILINEAR_SAMPLINGMODE, () => {
          if (disposed || epoch !== imageEpoch || !texture) return;
          const size = texture.getSize();
          if (!(size.width > 0 && size.height > 0)) { failed(); return; }
          status({ state: 'ready', error: null, width: size.width, height: size.height });
          fitImage(); layerVisibility();
        }, failed);
        texture.wrapU = B.Texture.CLAMP_ADDRESSMODE; texture.wrapV = B.Texture.CLAMP_ADDRESSMODE;
        layer.texture = texture;
      } catch { failed(); }
    }
    function syncShadows() {
      for (const light of scene.lights) {
        const shadow = light.getShadowGenerator?.(), map = shadow?.getShadowMap?.();
        if (!map) continue;
        for (const entry of entries.values()) if (!map.renderList?.includes(entry.mesh)) shadow.addShadowCaster(entry.mesh, false);
      }
    }
    function forgetCaster(mesh) {
      for (const light of scene.lights) light.getShadowGenerator?.()?.removeShadowCaster?.(mesh, false);
    }
    function objectMesh(type, id, parent, material) {
      const name = `Stage ${type} ${id}`;
      const mesh = type === 'box' ? B.MeshBuilder.CreateBox(name, { size: 1 }, scene)
        : type === 'sphere' ? B.MeshBuilder.CreateSphere(name, { diameter: 1, segments: 24 }, scene)
          : B.MeshBuilder.CreatePlane(name, { size: 1, sideOrientation: B.Mesh.DOUBLESIDE }, scene);
      mesh.parent = parent; mesh.material = material; mesh.receiveShadows = true; mesh.isPickable = editing;
      mesh.metadata = { directorStageId: id, directorStageObject: true };
      return mesh;
    }
    function createEntry(value) {
      const node = new B.TransformNode(`Stage control ${value.id}`, scene);
      node.metadata = { directorStageId: value.id };
      const material = new B.StandardMaterial(`Stage material ${value.id}`, scene);
      material.specularColor = new B.Color3(.06, .06, .06); material.specularPower = 48;
      const handle = B.MeshBuilder.CreateSphere(`Stage handle ${value.id}`, { diameter: .035, segments: 10 }, scene);
      handle.metadata = { joint: value.id, directorStageId: value.id, directorEditorHelper: true }; handle.renderingGroupId = 2;
      const handleMaterial = new B.StandardMaterial(`Stage handle material ${value.id}`, scene);
      handleMaterial.disableLighting = true; handle.material = handleMaterial;
      const entry = { node, material, handle, handleMaterial, mesh: objectMesh(value.type, value.id, node, material), value: clone(value) };
      entries.set(value.id, entry); return entry;
    }
    function deleteEntry(id) {
      const entry = entries.get(id); if (!entry) return;
      forgetCaster(entry.mesh); entry.mesh.dispose(); entry.handle.dispose(); entry.node.dispose();
      entry.material.dispose(); entry.handleMaterial.dispose(); entries.delete(id);
    }
    function applyObject(value) {
      const entry = entries.get(value.id) || createEntry(value);
      if (entry.value.type !== value.type) {
        forgetCaster(entry.mesh); entry.mesh.dispose(); entry.mesh = objectMesh(value.type, value.id, entry.node, entry.material);
      }
      entry.value = clone(value); entry.material.diffuseColor = B.Color3.FromHexString(value.color);
      entry.node.position.copyFromFloats(...value.position); entry.node.rotationQuaternion = null;
      entry.node.rotation.copyFromFloats(...value.rotation); entry.node.scaling.copyFromFloats(...value.scale);
    }
    function applyFloor() {
      if (legacyFloor) {
        floor.material = original.material; floor.position.copyFrom(original.position); floor.scaling.copyFrom(original.scaling);
      } else {
        if (!floorMaterial) { floorMaterial = new B.StandardMaterial('Director editable floor', scene); floorMaterial.specularColor = B.Color3.Black(); }
        floorMaterial.diffuseColor = B.Color3.FromHexString(design.floor.color); floor.material = floorMaterial;
        floor.scaling.copyFromFloats(design.floor.size / baseX, original.scaling.y, design.floor.size / baseZ);
        floor.position.copyFromFloats(original.position.x, design.floor.height, original.position.z);
      }
      floor.receiveShadows = true; floor.isPickable = false; floor.setEnabled(mode === 'white' && design.floor.enabled);
    }
    function applyBackground(value = mode) {
      if (!MODES.includes(value)) throw new TypeError('Unsupported stage background mode.');
      mode = value;
      const c = B.Color3.FromHexString(design.backdrop.color);
      scene.clearColor = mode === 'green' ? new B.Color4(0, .9, .08, 1)
        : mode === 'transparent' ? new B.Color4(c.r, c.g, c.b, 0)
          : legacyFloor && design.backdrop.color === defaults.backdrop.color ? new B.Color4(.953, .957, .941, 1) : new B.Color4(c.r, c.g, c.b, 1);
      applyFloor(); layerVisibility();
    }
    function sync() {
      if (disposed) return;
      for (const [id, entry] of entries) {
        entry.node.computeWorldMatrix(true); entry.handle.position.copyFrom(entry.node.getAbsolutePosition());
        entry.handle.setEnabled(editing); entry.mesh.isPickable = editing;
        entry.handle.scaling.setAll(id === selected ? 1.4 : 1);
        entry.handleMaterial.emissiveColor = B.Color3.FromHexString(id === selected ? '#e2bc73' : '#94cbb1');
      }
      const size = `${engine.getRenderWidth()}:${engine.getRenderHeight()}`;
      if (size !== lastRenderSize) { lastRenderSize = size; fitImage(); }
      syncShadows();
    }
    function snapshot() {
      return { backdrop: clone(design.backdrop), floor: clone(design.floor), ...(design.floorplan ? { floorplan: clone(design.floorplan) } : {}), objects: order.map(id => {
        const entry = entries.get(id), node = entry.node;
        return { id, name: entry.value.name, type: entry.value.type, color: entry.value.color,
          position: node.position.asArray(), rotation: (node.rotationQuaternion ? node.rotationQuaternion.toEulerAngles() : node.rotation).asArray(), scale: node.scaling.asArray() };
      }) };
    }
    function restore(value) {
      if (disposed) throw new Error('This stage controller was disposed.');
      const next = validateDesign(value === null || value === undefined ? defaults : value, options.validateFloorplan);
      options.floorplanRenderer?.restore(next.floorplan || null);
      legacyFloor = value === null || value === undefined;
      const keep = new Set(next.objects.map(o => o.id));
      for (const id of entries.keys()) if (!keep.has(id)) deleteEntry(id);
      next.objects.forEach(applyObject); order = next.objects.map(o => o.id); design = next;
      if (!entries.has(selected)) selected = order[0] || null;
      setImage(); applyBackground(mode); sync(); return snapshot();
    }
    function setDesign(patch) {
      record(patch, 'Stage patch'); const current = snapshot();
      return restore({ backdrop: { ...current.backdrop, ...(patch.backdrop || {}) }, floor: { ...current.floor, ...(patch.floor || {}) }, objects: own(patch, 'objects') ? patch.objects : current.objects,
        ...(own(patch, 'floorplan') ? (patch.floorplan === null ? {} : { floorplan: patch.floorplan }) : current.floorplan ? { floorplan: current.floorplan } : {}) });
    }
    function select(id) { selected = entries.has(id) ? id : null; sync(); return selected; }
    function add(type) {
      if (!TYPES.includes(type)) throw new TypeError('Unsupported stage object.');
      if (entries.size >= 32) throw new RangeError('A stage supports up to 32 objects.');
      let id;
      do { id = `stage-${globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`}`; } while (entries.has(id));
      const n = entries.size, size = type === 'plane' ? .6 : .35;
      const value = { id, name: `${type[0].toUpperCase()}${type.slice(1)} ${n + 1}`, type, color: '#aebbb1',
        position: [.5 + (n % 4) * .12, design.floor.height + size / 2, -.25 * Math.floor(n / 4)], rotation: [0, 0, 0], scale: [size, size, type === 'plane' ? 1 : size] };
      setDesign({ objects: [...snapshot().objects, value] }); select(id); return id;
    }
    function update(id, patch) {
      if (!entries.has(id)) return null;
      record(patch, 'Stage object patch');
      const current = snapshot();
      current.objects = current.objects.map(o => o.id === id ? { ...o, ...patch, id } : o);
      restore(current); return snapshot().objects.find(o => o.id === id);
    }
    function remove(id) {
      if (!entries.has(id)) return false;
      setDesign({ objects: snapshot().objects.filter(o => o.id !== id) }); return true;
    }
    const renderObserver = scene.onBeforeRenderObservable.add(sync);
    const resizeObserver = engine.onResizeObservable.add(fitImage);
    restore(null);
    return Object.freeze({ snapshot, restore, nodes: () => Object.fromEntries([...entries].map(([id, entry]) => [id, entry.node])),
      handles: () => [...entries.values()].map(entry => entry.handle), setEditing(value) { editing = Boolean(value); sync(); }, select,
      getSelected: () => selected, add, remove, update, sync, applyBackground, setDesign, defaultDesign: () => clone(defaults), getBackdropStatus: () => ({ ...backdropStatus }),
      dispose() {
        if (disposed) return; disposed = true; scene.onBeforeRenderObservable.remove(renderObserver); engine.onResizeObservable.remove(resizeObserver);
        for (const id of [...entries.keys()]) deleteEntry(id);
        options.floorplanRenderer?.dispose();
        clearTexture(); layer?.dispose(); layer = null; floorMaterial?.dispose(); floorMaterial = null;
        floor.material = original.material; floor.position.copyFrom(original.position); floor.scaling.copyFrom(original.scaling);
        floor.setEnabled(original.enabled); floor.receiveShadows = original.receiveShadows; floor.isPickable = original.pickable; scene.clearColor = original.clear.clone();
      } });
  }
  globalThis.DirectorStage = Object.freeze({ create });
})();
