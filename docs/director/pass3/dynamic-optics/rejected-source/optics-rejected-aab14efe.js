/* Camera-relative optical effects. These are a stylized lens response, not a
 * volumetric fog or a ray-traced glass simulation. A fixed camera and source
 * produce a fixed result; moving either changes the streak and lens ghosts. */
(() => {
  'use strict';
  const finite = (value, low, high, fallback) => Number.isFinite(value) ? Math.max(low, Math.min(high, value)) : fallback;
  function create(scene, emitter, { name = 'Director optical source' } = {}) {
    const B = globalThis.BABYLON;
    if (!B || !scene || !emitter?.getAbsolutePosition) throw new Error('Optical effects need a scene and an attached source.');
    const system = new B.LensFlareSystem(name, emitter, scene);
    system.metadata = { directorOptics: true };
    system.borderLimit = 1;
    let disposed = false, strength = 0, tint = B.Color3.White(), sourceRadius = .025;
    let diagnostics = { visible: false, visibility: 0, strength: 0 };
    const smooth = value => value * value * (3 - 2 * value);
    const texture = (label, size, sample) => {
      const result = new B.DynamicTexture(name + ' ' + label, { width: size, height: size }, scene, false, B.Texture.BILINEAR_SAMPLINGMODE);
      const ctx = result.getContext(), data = ctx.createImageData(size, size);
      for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
        const u = (x + .5) * 2 / size - 1, v = (y + .5) * 2 / size - 1;
        const value = Math.round(255 * finite(sample(u, v), 0, 1, 0)), i = (y * size + x) * 4;
        data.data[i] = data.data[i + 1] = data.data[i + 2] = value; data.data[i + 3] = 255;
      }
      ctx.putImageData(data, 0, 0); result.update(false); return result;
    };
    const make = (size, position, label, resolution, sample) => {
      const flare = new B.LensFlare(size, position, B.Color3.White(), null, system);
      flare.texture = texture(label, resolution, sample); return flare;
    };
    const streak = make(1.6, 1, 'source streak', 512, (x, y) =>
      .9 * Math.pow(Math.max(0, 1 - Math.abs(x)), 1.2) * Math.exp(-Math.abs(y) * 210) + Math.exp(-Math.hypot(x, y) * 50));
    const source = make(.065, 1, 'source core', 128, (x, y) => Math.exp(-Math.hypot(x, y) * 8));
    const ring = (x, y) => {
      const r = Math.hypot(x, y), angle = Math.atan2(y, x);
      // A faint filled reflection with only a trace of the lens aperture.
      // Strong hollow polygons read as editor handles, not light in glass.
      const edge = .66 + .009 * Math.cos(angle * 6);
      const interior = 1 - smooth(finite((r - .4) / .38, 0, 1, 0));
      return .06 * Math.exp(-Math.pow((r - edge) / .1, 2)) + .14 * interior;
    };
    const ghosts = [
      { flare: make(.042, .38, 'cyan reflection', 128, ring), size: .042, position: .38, color: new B.Color3(.45, .85, 1) },
      { flare: make(.075, -.28, 'amber reflection', 128, ring), size: .075, position: -.28, color: new B.Color3(1, .64, .3) },
      { flare: make(.12, -.72, 'violet reflection', 128, ring), size: .12, position: -.72, color: new B.Color3(.62, .48, 1) },
    ];
    system.meshesSelectionPredicate = mesh => !mesh.isDisposed() && mesh.isEnabled() && mesh.isVisible && mesh.visibility > 0 &&
      !mesh.metadata?.directorCharacter && !mesh.metadata?.joint && !mesh.metadata?.directorEditorHelper &&
      !mesh.metadata?.directorLightEffect && mesh.getTotalVertices() > 0;
    // Visibility is evaluated with the current camera just before compositing.
    // The vendor's unbounded first-hit ray can miss a nearer blocker when the
    // floor was encountered first. Each sample here is bounded at the source.
    system._isVisible = () => system.isEnabled && diagnostics.visible;
    function update() {
      const camera = scene.activeCamera, engine = scene.getEngine();
      if (disposed || !strength || !camera || emitter.isDisposed?.() || !emitter.isEnabled()) {
        diagnostics = { visible: false, visibility: 0, strength }; return false;
      }
      emitter.computeWorldMatrix(true);
      camera.getViewMatrix(true);
      const origin = camera.globalPosition, point = emitter.getAbsolutePosition().clone();
      const delta = point.subtract(origin), distance = delta.length();
      const forward = camera.getForwardRay().direction;
      const viewport = camera.viewport.toGlobal(engine.getRenderWidth(), engine.getRenderHeight());
      const matrix = camera.getViewMatrix().multiply(camera.getProjectionMatrix());
      const screen = B.Vector3.Project(point, B.Matrix.Identity(), matrix, viewport);
      const x = (screen.x - viewport.x) / viewport.width * 2 - 1;
      const y = (screen.y - viewport.y) / viewport.height * 2 - 1;
      if (distance < .0001 || B.Vector3.Dot(delta, forward) <= 0 || screen.z < 0 || screen.z > 1 || Math.abs(x) >= 1 || Math.abs(y) >= 1) {
        diagnostics = { visible: false, visibility: 0, strength, distance, source: [screen.x, screen.y] }; return false;
      }
      const inverseView = camera.getViewMatrix().clone().invert();
      const right = B.Vector3.TransformNormal(B.Vector3.Right(), inverseView).normalize();
      const up = B.Vector3.TransformNormal(B.Vector3.Up(), inverseView).normalize();
      let clear = 0;
      for (let i = 0; i < 9; i++) {
        const angle = (i - 1) * Math.PI / 4, r = i ? sourceRadius : 0;
        const sample = point.add(right.scale(Math.cos(angle) * r)).add(up.scale(Math.sin(angle) * r));
        const direction = sample.subtract(origin), reach = direction.length();
        const ray = new B.Ray(origin, direction.scale(1 / reach), Math.max(0, reach - .0001));
        if (!scene.pickWithRay(ray, system.meshesSelectionPredicate, false)?.hit) clear++;
      }
      const visibility = clear / 9;
      const border = smooth(finite((1 - Math.max(Math.abs(x), Math.abs(y))) / .16, 0, 1, 0));
      const offAxis = Math.min(1, Math.hypot(x, y));
      const approach = finite(Math.sqrt(2.2 / distance), .5, 1.5, 1);
      const transmission = (1 - .42 * offAxis * offAxis) * border * visibility;
      const amount = smooth(strength) * transmission;
      const white = B.Color3.Lerp(tint, B.Color3.White(), .85);
      streak.size = 1.6 * approach * (1 + .12 * offAxis);
      streak.color.copyFrom(white.scale(1.45 * amount * approach));
      source.size = .065 * approach;
      source.color.copyFrom(white.scale(1.1 * amount));
      for (const ghost of ghosts) {
        // Babylon places these along the source/optical-center axis. Their
        // signed positions cross the frame as that axis changes. They become
        // distinct off-axis instead of piling up at the center of the lens.
        ghost.flare.position = ghost.position * (1 + .12 * offAxis);
        ghost.flare.size = ghost.size * approach * (1 + .32 * offAxis);
        const coating = B.Color3.Lerp(ghost.color, tint, .2);
        ghost.flare.color.copyFrom(coating.scale(amount * .65 * smooth(Math.min(1, offAxis * 2.4))));
      }
      diagnostics = { visible: amount > .00001, visibility, strength, distance, source: [screen.x, screen.y], offAxis,
        transmission, streakSize: streak.size, streakColor: streak.color.asArray(),
        ghosts: ghosts.map(({ flare }) => ({ position: flare.position, size: flare.size, color: flare.color.asArray(),
          pixel: [viewport.x + viewport.width / 2 + (screen.x - viewport.x - viewport.width / 2) * flare.position,
            viewport.y + viewport.height / 2 + (screen.y - viewport.y - viewport.height / 2) * flare.position] })) };
      return diagnostics.visible;
    }
    const render = system.render.bind(system);
    system.render = () => !disposed && update() ? render() : false;
    system.isEnabled = false;
    return Object.freeze({
      apply(value = {}) {
        if (disposed) throw new Error('Optical effects have been disposed.');
        strength = finite(value.strength, 0, 1, 0);
        const rgb = Array.isArray(value.color) && value.color.length === 3 ? value.color : [1, 1, 1];
        tint.copyFromFloats(...rgb.map(channel => finite(channel, 0, 1, 1)));
        sourceRadius = finite(value.sourceRadius, .001, 1, .025);
        system.isEnabled = strength > 0;
        if (!strength) diagnostics = { visible: false, visibility: 0, strength: 0 };
      },
      inspect: () => structuredClone(diagnostics),
      dispose() { if (disposed) return; disposed = true; system.dispose(); },
    });
  }
  globalThis.DirectorOptics = Object.freeze({ create });
})();
