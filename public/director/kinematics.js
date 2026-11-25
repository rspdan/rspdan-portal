/* Connected, two-bone endpoint controls. The twelve registered bone transforms
 * remain the saved/animated pose; the four visible targets are derived editors.
 * Endpoint lengths were read from Ouch_112526_Pass2c.blend without modifying it.
 */
(() => {
  'use strict';
  const ASSET = 'ad640bbaf1fdf61eb304c1495bd1ba81388a85acf0293bcd4b6c929833e1cb14';
  const DEFINITIONS = [
    { id: 'hand.L', label: 'Left hand', upper: 'upper_arm.L', lower: 'lower_arm.L', length: .2222248911857605, kind: 'arm' },
    { id: 'hand.R', label: 'Right hand', upper: 'upper_arm.R', lower: 'lower_arm.R', length: .22601574659347534, kind: 'arm' },
    { id: 'foot.L', label: 'Left foot', upper: 'thigh.L', lower: 'shin.L', length: .36943960189819336, kind: 'leg' },
    { id: 'foot.R', label: 'Right foot', upper: 'thigh.R', lower: 'shin.R', length: .3694828748703003, kind: 'leg' },
  ];
  function create(scene, { nodes, neutralPose, manifest }) {
    const B = globalThis.BABYLON;
    if (!B || !scene || !nodes) throw new Error('Connected posing needs a scene and rig.');
    const available = manifest?.sha256 === ASSET && DEFINITIONS.every(d => nodes[d.upper] && nodes[d.lower]) && !!nodes.root;
    const entries = new Map(), targetNodes = Object.create(null), markers = [];
    let active = null, body = null, editing = false, disposed = false;
    const stateOf = node => ({ position: node.position.clone(), rotation: (node.rotationQuaternion || B.Quaternion.FromEulerVector(node.rotation)).clone(), scale: node.scaling.clone() });
    function applyState(node, value) { node.position.copyFrom(value.position); node.rotationQuaternion = value.rotation.clone(); node.scaling.copyFrom(value.scale); node.computeWorldMatrix(true); }
    function endpoint(entry) {
      return B.Vector3.TransformCoordinates(new B.Vector3(0, entry.length, 0), entry.lower.computeWorldMatrix(true));
    }
    function targetAt(entry, world) {
      const inverse = nodes.root.computeWorldMatrix(true).clone().invert();
      entry.target.position.copyFrom(B.Vector3.TransformCoordinates(world, inverse));
      entry.target.computeWorldMatrix(true);
    }
    function stablePerpendicular(direction, preferred) {
      let value = preferred.subtract(direction.scale(B.Vector3.Dot(preferred, direction)));
      if (value.lengthSquared() < 1e-10) {
        const axis = Math.abs(direction.y) < .8 ? B.Vector3.Up() : B.Vector3.Right();
        value = axis.subtract(direction.scale(B.Vector3.Dot(axis, direction)));
      }
      return value.normalize();
    }
    function fromTo(from, to, preferred) {
      const a = from.normalizeToNew(), b = to.normalizeToNew();
      const dot = Math.max(-1, Math.min(1, B.Vector3.Dot(a, b)));
      if (dot > 1 - 1e-12) return B.Quaternion.Identity();
      if (dot < -1 + 1e-9) return B.Quaternion.RotationAxis(stablePerpendicular(a, preferred), Math.PI);
      const cross = B.Vector3.Cross(a, b);
      return new B.Quaternion(cross.x, cross.y, cross.z, 1 + dot).normalize();
    }
    function transformedDirection(value, quaternion) {
      const matrix = B.Matrix.Identity(); quaternion.toRotationMatrix(matrix);
      return B.Vector3.TransformNormal(value, matrix);
    }
    function parentPoints(entry) {
      const parent = entry.upper.parent;
      const inverse = parent ? parent.computeWorldMatrix(true).clone().invert() : B.Matrix.Identity();
      return { inverse,
        a: B.Vector3.TransformCoordinates(entry.upper.getAbsolutePosition(), inverse),
        b: B.Vector3.TransformCoordinates(entry.lower.getAbsolutePosition(), inverse),
        c: B.Vector3.TransformCoordinates(endpoint(entry), inverse) };
    }
    function refreshMatrices(entry) {
      entry.upper.computeWorldMatrix(true); entry.lower.computeWorldMatrix(true);
    }
    function sync() {
      if (disposed || !available) return;
      for (const entry of entries.values()) if (active?.entry !== entry && !body?.contexts.some(context => context.entry === entry)) targetAt(entry, endpoint(entry));
    }
    function capture(entry) {
      refreshMatrices(entry);
      const points = parentPoints(entry), direction = points.c.subtract(points.a);
      if (direction.lengthSquared() < 1e-12) direction.copyFromFloats(0, -1, 0);
      direction.normalize();
      const bend = points.b.subtract(points.a), projected = bend.subtract(direction.scale(B.Vector3.Dot(bend, direction)));
      // A nearly straight knee prefers the character's front; an arm prefers
      // outward so a first drag cannot choose a random floating-point bend.
      const fallback = entry.kind === 'leg' ? new B.Vector3(0, 0, 1) : new B.Vector3(entry.id.endsWith('.L') ? 1 : -1, 0, .25);
      const authoredBend = projected.lengthSquared() > 1e-8 && (entry.kind !== 'leg' || projected.length() >= bend.length() * .15);
      return { entry, upper: stateOf(entry.upper), lower: stateOf(entry.lower), direction,
        bend: stablePerpendicular(direction, authoredBend ? projected : fallback), changed: false };
    }
    function begin(id) {
      if (disposed || !available || !entries.has(id)) return false;
      if (body) endBody();
      if (active) end();
      active = capture(entries.get(id));
      return true;
    }
    function connected(entry) {
      const reference = manifest.restPose?.bones || neutralPose?.bones;
      for (const node of [entry.upper, entry.lower]) {
        const rest = reference[node.name];
        if (!rest) throw new Error('The connected limb is missing its rest transform.');
        node.position.copyFromFloats(...rest.position);
        node.scaling.copyFromFloats(...rest.scale);
      }
      refreshMatrices(entry);
    }
    function solve(id) {
      if (disposed || !available || !entries.has(id)) return null;
      if (active?.entry.id !== id && !begin(id)) return null;
      const entry = active.entry;
      entry.target.computeWorldMatrix(true);
      const desiredWorld = entry.target.getAbsolutePosition().clone();
      if (![desiredWorld.x, desiredWorld.y, desiredWorld.z].every(Number.isFinite)) return null;
      connected(entry);
      const points = parentPoints(entry), target = B.Vector3.TransformCoordinates(desiredWorld, points.inverse);
      const l1 = B.Vector3.Distance(points.a, points.b), l2 = B.Vector3.Distance(points.b, points.c);
      if (l1 < 1e-8 || l2 < 1e-8) return null;
      let direction = target.subtract(points.a), requestedDistance = direction.length();
      direction = requestedDistance > 1e-9 ? direction.scale(1 / requestedDistance) : active.direction.clone();
      const minimum = Math.abs(l1 - l2) + 1e-7, maximum = l1 + l2 - 1e-7;
      const distance = Math.max(minimum, Math.min(maximum, requestedDistance));
      const transported = transformedDirection(active.bend, fromTo(active.direction, direction, active.bend));
      const bend = stablePerpendicular(direction, transported);
      const along = (l1 * l1 - l2 * l2 + distance * distance) / (2 * distance);
      const height = Math.sqrt(Math.max(0, l1 * l1 - along * along));
      const joint = points.a.add(direction.scale(along)).add(bend.scale(height));
      const resolved = points.a.add(direction.scale(distance));
      const upperRotation = entry.upper.rotationQuaternion || B.Quaternion.FromEulerVector(entry.upper.rotation);
      const upperDelta = fromTo(points.b.subtract(points.a), joint.subtract(points.a), bend);
      entry.upper.rotationQuaternion = upperDelta.multiply(upperRotation).normalize();
      refreshMatrices(entry);

      // Solve the second rotation in its parent's coordinates, not world space.
      // This preserves the actual hierarchy when the body has been moved/turned.
      const parentWorld = entry.upper.parent ? entry.upper.parent.computeWorldMatrix(true) : B.Matrix.Identity();
      const resolvedWorld = B.Vector3.TransformCoordinates(resolved, parentWorld);
      const upperInverse = entry.upper.computeWorldMatrix(true).clone().invert();
      const localEnd = B.Vector3.TransformCoordinates(endpoint(entry), upperInverse);
      const localTarget = B.Vector3.TransformCoordinates(resolvedWorld, upperInverse);
      const lowerRotation = entry.lower.rotationQuaternion || B.Quaternion.FromEulerVector(entry.lower.rotation);
      const lowerDelta = fromTo(localEnd.subtract(entry.lower.position), localTarget.subtract(entry.lower.position), B.Vector3.Right());
      entry.lower.rotationQuaternion = lowerDelta.multiply(lowerRotation).normalize();
      refreshMatrices(entry); active.changed = true;
      const actual = endpoint(entry); targetAt(entry, actual);
      // The other three derived controls follow any ordinary parent transforms.
      sync();
      return { id, clamped: Math.abs(distance - requestedDistance) > 1e-6, requested: desiredWorld.asArray(), actual: actual.asArray(),
        lengths: [l1, l2], error: B.Vector3.Distance(actual, resolvedWorld) };
    }
    function end(options = {}) {
      if (!active) { sync(); return; }
      if (options.cancelled === true) { applyState(active.entry.upper, active.upper); applyState(active.entry.lower, active.lower); }
      active = null; sync();
    }
    function beginBody(id) {
      if (disposed || !available || id !== 'torso.lower') return false;
      if (body) endBody();
      if (active) end();
      sync();
      const contexts = ['foot.L', 'foot.R'].map(name => capture(entries.get(name)));
      body = { id, original: stateOf(nodes[id]), contexts,
        targets: contexts.map(context => context.entry.target.position.clone()) };
      return true;
    }
    function solveBody() {
      if (!body || disposed) return [];
      const results = [];
      for (let i = 0; i < body.contexts.length; i++) {
        active = body.contexts[i];
        active.entry.target.position.copyFrom(body.targets[i]);
        results.push(solve(active.entry.id));
      }
      active = null; sync();
      return results;
    }
    function endBody(options = {}) {
      if (!body) return;
      if (options.cancelled === true) {
        applyState(nodes[body.id], body.original);
        for (const context of body.contexts) { applyState(context.entry.upper, context.upper); applyState(context.entry.lower, context.lower); }
      }
      body = null; active = null; sync();
    }
    function setEditing(value) { editing = Boolean(value); for (const handle of markers) handle.setEnabled(editing); }
    if (available) for (const definition of DEFINITIONS) {
      const target = new B.TransformNode('Director ' + definition.label + ' target', scene);
      target.parent = nodes.root;
      target.metadata = { directorIKTarget: definition.id };
      const material = new B.StandardMaterial('Control ' + definition.id, scene); material.disableLighting = true;
      material.emissiveColor = definition.id.endsWith('.L') ? B.Color3.FromHexString('#5d9fc9') : B.Color3.FromHexString('#70b48c');
      const handle = B.MeshBuilder.CreateSphere('Hand/foot control ' + definition.id, { diameter: .026, segments: 12 }, scene);
      handle.parent = target; handle.material = material; handle.renderingGroupId = 2;
      handle.metadata = { joint: definition.id, directorIKTarget: definition.id, directorEditorHelper: true };
      handle.isPickable = true; handle.renderOutline = true; handle.outlineColor = new B.Color3(.12, .16, .14); handle.outlineWidth = .0012;
      handle.setEnabled(false);
      entries.set(definition.id, { ...definition, upper: nodes[definition.upper], lower: nodes[definition.lower], target, handle, material });
      targetNodes[definition.id] = target; markers.push(handle);
    }
    sync();
    return Object.freeze({ available, nodes: () => targetNodes, handles: () => markers,
      labels: () => Object.fromEntries(DEFINITIONS.filter(d => entries.has(d.id)).map(d => [d.id, d.label])),
      isTarget: id => entries.has(id), setEditing, sync, begin, solve, end, beginBody, solveBody, endBody,
      endpoint: id => entries.has(id) ? endpoint(entries.get(id)).asArray() : null,
      dispose() { if (disposed) return; endBody({ cancelled: true }); end({ cancelled: true }); disposed = true; for (const entry of entries.values()) { entry.handle.dispose(); entry.material.dispose(); entry.target.dispose(); } entries.clear(); markers.length = 0; }
    });
  }
  globalThis.DirectorKinematics = Object.freeze({ create });
})();
