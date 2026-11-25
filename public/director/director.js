/* Nest Director: editable glTF poses, stepped takes, and explicit Crew routing. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const B = window.BABYLON;
  const A = window.DirectorAnimation;
  const transitionLabels = { hold: 'Hold · stop motion', linear: 'Linear', 'ease-in': 'Ease in', 'ease-out': 'Ease out', 'ease-in-out': 'Ease in & out' };
  const clone = value => structuredClone(value);
  const draftKey = 'nest.director.draft.v1';
  const currentDraftKey = () => `${draftKey}.${manifest.sha256}`;
  const ui = { ready: false, dirty: true, savedId: null, playing: false, handles: true, start: 1, frame: 1, end: 72, fps: 24, animation: { transition: 'ease-in-out', loop: true }, output: { width: 720, height: 720 }, keys: [], undo: [], redo: [], look: 'ouch', background: 'white' };
  let engine, scene, camera, floor, gizmo, manifest, neutralPose, nodes = {}, morphs = {}, handles = [], selected, savedSnapshot, saveRequest = null, sendRequest = null, savePayload = null;
  let playStart = 0, playFrame = 1, restoring = false, dragBefore = null;
  let cameraBefore = null, cameraWheelTimer = null;
  const label = name => ({ root: 'Whole character', 'torso.lower': 'Lower body', 'torso.upper': 'Torso', head: 'Head', 'upper_arm.L': 'Left shoulder', 'lower_arm.L': 'Left elbow', 'upper_arm.R': 'Right shoulder', 'lower_arm.R': 'Right elbow', 'thigh.L': 'Left hip', 'shin.L': 'Left knee', 'thigh.R': 'Right hip', 'shin.R': 'Right knee' }[name] || name);
  function status(message) { $('status').textContent = message; }
  function cameraState() { return { mode: camera.mode === B.Camera.ORTHOGRAPHIC_CAMERA ? 'orthographic' : 'perspective', position: camera.position.asArray(), target: camera.target.asArray(), fov: camera.fov, orthoSize: camera.orthoTop ? camera.orthoTop * 2 : 1.5 }; }
  function pose() {
    return { bones: Object.fromEntries(Object.entries(nodes).map(([name, node]) => [name, { position: node.position.asArray(), rotation: (node.rotationQuaternion || B.Quaternion.FromEulerVector(node.rotation)).normalize().asArray(), scale: node.scaling.asArray() }])), morphs: Object.fromEntries(manifest.morphs.map(name => [name, morphs[name]?.[0]?.influence || 0])) };
  }
  function snapshot() { return { schema: 'nest-director-take/v2', asset: { id: manifest.id, sha256: manifest.sha256 }, name: $('take-name').value.trim() || 'Untitled take', notes: $('notes').value, look: ui.look, fps: ui.fps, frame: ui.frame, range: { start: ui.start, end: ui.end }, stage: { background: ui.background }, camera: cameraState(), pose: pose(), keyframes: clone(ui.keys), animation: clone(ui.animation), output: clone(ui.output) }; }
  function applyPose(value, refresh = true) {
    scene.animationGroups.forEach(group => group.stop());
    for (const [name, p] of Object.entries(value.bones)) {
      const node = nodes[name]; if (!node) throw new Error(`This model has no ${name} joint.`);
      node.position.copyFromFloats(...p.position); node.rotationQuaternion = B.Quaternion.FromArray(p.rotation).normalize(); node.scaling.copyFromFloats(...p.scale);
    }
    for (const name of manifest.morphs) for (const target of morphs[name] || []) target.influence = value.morphs[name] || 0;
    if (refresh) { syncJoint(); syncPreset(value); }
  }
  function syncPreset(value) {
    const near = (a, b) => a.length === b.length && a.every((n, i) => Math.abs(n - b[i]) < 0.0001);
    const match = manifest.presets.find(p => p.pose && manifest.bones.every(n => ["position", "rotation", "scale"].every(k => near(value.bones[n][k], p.pose.bones[n][k]))) && manifest.morphs.every(n => Math.abs((value.morphs[n] || 0) - (p.pose.morphs[n] || 0)) < 0.0001));
    $("preset").value = match?.id || "";
  }
  function setCamera(value) {
    camera.setTarget(B.Vector3.FromArray(value.target)); camera.setPosition(B.Vector3.FromArray(value.position)); camera.fov = value.fov;
    camera.mode = value.mode === 'orthographic' ? B.Camera.ORTHOGRAPHIC_CAMERA : B.Camera.PERSPECTIVE_CAMERA;
    const size = value.orthoSize || 1.5; camera.orthoTop = size / 2; camera.orthoBottom = -size / 2; fitOrtho();
    $('camera-mode').setAttribute('aria-pressed', String(camera.mode === B.Camera.ORTHOGRAPHIC_CAMERA));
  }
  function restore(take) {
    if (take.asset.id !== manifest.id || take.asset.sha256 !== manifest.sha256) throw new Error('This take uses a different model revision. Its saved pose has been kept; open it with that revision.');
    restoring = true;
    try {
      $('take-name').value = take.name; $('notes').value = take.notes; ui.start = take.range.start; ui.end = take.range.end; ui.fps = take.fps; ui.frame = take.frame; ui.keys = clone(take.keyframes);
      $('fps').value = ui.fps; $('end-frame').value = ui.end; $('frame').max = ui.end; $('scrub').max = ui.end;
      ui.animation = clone(take.animation || { transition: 'hold', loop: true });
      const stageRect = document.querySelector('.stage').getBoundingClientRect();
      setOutput(take.output || { width: 720, height: Math.max(64, Math.round(720 * stageRect.height / stageRect.width)) });
      $('transition').value = ui.animation.transition; $('loop').checked = ui.animation.loop;
      setLook(take.look); setBackground(take.stage.background); setCamera(take.camera); applyPose(take.pose); syncTimeline();
    } finally { restoring = false; }
  }
  function pushHistory(value) { ui.undo.push(clone(value)); if (ui.undo.length > 60) ui.undo.shift(); ui.redo.length = 0; buttons(); }
  function finishCameraHistory() {
    const before = cameraBefore; cameraBefore = null; clearTimeout(cameraWheelTimer);
    if (!before || !camera) return;
    camera.getViewMatrix(true);
    if (JSON.stringify(before.camera) !== JSON.stringify(cameraState())) pushHistory(before);
  }
  function remember(value = snapshot()) { finishCameraHistory(); pushHistory(value); }
  function changed(message = 'Pose changed. Your browser draft is kept here.') {
    if (restoring || !ui.ready) return;
    syncPreset(pose()); ui.dirty = true; saveRequest = null; sendRequest = null;
    try { localStorage.setItem(currentDraftKey(), JSON.stringify(snapshot())); } catch { status('Browser draft storage is full. Use Save take to keep this work.'); }
    $('storage-label').textContent = 'BROWSER DRAFT'; buttons(); status(message);
  }
  function buttons() {
    for (const name of ['save', 'play', 'key-pose', 'handles', 'reset-joint']) $(name).disabled = !ui.ready;
    $('send').disabled = !ui.ready || ui.dirty || !ui.savedId;
    $('undo').disabled = !ui.undo.length; $('redo').disabled = !ui.redo.length;
    const historyText = `${ui.undo.length} back · ${ui.redo.length} forward`;
    if ($('history-count').textContent !== historyText) $('history-count').textContent = historyText;
    $('remove-key').disabled = !ui.keys.some(key => key.frame === ui.frame);
  }
  function setLook(look) {
    ui.look = look;
    for (const mesh of scene.meshes) if (mesh.metadata?.directorCharacter && mesh.material) {
      const color = look === 'trip' ? new B.Color3(.78, .78, .74) : new B.Color3(.025, .028, .026);
      if (mesh.material.albedoColor) mesh.material.albedoColor = color; else mesh.material.diffuseColor = color;
    }
    for (const name of ['ouch', 'trip']) { $(name).classList.toggle('active', name === look); $(name).setAttribute('aria-pressed', String(name === look)); }
    $('look-label').textContent = look.toUpperCase();
  }
  function setBackground(background) {
    ui.background = background; $('background').value = background;
    scene.clearColor = background === 'green' ? new B.Color4(0, .9, .08, 1) : new B.Color4(.953, .957, .941, background === 'transparent' ? 0 : 1);
    floor.setEnabled(background === 'white');
    $('room').style.background = background === 'transparent' ? 'repeating-conic-gradient(#d8dcd7 0% 25%, #eef0eb 0% 50%) 50% / 24px 24px' : 'transparent';
    $('room-title').textContent = background === 'white' ? ' THE WHITE ROOM ' : background === 'green' ? ' GREEN SCREEN ' : ' TRANSPARENT STAGE ';
  }
  function selectJoint(name) {
    selected = name; $('joint').value = name;
    gizmo.attachToNode(ui.handles ? nodes[name] : null);
    for (const handle of handles) handle.scaling.setAll(handle.metadata.joint === name ? 1.4 : 1);
    syncJoint(); $('hint').textContent = `${label(name)} · hold a dot to move; drag a ring to rotate`;
  }
  function syncJoint() {
    if (!selected || !nodes[selected]) return;
    const rest = B.Quaternion.FromArray(neutralPose.bones[selected].rotation);
    const q = nodes[selected].rotationQuaternion || B.Quaternion.Identity();
    const angles = rest.conjugate().multiply(q).toEulerAngles();
    ['x', 'y', 'z'].forEach(axis => { const degrees = Math.round(angles[axis] * 180 / Math.PI); $('rot-' + axis).value = degrees; $('value-' + axis).value = degrees + '°'; });
    const root = nodes.root;
    if (root) ['x', 'y', 'z'].forEach(axis => { $('pos-' + axis).value = root.position[axis]; $('pos-value-' + axis).value = root.position[axis].toFixed(2); });
    for (const input of document.querySelectorAll('[data-morph]')) input.value = morphs[input.dataset.morph]?.[0]?.influence || 0;
  }
  function resizeStage() {
    if (!engine) return;
    const stage = document.querySelector('.stage'), box = $('frame-window');
    const width = stage.clientWidth, height = stage.clientHeight, aspect = ui.output.width / ui.output.height;
    const fittedWidth = Math.min(width, height * aspect);
    box.style.width = fittedWidth + 'px'; box.style.height = fittedWidth / aspect + 'px';
    engine.resize(); fitOrtho();
  }
  function setOutput(value) {
    ui.output = clone(value);
    $('output-width').value = value.width; $('output-height').value = value.height;
    const option = `${value.width}x${value.height}`;
    $('frame-size').value = [...$('frame-size').options].some(o => o.value === option) ? option : 'custom';
    resizeStage();
  }
  function syncTimeline(rebuild = true) {
    $('frame').value = ui.frame; $('scrub').value = ui.frame;
    if (rebuild) {
      $('fps').value = ui.fps; $('end-frame').value = ui.end;
      $('duration').value = Number(((ui.end - ui.start + 1) / ui.fps).toFixed(3));
      $('duration').min = 1 / ui.fps;
      for (const id of ['frame', 'scrub', 'key-frame']) { $(id).min = ui.start; $(id).max = ui.end; }
      $('timing-label').textContent = transitionLabels[ui.animation.transition];
      const previous = $('key-select').value;
      $('key-select').replaceChildren(...ui.keys.map(k => new Option(`Frame ${k.frame} · ${((k.frame - ui.start) / ui.fps).toFixed(2)}s`, k.frame)));
      if (!ui.keys.length) $('key-select').append(new Option('No keys yet', ''));
      const exact = ui.keys.find(k => k.frame === ui.frame);
      $('key-select').value = String(exact?.frame ?? (ui.keys.some(k => String(k.frame) === previous) ? previous : ui.keys[0]?.frame ?? ''));
      syncKeyEditor();
      $('keys').replaceChildren();
      for (const key of ui.keys) {
        const button = document.createElement('button'); button.className = 'key-dot'; button.dataset.frame = key.frame;
        button.style.left = ((key.frame - ui.start) / Math.max(ui.end - ui.start, 1) * 100) + '%';
        button.title = `Keyed pose · frame ${key.frame}`; button.setAttribute('aria-label', button.title);
        button.onclick = () => { stop(); scrub(key.frame); }; $('keys').append(button);
      }
    }
    for (const dot of $('keys').children) dot.classList.toggle('current', Number(dot.dataset.frame) === ui.frame);
    buttons();
  }
  function syncKeyEditor() {
    const key = ui.keys.find(k => String(k.frame) === $('key-select').value);
    for (const id of ['key-frame', 'move-key', 'key-transition']) $(id).disabled = !key;
    $('key-frame').value = key?.frame || ui.frame;
    $('key-transition').value = key?.transition || 'inherit';
    const next = key && ui.keys.find(k => k.frame > key.frame);
    $('key-description').textContent = next ? `This transition runs from frame ${key.frame} to ${next.frame}.` : key ? 'This is the final key. Its pose holds to the end.' : 'Key two poses to make a motion.';
  }
  function scrub(frame, playing = false) {
    ui.frame = Math.max(ui.start, Math.min(ui.end, Math.round(frame)));
    const sampled = A.samplePose(ui.keys, ui.frame, ui.animation.transition); if (sampled) applyPose(sampled, !playing);
    syncTimeline(!playing); if (!playing) changed(`Frame ${ui.frame}. Key the pose when it is ready.`);
  }
  function changeTiming(end, fps, scaleKeys) {
    stop();
    if (!Number.isInteger(end) || end < ui.start || end > Math.min(36000, ui.start + 9999)) { syncTimeline(); status('Choose a length from 1 to 10,000 frames.'); return; }
    let keys = ui.keys;
    if (scaleKeys) {
      const result = A.retimeKeyframes(keys, ui.start, ui.end, end);
      if (!result.ok) { syncTimeline(); status(result.error); return; }
      keys = result.keyframes;
    } else if (keys.some(k => k.frame > end)) { syncTimeline(); status('A key is beyond that end frame. Scale the key spacing or move the key first.'); return; }
    remember();
    const position = ui.end === ui.start ? 0 : (ui.frame - ui.start) / (ui.end - ui.start);
    ui.frame = scaleKeys ? Math.round(ui.start + position * (end - ui.start)) : Math.min(ui.frame, end);
    ui.end = end; ui.fps = fps; ui.keys = keys;
    const sampled = A.samplePose(keys, ui.frame, ui.animation.transition); if (sampled) applyPose(sampled);
    syncTimeline(); changed(`Timing updated: ${((end - ui.start + 1) / fps).toFixed(2)} seconds at ${fps} fps.`);
  }
  function motionSamples() {
    if (!ui.keys.length) return [];
    // A bounded set for camera staging, including interior rotation arcs.
    const frames = new Set(ui.keys.length <= 16 ? ui.keys.map(k => k.frame) : []);
    for (let i = 0; i <= 16; i++) frames.add(Math.round(ui.start + (ui.end - ui.start) * i / 16));
    return [...frames].map(f => A.samplePose(ui.keys, f, ui.animation.transition)).filter(Boolean);
  }
  function frameMotion() {
    stop(); remember();
    if (frameDirectorCharacter(scene, camera, $('room'), motionSamples())) { fitOrtho(); changed('Motion framed with one fixed camera.'); }
  }
  function loadExample() {
    stop(); remember();
    const nerve = $('motion-example').value === 'nerve';
    const ids = nerve ? ['acting-defeated','acting-relaxed','acting-ready','acting-victorious'] : ['acting-relaxed','acting-victorious','acting-blasted','acting-falling'];
    const times = nerve ? [0,.65,1.6,3] : [0,.9,1.6,3];
    ui.start = 1; ui.fps = 24; ui.end = 72; ui.frame = 1; ui.animation = { transition: 'ease-in-out', loop: false };
    ui.keys = ids.map((id,i) => ({ frame: 1 + Math.round(times[i] / 3 * 71), pose: clone(manifest.presets.find(p => p.id === id).pose), ...(!nerve && i === 2 ? { transition: 'ease-in' } : {}) }));
    $('take-name').value = nerve ? 'Find some nerve' : 'There goes the plan';
    $('transition').value = ui.animation.transition; $('loop').checked = false;
    applyPose(ui.keys[0].pose); syncTimeline();
    frameDirectorCharacter(scene, camera, $('room'), motionSamples()); fitOrtho();
    changed('Four editable poses loaded. Press Play, or change a pose and key it. Undo restores your previous take.');
  }

/* Manual Frame action: fit the visible, evaluated character; preserve view direction.
   Call frameDirectorCharacter(scene, camera, canvas), then fitOrtho()/changed().
   No default camera, resize handler, pose or saved take is changed automatically. */
