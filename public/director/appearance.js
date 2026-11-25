/* Character appearance controller. Geometry, rig, animation and original
 * materials are left intact. Scene state is owned/serialized by the caller. */
(() => {
  'use strict';
  const clamp = (value, min, max, fallback) => Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : fallback;
  // Approximate display tint for a color temperature; 6500 K is neutral here.
  function temperatureRGB(kelvin) {
    function rgb(k) {
      const t = k / 100;
      return [t <= 66 ? 255 : 329.698727446 * Math.pow(t - 60, -.1332047592),
        t <= 66 ? 99.4708025861 * Math.log(t) - 161.1195681661 : 288.1221695283 * Math.pow(t - 60, -.0755148492),
        t >= 66 ? 255 : t <= 19 ? 0 : 138.5177312231 * Math.log(t - 10) - 305.0447927307].map(v => clamp(v / 255, 0, 1, 1));
    }
    const neutral = rgb(6500), tint = rgb(clamp(kelvin, 1800, 10000, 6500)).map((v, i) => v / neutral[i]);
    const peak = Math.max(...tint);
    return tint.map(v => v / peak);
  }
  function create(scene) {
    const B = globalThis.BABYLON;
    if (!B || !scene) throw new Error('Director appearance requires a Babylon scene.');
    const entries = new Map(), footCaches = new Map();
    let contacts = [], contactRecomputations = 0, supportStamp = null;
    const inverseVP = B.Matrix.Identity();
    const sameNumbers = (a, b) => a?.length === b.length && b.every((value, i) => value === a[i]);
    function footData(mesh) {
      if (footCaches.has(mesh)) return footCaches.get(mesh);
      const positions = mesh.getVerticesData(B.VertexBuffer.PositionKind), indices = mesh.getVerticesData(B.VertexBuffer.MatricesIndicesKind), weights = mesh.getVerticesData(B.VertexBuffer.MatricesWeightsKind);
      if (!positions || !indices || !weights || !mesh.skeleton) { footCaches.set(mesh, null); return null; }
      const extraIndices = mesh.getVerticesData(B.VertexBuffer.MatricesIndicesExtraKind), extraWeights = mesh.getVerticesData(B.VertexBuffer.MatricesWeightsExtraKind);
      const morphs = Array.from({ length: mesh.morphTargetManager?.numTargets || 0 }, (_, i) => mesh.morphTargetManager.getTarget(i));
      const feet = ['L', 'R'].map(side => {
        const bone = mesh.skeleton.bones.find(b => b.name === 'shin.' + side);
        if (!bone) return null;
        const candidates = [], inverse = bone.getInvertedAbsoluteTransform();
        let low = Infinity, high = -Infinity;
        for (let v = 0; v < positions.length / 3; v++) {
          if (![0, 1, 2, 3].some(i => indices[v * 4 + i] === bone.getIndex() && weights[v * 4 + i] > .5)) continue;
          const local = B.Vector3.TransformCoordinates(B.Vector3.FromArray(positions, v * 3), inverse);
          low = Math.min(low, local.y); high = Math.max(high, local.y); candidates.push([v, local.y]);
        }
        const start = high - (high - low) * .25;
        const samples = candidates.filter(([, y]) => y >= start).map(([v]) => {
          const base = [positions[v * 3], positions[v * 3 + 1], positions[v * 3 + 2]], skin = [];
          for (let i = 0; i < 4; i++) {
            if (weights[v * 4 + i] > 0) skin.push([indices[v * 4 + i], weights[v * 4 + i]]);
            if (extraWeights?.[v * 4 + i] > 0) skin.push([extraIndices[v * 4 + i], extraWeights[v * 4 + i]]);
          }
          const deltas = morphs.map(target => {
            const data = target.getPositions();
            return data ? [data[v * 3] - base[0], data[v * 3 + 1] - base[1], data[v * 3 + 2] - base[2]] : [0, 0, 0];
          });
          return { base, skin, deltas, point: B.Vector3.Zero() };
        });
        return { side, samples };
      }).filter(Boolean);
      const cache = { feet, morphs, matrixStamp: null, posed: [] }; footCaches.set(mesh, cache); return cache;
    }
    function updateContacts() {
      if (!glow?.isEnabled || state.look !== 'trip') { contacts = []; supportStamp = null; return; }
      const surfaces = scene.meshes.filter(mesh => !mesh.isDisposed() && mesh.isEnabled() && mesh.isVisible && mesh.visibility > 0 &&
        (mesh.name === 'White room floor' || mesh.metadata?.directorStageId) && !mesh.metadata?.directorEditorHelper);
      const stamp = [];
      for (const surface of surfaces) { surface.computeWorldMatrix(); stamp.push(surface.uniqueId, ...surface.getWorldMatrix().m); }
      let changed = !sameNumbers(supportStamp, stamp);
      const posed = [];
      for (const mesh of entries.keys()) {
        const cache = footData(mesh); if (!cache || mesh.isDisposed()) continue;
        mesh.skeleton.prepare(true); mesh.computeWorldMatrix();
        const matrices = mesh.skeleton.getTransformMatrices(mesh), world = mesh.getWorldMatrix().m, influences = cache.morphs.map(m => m.influence);
        const values = [...matrices, ...world, ...influences];
        if (!sameNumbers(cache.matrixStamp, values)) {
          cache.matrixStamp = values; cache.posed = []; changed = true; contactRecomputations++;
          const unit = Math.max(.0001, (Math.hypot(matrices[0], matrices[1], matrices[2]) + Math.hypot(matrices[4], matrices[5], matrices[6]) + Math.hypot(matrices[8], matrices[9], matrices[10])) / 3);
          for (const foot of cache.feet) {
            let minY = Infinity;
            for (const sample of foot.samples) {
              let [x, y, z] = sample.base;
              sample.deltas.forEach((delta, i) => { x += delta[0] * influences[i]; y += delta[1] * influences[i]; z += delta[2] * influences[i]; });
              let sx = 0, sy = 0, sz = 0;
              for (const [index, weight] of sample.skin) {
                const j = index * 16;
                sx += (x * matrices[j] + y * matrices[j + 4] + z * matrices[j + 8] + matrices[j + 12]) * weight;
                sy += (x * matrices[j + 1] + y * matrices[j + 5] + z * matrices[j + 9] + matrices[j + 13]) * weight;
                sz += (x * matrices[j + 2] + y * matrices[j + 6] + z * matrices[j + 10] + matrices[j + 14]) * weight;
              }
              sample.point.set(sx * world[0] + sy * world[4] + sz * world[8] + world[12], sx * world[1] + sy * world[5] + sz * world[9] + world[13], sx * world[2] + sy * world[6] + sz * world[10] + world[14]);
              minY = Math.min(minY, sample.point.y);
            }
            const min = new B.Vector3(Infinity, Infinity, Infinity), max = new B.Vector3(-Infinity, -Infinity, -Infinity);
            for (const sample of foot.samples) if (sample.point.y <= minY + .014 * unit) { min.minimizeInPlace(sample.point); max.maximizeInPlace(sample.point); }
            if (Number.isFinite(min.x)) cache.posed.push({ side: foot.side, minY, center: B.Vector3.Center(min, max), rx: (max.x - min.x) / 2 + .025 * unit, rz: (max.z - min.z) / 2 + .025 * unit, unit, samples: foot.samples.length });
          }
        }
        posed.push(...cache.posed);
      }
      if (changed) {
        supportStamp = stamp; contacts = [];
        for (const foot of posed.slice(0, 2)) {
          const ray = new B.Ray(new B.Vector3(foot.center.x, foot.minY + .035 * foot.unit, foot.center.z), new B.Vector3(0, -1, 0), .065 * foot.unit);
          const hit = scene.pickWithRay(ray, mesh => surfaces.includes(mesh), false);
          const normal = hit?.hit && hit.getNormal(true, true)?.normalize();
          if (!normal || normal.y < .5 || !hit.pickedPoint) continue;
          const gap = foot.minY - hit.pickedPoint.y;
          if (gap < -.012 * foot.unit || gap > .025 * foot.unit) continue;
          const t = clamp((gap / foot.unit - .001) / .024, 0, 1, 1), weight = 1 - t * t * (3 - 2 * t);
          const bounds = hit.pickedMesh.getBoundingInfo().boundingBox;
          contacts.push({ side: foot.side, center: [foot.center.x, foot.center.z], radii: [foot.rx, foot.rz], plane: [normal.x, normal.y, normal.z, -B.Vector3.Dot(normal, hit.pickedPoint)],
            bounds: [bounds.minimumWorld.x, bounds.maximumWorld.x, bounds.minimumWorld.z, bounds.maximumWorld.z], weight, gap, surface: hit.pickedMesh.name, samples: foot.samples });
        }
      }
      glow.metadata = { directorContact: { contacts: structuredClone(contacts), recomputations: contactRecomputations, cachedSamples: posed.reduce((sum, foot) => sum + foot.samples, 0) } };
    }
    function bindContacts(effect) {
      const camera = scene.activeCamera;
      if (camera) camera.getViewMatrix().multiply(camera.getProjectionMatrix()).invertToRef(inverseVP);
      effect.setMatrix('contactInverseVP', inverseVP);
      for (let i = 0; i < 2; i++) {
        const contact = contacts[i];
        effect.setFloat4('contact' + i, ...(contact ? [...contact.center, ...contact.radii] : [0, 0, 1, 1]));
        effect.setFloat4('contactPlane' + i, ...(contact?.plane || [0, 1, 0, 0]));
        effect.setFloat4('contactBounds' + i, ...(contact?.bounds || [0, 0, 0, 0]));
      }
      effect.setFloat2('contactWeights', contacts[0]?.weight || 0, contacts[1]?.weight || 0);
    }
    let glow = null, spill = null, optical = null, flareAnchor = null, spillObserver = null, disposed = false, state = null;
    let excludedMeshCount = -1, lightTime = 0;
    const lightTint = B.Color3.White(), bodyTint = B.Color3.White(), surfaceTint = B.Color3.White(), bodyEmission = B.Color3.Black(), haloTint = B.Color3.Black();
    const white = B.Color3.White();
    function color(material, value) {
      if ('albedoColor' in material) material.albedoColor.copyFromFloats(...value);
      else if ('diffuseColor' in material) material.diffuseColor.copyFromFloats(...value);
    }
    function receiveMeshes() {
      for (const mesh of scene.meshes) {
        if (!mesh.metadata?.directorCharacter || !mesh.material || entries.has(mesh) || mesh.isDisposed()) continue;
        const original = mesh.material;
        const ouch = original.clone(`Director Ouch ${mesh.uniqueId}`);
        const trip = original.clone(`Director Trip ${mesh.uniqueId}`);
        if (!ouch || !trip) throw new Error('The character material cannot be edited.');
        color(ouch, [.025, .028, .026]); ouch.emissiveColor = B.Color3.Black();
        color(trip, [1, 1, 1]); trip.emissiveColor = new B.Color3(.35, .35, .35);
        // A future dark albedo image must not repaint Trip's white body.
        if ('albedoTexture' in trip) trip.albedoTexture = null;
        if ('diffuseTexture' in trip) trip.diffuseTexture = null;
        if ('emissiveTexture' in trip) trip.emissiveTexture = null;
        ouch.maxSimultaneousLights = Math.max(10, original.maxSimultaneousLights || 0);
        trip.maxSimultaneousLights = Math.max(10, original.maxSimultaneousLights || 0);
        entries.set(mesh, { original, ouch, trip, outline: mesh.renderOutline, width: mesh.outlineWidth, color: mesh.outlineColor.clone() });
        if (glow) glow.addMesh(mesh, B.Color3.White());
      }
    }
    function followCharacter() {
      if (!spill) return;
      // Effect texture pixels follow the shorter output dimension. This keeps
      // the field's reach consistent when the phone rotates or the gate resizes.
      const engine = scene.getEngine();
      const scale = Math.max(.25, Math.min(2, Math.min(engine.getRenderWidth(), engine.getRenderHeight()) / 802));
      const bleed = Math.max(0, Math.min(1, (state.tripGlow - .15) / .5));
      const kernel = (6 + 42 * bleed * bleed * (3 - 2 * bleed)) * scale;
      // Babylon 9.37.1's non-combine path has a separate active vertical
      // postprocess. Its public setter alone does not update that process, and
      // a resize recreates both. Check the actual processes every render.
      if (glow.blurHorizontalSize !== kernel) glow.blurHorizontalSize = kernel;
      if (glow.blurVerticalSize !== kernel) glow.blurVerticalSize = kernel;
      if (glow._horizontalBlurPostprocess.kernel !== kernel) glow._horizontalBlurPostprocess.kernel = kernel;
      if (glow._verticalBlurPostprocess.kernel !== kernel) glow._verticalBlurPostprocess.kernel = kernel;
      if (flareAnchor) flareAnchor.computeWorldMatrix(true);
      updateContacts();
      // This is a real scene light for nearby sets/props. It must not relight
      // Trip's own white core or the editor's handles.
      if (excludedMeshCount !== scene.meshes.length) {
        spill.excludedMeshes = scene.meshes.filter(mesh => mesh.metadata?.directorCharacter || mesh.metadata?.joint || mesh.metadata?.directorEditorHelper || mesh.metadata?.directorLightEffect);
        excludedMeshCount = scene.meshes.length;
      }
      const anchor = scene.getTransformNodeByName('torso.upper');
      if (anchor && !anchor.isDisposed()) {
        anchor.computeWorldMatrix(true);
        spill.position.copyFrom(anchor.getAbsolutePosition());
      } else {
        for (const mesh of entries.keys()) {
          if (mesh.isDisposed()) continue;
          mesh.computeWorldMatrix(true);
          spill.position.copyFrom(mesh.getBoundingInfo().boundingBox.centerWorld);
          break;
        }
      }
    }
    function ensureGlow() {
      if (glow) return;
      // A concentrated near-surface band, with an explicit steep outer falloff.
      // Stencil excludes the body interior so rounded shading survives. Limit
      // RGB by its peak before additive blending: per-channel clipping would
      // turn a warm/cool exterior band white instead of retaining its hue.
      B.Effect.ShadersStore.directorSharpRadianceVertexShader = 'attribute vec2 position; varying vec2 vUV; void main(){vUV=position*.5+.5;gl_Position=vec4(position,0.,1.);}';
      B.Effect.ShadersStore.directorSharpRadiancePixelShader = `precision highp float;
        varying vec2 vUV; uniform sampler2D textureSampler; uniform float offset;
        uniform mat4 contactInverseVP; uniform vec4 contact0, contact1, contactPlane0, contactPlane1, contactBounds0, contactBounds1; uniform vec2 contactWeights;
        float contactMask(vec3 origin, vec3 ray, vec4 shape, vec4 plane, vec4 bounds, float weight) {
          float denom=dot(plane.xyz,ray); if(weight<=0. || abs(denom)<.000001) return 0.;
          float t=-(dot(plane.xyz,origin)+plane.w)/denom; if(t<0. || t>1.) return 0.;
          vec3 p=origin+ray*t;
          if(p.x<bounds.x || p.x>bounds.y || p.z<bounds.z || p.z>bounds.w) return 0.;
          float r=length((p.xz-shape.xy)/shape.zw);
          return weight*(1.-smoothstep(.65,1.,r));
        }
        void main(){
          vec4 q=texture2D(textureSampler,vUV); float a=smoothstep(.06,.48,q.a);
          if(a<.00001){gl_FragColor=vec4(0.);return;}
          vec3 hue=q.rgb/max(q.a,.0001); vec3 emitted=hue*a; float peak=max(emitted.r,max(emitted.g,emitted.b)); emitted/=max(1.,peak);
          vec4 nearP=contactInverseVP*vec4(vUV*2.-1.,-1.,1.); vec4 farP=contactInverseVP*vec4(vUV*2.-1.,1.,1.);
          vec3 origin=nearP.xyz/nearP.w, ray=farP.xyz/farP.w-origin;
          float contact=max(contactMask(origin,ray,contact0,contactPlane0,contactBounds0,contactWeights.x),contactMask(origin,ray,contact1,contactPlane1,contactBounds1,contactWeights.y));
          gl_FragColor=vec4(emitted*(1.-contact),a);
        }`;

      glow = new B.HighlightLayer('Director Trip luminosity', scene, {
        mainTextureRatio: .5, blurTextureSizeRatio: 1,
        // Compose before editor helper groups clear scene depth/stencil. The
        // surface contour needs the body's mask, including when handles show.
        renderingGroupId: 0,
        mainTextureType: scene.getEngine().getCaps().textureHalfFloatRender ? B.Constants.TEXTURETYPE_HALF_FLOAT : B.Constants.TEXTURETYPE_UNSIGNED_BYTE,
        alphaBlendingMode: B.Constants.ALPHA_ADD,
        blurHorizontalSize: 6, blurVerticalSize: 6,
      });
      glow.innerGlow = false; glow.outerGlow = true;
      // The pinned Babylon merge hook preserves its skinned mask and stencil
      // composition while shaping just this controller's field.
      glow._thinEffectLayer._createMergeEffect = () => scene.getEngine().createEffect('directorSharpRadiance', ['position'], ['offset', 'contactInverseVP', 'contact0', 'contact1', 'contactPlane0', 'contactPlane1', 'contactBounds0', 'contactBounds1', 'contactWeights'], ['textureSampler']);
      const compose = glow._thinEffectLayer._internalCompose.bind(glow._thinEffectLayer);
      glow._thinEffectLayer._internalCompose = (effect, ...args) => { bindContacts(effect); compose(effect, ...args); };
      // The blur composes after Babylon's normal outline pass. Reassert only
      // its exterior silhouette against the body stencil, so radiance may
      // spread beyond a still-readable surface edge. Keep normal depth testing
      // so a set piece in front remains in front.
      glow.onAfterComposeObservable.add(() => {
        if (!state.outline.enabled || state.look !== 'trip') return;
        const engine = scene.getEngine(), renderer = scene.getOutlineRenderer();
        const depthWrite = engine.getDepthWrite(), depthBuffer = engine.getDepthBuffer(), alphaMode = engine.getAlphaMode();
        engine.cacheStencilState();
        engine.setStencilBuffer(true); engine.setStencilFunction(B.Constants.NOTEQUAL);
        engine.setStencilFunctionReference(glow.stencilReference); engine.setStencilMask(0);
        engine.setDepthBuffer(true); engine.setDepthWrite(false); engine.setAlphaMode(B.Constants.ALPHA_DISABLE);
        for (const mesh of entries.keys()) {
          if (mesh.isDisposed() || !mesh.isEnabled() || !mesh.isVisible) continue;
          for (const sub of mesh.subMeshes) renderer.render(sub, mesh._getInstancesRenderList(sub._id));
        }
        engine.setAlphaMode(alphaMode); engine.setDepthBuffer(depthBuffer); engine.setDepthWrite(depthWrite);
        engine.restoreStencilState();
      });
      spill = new B.PointLight('Director Trip light spill', B.Vector3.Zero(), scene);
      spill.metadata = { directorAppearanceLight: true };
      spill.range = 4; spill.radius = .12;
      spillObserver = scene.onBeforeRenderObservable.add(followCharacter);
    }
    function ensureOptical() {
      if (optical) return;
      const head = scene.getTransformNodeByName('head');
      if (!head) return;
      flareAnchor = new B.TransformNode('Director Trip head flare source', scene);
      flareAnchor.parent = head;
      // Use the bound head geometry's center, not the neck joint or torso.
      // Inverse bind space makes this offset follow a posed/rotated head.
      for (const mesh of entries.keys()) {
        const bone = mesh.skeleton?.bones.find(b => b.getTransformNode() === head);
        const positions = mesh.getVerticesData(B.VertexBuffer.PositionKind), indices = mesh.getVerticesData(B.VertexBuffer.MatricesIndicesKind), weights = mesh.getVerticesData(B.VertexBuffer.MatricesWeightsKind);
        if (!bone || !positions || !indices || !weights) continue;
        const index = bone.getIndex(), min = new B.Vector3(Infinity, Infinity, Infinity), max = new B.Vector3(-Infinity, -Infinity, -Infinity);
        for (let v = 0; v < positions.length / 3; v++) {
          if (![0, 1, 2, 3].some(i => indices[v * 4 + i] === index && weights[v * 4 + i] > .75)) continue;
          const p = B.Vector3.TransformCoordinates(B.Vector3.FromArray(positions, v * 3), bone.getInvertedAbsoluteTransform());
          min.minimizeInPlace(p); max.maximizeInPlace(p);
        }
        if (Number.isFinite(min.x)) { flareAnchor.position.copyFrom(min.add(max).scale(.5)); break; }
      }
      flareAnchor.computeWorldMatrix(true);
      if (!globalThis.DirectorOptics) throw new Error('Director head flare requires the optical effects module.');
      optical = globalThis.DirectorOptics.create(scene, flareAnchor, { name: 'Director Trip head optical response' });
    }

    function updateSourceColors() {
      const selected = globalThis.DirectorLightColor?.resolve(state.tripLightColor, lightTime);
      const rgb = selected || temperatureRGB(state.tripTemperature);
      lightTint.copyFromFloats(...rgb);
      const heat = Math.max(0, Math.min(1, (state.tripGlow - .15) / .5));
      const linkedColor = selected && !Number.isFinite(state.tripBodyTemperature);
      const peak = linkedColor ? Math.max(...rgb) : 1;
      // HSL lightness changes emitted energy, not the underlying white paint.
      // Linked colored light tints the surface; at zero it returns to unlit
      // white. An explicit body temperature stays independent of exterior HSL.
      const bodyRGB = linkedColor ? (peak > 0 ? rgb.map(v => v / peak) : [1, 1, 1]) : temperatureRGB(state.tripBodyTemperature ?? state.tripTemperature);
      bodyTint.copyFromFloats(...bodyRGB);
      B.Color3.LerpToRef(white, bodyTint, heat * heat * (3 - 2 * heat) * peak, surfaceTint);
      const emission = .35 + .1 * state.tripGlow;
      if (linkedColor) lightTint.scaleToRef(emission, bodyEmission);
      else surfaceTint.scaleToRef(emission, bodyEmission);
      const bleed = Math.max(0, Math.min(1, (state.tripGlow - .15) / .5));
      lightTint.scaleToRef(4 * bleed * bleed * (3 - 2 * bleed), haloTint);
      for (const [mesh, entry] of entries) {
        if (mesh.isDisposed()) continue;
        color(entry.trip, surfaceTint.asArray());
        entry.trip.emissiveColor.copyFrom(bodyEmission);
      }
      if (spill) { spill.diffuse.copyFrom(lightTint); spill.specular.copyFrom(lightTint); }
      if (optical) optical.apply({ strength: state.look === 'trip' ? state.tripFlare : 0, color: lightTint.asArray(), sourceRadius: .025, lens: state.tripLens });
    }
    function setLightTime(seconds) {
      if (disposed || !Number.isFinite(seconds) || seconds === lightTime) return;
      lightTime = seconds;
      if (state?.look === 'trip' && state.tripLightColor?.mode === 'cycle') updateSourceColors();
    }

    function apply(value = {}) {
      if (disposed) throw new Error('Director appearance has been disposed.');
      state = { look: value.look === 'trip' ? 'trip' : 'ouch', tripGlow: clamp(value.tripGlow, 0, 1, 0),
        tripTemperature: clamp(value.tripTemperature, 1800, 10000, 6500), tripFlare: clamp(value.tripFlare, 0, 1, 0),
        outline: { enabled: value.outline?.enabled === true, tone: clamp(value.outline?.tone, 0, 1, 0), width: clamp(value.outline?.width, .0005, .01, .0025) } };
      // An omitted override keeps existing takes linked to emitted-light
      // temperature. An explicit value controls only the enclosed body.
      if (Number.isFinite(value.tripBodyTemperature)) state.tripBodyTemperature = clamp(value.tripBodyTemperature, 1800, 10000, 6500);
      if (value.tripLightColor && typeof value.tripLightColor === 'object' && !Array.isArray(value.tripLightColor)) state.tripLightColor = structuredClone(value.tripLightColor);
      if (value.tripLens && typeof value.tripLens === 'object' && !Array.isArray(value.tripLens)) state.tripLens = structuredClone(value.tripLens);
      receiveMeshes();
      if (state.look === 'trip' && (state.tripGlow > 0 || state.tripFlare > 0) && entries.size) ensureGlow();
      updateSourceColors();
      for (const [mesh, entry] of entries) {
        if (mesh.isDisposed()) continue;
        mesh.material = entry[state.look];
        mesh.renderOutline = state.outline.enabled;
        mesh.outlineWidth = state.outline.width;
        mesh.outlineColor = new B.Color3(state.outline.tone, state.outline.tone, state.outline.tone);
      }
      if (glow) {
        const g = state.tripGlow, active = state.look === 'trip' && g > 0;
        glow.isEnabled = active;
        for (const mesh of entries.keys()) if (!mesh.isDisposed()) {
          // Babylon retains this Color3 reference; cycling mutates it in place
          // without re-registering masks, meshes, materials or observers.
          glow.addMesh(mesh, haloTint);
        }
        spill.setEnabled(active);
        spill.intensity = active ? 16 * g * g : 0;
        if (state.look === 'trip' && state.tripFlare > 0) ensureOptical();
        if (optical) {
          optical.apply({ strength: state.look === 'trip' ? state.tripFlare : 0, color: lightTint.asArray(), sourceRadius: .025, lens: state.tripLens });
        }
        excludedMeshCount = -1; followCharacter();
      }
      return structuredClone(state);
    }
    function dispose() {
      if (disposed) return;
      disposed = true; glow?.dispose(); optical?.dispose(); flareAnchor?.dispose(); flareAnchor = null; glow = null; optical = null;
      if (spillObserver) scene.onBeforeRenderObservable.remove(spillObserver);
      spill?.dispose(); spill = null; spillObserver = null;
      for (const [mesh, entry] of entries) {
        if (!mesh.isDisposed()) { mesh.material = entry.original; mesh.renderOutline = entry.outline; mesh.outlineWidth = entry.width; mesh.outlineColor = entry.color; }
        entry.ouch.dispose(false, false); entry.trip.dispose(false, false);
      }
      entries.clear(); footCaches.clear(); contacts = [];
    }
    return Object.freeze({ apply, setLightTime, dispose });
  }
  globalThis.DirectorAppearance = Object.freeze({ create });
})();
