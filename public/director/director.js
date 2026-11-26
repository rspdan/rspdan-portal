/* Nest Director: editable glTF poses, stepped takes, and explicit Crew routing. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const B = window.BABYLON;
  const A = window.DirectorAnimation;
  const colorClock = window.DirectorLightColor.createClock();
  const transitionLabels = { hold: 'Hold · stop motion', linear: 'Linear', 'ease-in': 'Ease in', 'ease-out': 'Ease out', 'ease-in-out': 'Ease in & out' };
  const clone = value => structuredClone(value);
  const draftKey = 'nest.director.draft.v1';
  const currentDraftKey = () => `${draftKey}.${manifest.sha256}`;
  const lensFields = [['glow',0,1],['rays',0,1],['streak',0,1],['ghosts',0,1],['spread',.25,2],['rotation',-180,180],['rayCount',4,16]];
  const lensInputId = (prefix, field) => `${prefix}-${field === 'rayCount' ? 'ray-count' : field}`;
  const ui = { ready: false, dirty: true, draftWriteFailed: false, savedId: null, playing: false, handles: true, start: 1, frame: 1, end: 72, fps: 24, animation: { transition: 'ease-in-out', loop: true }, output: { width: 720, height: 720 }, keys: [], undo: [], redo: [], look: 'ouch', background: 'white', mode: 'pose', navigation: 'edit', tool: 'rotate', stretch: false, tripGlow: 0, tripFlare: 0, tripTemperature: 6500, tripBodyTemperature: null, tripLightColor: null, tripLens: null, outline: { enabled: true, tone: 0, width: .0025 } };
  let engine, scene, camera, floor, gizmo, manifest, neutralPose, nodes = {}, morphs = {}, handles = [], selected, savedSnapshot, saveRequest = null, sendRequest = null, savePayload = null;
  let playStart = 0, playFrame = 1, restoring = false, dragBefore = null;
  let cameraNavigation, cameraTakingOver = false;
  let appearance, lighting, stageDesign, kinematics, directManipulation, poseControl, backdropUploadToken = 0;
  let floorplanEditor, emptyFloorplan;
  let gizmoTargetStart = null, gizmoTargetMoved = false;
  const label = name => ({ root: 'Whole character', 'torso.lower': 'Hips', 'torso.upper': 'Torso', head: 'Head', 'upper_arm.L': 'Left shoulder', 'lower_arm.L': 'Left elbow', 'upper_arm.R': 'Right shoulder', 'lower_arm.R': 'Right elbow', 'thigh.L': 'Left hip', 'shin.L': 'Left knee', 'thigh.R': 'Right hip', 'shin.R': 'Right knee' }[name] || name);
  function status(message) { $('status').textContent = ui.draftWriteFailed ? `Browser draft unavailable. Use Save take before closing. ${message}` : message; }
  function cameraState() { camera.getViewMatrix(true); return { mode: camera.mode === B.Camera.ORTHOGRAPHIC_CAMERA ? 'orthographic' : 'perspective', position: camera.position.asArray(), target: camera.target.asArray(), fov: camera.fov, orthoSize: camera.orthoTop ? camera.orthoTop * 2 : 1.5 }; }
  function pose() {
    return { bones: Object.fromEntries(Object.entries(nodes).map(([name, node]) => [name, { position: node.position.asArray(), rotation: (node.rotationQuaternion?.clone() || B.Quaternion.FromEulerVector(node.rotation)).normalize().asArray(), scale: node.scaling.asArray() }])), morphs: Object.fromEntries(manifest.morphs.map(name => [name, morphs[name]?.[0]?.influence || 0])) };
  }
  function snapshot() { return { schema: 'nest-director-take/v2', asset: { id: manifest.id, sha256: manifest.sha256 }, name: $('take-name').value.trim() || 'Untitled take', notes: $('notes').value, look: ui.look, fps: ui.fps, frame: ui.frame, range: { start: ui.start, end: ui.end }, stage: { background: ui.background, design: stageDesign.snapshot() }, tripGlow: ui.tripGlow, tripFlare: ui.tripFlare, tripTemperature: ui.tripTemperature, ...(ui.tripBodyTemperature !== null ? { tripBodyTemperature: ui.tripBodyTemperature } : {}), ...(ui.tripLightColor ? { tripLightColor: clone(ui.tripLightColor) } : {}), ...(ui.tripLens ? { tripLens: clone(ui.tripLens) } : {}), outline: clone(ui.outline), lighting: lighting.snapshot(), camera: cameraState(), pose: pose(), keyframes: clone(ui.keys), animation: clone(ui.animation), output: clone(ui.output) }; }
  function applyPose(value, refresh = true) {
    scene.animationGroups.forEach(group => group.stop());
    for (const [name, p] of Object.entries(value.bones)) {
      const node = nodes[name]; if (!node) throw new Error(`This model has no ${name} joint.`);
      node.position.copyFromFloats(...p.position); node.rotationQuaternion = B.Quaternion.FromArray(p.rotation).normalize(); node.scaling.copyFromFloats(...p.scale);
    }
    for (const name of manifest.morphs) for (const target of morphs[name] || []) target.influence = value.morphs[name] || 0;
    kinematics?.sync();
    if (refresh) { syncJoint(); syncPreset(value); }
  }
  function syncPreset(value) {
    const near = (a, b) => a.length === b.length && a.every((n, i) => Math.abs(n - b[i]) < 0.0001);
    const match = manifest.presets.find(p => p.pose && manifest.bones.every(n => ["position", "rotation", "scale"].every(k => near(value.bones[n][k], p.pose.bones[n][k]))) && manifest.morphs.every(n => Math.abs((value.morphs[n] || 0) - (p.pose.morphs[n] || 0)) < 0.0001));
    $("preset").value = match?.id || "";
  }
  function setCamera(value) {
    const distance = Math.hypot(...value.position.map((n, i) => n - value.target[i]));
    camera.upperRadiusLimit = Math.max(camera.upperRadiusLimit || 0, distance * 1.1);
    camera.setTarget(B.Vector3.FromArray(value.target)); camera.setPosition(B.Vector3.FromArray(value.position)); camera.fov = value.fov;
    camera.maxZ = Math.max(camera.maxZ || 10000, camera.radius * 4);
    camera.mode = value.mode === 'orthographic' ? B.Camera.ORTHOGRAPHIC_CAMERA : B.Camera.PERSPECTIVE_CAMERA;
    const size = value.orthoSize || 1.5; camera.orthoTop = size / 2; camera.orthoBottom = -size / 2; fitOrtho();
    $('camera-mode').setAttribute('aria-pressed', String(camera.mode === B.Camera.ORTHOGRAPHIC_CAMERA));
    syncCameraEditor();
  }
  function restore(take, { restartColor = false } = {}) {
    if (take.asset.id !== manifest.id || take.asset.sha256 !== manifest.sha256) throw new Error('This take uses a different model revision. Its saved pose has been kept; open it with that revision.');
    cameraNavigation?.cancel(); directManipulation?.cancel(); kinematics?.endBody({cancelled:true}); kinematics?.end({cancelled:true});
    restoring = true;
    try {
      $('take-name').value = take.name; $('notes').value = take.notes; ui.start = take.range.start; ui.end = take.range.end; ui.fps = take.fps; ui.frame = take.frame; ui.keys = clone(take.keyframes);
      $('fps').value = ui.fps; $('end-frame').value = ui.end; $('frame').max = ui.end; $('scrub').max = ui.end;
      ui.animation = clone(take.animation || { transition: 'hold', loop: true });
      const stageRect = document.querySelector('.stage').getBoundingClientRect();
      setOutput(take.output || { width: 720, height: Math.max(64, Math.round(720 * stageRect.height / stageRect.width)) });
      $('transition').value = ui.animation.transition; $('loop').checked = ui.animation.loop;
      backdropUploadToken++;
      ui.tripGlow = take.tripGlow ?? 0; ui.tripFlare = take.tripFlare ?? 0; ui.tripTemperature = take.tripTemperature ?? 6500;
      ui.tripBodyTemperature = take.tripBodyTemperature ?? null; ui.tripLens = take.tripLens ? clone(take.tripLens) : null;
      ui.tripLightColor = take.tripLightColor ? clone(take.tripLightColor) : null;
      colorClock.configure(ui.tripLightColor, { restart: restartColor });
      if (restartColor) colorClock.resume();
      ui.outline = clone(take.outline || { enabled: false, tone: 0, width: .0025 });
      stageDesign.restore(take.stage.design || null); lighting.restore(take.lighting || null);
      setLook(take.look); setBackground(take.stage.background); setCamera(take.camera); applyPose(take.pose); syncTimeline(); syncSceneEditor(); setMode(ui.mode);
    } finally { restoring = false; }
  }
  function pushHistory(value) { ui.undo.push(clone(value)); if (ui.undo.length > 60) ui.undo.shift(); ui.redo.length = 0; buttons(); }
  function finishCameraHistory() { cameraNavigation?.finish(); }
  function remember(value = snapshot()) { finishCameraHistory(); pushHistory(value); }
  function preserveUnkeyedPose() {
    const sampled = A.samplePose(ui.keys, ui.frame, ui.animation.transition);
    // With no keys, navigation keeps the scratch pose; there is nothing to
    // replace. Compare the full pose so slider, ring, direct-position and soft
    // shape edits all receive the same reversible boundary.
    if (!sampled) return false;
    const current = pose();
    const near = (a, b, sign = 1) => a.every((value, i) => Math.abs(value - sign * b[i]) <= 1e-7);
    const matches = manifest.bones.every(name => {
      const a = current.bones[name], b = sampled.bones[name];
      return near(a.position, b.position) && near(a.scale, b.scale)
        && (near(a.rotation, b.rotation) || near(a.rotation, b.rotation, -1));
    }) && manifest.morphs.every(name => Math.abs(current.morphs[name] - sampled.morphs[name]) <= 1e-7);
    if (matches) return false;
    remember();
    return true;
  }
  function changed(message = 'Pose changed.') {
    if (restoring || !ui.ready) return;
    syncCameraEditor(); syncPreset(pose()); ui.dirty = true; saveRequest = null; sendRequest = null;
    try { localStorage.setItem(currentDraftKey(), JSON.stringify(snapshot())); ui.draftWriteFailed = false; } catch { ui.draftWriteFailed = true; }
    $('storage-label').textContent = ui.draftWriteFailed ? 'DRAFT NOT SAVED' : 'BROWSER DRAFT'; buttons(); status(message);
  }
  function buttons() {
    for (const name of ['save', 'play', 'key-pose', 'handles', 'reset-joint']) $(name).disabled = !ui.ready;
    $('send').disabled = !ui.ready || ui.dirty || !ui.savedId;
    $('undo').disabled = !ui.undo.length; $('redo').disabled = !ui.redo.length;
    floorplanEditor?.setHistory({ undo: ui.undo.length, redo: ui.redo.length });
    const historyText = `${ui.undo.length} back · ${ui.redo.length} forward`;
    if ($('history-count').textContent !== historyText) $('history-count').textContent = historyText;
    $('remove-key').disabled = !ui.keys.some(key => key.frame === ui.frame);
  }
  function syncLensControls(prefix, value, disabled = false) {
    const settings = value || window.DirectorOptics.defaults('glow');
    $(prefix + '-style').value = settings.preset; $(prefix + '-style').disabled = disabled;
    for (const [field] of lensFields) {
      const id = lensInputId(prefix, field), number = settings[field];
      $(id).value = number; $(id).disabled = disabled;
      $(id + '-label').value = ['glow','rays','streak','ghosts'].includes(field) ? `${Math.round(number * 100)}%` : field === 'rotation' ? `${number}°` : field === 'spread' ? `${Number(number.toFixed(2))}×` : String(number);
    }
  }
  function applyAppearance() {
    colorClock.configure(ui.tripLightColor);
    appearance.apply({ look: ui.look, tripGlow: ui.tripGlow, tripFlare: ui.tripFlare, tripTemperature: ui.tripTemperature, ...(ui.tripBodyTemperature !== null ? { tripBodyTemperature: ui.tripBodyTemperature } : {}), ...(ui.tripLightColor ? { tripLightColor: ui.tripLightColor } : {}), ...(ui.tripLens ? { tripLens: ui.tripLens } : {}), outline: ui.outline });
    appearance.setLightTime(colorClock.seconds());
    $('outline-enabled').checked = ui.outline.enabled; $('outline-tone').value = ui.outline.tone; $('outline-width').value = ui.outline.width;
    $('outline-tone-label').value = ui.outline.tone === 0 ? 'Black' : ui.outline.tone === 1 ? 'White' : `${Math.round(ui.outline.tone * 100)}%`;
    $('trip-glow').value = ui.tripGlow; $('trip-glow-label').value = `${Math.round(ui.tripGlow * 100)}%`;
    $('trip-flare').value = ui.tripFlare; $('trip-flare-label').value = ui.tripFlare === 0 ? 'Off' : `${Math.round(ui.tripFlare * 100)}%`;
    $('trip-temperature').value = ui.tripTemperature; $('trip-temperature-label').value = `${ui.tripTemperature} K`;
    const linked = ui.tripBodyTemperature === null, bodyTemperature = linked ? ui.tripTemperature : ui.tripBodyTemperature;
    $('trip-body-linked').checked = linked; $('trip-body-temperature').disabled = linked;
    const hsl = ui.tripLightColor && ui.tripLightColor.mode !== 'temperature';
    $('trip-body-temperature').value = bodyTemperature; $('trip-body-temperature-label').value = linked && hsl ? 'Linked to HSL' : `${bodyTemperature} K${linked ? ' · linked' : ''}`;
    syncLensControls('trip-lens', ui.tripLens, ui.look !== 'trip');
    for (const id of ['trip-glow-control','trip-flare-control','trip-temperature-control','trip-body-temperature-control','trip-lens-control','trip-color-control']) $(id).hidden = ui.look !== 'trip';
    $('trip-temperature-control').hidden = ui.look !== 'trip' || hsl;
    syncColorControls();
    lighting?.sync();
  }
  function colorRecipe() { return clone(ui.tripLightColor || { mode: 'temperature', hue: 0, saturation: 1, lightness: .5, periodSeconds: 60 }); }
  function syncColorControls() {
    const recipe = colorRecipe(), cycling = recipe.mode === 'cycle';
    $('trip-color-source').value = recipe.mode;
    $('trip-hsl-controls').hidden = recipe.mode === 'temperature';
    $('trip-color-cycle-controls').hidden = !cycling;
    $('trip-hue-name').textContent = cycling ? 'Start hue' : 'Hue';
    $('trip-hue').value = recipe.hue; $('trip-hue-label').value = `${recipe.hue}°`;
    for (const field of ['saturation', 'lightness']) { $('trip-' + field).value = recipe[field]; $('trip-' + field + '-label').value = `${Math.round(recipe[field] * 100)}%`; }
    $('trip-cycle-seconds').value = recipe.periodSeconds;
    $('trip-color-pause').textContent = colorClock.isPaused() ? 'Resume color' : 'Pause color';
    $('trip-color-pause').setAttribute('aria-pressed', String(colorClock.isPaused()));
    $('trip-color-state').textContent = colorClock.isPaused() ? 'Color preview paused.' : `Color preview running · ${recipe.periodSeconds} seconds per cycle.`;
  }
  function setLook(look) {
    ui.look = look; applyAppearance();
    for (const name of ['ouch', 'trip']) { $(name).classList.toggle('active', name === look); $(name).setAttribute('aria-pressed', String(name === look)); }
    $('look-label').textContent = look.toUpperCase();
  }
  function setBackground(background) {
    ui.background = background; $('background').value = background;
    stageDesign.applyBackground(background);
    $('room').style.background = background === 'transparent' ? 'repeating-conic-gradient(#d8dcd7 0% 25%, #eef0eb 0% 50%) 50% / 24px 24px' : 'transparent';
    $('room-title').textContent = background === 'white' ? ' THE SET ' : background === 'green' ? ' GREEN SCREEN ' : ' TRANSPARENT STAGE ';
  }
  const activeController = () => ui.mode === 'lighting' ? lighting : ui.mode === 'stage' ? stageDesign : null;
  const activeNodes = () => ['floorplan','camera'].includes(ui.mode) ? {} : activeController()?.nodes() || (ui.stretch ? nodes : { ...nodes, ...kinematics.nodes() });
  const activeHandles = () => ['floorplan','camera'].includes(ui.mode) ? [] : activeController()?.handles() || (ui.stretch ? handles : [...handles, ...kinematics.handles()]);
  const movableHandles = () => ui.mode !== 'pose' || ui.stretch ? activeHandles() : activeHandles().filter(handle => canMoveControl(handle.metadata?.joint));
  const activeSelected = () => activeController()?.getSelected() || (ui.mode === 'pose' ? poseControl || selected : null);
  const isPoseTarget = () => ui.mode === 'pose' && !ui.stretch && kinematics.isTarget(activeSelected());
  const isHipControl = () => ui.mode === 'pose' && !ui.stretch && activeSelected() === 'torso.lower';
  const canMoveControl = id => ui.mode !== 'pose' || ui.stretch || kinematics.isTarget(id) || ['root','torso.lower'].includes(id);
  const canScaleControl = () => ui.mode === 'stage' || (ui.mode === 'pose' && ui.stretch);
  function syncTools() {
    const target = isPoseTarget();
    if (target) ui.tool = 'move';
    else if ((ui.tool === 'move' && !canMoveControl(activeSelected())) || (ui.tool === 'scale' && !canScaleControl())) ui.tool = 'rotate';
    $('tool-move').disabled = !canMoveControl(activeSelected()); $('tool-rotate').disabled = target; $('tool-scale').disabled = !canScaleControl();
    for (const tool of ['move','rotate','scale']) { $('tool-' + tool).setAttribute('aria-pressed', String(ui.tool === tool)); $('tool-' + tool).classList.toggle('active', ui.tool === tool); }
  }
  function controlLabel(id) {
    if (ui.mode === 'pose') return kinematics.labels()[id] || label(id);
    const data = ui.mode === 'lighting' ? lighting.snapshot().lights : stageDesign.snapshot().objects;
    return data.find(item => item.id === id)?.name || 'Set control';
  }
  function attachControl() {
    if (!gizmo) return;
    gizmo.positionGizmoEnabled = ui.tool === 'move'; gizmo.rotationGizmoEnabled = ui.tool === 'rotate'; gizmo.scaleGizmoEnabled = ui.tool === 'scale' && ui.mode !== 'lighting';
    gizmo.attachToNode(ui.handles && ui.navigation === 'edit' && !cameraNavigation?.active ? activeNodes()[activeSelected()] || null : null);
    if(ui.navigation !== 'edit' || ui.mode === 'camera'){ $('hint').textContent = ui.navigation === 'zoom' ? 'Drag up to zoom in, down to zoom out · pinch works in every mode' : ui.navigation === 'pan' ? 'Drag to pan · pinch to zoom' : 'Drag to orbit · two fingers pan and pinch'; return; }
    $('hint').textContent = ui.handles && activeSelected() ? (canMoveControl(activeSelected()) ? `${controlLabel(activeSelected())} · hold a marker to move; drag the ${ui.tool} gizmo` : (kinematics.available ? `${controlLabel(activeSelected())} · rotate here; move a hand or foot to bend the limb` : `${controlLabel(activeSelected())} · rotate here; Stretch allows free movement`)) : ui.handles ? 'Choose a control or add a set piece.' : 'Controls hidden · drag the room to orbit the camera';
  }
  function selectControl(id) {
    if (!activeNodes()[id]) return;
    if (ui.mode === 'pose') {
      if (kinematics.isTarget(id) && !ui.stretch) { poseControl = id; $('joint').value = id; kinematics.sync(); syncTools(); syncJoint(); attachControl(); }
      else selectJoint(id);
    }
    else { activeController().select(id); syncSceneEditor(); attachControl(); }
  }
  function setMode(mode) {
    cameraNavigation?.cancel(); directManipulation?.cancel(); stop(); const modeChanged=ui.mode!==mode;ui.mode = mode;
    if(modeChanged)ui.navigation=mode==='camera'?'orbit':'edit';
    if (mode === 'lighting' && ui.tool === 'scale') ui.tool = 'move';
    kinematics.setEditing(ui.handles && mode === 'pose' && !ui.stretch);
    for (const name of ['pose', 'lighting', 'stage', 'camera', 'floorplan']) $('mode-' + name).setAttribute('aria-pressed', String(mode === name));
    for (const element of document.querySelectorAll('[data-modes]')) element.hidden = !element.dataset.modes.split(' ').includes(mode);
    document.querySelector('.inspector').dataset.mode = mode;
    $('director').dataset.mode = mode;
    document.querySelector('.stage').dataset.floorplan = String(mode === 'floorplan');
    $('floorplan-canvas-host').hidden = mode !== 'floorplan';
    floorplanEditor?.setActive(mode === 'floorplan');
    $('mode-title').textContent = mode[0].toUpperCase() + mode.slice(1) + ' Mode';
    syncTools();
    handles.forEach(handle => handle.setEnabled(ui.handles && mode === 'pose'));
    lighting.setEditing(ui.handles && mode === 'lighting'); stageDesign.setEditing(ui.handles && mode === 'stage');
    $('handles').textContent = 'Controls ' + (ui.handles ? 'on' : 'off'); $('handles').setAttribute('aria-pressed', String(ui.handles));
    syncSceneEditor(); syncCameraEditor(); setNavigationTool(ui.navigation);
  }
  function cameraLimits() { const plan = !!stageDesign?.snapshot().floorplan; return { coordinate: plan ? 1e9 : 1000, ortho: plan ? 1e8 : 1000 }; }
  function validCamera(value) {
    const limits = cameraLimits();
    if (![...value.position,...value.target].every(n=>Number.isFinite(n)&&Math.abs(n)<=limits.coordinate)) throw new Error(`Camera coordinates must be within ±${limits.coordinate}.`);
    if (Math.hypot(...value.position.map((n,i)=>n-value.target[i]))<=.001) throw new Error('Camera position and look-at point must differ.');
    if (!Number.isFinite(value.fov)||value.fov<.05||value.fov>3||!Number.isFinite(value.orthoSize)||value.orthoSize<.01||value.orthoSize>limits.ortho) throw new Error('Use a valid field of view and orthographic height.');
    return value;
  }
  function syncCameraEditor(force=false) {
    if (!camera) return;
    camera.getViewMatrix(true);const value=cameraState(),limits=cameraLimits();
    const update=(id,v)=>{const input=$(id);if(input && (force||document.activeElement!==input))input.value=Number.isFinite(v)?Number(v.toFixed(5)):v;};
    for(const [kind,values] of [['pos',value.position],['target',value.target]])for(const [i,axis] of ['x','y','z'].entries()){const input=$(`camera-${kind}-${axis}`);input.min=-limits.coordinate;input.max=limits.coordinate;update(input.id,values[i]);}
    update('camera-projection',value.mode);update('camera-fov',value.fov*180/Math.PI);update('camera-size',value.orthoSize);
    update('camera-azimuth',((camera.alpha*180/Math.PI)%360+540)%360-180);update('camera-elevation',90-camera.beta*180/Math.PI);update('camera-distance',camera.radius);
    $('camera-size').max=limits.ortho;$('camera-distance').max=Math.sqrt(12)*limits.coordinate;
    $('camera-fov-field').hidden=value.mode==='orthographic';$('camera-size-field').hidden=value.mode!=='orthographic';
    $('camera-mode').setAttribute('aria-pressed',String(value.mode==='orthographic'));
  }
  function setNavigationTool(tool) {
    cameraNavigation?.cancel();directManipulation?.cancel();
    ui.navigation=ui.mode==='camera'&&tool==='edit'?'orbit':tool;
    for(const name of ['edit','orbit','pan','zoom'])$('nav-'+name).setAttribute('aria-pressed',String(name===ui.navigation));
    $('nav-edit').disabled=ui.mode==='camera';attachControl();
  }
  function cameraProjection(mode) {
    const value=cameraState();if(value.mode===mode)return;
    if(mode==='orthographic')value.orthoSize=Math.max(.01,Math.min(cameraLimits().ortho,2*camera.radius*Math.tan(camera.fov/2)));
    else {const radius=value.orthoSize/(2*Math.tan(value.fov/2)),outward=camera.position.subtract(camera.target).normalize();value.position=camera.target.add(outward.scale(radius)).asArray();}
    value.mode=mode;setCamera(validCamera(value));
  }
  function cameraEdit(apply,message='Camera updated.') {
    cameraNavigation?.finish();stop();const before=snapshot();
    try {apply();camera.getViewMatrix(true);validCamera(cameraState());if(JSON.stringify(before.camera)!==JSON.stringify(cameraState())){remember(before);changed(message);}}
    catch(error){setCamera(before.camera);status(error.message);}
    syncCameraEditor(true);
  }
  function bindCameraEditor() {
    const number=(input,min,max)=>{const n=Number(input.value);if(input.value===''||!Number.isFinite(n)||n<min||n>max)throw new Error(`Use a value from ${min} to ${max}.`);return n;};
    for(const name of ['edit','orbit','pan','zoom'])$('nav-'+name).onclick=()=>setNavigationTool(name);
    $('camera-projection').onchange=()=>cameraEdit(()=>cameraProjection($('camera-projection').value),'Camera projection updated.');
    for(const [kind,key] of [['pos','position'],['target','target']])for(const [i,axis] of ['x','y','z'].entries())$(`camera-${kind}-${axis}`).onchange=event=>cameraEdit(()=>{const value=cameraState();value[key][i]=number(event.target,-cameraLimits().coordinate,cameraLimits().coordinate);setCamera(validCamera(value));});
    $('camera-fov').onchange=event=>cameraEdit(()=>{camera.fov=number(event.target,.05*180/Math.PI,3*180/Math.PI)*Math.PI/180;},'Camera field of view updated.');
    $('camera-size').onchange=event=>cameraEdit(()=>{const half=number(event.target,.01,cameraLimits().ortho)/2;camera.orthoTop=half;camera.orthoBottom=-half;fitOrtho();},'Orthographic height updated.');
    $('camera-azimuth').onchange=event=>cameraEdit(()=>{camera.alpha=number(event.target,-360,360)*Math.PI/180;});
    $('camera-elevation').onchange=event=>cameraEdit(()=>{camera.beta=(90-number(event.target,-89,89))*Math.PI/180;});
    $('camera-distance').onchange=event=>cameraEdit(()=>{const distance=number(event.target,.01,Math.sqrt(12)*cameraLimits().coordinate),value=cameraState();value.position=camera.target.add(camera.position.subtract(camera.target).normalize().scale(distance)).asArray();setCamera(validCamera(value));},'Camera distance updated.');
    $('camera-frame-character').onclick=()=>cameraEdit(()=>{frameDirectorCharacter(scene,camera,$('room'));fitOrtho();},'Whole character framed.');
    $('camera-frame-set').onclick=()=>cameraEdit(()=>frameSet(),'Set framed.');
    $('camera-top').onclick=()=>cameraEdit(()=>{camera.beta=Math.PI/180;},'Top camera view.');
  }
  function cameraEditingHit(event) {
    if(ui.navigation!=='edit'||ui.mode==='camera'||!ui.handles)return false;
    const rect=$('room').getBoundingClientRect(),x=event.clientX-rect.left,y=event.clientY-rect.top;
    camera.getViewMatrix(true);scene.updateTransformMatrix();
    if(B.UtilityLayerRenderer.DefaultUtilityLayer.utilityLayerScene?.pick(x,y)?.hit)return true;
    if(scene.pick(x,y,mesh=>!!activeNodes()[mesh.metadata?.joint||mesh.metadata?.directorStageId])?.hit)return true;
    const viewport=camera.viewport.toGlobal(rect.width,rect.height),radius=event.pointerType==='touch'?22:10;
    return activeHandles().some(handle=>{if(!handle.isEnabled())return false;handle.computeWorldMatrix(true);const p=B.Vector3.Project(handle.getAbsolutePosition(),B.Matrix.Identity(),scene.getTransformMatrix(),viewport);return p.z>=0&&p.z<=1&&Math.hypot(p.x-x,p.y-y)<radius;});
  }
  function cancelEditForCamera(before) {
    cameraTakingOver=true;
    try {
      directManipulation?.cancel();
      kinematics?.endBody({cancelled:true});kinematics?.end({cancelled:true});
      for(const control of Object.values(gizmo.gizmos))control?.releaseDrag?.();
      gizmo.attachToNode(null);dragBefore=null;gizmoTargetStart=null;gizmoTargetMoved=false;
      if(before){lighting.restore(before.lighting);stageDesign.restore(before.stage.design);applyPose(before.pose);lighting.sync();stageDesign.sync();syncSceneEditor();}
    } finally {cameraTakingOver=false;}
  }
  function syncSceneEditor() {
    if (!lighting || !stageDesign) return;
    const lights = lighting.snapshot(), design = stageDesign.snapshot();
    $('light-select').replaceChildren(...lights.lights.map(item => new Option(item.name, item.id)));
    $('light-select').value = lighting.getSelected() || '';
    $('stage-select').replaceChildren(...design.objects.map(item => new Option(item.name, item.id)));
    if (!design.objects.length) $('stage-select').add(new Option('No set pieces yet', ''));
    $('stage-select').value = stageDesign.getSelected() || '';
    for (const id of ['add-light','add-left-hand-light','add-right-hand-light','add-head-light']) $(id).disabled = lights.lights.length >= 8;
    $('add-stage-object').disabled = design.objects.length >= 32;
    const light = lights.lights.find(item => item.id === lighting.getSelected());
    for (const id of ['light-enabled','light-selected-type','light-name','light-color','light-intensity','light-angle','light-range','light-attachment','light-flare','light-effect-shape','light-effect-radius','light-effect-length','light-effect-strength','remove-light']) $(id).disabled = !light;
    if (light) { $('light-enabled').checked = light.enabled; $('light-selected-type').value = light.type; $('light-name').value = light.name; $('light-color').value = light.color; $('light-intensity').value = light.intensity; $('light-intensity-label').value = light.intensity.toFixed(2); $('light-angle').value = Math.round(light.angle * 180 / Math.PI); $('light-range').value = light.range; $('light-angle').disabled = light.type !== 'spot'; $('light-range').disabled = light.type === 'directional'; }
    const attachment = light?.attachment || 'world', effect = light?.effect || { shape: 'none', radius: .06, length: 1, strength: .5 };
    $('light-attachment').value = attachment;
    const flare = light?.flare || 0;
    $('light-flare').value = flare; $('light-flare-label').value = flare === 0 ? 'Off' : `${Math.round(flare * 100)}%`;
    syncLensControls('light-lens', light?.lens, !light);
    $('light-attachment-description').textContent = attachment === 'world' ? 'Position and rotation are relative to the stage.' : 'Follows the selected body part. Position and rotation adjust its local offset.';
    $('light-effect-shape').value = effect.shape; $('light-effect-radius').value = effect.radius; $('light-effect-length').value = effect.length; $('light-effect-strength').value = effect.strength; $('light-effect-strength-label').value = `${Math.round(effect.strength * 100)}%`;
    $('light-effect-radius').disabled = !light || effect.shape === 'none'; $('light-effect-length').disabled = !light || effect.shape !== 'beam'; $('light-effect-strength').disabled = !light || effect.shape === 'none';
    $('ambient-color').value = lights.ambient.color; $('ambient-intensity').value = lights.ambient.intensity;
    const object = design.objects.find(item => item.id === stageDesign.getSelected());
    for (const id of ['stage-name','stage-color','remove-stage-object']) $(id).disabled = !object;
    if (object) { $('stage-name').value = object.name; $('stage-color').value = object.color; }
    $('backdrop-type').value = design.backdrop.type; $('backdrop-color').value = design.backdrop.color; $('backdrop-fit').value = design.backdrop.fit;
    $('backdrop-image-name').textContent = design.backdrop.image?.name || 'No image selected.'; $('remove-backdrop-image').disabled = !design.backdrop.image;
    $('floor-enabled').checked = design.floor.enabled; $('floor-color').value = design.floor.color; $('floor-size').value = design.floor.size; $('floor-height').value = design.floor.height;
    floorplanEditor?.setPlan(design.floorplan || emptyFloorplan);
    const node = activeNodes()[activeSelected()];
    $('scene-selection-label').textContent = node ? controlLabel(activeSelected()) : 'Select an item to place it.';
    for (const input of document.querySelectorAll('.scene-transform-panel input')) input.disabled = !node;
    if (node && ui.mode !== 'pose') {
      const rotation = node.rotationQuaternion?.toEulerAngles() || node.rotation;
      for (const axis of ['x','y','z']) { $('scene-pos-' + axis).value = Number(node.position[axis].toFixed(4)); $('scene-rot-' + axis).value = Number((rotation[axis] * 180 / Math.PI).toFixed(2)); $('scene-scale-' + axis).value = Number(node.scaling[axis].toFixed(4)); }
    }
  }
  function syncActive() { if (ui.mode === 'pose') { kinematics.sync(); syncJoint(); } else { lighting.sync(); stageDesign.sync(); syncSceneEditor(); } }
  function constrainActive() {
    const node = activeNodes()[activeSelected()]; if (!node) return false;
    const limit = ui.mode === 'pose' ? 1000 : 100, scaleMax = ui.mode === 'pose' ? 20 : 100;
    let bounded = false;
    for (const axis of ['x','y','z']) {
      const position = Math.max(-limit, Math.min(limit, Number.isFinite(node.position[axis]) ? node.position[axis] : 0));
      const scale = Math.max(.01, Math.min(scaleMax, Number.isFinite(node.scaling[axis]) ? node.scaling[axis] : 1));
      bounded ||= position !== node.position[axis] || scale !== node.scaling[axis];
      node.position[axis] = position; node.scaling[axis] = scale;
    }
    node.rotationQuaternion?.normalize(); node.computeWorldMatrix(true); return bounded;
  }
  function frameSet() {
    scene.render();
    const points = Object.values(activeNodes()).map(node => node.getAbsolutePosition().clone());
    for (const mesh of scene.meshes) {
      if (!mesh.isEnabled() || !mesh.getTotalVertices()) continue;
      if (mesh.metadata?.directorCharacter) {
        mesh.skeleton?.prepare(true); const data = mesh.getPositionData(true,true), world = mesh.computeWorldMatrix(true);
        if (data) for (let i = 0; i < data.length; i += 3) points.push(B.Vector3.TransformCoordinates(new B.Vector3(data[i],data[i+1],data[i+2]),world));
      } else if (mesh.metadata?.directorStageId) {
        mesh.computeWorldMatrix(true); points.push(...mesh.getBoundingInfo().boundingBox.vectorsWorld.map(point => point.clone()));
      }
    }
    if (!points.length) return;
    const min = points.reduce((a,b) => B.Vector3.Minimize(a,b)), max = points.reduce((a,b) => B.Vector3.Maximize(a,b));
    const center = min.add(max).scale(.5), rect = $('room').getBoundingClientRect(), alpha = camera.alpha, beta = camera.beta;
    const aspect = rect.width / Math.max(1,rect.height), forward = camera.getForwardRay().direction.normalize();
    const right = B.Vector3.Cross(forward,camera.upVector).normalize(), up = B.Vector3.Cross(right,forward).normalize();
    const top = Math.min(rect.height * .45, Math.max(45,document.querySelector('.mode-switcher').getBoundingClientRect().bottom - rect.top + 35));
    const bottom = Math.min(45,rect.height * .2), side = Math.min(30,rect.width * .12);
    const cx = 0, cy = (bottom - top) / rect.height, sx = Math.max(.2,1 - 2 * side / rect.width), sy = Math.max(.2,1 - (top + bottom) / rect.height);
    const tangent = Math.tan(camera.fov / 2), tanY = camera.fovMode === B.Camera.FOVMODE_HORIZONTAL_FIXED ? tangent / aspect : tangent, tanX = tanY * aspect;
    let distance = .6, half = .3;
    for (const point of points) {
      const delta = point.subtract(center), x = B.Vector3.Dot(delta,right), y = B.Vector3.Dot(delta,up), z = B.Vector3.Dot(delta,forward);
      distance = Math.max(distance,Math.abs(x - cx * tanX * z) / (sx * tanX) - z,Math.abs(y - cy * tanY * z) / (sy * tanY) - z,camera.minZ + .1 - z);
      half = Math.max(half,Math.abs(x) / (sx * aspect),Math.abs(y) / sy);
    }
    distance *= 1.05; half *= 1.05;
    camera.upperRadiusLimit = Math.max(camera.upperRadiusLimit || 0,distance * 1.1);
    camera.maxZ = Math.max(camera.maxZ || 10000, distance * 4);
    if (camera.mode === B.Camera.ORTHOGRAPHIC_CAMERA) { camera.setTarget(center.subtract(right.scale(cx * half * aspect)).subtract(up.scale(cy * half))); camera.orthoTop = half; camera.orthoBottom = -half; }
    else camera.setTarget(center.subtract(right.scale(cx * distance * tanX)).subtract(up.scale(cy * distance * tanY)));
    camera.alpha = alpha; camera.beta = beta; camera.radius = distance; camera.getViewMatrix(true); fitOrtho();
  }
  function selectJoint(name) {
    selected = name; poseControl = name; $('joint').value = name; syncTools();
    if (ui.mode === 'pose') attachControl();
    for (const handle of handles) handle.scaling.setAll(handle.metadata.joint === name ? 1.4 : 1);
    syncJoint(); if (ui.mode === 'pose') attachControl();
  }
  function syncJoint() {
    if (!selected || !nodes[selected]) return;
    const target = kinematics?.isTarget(poseControl) && !ui.stretch;
    $('rotation-controls').hidden = Boolean(target);
    $('reset-joint').textContent = target ? 'Reset limb' : 'Reset joint';
    $('pose-control-description').textContent = target ? 'Move this hand or foot. The connected limb bends toward it.' : ui.stretch ? 'Free movement and scaling can stretch the body.' : kinematics.available ? 'Rotate this joint. Move a hand or foot to bend its connected limb.' : 'This model revision uses joint rotation. Stretch allows free movement.';
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
    const preserved = !playing && preserveUnkeyedPose();
    ui.frame = Math.max(ui.start, Math.min(ui.end, Math.round(frame)));
    const sampled = A.samplePose(ui.keys, ui.frame, ui.animation.transition); if (sampled) applyPose(sampled, !playing);
    syncTimeline(!playing); if (!playing) changed(preserved ? `Unkeyed pose kept in Undo. Frame ${ui.frame}.` : `Frame ${ui.frame}. Key the pose when it is ready.`);
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

/* Manual Frame action: fit the evaluated character and attached light effects;
   preserve view direction. World lights and set pieces belong to Frame Set.
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
  const attachedEffects = new Set(lighting.snapshot().lights.filter(light => light.enabled && light.attachment && light.attachment !== 'world').map(light => light.id));
  try {
  for (const sample of samplePoses.length ? samplePoses : [null]) {
    if (sample) { applyPose(sample, false); scene.render(); }
  for (const mesh of scene.meshes) {
    const included = mesh.metadata?.directorCharacter || (mesh.metadata?.directorLightEffect && attachedEffects.has(mesh.metadata.directorLightId));
    if (!included || !mesh.isEnabled() || !mesh.isVisible || mesh.visibility <= 0 || !mesh.getTotalVertices()) continue;
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
    let value; try { value = await response.json(); } catch { throw new Error(response.status === 401 ? 'Sign in again to save this take. Your work remains in this tab.' : 'The save service did not return a usable response. Your work remains in this tab.'); }
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
    try { const result = await api('?id=' + encodeURIComponent(id)); const record = result.saved || result.record || result; const take = record.take || result.take; if (take.asset.sha256 !== manifest.sha256) { if (preserveDraft) localStorage.setItem(currentDraftKey(), JSON.stringify(snapshot())); location.assign('/director?take=' + encodeURIComponent(id) + '&asset=' + encodeURIComponent(take.asset.sha256)); return; } remember(); restore(take, { restartColor: true }); ui.savedId = record.id || id; sendRequest = null; ui.dirty = false; ui.draftWriteFailed = false; savedSnapshot = JSON.stringify(snapshot()); try { localStorage.setItem(currentDraftKey(), savedSnapshot); } catch {} $('storage-label').textContent = result.shared === false ? 'LOCAL WORKSPACE' : 'SAVED IN NEST'; buttons(); status('Saved take reopened. The pose, stage and frames are editable.'); }
    catch (error) { status(error.message); }
  }
  function bindSceneEditor() {
    const refresh = () => { lighting.sync(); stageDesign.sync(); syncSceneEditor(); attachControl(); };
    function edit(id, apply, message = 'Scene updated.') {
      $(id).addEventListener('change', () => {
        stop(); const before = snapshot();
        try { apply($(id)); refresh(); if (JSON.stringify(before) !== JSON.stringify(snapshot())) { remember(before); changed(message); } }
        catch (error) { restore(before); status(error.message); }
      });
    }
    function live(id, apply, message = 'Scene updated.') {
      const input = $(id); let before = null;
      const begin = () => { if (!before) { stop(); before = snapshot(); } };
      const finish = () => { if (before && JSON.stringify(before) !== JSON.stringify(snapshot())) remember(before); before = null; };
      input.addEventListener('pointerdown', begin); input.addEventListener('focus', begin); input.addEventListener('keydown', begin);
      input.addEventListener('input', () => {
        begin();
        try { apply(input); refresh(); changed(message); }
        catch (error) { const previous = before; before = null; if (previous) restore(previous); status(error.message); }
      });
      input.addEventListener('change', finish); input.addEventListener('blur', finish);
      input.addEventListener('pointercancel', finish);
    }
    function action(id, apply, message) {
      $(id).onclick = () => { stop(); const before = snapshot(); try { apply(); refresh(); if (JSON.stringify(before) !== JSON.stringify(snapshot())) { remember(before); changed(message); } } catch(error) { restore(before); status(error.message); } };
    }
    const numeric = (input, min, max) => { const value = Number(input.value); if (input.value === '' || !Number.isFinite(value) || value < min || value > max) throw new Error(`Use a value from ${min} to ${max}.`); return value; };
    const bindLens = (prefix, current, apply) => {
      edit(prefix + '-style', input => apply(window.DirectorOptics.defaults(input.value)), 'Lens style updated.');
      for (const [field, min, max] of lensFields) live(lensInputId(prefix, field), input => {
        const value = numeric(input, min, max);
        if (field === 'rayCount' && !Number.isInteger(value)) throw new Error('Use a whole number of rays.');
        apply({ ...(current() || window.DirectorOptics.defaults('glow')), [field]: value });
      }, 'Lens effect updated.');
    };
    for (const mode of ['pose','lighting','stage','camera','floorplan']) $('mode-' + mode).onclick = () => { setMode(mode); document.querySelector('.inspector').scrollTop = 0; };
    for (const tool of ['move','rotate','scale']) $('tool-' + tool).onclick = () => { directManipulation?.cancel(); ui.tool = tool; setMode(ui.mode); };
    edit('outline-enabled', input => { ui.outline.enabled = input.checked; applyAppearance(); }, 'Outline updated.');
    live('outline-tone', input => { ui.outline.tone = numeric(input,0,1); applyAppearance(); }, 'Outline color updated.');
    live('outline-width', input => { ui.outline.width = numeric(input,.0005,.01); applyAppearance(); }, 'Line weight updated.');
    live('trip-glow', input => { ui.tripGlow = numeric(input,0,1); applyAppearance(); }, 'Trip glow updated.');
    live('trip-flare', input => { ui.tripFlare = numeric(input,0,1); applyAppearance(); }, 'Trip head flare updated.');
    live('trip-temperature', input => { ui.tripTemperature = numeric(input,1800,10000); applyAppearance(); }, 'Trip light temperature updated.');
    const chooseColor = (patch, startCycle = false) => {
      const before = snapshot();
      try {
        const next = { ...colorRecipe(), ...patch };
        if (!['temperature','hsl','cycle'].includes(next.mode)) throw new Error('Choose temperature, HSL, or an HSL cycle.');
        ui.tripLightColor = next;
        colorClock.configure(next, { restart: startCycle });
        if (startCycle) colorClock.resume();
        applyAppearance();
        if (JSON.stringify(before) !== JSON.stringify(snapshot())) { remember(before); changed('Trip light color updated.'); }
        else status(startCycle ? 'Color cycle restarted.' : 'Trip light color selected.');
      } catch (error) { restore(before); status(error.message); }
    };
    $('trip-color-source').onchange = event => chooseColor({ mode: event.target.value }, event.target.value === 'cycle');
    $('trip-color-slow').onclick = () => chooseColor({ mode: 'cycle', periodSeconds: 60 }, true);
    $('trip-color-fast').onclick = () => chooseColor({ mode: 'cycle', periodSeconds: 10 }, true);
    for (const [id, field, min, max] of [['trip-hue','hue',0,360],['trip-saturation','saturation',0,1],['trip-lightness','lightness',0,1]]) live(id, input => { ui.tripLightColor = { ...colorRecipe(), [field]: numeric(input,min,max) }; applyAppearance(); }, 'Trip HSL color updated.');
    edit('trip-cycle-seconds', input => { ui.tripLightColor = { ...colorRecipe(), periodSeconds: numeric(input,.5,3600) }; applyAppearance(); }, 'Color cycle duration updated.');
    $('trip-color-pause').onclick = () => {
      if (ui.tripLightColor?.mode !== 'cycle') return;
      if (colorClock.isPaused()) colorClock.resume(); else colorClock.pause();
      syncColorControls(); status(colorClock.isPaused() ? 'Color preview paused. Pose playback is unchanged.' : 'Color preview resumed.');
    };
    $('trip-color-restart').onclick = () => {
      if (ui.tripLightColor?.mode !== 'cycle') return;
      colorClock.restart(); colorClock.resume(); appearance.setLightTime(0); syncColorControls(); status('Color cycle restarted from the selected hue.');
    };
    edit('trip-body-linked', input => { ui.tripBodyTemperature = input.checked ? null : 6500; applyAppearance(); }, 'Trip body temperature updated.');
    live('trip-body-temperature', input => { ui.tripBodyTemperature = numeric(input,1800,10000); applyAppearance(); }, 'Trip body temperature updated.');
    bindLens('trip-lens', () => ui.tripLens, value => { ui.tripLens = value; applyAppearance(); });
    for (const [id, kelvin] of [['temperature-warm',2700],['temperature-neutral',6500],['temperature-cool',10000]]) action(id, () => { ui.tripTemperature = kelvin; applyAppearance(); }, 'Trip light temperature updated.');
    $('light-select').onchange = () => selectControl($('light-select').value);
    $('stage-select').onchange = () => selectControl($('stage-select').value);
    action('add-light', () => lighting.add($('light-type').value), 'Light added. Use Frame to see its marker.');
    for (const [side, name] of [['L','left'],['R','right']]) action(`add-${name}-hand-light`, () => lighting.add('point', { name: `${name === 'left' ? 'Left' : 'Right'} hand light`, attachment: `hand.${side}`, color: '#ffffff', intensity: 2, effect: { shape: 'ball', radius: .06, length: 1, strength: .5 } }), 'Hand light added. It follows the hand as you pose.');
    action('add-head-light', () => lighting.add('point', { name: 'Head light', attachment: 'head', color: '#ffffff', intensity: 2, effect: { shape: 'ball', radius: .06, length: 1, strength: .5 } }), 'Head light added. It follows the head as you pose.');
    action('remove-light', () => lighting.remove(lighting.getSelected()), 'Light removed. Undo restores it.');
    action('add-stage-object', () => stageDesign.add($('stage-type').value), 'Set piece added.');
    action('remove-stage-object', () => stageDesign.remove(stageDesign.getSelected()), 'Set piece removed. Undo restores it.');
    const lightPatch = patch => { if (lighting.getSelected()) lighting.update(lighting.getSelected(), patch); };
    edit('light-enabled', input => lightPatch({ enabled: input.checked }), 'Light switched.');
    edit('light-selected-type', input => lightPatch({ type: input.value }), 'Light type updated.');
    live('light-name', input => lightPatch({ name: input.value }), 'Light name updated.');
    live('light-color', input => lightPatch({ color: input.value }), 'Light color updated.');
    live('light-intensity', input => lightPatch({ intensity: numeric(input,0,20) }), 'Light brightness updated.');
    edit('light-angle', input => lightPatch({ angle: numeric(input,6,179) * Math.PI / 180 }), 'Light beam updated.');
    edit('light-range', input => lightPatch({ range: numeric(input,.1,100) }), 'Light range updated.');
    edit('light-attachment', input => lightPatch({ attachment: input.value }), 'Light attachment updated.');
    live('light-flare', input => lightPatch({ flare: numeric(input,0,1) }), 'Glass flare updated.');
    bindLens('light-lens', () => lighting.snapshot().lights.find(item => item.id === lighting.getSelected())?.lens, value => lightPatch({ lens: value }));
    const effectPatch = patch => {
      const light = lighting.snapshot().lights.find(item => item.id === lighting.getSelected());
      if (light) lightPatch({ effect: { ...(light.effect || { shape: 'none', radius: .06, length: 1, strength: .5 }), ...patch } });
    };
    edit('light-effect-shape', input => effectPatch({ shape: input.value }), 'Light effect updated.');
    edit('light-effect-radius', input => effectPatch({ radius: numeric(input,.005,1) }), 'Light effect radius updated.');
    edit('light-effect-length', input => effectPatch({ length: numeric(input,.05,10) }), 'Light effect length updated.');
    live('light-effect-strength', input => effectPatch({ strength: numeric(input,0,1) }), 'Light effect strength updated.');
    live('ambient-color', input => lighting.updateAmbient({color: input.value}), 'Ambient color updated.');
    live('ambient-intensity', input => lighting.updateAmbient({intensity: numeric(input,0,3)}), 'Ambient brightness updated.');
    const objectPatch = patch => { if (stageDesign.getSelected()) stageDesign.update(stageDesign.getSelected(),patch); };
    live('stage-name', input => objectPatch({name: input.value}), 'Set piece name updated.');
    live('stage-color', input => objectPatch({color: input.value}), 'Set piece color updated.');
    const designPatch = patch => { stageDesign.setDesign(patch); setBackground('white'); };
    edit('backdrop-type', input => designPatch({backdrop:{type:input.value}}), 'Backdrop updated.');
    live('backdrop-color', input => designPatch({backdrop:{color:input.value}}), 'Backdrop color updated.');
    edit('backdrop-fit', input => designPatch({backdrop:{fit:input.value}}), 'Image framing updated.');
    edit('floor-enabled', input => stageDesign.setDesign({floor:{enabled:input.checked}}), 'Floor visibility updated.');
    live('floor-color', input => stageDesign.setDesign({floor:{color:input.value}}), 'Floor color updated.');
    edit('floor-size', input => stageDesign.setDesign({floor:{size:numeric(input,1,200)}}), 'Floor size updated.');
    edit('floor-height', input => stageDesign.setDesign({floor:{height:numeric(input,-10,10)}}), 'Floor height updated.');
    action('remove-backdrop-image', () => { backdropUploadToken++; designPatch({backdrop:{type:'color',image:null}}); }, 'Background image removed. Undo restores it.');
    for (const axis of ['x','y','z']) for (const field of ['pos','rot','scale']) edit(`scene-${field}-${axis}`, input => {
      const node = activeNodes()[activeSelected()]; if (!node) return;
      const index = ['x','y','z'].indexOf(axis), data = ui.mode === 'lighting' ? lighting.snapshot().lights : stageDesign.snapshot().objects;
      const current = data.find(item => item.id === activeSelected()); if (!current) return;
      const key = field === 'pos' ? 'position' : field === 'rot' ? 'rotation' : 'scale';
      const values = [...current[key]];
      values[index] = field === 'rot' ? numeric(input,-5729,5729) * Math.PI / 180 : numeric(input,field === 'scale' ? .01 : -100,100);
      activeController().update(activeSelected(),{[key]:values});
    }, 'Placement updated.');
    $('backdrop-file').onchange = async () => {
      const file = $('backdrop-file').files?.[0]; if (!file) return;
      const token = ++backdropUploadToken; $('backdrop-file').disabled = true; status('Preparing the background image…');
      try {
        const image = await normalizeBackdrop(file);
        if (token !== backdropUploadToken) return;
        stop(); const before = snapshot(); designPatch({backdrop:{type:'image',image},floor:{enabled:false}}); refresh(); remember(before); changed('Background image added. Save take keeps it with the scene.');
      } catch (error) { if (token === backdropUploadToken) status(error.message); }
      finally { $('backdrop-file').disabled = false; $('backdrop-file').value = ''; }
    };
  }
  async function normalizeBackdrop(file) {
    if (!['image/png','image/jpeg','image/webp'].includes(file.type)) throw new Error('Choose a PNG, JPEG or WebP image.');
    if (file.size > 24 * 1024 * 1024) throw new Error('Choose an image smaller than 24 MB.');
    const url = URL.createObjectURL(file), source = new Image();
    try {
      source.src = url; await source.decode();
      if (!source.naturalWidth || !source.naturalHeight || source.naturalWidth * source.naturalHeight > 40000000) throw new Error('Choose an image up to 40 megapixels.');
      const canvas = document.createElement('canvas'), ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('This browser could not prepare the image.');
      let scale = Math.min(1,1600 / Math.max(source.naturalWidth,source.naturalHeight));
      for (let attempt = 0; attempt < 7; attempt++, scale *= .75) {
        canvas.width = Math.max(1,Math.round(source.naturalWidth * scale)); canvas.height = Math.max(1,Math.round(source.naturalHeight * scale)); ctx.clearRect(0,0,canvas.width,canvas.height); ctx.drawImage(source,0,0,canvas.width,canvas.height);
        for (const quality of [.9,.75,.55]) { const dataUrl = canvas.toDataURL('image/webp',quality); if (/^data:image\/(webp|png|jpeg);base64,/.test(dataUrl) && dataUrl.length <= 400000) return {dataUrl,name:file.name.slice(0,100)}; }
      }
      throw new Error('This image is too detailed to save. Try a smaller version.');
    } catch (error) { if (error.name === 'EncodingError') throw new Error('This image could not be read. Choose another PNG, JPEG or WebP.'); throw error; }
    finally { URL.revokeObjectURL(url); }
  }

  function bind() {
    $('joint').onchange = () => selectControl($('joint').value);
    $('pose-stretch').onchange = () => { directManipulation?.cancel(); ui.stretch = $('pose-stretch').checked;
      if (ui.stretch && kinematics.isTarget(poseControl)) { const side = poseControl.split('.')[1]; selectJoint((poseControl.startsWith('hand') ? 'lower_arm.' : 'shin.') + side); }
      for (const option of $('joint').options) if (kinematics.isTarget(option.value)) option.disabled = ui.stretch;
      kinematics.sync(); syncJoint(); setMode(ui.mode); status(ui.stretch ? 'Stretch enabled: joints can move and scale freely.' : 'Connected posing: move hands and feet; rotate other joints.');
    };
    $('preset').onchange = () => { directManipulation?.cancel(); kinematics.endBody({cancelled:true}); kinematics.end({cancelled:true}); stop(); remember(); const preset = manifest.presets.find(p => p.id === $('preset').value); if (!preset?.pose) return; applyPose(preset.pose); changed(`${preset.label} start. Pose it your way, then key a frame.`); };
    for (const input of document.querySelectorAll('#rotation-controls input,#position-controls input')) {
      input.addEventListener('pointerdown', () => { stop(); syncJoint(); dragBefore = snapshot(); if (input.id.startsWith('rot') && isHipControl()) kinematics.beginBody('torso.lower'); });
      input.addEventListener('keydown', e => { if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'].includes(e.key) && !dragBefore) { stop(); syncJoint(); dragBefore = snapshot(); if (input.id.startsWith('rot') && isHipControl()) kinematics.beginBody('torso.lower'); } });
      input.addEventListener('input', () => {
        stop();
        if (input.id.startsWith('rot')) {
          const rest = B.Quaternion.FromArray(neutralPose.bones[selected].rotation);
          const angles = rest.conjugate().multiply(nodes[selected].rotationQuaternion || B.Quaternion.Identity()).toEulerAngles();
          angles[input.id.slice(-1)] = Number(input.value) * Math.PI / 180;
          nodes[selected].rotationQuaternion = rest.multiply(B.Quaternion.FromEulerVector(angles)).normalize();
        } else nodes.root.position[input.id.slice(-1)] = Number(input.value);
        if (input.id.startsWith('rot') && isHipControl()) kinematics.solveBody();
        kinematics.sync(); syncJoint(); changed();
      });
      input.addEventListener('change', () => { if (input.id.startsWith('rot') && isHipControl()) kinematics.endBody(); if (dragBefore) remember(dragBefore); dragBefore = null; });
    }
    $('reset-joint').onclick = () => { stop(); remember(); const p = pose();
      const targets = isPoseTarget() ? (poseControl.startsWith('hand') ? ['upper_arm.','lower_arm.'] : ['thigh.','shin.']).map(prefix => prefix + poseControl.split('.')[1]) : [selected];
      for (const name of targets) p.bones[name] = clone(neutralPose.bones[name]);
      applyPose(p); changed(isPoseTarget() ? 'Selected limb reset.' : 'Selected joint reset.');
    };
    $('handles').onclick = () => { ui.handles = !ui.handles; setMode(ui.mode); };
    for (const look of ['ouch', 'trip']) $(look).onclick = () => { remember(); setLook(look); changed(look === 'trip' ? 'Trip selected.' : 'Ouch selected.'); };
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
    $('motion-settings').onclick = () => { setMode('pose'); document.querySelector('.animation-panel').scrollIntoView({behavior: 'smooth', block: 'start'}); $('transition').focus({preventScroll: true}); };
    const outputChanged = () => {
      const width = Number($('output-width').value), height = Number($('output-height').value);
      if (![width,height].every(v => Number.isInteger(v) && v >= 64 && v <= 4096) || width*height > 4096*2160) { setOutput(ui.output); status('Use whole-pixel dimensions from 64 to 4096, up to 8.8 million pixels.'); return; }
      stop(); remember(); setOutput({width,height}); changed(`Frame size: ${width} × ${height}. Use Frame to fit the pose if needed.`);
    };
    $('output-width').onchange = outputChanged; $('output-height').onchange = outputChanged;
    $('frame-size').onchange = () => { if ($('frame-size').value === 'custom') { $('output-width').focus(); return; } const [width,height] = $('frame-size').value.split('x'); $('output-width').value = width; $('output-height').value = height; outputChanged(); };
    $('play').onclick = () => {
      if (ui.playing) { stop(); syncJoint(); syncPreset(pose()); }
      else if (!ui.keys.length) status('Key at least one pose to play a take.');
      else {
        const preserved = preserveUnkeyedPose();
        scrub(ui.frame >= ui.end ? ui.start : ui.frame, true);
        ui.playing = true; playStart = performance.now(); playFrame = ui.frame;
        $('play').textContent = 'Ⅱ'; $('play').setAttribute('aria-label', 'Pause take');
        if (preserved) status('Unkeyed pose kept in Undo. Playing the keyed motion.');
      }
    };
    for (const direction of ['undo', 'redo']) $(direction).onclick = () => { finishCameraHistory(); const from = ui[direction], to = ui[direction === 'undo' ? 'redo' : 'undo']; if (!from.length) return; stop(); to.push(snapshot()); restore(from.pop()); changed(direction === 'undo' ? 'Undone.' : 'Redone.'); };
    for (const [id, alpha] of [['front', Math.PI / 2], ['side', 0], ['quarter', Math.PI / 2 - .35]]) $(id).onclick = () => { remember(); camera.alpha = alpha; camera.beta = Math.PI / 2 - .11; changed('Camera view updated.'); };
    $('frame-character').onclick = () => { stop(); remember(); if (ui.mode !== 'pose') { frameSet(); changed('Set controls framed. The scene is unchanged.'); } else if (frameDirectorCharacter(scene, camera, $('room'))) { fitOrtho(); changed('Whole character framed. Your pose is unchanged.'); } };
    $('camera-mode').onclick = () => cameraEdit(()=>cameraProjection(camera.mode===B.Camera.ORTHOGRAPHIC_CAMERA?'perspective':'orthographic'),'Camera projection updated.');
    $('save').onclick = async () => {
      stop(); $('save').disabled = true; const take = snapshot(), serialized = JSON.stringify(take); if (savePayload !== serialized) saveRequest = null; savePayload = serialized; saveRequest ||= crypto.randomUUID();
      try {
        const result = await api('', { method: 'POST', body: JSON.stringify({ take, requestId: saveRequest }) });
        const record = result.saved || result.record || result; ui.savedId = record.id || result.id;
        ui.dirty = JSON.stringify(snapshot()) !== serialized; savedSnapshot = serialized;
        // A completed save protects only the version sent. Edits made while it
        // was in flight still need their own healthy draft or durable save.
        if (!ui.dirty) ui.draftWriteFailed = false;
        $('storage-label').textContent = ui.dirty ? (ui.draftWriteFailed ? 'DRAFT NOT SAVED' : 'BROWSER DRAFT') : result.shared === false ? 'LOCAL WORKSPACE' : 'SAVED IN NEST';
        status(ui.dirty ? 'The submitted take was saved. Newer edits still need Save take.' : result.shared === false ? 'Take saved in this development workspace. Shared Nest storage is not connected here.' : 'Take saved in Nest. Crew can receive this exact version.');
        await refreshTakes();
      }
      catch (error) { status(error.message); } finally { buttons(); }
    };
    $('send').onclick = async () => {
      if (ui.dirty || !ui.savedId) return; $('send').disabled = true; sendRequest ||= crypto.randomUUID();
      try { const result = await api('', { method: 'POST', body: JSON.stringify({ action: 'send', id: ui.savedId, requestId: sendRequest }) }); status(result.shared === false ? 'Crew route recorded locally for testing. No live Crew message was sent.' : 'Sent to Crew with the saved pose, camera and timeline.'); }
      catch (error) { status(error.message); } finally { buttons(); }
    };
    $('refresh-takes').onclick = refreshTakes;
    document.addEventListener('keydown', e => { if (ui.mode === 'floorplan' || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return; if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); $(e.shiftKey ? 'redo' : 'undo').click(); } if (e.code === 'Space') { e.preventDefault(); $('play').click(); } });
    window.addEventListener('beforeunload', event => { if (ui.ready && ui.dirty && (ui.keys.length || ui.draftWriteFailed)) { event.preventDefault(); event.returnValue = ''; } });
  }
  async function start() {
    if (!A) throw new Error('The animation tools did not load. Reload to try again.');
    if (!B) throw new Error('The room renderer did not load. Reload to try again; saved takes are kept.');
    const [planModel, planRendererModule, planEditorModule] = await Promise.all([
      import('/director/floorplan-model.js'), import('/director/floorplan-renderer.js'), import('/director/floorplan-editor.js'),
    ]);
    emptyFloorplan = planModel.createPlan();
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
    camera.inertia = 0; camera.lowerRadiusLimit = .0011; camera.upperRadiusLimit = 400; camera.wheelDeltaPercentage = .025; camera.panningSensibility = 900; camera.minZ = .01; camera.fov = .62; camera.orthoTop = .74; camera.orthoBottom = -.74;
    floor = B.MeshBuilder.CreateGround('White room floor', { width: 200, height: 200 }, scene); floor.position.y = 0; floor.isPickable = false; floor.receiveShadows = true;
    const floorMat = new B.StandardMaterial('White plaster', scene); floorMat.diffuseColor = new B.Color3(.95, .955, .94); floorMat.specularColor = B.Color3.Black(); floor.material = floorMat;
    const result = await B.SceneLoader.ImportMeshAsync('', '/director/assets/', manifest.file, scene);
    result.animationGroups.forEach(group => group.stop());
    for (const name of manifest.bones) { const node = scene.getTransformNodeByName(name) || result.skeletons.flatMap(skeleton => skeleton.bones).find(bone => bone.name === name)?.getTransformNode(); if (!node) throw new Error(`The model is missing its ${name} control.`); nodes[name] = node; }
    for (const mesh of result.meshes) {
      if (!mesh.getTotalVertices()) continue;
      mesh.metadata = { ...mesh.metadata, directorCharacter: true }; mesh.receiveShadows = false; mesh.isPickable = false;
      const manager = mesh.morphTargetManager;
      if (manager) for (let i = 0; i < manager.numTargets; i++) { const target = manager.getTarget(i); (morphs[target.name] ||= []).push(target); }
    }
    if (!window.DirectorAppearance || !window.DirectorLighting || !window.DirectorStage || !window.DirectorKinematics) throw new Error('Scene tools did not load. Reload to try again.');
    stageDesign = window.DirectorStage.create(scene, { floor, validateFloorplan: planModel.validatePlan,
      floorplanRenderer: planRendererModule.createFloorplanRenderer(scene),
      onBackdropStatus: value => { if (value?.state === 'error' || value === 'error') status('The background image could not be displayed. Choose another image.'); } });
    lighting = window.DirectorLighting.create(scene); appearance = window.DirectorAppearance.create(scene); lighting.sync();
    kinematics = window.DirectorKinematics.create(scene, { nodes, neutralPose, manifest });
    gizmo = new B.GizmoManager(scene); gizmo.usePointerToAttachGizmos = false;
    gizmo.positionGizmoEnabled = true; gizmo.rotationGizmoEnabled = true; gizmo.scaleGizmoEnabled = true;
    for (const control of [gizmo.gizmos.positionGizmo, gizmo.gizmos.rotationGizmo, gizmo.gizmos.scaleGizmo]) {
      control.scaleRatio = .65;
      control.onDragStartObservable.add(() => { if(cameraTakingOver)return;stop(); dragBefore = snapshot(); gizmoTargetStart = null; gizmoTargetMoved = false; if (isPoseTarget()) { gizmoTargetStart = activeNodes()[activeSelected()].position.clone(); kinematics.begin(activeSelected()); } else if (isHipControl()) kinematics.beginBody('torso.lower'); });
      const liveDrag = () => {
        if(cameraTakingOver)return;constrainActive();
        if (isPoseTarget() && gizmoTargetStart && (gizmoTargetMoved || B.Vector3.DistanceSquared(activeNodes()[activeSelected()].position,gizmoTargetStart) > 1e-14)) { kinematics.solve(activeSelected()); gizmoTargetMoved = true; }
        else if (isHipControl()) kinematics.solveBody();
        syncActive();
      };
      if (control.onDragObservable) control.onDragObservable.add(liveDrag);
      else for (const axis of ['xGizmo','yGizmo','zGizmo','xPlaneGizmo','yPlaneGizmo','zPlaneGizmo','uniformScaleGizmo']) control[axis]?.dragBehavior?.onDragObservable.add(liveDrag);
      control.onDragEndObservable.add(() => { if(cameraTakingOver){dragBefore=null;return;}const bounded = constrainActive();
        if (isPoseTarget()) { if (gizmoTargetStart && (gizmoTargetMoved || B.Vector3.DistanceSquared(activeNodes()[activeSelected()].position,gizmoTargetStart) > 1e-14)) kinematics.solve(activeSelected()); kinematics.end(); } else if (isHipControl()) kinematics.endBody();
        gizmoTargetStart = null; gizmoTargetMoved = false;
        if (dragBefore) remember(dragBefore); dragBefore = null; syncActive(); changed(bounded ? 'Placement kept within the editable range.' : 'Placement updated.');
      });
    }
    for (const name of manifest.bones) {
      const handle = B.MeshBuilder.CreateSphere('Joint handle ' + name, { diameter: .022, segments: 8 }, scene); handle.parent = nodes[name]; handle.metadata = { joint: name }; handle.renderingGroupId = 2;
      const material = new B.StandardMaterial('Control ' + name, scene); material.disableLighting = true; material.emissiveColor = name.endsWith('.L') ? B.Color3.FromHexString('#709bc2') : name.endsWith('.R') ? B.Color3.FromHexString('#8bb99c') : B.Color3.FromHexString('#c4a06f'); handle.material = material; handles.push(handle);
    }
    scene.onPointerObservable.add(info => {
      if(ui.navigation!=='edit'||ui.mode==='camera'||cameraNavigation?.active)return;
      if (info.type === B.PointerEventTypes.POINTERPICK) { const meta = info.pickInfo?.pickedMesh?.metadata; const id = meta?.joint || meta?.directorStageId; if (id) selectControl(id); }
      if (info.type !== B.PointerEventTypes.POINTERTAP || info.event.pointerType !== 'touch' || !ui.handles) return;
      // A fingertip needs a stable screen-sized target, even when the joint dot
      // is small. The utility layer handles ring drags before this scene tap.
      const rect = $('room').getBoundingClientRect();
      const viewport = new B.Viewport(0, 0, rect.width, rect.height);
      let nearest = null, distance = 22;
      for (const handle of activeHandles()) {
        if (!handle.isEnabled()) continue;
        const screen = B.Vector3.Project(handle.getAbsolutePosition(), B.Matrix.Identity(), scene.getTransformMatrix(), viewport);
        if (screen.z < 0 || screen.z > 1) continue;
        const d = Math.hypot(screen.x - (info.event.clientX - rect.left), screen.y - (info.event.clientY - rect.top));
        if (d < distance) { distance = d; nearest = handle.metadata.joint; }
      }
      if (nearest) selectControl(nearest);
    });
    $('joint').replaceChildren(...Object.entries(kinematics.labels()).map(([id, name]) => new Option(name, id)), ...manifest.bones.map(name => new Option(label(name), name))); $('joint').disabled = false;
    $('preset').replaceChildren(new Option('Custom pose', ''), ...manifest.presets.map(preset => new Option(preset.label, preset.id))); $('preset').disabled = false; $('preset').value = 'neutral';
    for (const name of manifest.morphs.filter(name => !/overhead|shoulder/i.test(name))) {
      const wrap = document.createElement('label'); wrap.textContent = name.replace(/^Ouch \| /, ''); const input = document.createElement('input'); input.type = 'range'; input.min = 0; input.max = 1; input.step = .01; input.value = 0; input.dataset.morph = name; input.setAttribute('aria-label', wrap.textContent); input.onpointerdown = () => { stop(); syncJoint(); dragBefore = snapshot(); }; input.onkeydown = e => { if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End','PageUp','PageDown'].includes(e.key) && !dragBefore) { stop(); syncJoint(); dragBefore = snapshot(); } }; input.oninput = () => { stop(); for (const target of morphs[name] || []) target.influence = Number(input.value); changed(); }; input.onchange = () => { if (dragBefore) remember(dragBefore); dragBefore = null; }; wrap.append(input); $('morph-controls').append(wrap);
    }
    let directBefore = null;
    if (!window.DirectorDirectManipulation) throw new Error('Direct joint controls did not load. Reload to try again.');
    if (!window.DirectorCameraNavigation) throw new Error('Camera navigation did not load. Reload to try again.');
    cameraNavigation = window.DirectorCameraNavigation.install({canvas:$('room'),camera,fitOrtho,limits:cameraLimits,
      isEnabled:()=>ui.ready&&ui.mode!=='floorplan',getTool:()=>ui.navigation,isEditingHit:cameraEditingHit,
      captureEdit:()=>snapshot(),onTakeover:cancelEditForCamera,
      onBegin(){stop();return snapshot();},onChange:syncCameraEditor,
      onEnd(before,cancelled){if(cancelled){setCamera(before.camera);status('Camera gesture cancelled.');}else if(JSON.stringify(before.camera)!==JSON.stringify(cameraState())){pushHistory(before);changed('Camera view updated.');}syncCameraEditor();attachControl();}
    });
    directManipulation = window.DirectorDirectManipulation.install({
      canvas: $('room'), scene, camera, getHandles: movableHandles, getNodes: activeNodes,
      isEnabled: () => ui.ready && ui.handles && ui.navigation === 'edit' && !['camera','floorplan'].includes(ui.mode) && !cameraNavigation?.active,
      onSelect: selectControl,
      onPending: ({name}) => { $('hint').textContent = `Hold ${controlLabel(name)} to reposition`; },
      onStart: ({name}) => { stop(); directBefore = snapshot(); if (isPoseTarget()) kinematics.begin(name); else if (isHipControl()) kinematics.beginBody('torso.lower'); gizmo.attachToNode(null); $('hint').textContent = `Drag ${controlLabel(name)} · release to place`; },
      onMove: ({name}) => { constrainActive(); if (isPoseTarget()) kinematics.solve(name); else if (isHipControl()) kinematics.solveBody(); syncActive(); },
      onEnd: ({started,moved,cancelled}) => {
        if (started && isPoseTarget()) kinematics.end({cancelled}); else if (started && isHipControl()) kinematics.endBody({cancelled});
        syncActive(); attachControl();
        if (!cameraTakingOver && started && moved && !cancelled && directBefore) { remember(directBefore); changed(ui.mode === 'pose' ? 'Joint repositioned. Key this pose to put it in the motion.' : 'Set control repositioned.'); }
        else if (cancelled) status('Repositioning cancelled. The joint is back where it started.');
        directBefore = null;
        attachControl();
      }
    });
    floorplanEditor = planEditorModule.createFloorplanEditor({ canvasHost: $('floorplan-canvas-host'), inspectorHost: $('floorplan-inspector-host'),
      onCommit(next) {
        const plan = planModel.validatePlan(next), before = snapshot();
        stageDesign.setDesign({ floorplan: plan, floor: { enabled: false } });
        remember(before); setBackground('white'); syncSceneEditor(); changed('Floor plan updated. Save take or export the plan to keep a reusable copy.');
      },
      onStatus: status,
      onUndo: () => $('undo').click(), onRedo: () => $('redo').click(),
      onPreview() { stop(); const before = snapshot(); setMode('stage'); camera.beta = Math.PI / 3; frameSet(); remember(before); changed('Active level shown in 3D. Return to Floor plan to edit rooms or select another level.'); },
    });
    applyPose(neutralPose); setLook('ouch'); setBackground('white'); setOutput(ui.output); fitOrtho(); selectJoint('upper_arm.L'); bind(); bindSceneEditor(); bindCameraEditor(); ui.ready = true; setMode('pose'); syncTimeline(); buttons();
    $('loading').hidden = true; status('Ouch is ready. Pick a gesture or move a joint.');
    engine.runRenderLoop(() => { if (ui.mode === 'floorplan') return; if (ui.playing) { const elapsed = playFrame - ui.start + Math.floor((performance.now() - playStart) / 1000 * ui.fps); const count = ui.end - ui.start + 1; const frame = ui.animation.loop ? ui.start + (elapsed % count) : Math.min(ui.end, ui.start + elapsed); if (frame !== ui.frame) scrub(frame, true); if (!ui.animation.loop && elapsed >= count) { stop(); syncJoint(); syncPreset(pose()); } } appearance.setLightTime(colorClock.seconds()); scene.render(); });
    window.addEventListener('resize', resizeStage); new ResizeObserver(resizeStage).observe(document.querySelector('.stage'));
    engine.onContextLostObservable.add(() => status(ui.draftWriteFailed ? 'The graphics context paused. Keep this tab open and use Save take.' : 'The graphics context paused. Your browser draft is kept; reload if the room does not recover.'));
    engine.onContextRestoredObservable.add(() => status('The room renderer recovered.'));
    const id = new URL(location.href).searchParams.get('take');
    if (id) await loadTake(id, false);
    else try { const draft = JSON.parse(localStorage.getItem(currentDraftKey()) || localStorage.getItem(draftKey) || 'null'); if (draft) { restore(draft, { restartColor: true }); status('Your browser draft has been reopened.'); } } catch (error) { status('The previous draft uses another model revision. It remains stored; this room opened with the current model.'); }
    refreshTakes();
    // Readable diagnostics also let Crew receive the exact current state.
    window.directorStudio = { snapshot, samplePose: (frame) => A.samplePose(ui.keys, frame, ui.animation.transition), get colorPreview() { return { seconds: colorClock.seconds(), paused: colorClock.isPaused() }; }, get ready() { return ui.ready; }, get scene() { return scene; }, get manifest() { return manifest; } };
  }
  start().catch(error => { console.error(error); $('loading').querySelector('p').textContent = error.message; status(error.message); window.directorError = error.message; });
})();