function frameDirectorCharacter(scene, camera, canvas, samplePoses = []) {
  const B = BABYLON;
  const rect = canvas.getBoundingClientRect();
  if (rect.width < 1 || rect.height < 1) return null;
  scene.render(); // flush current linked-node, skin and morph state before measuring
  camera.getViewMatrix(true);
  const outward = camera.position.subtract(camera.target).normalize();
  if (outward.lengthSquared() < .5) return null;
  let right = B.Vector3.Cross(camera.upVector, outward);
  if (right.lengthSquared() < 1e-8) right = B.Vector3.Cross(new B.Vector3(0, 0, 1), outward);
  if (right.lengthSquared() < 1e-8) return null;
  right.normalize();
  const up = B.Vector3.Cross(outward, right).normalize();
  const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
  const point = new B.Vector3();
  let count = 0;
  const originalPose = pose();
  try {
  for (const sample of samplePoses.length ? samplePoses : [null]) {
    if (sample) { applyPose(sample, false); scene.render(); }
  for (const mesh of scene.meshes) {
    if (!mesh.metadata?.directorCharacter || !mesh.isEnabled() || !mesh.getTotalVertices()) continue;
    mesh.skeleton?.prepare(true); // refresh linked bone transforms even within the same render frame
    const positions = mesh.getPositionData(true, true); // skeleton and morphs, not the construction-rest bounds
    if (!positions) continue;
    const world = mesh.computeWorldMatrix(true);
    for (let i = 0; i < positions.length; i += 3) {
      B.Vector3.TransformCoordinatesFromFloatsToRef(positions[i], positions[i + 1], positions[i + 2], world, point);
      const x = B.Vector3.Dot(point, right), y = B.Vector3.Dot(point, up), z = B.Vector3.Dot(point, outward);
      if (!Number.isFinite(x + y + z)) continue;
      lo[0] = Math.min(lo[0], x); hi[0] = Math.max(hi[0], x);
      lo[1] = Math.min(lo[1], y); hi[1] = Math.max(hi[1], y);
      lo[2] = Math.min(lo[2], z); hi[2] = Math.max(hi[2], z);
      count++;
    }
  }
  }
  } finally { if (samplePoses.length) applyPose(originalPose); }
  if (!count) return null;
  const center = right.scale((lo[0] + hi[0]) / 2).add(up.scale((lo[1] + hi[1]) / 2)).add(outward.scale((lo[2] + hi[2]) / 2));
  const halfX = Math.max(.001, (hi[0] - lo[0]) / 2), halfY = Math.max(.001, (hi[1] - lo[1]) / 2), halfZ = Math.max(.001, (hi[2] - lo[2]) / 2);
  const aspect = rect.width / rect.height;
  const padX = Math.min(32, rect.width * .08), padY = Math.min(56, rect.height * .20);
  const usableX = Math.max(.2, 1 - 2 * padX / rect.width), usableY = Math.max(.2, 1 - 2 * padY / rect.height);
  const near = Math.max(.001, camera.minZ || .01);
  let distance;
  if (camera.mode === B.Camera.ORTHOGRAPHIC_CAMERA) {
    const half = Math.max(halfY / usableY, halfX / (aspect * usableX)) * 1.04;
    camera.orthoTop = half; camera.orthoBottom = -half;
    camera.orthoLeft = -half * aspect; camera.orthoRight = half * aspect;
    distance = Math.max(camera.radius || 1, halfZ + 2 * near);
  } else {
    const tangent = Math.tan(Math.max(.05, Math.min(3, camera.fov)) / 2);
    const tanY = camera.fovMode === B.Camera.FOVMODE_HORIZONTAL_FIXED ? tangent / aspect : tangent;
    const tanX = tanY * aspect;
    distance = halfZ + Math.max(halfX / (tanX * usableX), halfY / (tanY * usableY), 2 * near) * 1.04;
  }
  distance = Math.max(distance, camera.lowerRadiusLimit || .01);
  if (camera.upperRadiusLimit != null && distance > camera.upperRadiusLimit) camera.upperRadiusLimit = distance * 1.1;
  camera.setTarget(center);
  camera.setPosition(center.add(outward.scale(distance)));
  camera.maxZ = Math.max(camera.maxZ || 1000, distance + halfZ + 1);
  camera.getViewMatrix(true);
  return { vertices: count, radius: camera.radius, aspect, padding: { x: padX, y: padY }, mode: camera.mode === B.Camera.ORTHOGRAPHIC_CAMERA ? 'orthographic' : 'perspective' };
}

  function fitOrtho() { if (!camera) return; const half = camera.orthoTop || .75; const ratio = engine.getRenderWidth() / engine.getRenderHeight(); camera.orthoLeft = -half * ratio; camera.orthoRight = half * ratio; }
  function stop() { ui.playing = false; $('play').textContent = '▶'; $('play').setAttribute('aria-label', 'Play take'); }
  async function api(url = '', options = {}) {
    const response = await fetch('/api/director' + url, { credentials: 'same-origin', ...options, headers: { 'Content-Type': 'application/json', ...(options.headers || {}) } });
    let value; try { value = await response.json(); } catch { throw new Error(response.status === 401 ? 'Sign in again to save this take. Your browser draft is still here.' : 'The save service did not return a usable response. Your draft is still here.'); }
    if (!response.ok) throw new Error(value.error || 'The request could not be completed.'); return value;
  }
  async function refreshTakes() {
    try {
      const result = await api(); const records = result.takes || result.records || [];
      $('saved-takes').replaceChildren();
      if (!records.length) { const p = document.createElement('p'); p.className = 'small'; p.textContent = 'No saved takes yet.'; $('saved-takes').append(p); }
      for (const record of records) {
        const button = document.createElement('button'); button.className = 'saved-take'; button.textContent = record.name || record.take?.name || 'Untitled take';
        const small = document.createElement('small'); small.textContent = new Date(record.createdAt || record.savedAt).toLocaleString(); button.append(small);
        button.onclick = () => loadTake(record.id); $('saved-takes').append(button);
      }
    } catch (error) { $('saved-takes').textContent = error.message; }
  }
  async function loadTake(id, preserveDraft = true) {
    stop();
    try { const result = await api('?id=' + encodeURIComponent(id)); const record = result.saved || result.record || result; const take = record.take || result.take; if (take.asset.sha256 !== manifest.sha256) { if (preserveDraft) localStorage.setItem(currentDraftKey(), JSON.stringify(snapshot())); location.assign('/director?take=' + encodeURIComponent(id) + '&asset=' + encodeURIComponent(take.asset.sha256)); return; } remember(); restore(take); ui.savedId = record.id || id; sendRequest = null; ui.dirty = false; savedSnapshot = JSON.stringify(snapshot()); try { localStorage.setItem(currentDraftKey(), savedSnapshot); } catch {} $('storage-label').textContent = result.shared === false ? 'LOCAL WORKSPACE' : 'SAVED IN NEST'; buttons(); status('Saved take reopened. The pose, stage and frames are editable.'); }
    catch (error) { status(error.message); }
  }
  function bind() {
    $('joint').onchange = () => selectJoint($('joint').value);
    $('preset').onchange = () => { stop(); remember(); const preset = manifest.presets.find(p => p.id === $('preset').value); if (!preset?.pose) return; applyPose(preset.pose); changed(`${preset.label} start. Pose it your way, then key a frame.`); };
    for (const input of document.querySelectorAll('#rotation-controls input,#position-controls input')) {
      input.addEventListener('pointerdown', () => { stop(); syncJoint(); dragBefore = snapshot(); });
      input.addEventListener('keydown', e => { if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'].includes(e.key) && !dragBefore) { stop(); syncJoint(); dragBefore = snapshot(); } });
      input.addEventListener('input', () => {
        stop();
        if (input.id.startsWith('rot')) {
          const rest = B.Quaternion.FromArray(neutralPose.bones[selected].rotation);
          const angles = rest.conjugate().multiply(nodes[selected].rotationQuaternion || B.Quaternion.Identity()).toEulerAngles();
          angles[input.id.slice(-1)] = Number(input.value) * Math.PI / 180;
          nodes[selected].rotationQuaternion = rest.multiply(B.Quaternion.FromEulerVector(angles)).normalize();
        } else nodes.root.position[input.id.slice(-1)] = Number(input.value);
        syncJoint(); changed();
      });
      input.addEventListener('change', () => { if (dragBefore) remember(dragBefore); dragBefore = null; });
    }
    $('reset-joint').onclick = () => { stop(); remember(); const p = pose(); p.bones[selected] = clone(neutralPose.bones[selected]); applyPose(p); changed('Selected joint reset.'); };
    $('handles').onclick = () => { ui.handles = !ui.handles; handles.forEach(handle => handle.setEnabled(ui.handles)); gizmo.attachToNode(ui.handles ? nodes[selected] : null); $('handles').textContent = 'Joint controls ' + (ui.handles ? 'on' : 'off'); $('handles').setAttribute('aria-pressed', String(ui.handles)); $('hint').textContent = ui.handles ? label(selected) + ' · drag a colored ring to rotate' : 'Controls hidden · drag the room to orbit the camera'; };
    for (const look of ['ouch', 'trip']) $(look).onclick = () => { remember(); setLook(look); changed(`Same character, ${look === 'trip' ? 'white' : 'black'} clay.`); };
    $('background').onchange = () => { remember(); setBackground($('background').value); changed('Stage background changed.'); };
    for (const id of ['take-name', 'notes']) {
      let before = null;
      $(id).addEventListener('focus', () => { if (ui.ready) before = snapshot(); });
      $(id).addEventListener('input', () => changed('Take details updated.'));
      $(id).addEventListener('change', () => { if (before && JSON.stringify(before) !== JSON.stringify(snapshot())) remember(before); before = null; });
    }
    $('key-pose').onclick = () => { stop(); remember(); const previous = ui.keys.find(key => key.frame === ui.frame); ui.keys = ui.keys.filter(key => key.frame !== ui.frame); ui.keys.push({ frame: ui.frame, pose: pose(), ...(previous?.transition ? { transition: previous.transition } : {}) }); ui.keys.sort((a, b) => a.frame - b.frame); syncTimeline(); changed(`Pose keyed at frame ${ui.frame}.`); };
    $('remove-key').onclick = () => { stop(); remember(); ui.keys = ui.keys.filter(key => key.frame !== ui.frame); syncTimeline(); changed('Key removed.'); };
    $('frame').onchange = () => { stop(); scrub(Number($('frame').value)); }; $('scrub').oninput = () => { stop(); scrub(Number($('scrub').value)); };
    $('end-frame').onchange = () => changeTiming(Math.round(Number($('end-frame').value)), ui.fps, $('retime-keys').checked);
    $('duration').onchange = () => changeTiming(ui.start + Math.round(Number($('duration').value) * ui.fps) - 1, ui.fps, $('retime-keys').checked);
    $('fps').onchange = () => { const fps = Math.max(1, Math.min(60, Math.round(Number($('fps').value) || ui.fps))); const seconds = $('fps-behavior').value === 'seconds'; changeTiming(seconds ? ui.start + Math.round((ui.end - ui.start + 1) / ui.fps * fps) - 1 : ui.end, fps, seconds); };
    $('transition').onchange = () => { stop(); remember(); ui.animation.transition = $('transition').value; const sampled = A.samplePose(ui.keys, ui.frame, ui.animation.transition); if (sampled) applyPose(sampled); syncTimeline(); changed('Motion between keys updated.'); };
    $('loop').onchange = () => { stop(); remember(); ui.animation.loop = $('loop').checked; changed(ui.animation.loop ? 'Playback will loop.' : 'Playback will stop on the final frame.'); };
    $('key-select').onchange = () => { const frame = Number($('key-select').value); if (ui.keys.some(k => k.frame === frame)) { stop(); scrub(frame); } };
    $('key-transition').onchange = () => { const key = ui.keys.find(k => String(k.frame) === $('key-select').value); if (!key) return; stop(); remember(); const value = $('key-transition').value; if (value === 'inherit') delete key.transition; else key.transition = value; const sampled = A.samplePose(ui.keys, ui.frame, ui.animation.transition); if (sampled) applyPose(sampled); syncTimeline(); changed(`Motion leaving frame ${key.frame} updated.`); };
    $('move-key').onclick = () => {
      const key = ui.keys.find(k => String(k.frame) === $('key-select').value), frame = Number($('key-frame').value);
      if (!key) return;
      if (!Number.isInteger(frame) || frame < ui.start || frame > ui.end || ui.keys.some(k => k !== key && k.frame === frame)) { syncKeyEditor(); status('Choose an unused frame within this take.'); return; }
      stop(); remember(); key.frame = frame; ui.keys.sort((a,b) => a.frame-b.frame); ui.frame = frame; applyPose(key.pose); syncTimeline(); changed('Key moved.');
    };
    $('load-example').onclick = loadExample; $('frame-motion').onclick = frameMotion;
    $('motion-settings').onclick = () => { document.querySelector('.animation-panel').scrollIntoView({behavior: 'smooth', block: 'start'}); $('transition').focus({preventScroll: true}); };
    const outputChanged = () => {
      const width = Number($('output-width').value), height = Number($('output-height').value);
      if (![width,height].every(v => Number.isInteger(v) && v >= 64 && v <= 4096) || width*height > 4096*2160) { setOutput(ui.output); status('Use whole-pixel dimensions from 64 to 4096, up to 8.8 million pixels.'); return; }
      stop(); remember(); setOutput({width,height}); changed(`Frame size: ${width} × ${height}. Use Frame to fit the pose if needed.`);
    };
    $('output-width').onchange = outputChanged; $('output-height').onchange = outputChanged;
    $('frame-size').onchange = () => { if ($('frame-size').value === 'custom') { $('output-width').focus(); return; } const [width,height] = $('frame-size').value.split('x'); $('output-width').value = width; $('output-height').value = height; outputChanged(); };
    $('play').onclick = () => { if (ui.playing) { stop(); syncJoint(); syncPreset(pose()); } else if (!ui.keys.length) status('Key at least one pose to play a take.'); else { if (ui.frame >= ui.end) scrub(ui.start); ui.playing = true; playStart = performance.now(); playFrame = ui.frame; $('play').textContent = 'Ⅱ'; $('play').setAttribute('aria-label', 'Pause take'); } };
    for (const direction of ['undo', 'redo']) $(direction).onclick = () => { finishCameraHistory(); const from = ui[direction], to = ui[direction === 'undo' ? 'redo' : 'undo']; if (!from.length) return; stop(); to.push(snapshot()); restore(from.pop()); changed(direction === 'undo' ? 'Undone.' : 'Redone.'); };
    for (const [id, alpha] of [['front', Math.PI / 2], ['side', 0], ['quarter', Math.PI / 2 - .35]]) $(id).onclick = () => { remember(); camera.alpha = alpha; camera.beta = Math.PI / 2 - .11; changed('Camera view updated.'); };
    $('frame-character').onclick = () => { stop(); remember(); if (frameDirectorCharacter(scene, camera, $('room'))) { fitOrtho(); changed('Whole character framed. Your pose is unchanged.'); } };
    $('camera-mode').onclick = () => { remember(); camera.mode = camera.mode === B.Camera.ORTHOGRAPHIC_CAMERA ? B.Camera.PERSPECTIVE_CAMERA : B.Camera.ORTHOGRAPHIC_CAMERA; fitOrtho(); $('camera-mode').setAttribute('aria-pressed', String(camera.mode === B.Camera.ORTHOGRAPHIC_CAMERA)); changed('Camera projection updated.'); };
    $('save').onclick = async () => {
      stop(); $('save').disabled = true; const take = snapshot(), serialized = JSON.stringify(take); if (savePayload !== serialized) saveRequest = null; savePayload = serialized; saveRequest ||= crypto.randomUUID();
      try { const result = await api('', { method: 'POST', body: JSON.stringify({ take, requestId: saveRequest }) }); const record = result.saved || result.record || result; ui.savedId = record.id || result.id; ui.dirty = JSON.stringify(snapshot()) !== serialized; savedSnapshot = serialized; $('storage-label').textContent = result.shared === false ? 'LOCAL WORKSPACE' : 'SAVED IN NEST'; status(result.shared === false ? 'Take saved in this development workspace. Shared Nest storage is not connected here.' : 'Take saved in Nest. Crew can receive this exact version.'); await refreshTakes(); }
      catch (error) { status(error.message); } finally { buttons(); }
    };
    $('send').onclick = async () => {
      if (ui.dirty || !ui.savedId) return; $('send').disabled = true; sendRequest ||= crypto.randomUUID();
      try { const result = await api('', { method: 'POST', body: JSON.stringify({ action: 'send', id: ui.savedId, requestId: sendRequest }) }); status(result.shared === false ? 'Crew route recorded locally for testing. No live Crew message was sent.' : 'Sent to Crew with the saved pose, camera and timeline.'); }
      catch (error) { status(error.message); } finally { buttons(); }
    };
    $('refresh-takes').onclick = refreshTakes;
    document.addEventListener('keydown', e => { if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return; if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); $(e.shiftKey ? 'redo' : 'undo').click(); } if (e.code === 'Space') { e.preventDefault(); $('play').click(); } });
    $('room').addEventListener('pointerdown', () => { if (ui.ready) { finishCameraHistory(); stop(); camera.getViewMatrix(true); cameraBefore = snapshot(); } });
    $('room').addEventListener('pointerup', () => { finishCameraHistory(); if (ui.ready && !gizmo.gizmos.rotationGizmo.isDragging) changed('Camera and pose kept in your browser draft.'); });
    $('room').addEventListener('pointercancel', finishCameraHistory);
    $('room').addEventListener('wheel', () => {
      if (!ui.ready) return;
      if (!cameraBefore) { stop(); camera.getViewMatrix(true); cameraBefore = snapshot(); }
      clearTimeout(cameraWheelTimer);
      cameraWheelTimer = setTimeout(() => { finishCameraHistory(); changed('Camera zoom kept in your browser draft.'); }, 180);
    }, {passive:true});
    window.addEventListener('beforeunload', event => { if (ui.ready && ui.dirty && ui.keys.length) { event.preventDefault(); event.returnValue = ''; } });
  }
  async function start() {
    if (!A) throw new Error('The animation tools did not load. Reload to try again.');
    if (!B) throw new Error('The room renderer did not load. Reload to try again; saved takes are kept.');
    const indexResponse = await fetch('/director/assets/index.json');
    const index = indexResponse.ok ? await indexResponse.json() : null;
    const requestedHash = new URL(location.href).searchParams.get('asset');
    const manifestFile = requestedHash ? index?.assets.find(a => a.sha256 === requestedHash)?.manifest : index?.current || 'ouch-director.json';
    if (!manifestFile || /[\/]/.test(manifestFile)) throw new Error('That character revision is not available in this room. The saved take is unchanged.');
    manifest = await fetch('/director/assets/' + manifestFile).then(r => { if (!r.ok) throw new Error('The character manifest could not be loaded.'); return r.json(); });
    neutralPose = manifest.presets.find(p => p.id === 'neutral')?.pose || manifest.restPose;
    engine = new B.Engine($('room'), true, { preserveDrawingBuffer: true, stencil: true, alpha: true });
    // Babylon's scaling level is inverse resolution. Keep phones sharp without
    // asking high-density screens to render an unbounded number of pixels.
    engine.setHardwareScalingLevel(1 / Math.min(devicePixelRatio || 1, 2));
    scene = new B.Scene(engine); scene.useRightHandedSystem = true;
    camera = new B.ArcRotateCamera('Director camera', Math.PI / 2 - .35, Math.PI / 2 - .11, 2.1, new B.Vector3(0, .56, 0), scene);
    camera.attachControl($('room'), true); camera.inertia = 0; camera.lowerRadiusLimit = .4; camera.upperRadiusLimit = 7; camera.wheelDeltaPercentage = .025; camera.panningSensibility = 900; camera.minZ = .01; camera.fov = .62; camera.orthoTop = .74; camera.orthoBottom = -.74;
    const fill = new B.HemisphericLight('Room fill', new B.Vector3(0, 1, 0), scene); fill.intensity = .8; fill.groundColor = new B.Color3(.55, .58, .54);
    const key = new B.DirectionalLight('Window light', new B.Vector3(.4, -1, -.5), scene); key.position = new B.Vector3(-2, 4, 3); key.intensity = 1.3; key.shadowFrustumSize = 3; key.shadowMinZ = .1; key.shadowMaxZ = 10;
    const shadows = new B.ShadowGenerator(1024, key); shadows.usePercentageCloserFiltering = true; shadows.filteringQuality = B.ShadowGenerator.QUALITY_HIGH; shadows.setDarkness(.25); shadows.bias = .001;
    floor = B.MeshBuilder.CreateGround('White room floor', { width: 200, height: 200 }, scene); floor.position.y = -.005; floor.isPickable = false; floor.receiveShadows = true;
    const floorMat = new B.StandardMaterial('White plaster', scene); floorMat.diffuseColor = new B.Color3(.95, .955, .94); floorMat.specularColor = B.Color3.Black(); floor.material = floorMat;
    const result = await B.SceneLoader.ImportMeshAsync('', '/director/assets/', manifest.file, scene);
    result.animationGroups.forEach(group => group.stop());
    for (const name of manifest.bones) { const node = scene.getTransformNodeByName(name) || result.skeletons.flatMap(skeleton => skeleton.bones).find(bone => bone.name === name)?.getTransformNode(); if (!node) throw new Error(`The model is missing its ${name} control.`); nodes[name] = node; }
    for (const mesh of result.meshes) {
      if (!mesh.getTotalVertices()) continue;
      mesh.metadata = { ...mesh.metadata, directorCharacter: true }; shadows.addShadowCaster(mesh); mesh.receiveShadows = false; mesh.isPickable = false;
      const manager = mesh.morphTargetManager;
      if (manager) for (let i = 0; i < manager.numTargets; i++) { const target = manager.getTarget(i); (morphs[target.name] ||= []).push(target); }
    }
    gizmo = new B.GizmoManager(scene); gizmo.usePointerToAttachGizmos = false; gizmo.rotationGizmoEnabled = true; gizmo.gizmos.rotationGizmo.scaleRatio = .65;
    gizmo.gizmos.rotationGizmo.onDragStartObservable.add(() => { stop(); dragBefore = snapshot(); });
    gizmo.gizmos.rotationGizmo.onDragEndObservable.add(() => { if (dragBefore) remember(dragBefore); dragBefore = null; syncJoint(); changed(); });
    for (const name of manifest.bones) {
      const handle = B.MeshBuilder.CreateSphere('Joint handle ' + name, { diameter: .022, segments: 8 }, scene); handle.parent = nodes[name]; handle.metadata = { joint: name }; handle.renderingGroupId = 2;
      const material = new B.StandardMaterial('Control ' + name, scene); material.disableLighting = true; material.emissiveColor = name.endsWith('.L') ? B.Color3.FromHexString('#709bc2') : name.endsWith('.R') ? B.Color3.FromHexString('#8bb99c') : B.Color3.FromHexString('#c4a06f'); handle.material = material; handles.push(handle);
    }
    scene.onPointerObservable.add(info => {
      if (info.type === B.PointerEventTypes.POINTERPICK && info.pickInfo?.pickedMesh?.metadata?.joint) selectJoint(info.pickInfo.pickedMesh.metadata.joint);
      if (info.type !== B.PointerEventTypes.POINTERTAP || info.event.pointerType !== 'touch' || !ui.handles) return;
      // A fingertip needs a stable screen-sized target, even when the joint dot
      // is small. The utility layer handles ring drags before this scene tap.
      const rect = $('room').getBoundingClientRect();
      const viewport = new B.Viewport(0, 0, rect.width, rect.height);
      let nearest = null, distance = 22;
      for (const handle of handles) {
        if (!handle.isEnabled()) continue;
        const screen = B.Vector3.Project(handle.getAbsolutePosition(), B.Matrix.Identity(), scene.getTransformMatrix(), viewport);
        if (screen.z < 0 || screen.z > 1) continue;
        const d = Math.hypot(screen.x - (info.event.clientX - rect.left), screen.y - (info.event.clientY - rect.top));
        if (d < distance) { distance = d; nearest = handle.metadata.joint; }
      }
      if (nearest) selectJoint(nearest);
    });
    $('joint').replaceChildren(...manifest.bones.map(name => new Option(label(name), name))); $('joint').disabled = false;
    $('preset').replaceChildren(new Option('Custom pose', ''), ...manifest.presets.map(preset => new Option(preset.label, preset.id))); $('preset').disabled = false; $('preset').value = 'neutral';
    for (const name of manifest.morphs.filter(name => !/overhead|shoulder/i.test(name))) {
      const wrap = document.createElement('label'); wrap.textContent = name.replace(/^Ouch \| /, ''); const input = document.createElement('input'); input.type = 'range'; input.min = 0; input.max = 1; input.step = .01; input.value = 0; input.dataset.morph = name; input.setAttribute('aria-label', wrap.textContent); input.onpointerdown = () => { stop(); syncJoint(); dragBefore = snapshot(); }; input.onkeydown = e => { if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End','PageUp','PageDown'].includes(e.key) && !dragBefore) { stop(); syncJoint(); dragBefore = snapshot(); } }; input.oninput = () => { stop(); for (const target of morphs[name] || []) target.influence = Number(input.value); changed(); }; input.onchange = () => { if (dragBefore) remember(dragBefore); dragBefore = null; }; wrap.append(input); $('morph-controls').append(wrap);
    }
    let directBefore = null;
    if (!window.DirectorDirectManipulation) throw new Error('Direct joint controls did not load. Reload to try again.');
    window.DirectorDirectManipulation.install({
      canvas: $('room'), scene, camera, getHandles: () => handles, getNodes: () => nodes,
      isEnabled: () => ui.ready && ui.handles,
      onSelect: name => selectJoint(name),
      onPending: ({name}) => { $('hint').textContent = `Hold ${label(name).toLowerCase()} to reposition`; },
      onStart: ({name}) => { stop(); directBefore = snapshot(); gizmo.attachToNode(null); $('hint').textContent = `Drag ${label(name).toLowerCase()} · release to place`; },
      onMove: () => syncJoint(),
      onEnd: ({started,moved,cancelled}) => {
        syncJoint(); gizmo.attachToNode(ui.handles ? nodes[selected] : null);
        if (started && moved && !cancelled && directBefore) { remember(directBefore); changed('Joint repositioned. Key this pose to put it in the motion.'); }
        else if (cancelled) status('Repositioning cancelled. The joint is back where it started.');
        directBefore = null;
        $('hint').textContent = `${label(selected)} · hold a dot to move; drag a ring to rotate`;
      }
    });
    applyPose(neutralPose); setLook('ouch'); setBackground('white'); setOutput(ui.output); fitOrtho(); selectJoint('upper_arm.L'); bind(); ui.ready = true; syncTimeline(); buttons();
    $('loading').hidden = true; status('Ouch is ready. Pick a gesture or move a joint.');
    engine.runRenderLoop(() => { if (ui.playing) { const elapsed = playFrame - ui.start + Math.floor((performance.now() - playStart) / 1000 * ui.fps); const count = ui.end - ui.start + 1; const frame = ui.animation.loop ? ui.start + (elapsed % count) : Math.min(ui.end, ui.start + elapsed); if (frame !== ui.frame) scrub(frame, true); if (!ui.animation.loop && elapsed >= count) { stop(); syncJoint(); syncPreset(pose()); } } scene.render(); });
    window.addEventListener('resize', resizeStage); new ResizeObserver(resizeStage).observe(document.querySelector('.stage'));
    engine.onContextLostObservable.add(() => status('The graphics context paused. Your draft is kept; reload if the room does not recover.'));
    engine.onContextRestoredObservable.add(() => status('The room renderer recovered.'));
    const id = new URL(location.href).searchParams.get('take');
    if (id) await loadTake(id, false);
    else try { const draft = JSON.parse(localStorage.getItem(currentDraftKey()) || localStorage.getItem(draftKey) || 'null'); if (draft) { restore(draft); status('Your browser draft has been reopened.'); } } catch (error) { status('The previous draft uses another model revision. It remains stored; this room opened with the current model.'); }
    refreshTakes();
    // Readable diagnostics also let Crew receive the exact current state.
    window.directorStudio = { snapshot, samplePose: (frame) => A.samplePose(ui.keys, frame, ui.animation.transition), get ready() { return ui.ready; }, get scene() { return scene; }, get manifest() { return manifest; } };
  }
  start().catch(error => { console.error(error); $('loading').querySelector('p').textContent = error.message; status(error.message); window.directorError = error.message; });
})();
