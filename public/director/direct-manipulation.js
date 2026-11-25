/* Joint-dot press and hold. Classic script; no rig or IK assumptions.
 * install({canvas, scene, camera, getHandles, getNodes, isEnabled,
 *   onSelect(name), onPending({name}), onStart({name}), onMove({name}),
 *   onEnd({name, started, moved, cancelled})})
 * Cancel restores the starting local position. Commit one undo entry only when
 * onEnd reports started && moved && !cancelled. All callbacks are optional.
 */
(() => {
  'use strict';
  function install(options) {
    const { canvas, scene, camera, getHandles, getNodes, isEnabled } = options;
    const B = globalThis.BABYLON;
    if (!B || !canvas || !scene || !camera) throw new Error('A Director canvas, scene and camera are required.');
    const call = (name, value) => options[name]?.(value);
    const identity = B.Matrix.Identity();
    let press = null, disposed = false, suppressUntil = 0;
    const listeners = [];
    function listen(target, type, fn) {
      target.addEventListener(type, fn, { capture: true, passive: false });
      listeners.push(() => target.removeEventListener(type, fn, true));
    }
    function own(event) { event.preventDefault(); event.stopImmediatePropagation(); }
    function coordinates(event) {
      const rect = canvas.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 ? { x: event.clientX - rect.left, y: event.clientY - rect.top, rect } : null;
    }
    function nearest(event) {
      const p = coordinates(event); if (!p) return null;
      camera.getViewMatrix(true); scene.updateTransformMatrix();
      const viewport = camera.viewport.toGlobal(p.rect.width, p.rect.height);
      let found = null, distance = event.pointerType === 'touch' ? 22 : 10;
      for (const handle of getHandles()) {
        const name = handle.metadata?.joint;
        if (!name || !handle.isEnabled() || !getNodes()[name]) continue;
        handle.computeWorldMatrix(true);
        const projected = B.Vector3.Project(handle.getAbsolutePosition(), identity, scene.getTransformMatrix(), viewport);
        if (!Number.isFinite(projected.x + projected.y + projected.z) || projected.z < 0 || projected.z > 1) continue;
        const delta = Math.hypot(projected.x - p.x, projected.y - p.y);
        if (delta < distance) { found = name; distance = delta; }
      }
      if (!found) return null;
      // The center of a dot belongs to the joint. Outside its small core, a
      // utility-layer rotation ring wins over the larger touch target.
      if (distance > 12) {
        const utility = B.UtilityLayerRenderer.DefaultUtilityLayer.utilityLayerScene;
        if (utility?.pick(p.x, p.y)?.hit) return null;
      }
      return found;
    }
    function intersection(event, plane) {
      const p = coordinates(event); if (!p) return null;
      const engine = scene.getEngine(), width = engine.getRenderWidth(), height = engine.getRenderHeight();
      if (!width || !height) return null;
      const ray = B.Ray.CreateNew(p.x * width / p.rect.width, p.y * height / p.rect.height,
        width, height, identity, camera.getViewMatrix(), camera.getProjectionMatrix());
      const distance = ray.intersectsPlane(plane);
      if (distance == null || !Number.isFinite(distance) || distance < 0) return null;
      return ray.origin.add(ray.direction.scale(distance));
    }
    function start() {
      const current = press;
      if (!current || disposed || !isEnabled()) { finish(true); return; }
      const node = getNodes()[current.name];
      if (!node) { finish(true); return; }
      current.node = node; current.original = node.position.clone(); current.started = true;
      call('onStart', { name: current.name });
      node.computeWorldMatrix(true);
      const origin = node.getAbsolutePosition().clone();
      const normal = camera.getForwardRay().direction.normalize();
      const plane = new B.Plane(normal.x, normal.y, normal.z, -B.Vector3.Dot(normal, origin));
      const hit = intersection(current.last, plane);
      if (!hit) { finish(true); return; }
      current.plane = plane; current.offset = origin.subtract(hit);
      canvas.style.cursor = 'grabbing';
    }
    function finish(cancelled = false) {
      const current = press; if (!current) return;
      press = null; clearTimeout(current.timer);
      if (cancelled && current.started && current.moved) {
        current.node.position.copyFrom(current.original); current.node.computeWorldMatrix(true);
        call('onMove', { name: current.name });
      }
      canvas.style.cursor = current.cursor;
      suppressUntil = performance.now() + 500;
      try { if (canvas.hasPointerCapture(current.id)) canvas.releasePointerCapture(current.id); } catch {}
      call('onEnd', { name: current.name, started: current.started, moved: current.moved, cancelled });
    }
    function down(event) {
      if (disposed || press || !isEnabled() || event.button !== 0 || event.isPrimary === false) return;
      const name = nearest(event); if (!name) return;
      own(event);
      press = { id: event.pointerId, name, last: event, started: false, moved: false, cursor: canvas.style.cursor };
      try { canvas.setPointerCapture(event.pointerId); } catch {}
      call('onSelect', name); call('onPending', { name });
      canvas.style.cursor = 'grab';
      press.timer = setTimeout(start, 350);
    }
    function move(event) {
      if (!press || event.pointerId !== press.id) return;
      own(event); press.last = event;
      if (!press.started) return;
      if (!isEnabled()) { finish(true); return; }
      const hit = intersection(event, press.plane); if (!hit) return;
      const world = hit.add(press.offset), node = press.node;
      let local = world;
      if (node.parent) {
        const matrix = node.parent.computeWorldMatrix(true);
        if (!Number.isFinite(matrix.determinant()) || Math.abs(matrix.determinant()) < 1e-12) return;
        local = B.Vector3.TransformCoordinates(world, matrix.clone().invert());
      }
      if (![local.x, local.y, local.z].every(Number.isFinite)) return;
      if (B.Vector3.DistanceSquared(node.position, local) < 1e-16) return;
      node.position.copyFrom(local); node.computeWorldMatrix(true); press.moved = true;
      call('onMove', { name: press.name });
    }
    function up(event) { if (press && event.pointerId === press.id) { own(event); finish(false); } }
    function cancel(event) { if (press && (!event || event.pointerId === press.id)) { if (event) own(event); finish(true); } }
    listen(canvas, 'pointerdown', down);
    listen(window, 'pointerdown', event => { if (press && event.pointerId !== press.id && (event.target === canvas || canvas.contains(event.target))) own(event); });
    listen(window, 'pointermove', move);
    listen(window, 'pointerup', up);
    listen(window, 'pointercancel', cancel);
    listen(canvas, 'lostpointercapture', event => { if (press && event.pointerId === press.id) finish(true); });
    listen(canvas, 'contextmenu', event => { if (press || performance.now() < suppressUntil) own(event); });
    listen(canvas, 'click', event => { if (performance.now() < suppressUntil) own(event); });
    listen(window, 'blur', () => finish(true));
    listen(document, 'visibilitychange', () => { if (document.hidden) finish(true); });
    return Object.freeze({
      cancel: () => finish(true),
      dispose() { if (disposed) return; finish(true); disposed = true; listeners.forEach(remove => remove()); },
      get active() { return !!press; }
    });
  }
  globalThis.DirectorDirectManipulation = Object.freeze({ install });
})();
