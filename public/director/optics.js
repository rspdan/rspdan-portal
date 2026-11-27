/* Original, procedural optical looks. Components are independently weighted;
 * camera/source movement changes their response, never an implicit time pulse. */
(() => {
  'use strict';
  const finite = (value, low, high, fallback) => Number.isFinite(value) ? Math.max(low, Math.min(high, value)) : fallback;
  const presets = Object.freeze({
    glow: [1, 0, 0, 0],
    starburst: [.5, 1, 0, 0],
    anamorphic: [.35, 0, 1, 0],
    glass: [.7, 0, 0, 1],
  });
  function defaults(preset = 'glow') {
    if (!Object.hasOwn(presets, preset)) preset = 'glow';
    const [glow, rays, streak, ghosts] = presets[preset];
    return { preset, glow, rays, streak, ghosts, spread: 1, rotation: 0, rayCount: 8 };
  }
  function normalize(value) {
    const lens = defaults(value?.preset);
    for (const key of ['glow', 'rays', 'streak', 'ghosts']) lens[key] = finite(value?.[key], 0, 1, lens[key]);
    lens.spread = finite(value?.spread, .25, 2, 1);
    lens.rotation = finite(value?.rotation, -180, 180, 0);
    lens.rayCount = Math.round(finite(value?.rayCount, 4, 16, 8));
    return lens;
  }
  function create(scene, emitter, { name = 'Director optical source' } = {}) {
    const B = globalThis.BABYLON;
    if (!B || !scene || !emitter?.getAbsolutePosition) throw new Error('Optical effects need a scene and an attached source.');
    const system = new B.LensFlareSystem(name, emitter, scene);
    system.metadata = { directorOptics: true };
    system.borderLimit = 1;
    let disposed = false, strength = 0, tint = B.Color3.White(), sourceRadius = .025, lens = defaults();
    let diagnostics = { visible: false, visibility: 0, strength: 0, lens: { ...lens } };
    const smooth = value => value * value * (3 - 2 * value);
    const image = (size, sample) => {
      const canvas = document.createElement('canvas'); canvas.width = canvas.height = size;
      const ctx = canvas.getContext('2d'), data = ctx.createImageData(size, size);
      for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
        const u = (x + .5) * 2 / size - 1, v = (y + .5) * 2 / size - 1;
        const value = Math.round(255 * finite(sample(u, v), 0, 1, 0)), i = (y * size + x) * 4;
        data.data[i] = data.data[i + 1] = data.data[i + 2] = value; data.data[i + 3] = 255;
      }
      ctx.putImageData(data, 0, 0); return canvas;
    };
    const make = (size, position, label, resolution, sample) => {
      const flare = new B.LensFlare(size, position, B.Color3.White(), null, system);
      flare.texture = new B.DynamicTexture(name + ' ' + label, { width: resolution, height: resolution }, scene, false, B.Texture.BILINEAR_SAMPLINGMODE);
      const component = { flare, canvas: image(resolution, sample), resolution, angle: NaN };
      paint(component, 0); return component;
    };
    function paint(component, degrees) {
      if (component.angle === degrees) return;
      const ctx = component.flare.texture.getContext(), size = component.resolution;
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, size, size);
      ctx.translate(size / 2, size / 2); ctx.rotate(degrees * Math.PI / 180);
      ctx.drawImage(component.canvas, -size / 2, -size / 2);
      ctx.setTransform(1, 0, 0, 1, 0, 0); component.flare.texture.update(false); component.angle = degrees;
    }
    const glow = make(.26, 1, 'compact glow', 256, (x, y) => {
      const r = Math.hypot(x, y), edge = 1 - smooth(finite((r - .28) / .6, 0, 1, 0));
      return (.8 * Math.exp(-r * r * 12) + .2 * Math.exp(-r * r * 3)) * edge;
    });
    const streak = make(1.65, 1, 'anamorphic streak', 512, (x, y) => {
      const length = Math.pow(Math.max(0, 1 - Math.abs(x)), 1.45);
      return length * (.82 * Math.exp(-Math.abs(y) * 230) + .12 * Math.exp(-Math.abs(y) * 55)) + .2 * Math.exp(-Math.hypot(x, y) * 70);
    });
    let drawnRayCount = 8;
    const rayShape = count => (x, y) => {
      const r = Math.hypot(x, y), angle = Math.atan2(y, x), sector = Math.PI * 2 / count;
      // A repeatable, slightly uneven drawn burst, with definite ray tips.
      // The same count and orientation always generate the same image.
      const index = Math.round(angle / sector), turn = (index % count + count) % count;
      const a = angle - index * sector, reach = .63 + .28 * (.5 + .5 * Math.sin(turn * 2.399 + 1));
      const tip = 1 - smooth(finite((r - reach * .52) / (reach * .48), 0, 1, 0));
      const across = Math.abs(Math.sin(a)) * r;
      return Math.exp(-across * (95 + 50 * r)) * Math.exp(-r * 2.2) * tip + .18 * Math.exp(-r * 65);
    };
    const rays = make(.9, 1, 'radial starburst', 512, rayShape(drawnRayCount));
    const disc = (x, y) => {
      const r = Math.hypot(x, y);
      const fill = .16 * (1 - smooth(finite((r - .25) / .55, 0, 1, 0)));
      return fill + .12 * Math.exp(-Math.pow((r - .64) / .08, 2));
    };
    const ghosts = [
      { ...make(.075, .3, 'cyan glass reflection', 128, disc), size: .075, position: .3, color: new B.Color3(.35, .8, 1) },
      { ...make(.13, -.4, 'amber glass reflection', 128, disc), size: .13, position: -.4, color: new B.Color3(1, .62, .3) },
      { ...make(.22, -.85, 'violet glass reflection', 128, disc), size: .22, position: -.85, color: new B.Color3(.65, .45, 1) },
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
        diagnostics = { visible: false, visibility: 0, strength, lens: { ...lens } }; return false;
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
        diagnostics = { visible: false, visibility: 0, strength, lens: { ...lens }, distance, source: [screen.x, screen.y] }; return false;
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
      const white = B.Color3.Lerp(tint, B.Color3.White(), .7), extent = approach * lens.spread;
      glow.flare.size = .26 * extent;
      glow.flare.color.copyFrom(white.scale(1.45 * amount * lens.glow));
      streak.flare.size = 1.65 * extent * (1 + .12 * offAxis);
      streak.flare.color.copyFrom(white.scale(1.65 * amount * approach * lens.streak));
      rays.flare.size = .9 * extent * (1 + .1 * offAxis);
      rays.flare.color.copyFrom(white.scale(2.1 * amount * lens.rays));
      for (const ghost of ghosts) {
        // Babylon places these along the source/optical-center axis. Their
        // signed positions cross the frame as that axis changes. They become
        // distinct off-axis instead of piling up at the center of the lens.
        ghost.flare.position = ghost.position * (1 + .12 * offAxis);
        ghost.flare.size = ghost.size * extent * (1 + .32 * offAxis);
        const coating = B.Color3.Lerp(ghost.color, tint, .2);
        ghost.flare.color.copyFrom(coating.scale(amount * lens.ghosts * 1.15 * smooth(Math.min(1, offAxis * 2.4))));
      }
      diagnostics = { visible: amount * Math.max(lens.glow, lens.rays, lens.streak, lens.ghosts) > .00001, visibility, strength,
        lens: { ...lens }, distance, source: [screen.x, screen.y], offAxis,
        transmission, streakSize: streak.flare.size, streakColor: streak.flare.color.asArray(),
        glowSize: glow.flare.size, glowColor: glow.flare.color.asArray(), raysSize: rays.flare.size, raysColor: rays.flare.color.asArray(),
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
        lens = normalize(value.lens);
        if (drawnRayCount !== lens.rayCount) {
          rays.canvas = image(rays.resolution, rayShape(lens.rayCount));
          rays.angle = NaN; drawnRayCount = lens.rayCount;
        }
        paint(streak, lens.rotation); paint(rays, lens.rotation);
        system.isEnabled = strength > 0;
        if (!strength) diagnostics = { visible: false, visibility: 0, strength: 0, lens: { ...lens } };
      },
      inspect: () => structuredClone(diagnostics),
      dispose() { if (disposed) return; disposed = true; system.dispose(); },
    });
  }
  globalThis.DirectorOptics = Object.freeze({ create, defaults });
})();
