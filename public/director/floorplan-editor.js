import { createPlan, validatePlan, nearestEdge, createPlanPackage, LIMITS } from './floorplan-model.js';
import { createFloorplanOverview } from './floorplan-overview.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const clone = value => structuredClone(value);
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const round = value => Math.round(value * 10000) / 10000;
const id = prefix => `${prefix}-${globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)}`;
const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const numberText = value => Number(value.toFixed(2)).toString();
const editable = target => target instanceof Element && Boolean(target.closest('input,textarea,select,[contenteditable="true"]'));
const placementTools = new Set(['door', 'window', 'passage', 'stairs', 'elevator']);
const toolLabel = type => type[0].toUpperCase() + type.slice(1);

/** A self-contained overhead editor. The host owns saving and undo history. */
export function createFloorplanEditor({ canvasHost, inspectorHost, onCommit, onStatus, onPreview, onUndo, onRedo }) {
  if (!canvasHost || !inspectorHost) throw new Error('The floor plan needs a canvas and inspector host.');
  let plan = createPlan(), draft = null, active = false, disposed = false;
  let selection = null, tool = 'select', snap = true, drag = null, polygon = [], hover = null;
  let view = { x: 2, z: 1.5, zoom: 65 }, fitted = false;
  let history = { undo: 0, redo: 0 };
  let toolbarDrag = null, suppressedClick = null, polygonClick = null;
  let editorView = 'plan', inspectorTab = 'selected', lastSelectionKey = '', committing = false;
  const instanceId = id('floorplan-editor');
  const cleanups = [];
  const listen = (node, event, fn, options) => { node.addEventListener(event, fn, options); cleanups.push(() => node.removeEventListener(event, fn, options)); };
  const say = (message, showAddLevel = false) => {
    if (disposed) return;
    if (hint.textContent !== message) { hint.textContent = message; onStatus?.(message); }
    hintAction.hidden = !showAddLevel;
  };

  canvasHost.classList.add('fp-canvas-host');
  inspectorHost.classList.add('fp-inspector');
  canvasHost.innerHTML = `
    <div class="fp-navigation">
      <div class="fp-view-switch" role="group" aria-label="Floor plan view">
        <button type="button" data-action="view-plan" aria-pressed="true">Plan</button>
        <button type="button" data-action="view-building" aria-pressed="false">Building</button>
      </div>
      <label class="fp-canvas-level">Level<select data-canvas-level aria-label="Canvas level"></select></label>
    </div>
    <div class="fp-toolbar" role="toolbar" aria-label="Floor plan drawing tools">
      <div class="fp-tool-group">
        <button type="button" data-tool="select" aria-pressed="true" title="Select and move a room or point">Select</button>
        <button type="button" data-tool="rectangle" aria-pressed="false">Draw room</button>
        <button type="button" data-tool="polygon" aria-pressed="false">Polygon</button>
        <button type="button" data-tool="door" aria-pressed="false">Door</button>
        <button type="button" data-tool="window" aria-pressed="false">Window</button>
        <button type="button" data-tool="passage" aria-pressed="false">Passage</button>
      </div>
      <div class="fp-tool-group">
        <button type="button" data-tool="stairs" aria-pressed="false">Stairs</button>
        <button type="button" data-tool="elevator" aria-pressed="false">Elevator</button>
        <button type="button" data-tool="pan" aria-pressed="false">Pan</button>
        <button type="button" data-action="preview" class="fp-preview">Preview in 3D</button>
      </div>
    </div>
    <div class="fp-surface" tabindex="0" role="application" aria-label="Overhead floor plan. Select an item in the inspector, then use arrow keys here to move it. With nothing selected, arrow keys pan. Plus and minus zoom; zero fits the plan.">
      <svg class="fp-svg" xmlns="http://www.w3.org/2000/svg" aria-label="Editable floor plan"><title>Overhead floor plan</title></svg>
      <div class="fp-empty"><strong>Start with a room</strong><span>Drag with Draw room, or enter dimensions in the inspector.</span></div>
      <div class="fp-view-controls" role="toolbar" aria-label="Plan view controls">
        <button type="button" data-action="undo" title="Undo" aria-label="Undo floor plan change">↶</button>
        <button type="button" data-action="redo" title="Redo" aria-label="Redo floor plan change">↷</button>
        <button type="button" data-action="zoom-out" aria-label="Zoom out">−</button>
        <button type="button" data-action="zoom-in" aria-label="Zoom in">+</button>
        <button type="button" data-action="fit">Fit plan</button>
      </div>
      <div class="fp-scale" aria-hidden="true"><span class="fp-scale-level"></span><span class="fp-scale-grid"></span></div>
    </div>
    <div class="fp-building-host" hidden></div>
    <div class="fp-hint" role="status" aria-live="polite"><span class="fp-hint-text">Draw rooms and place openings on their edges.</span><button class="fp-hint-action" type="button" data-action="add-level" hidden>+ Level</button></div>`;
  inspectorHost.innerHTML = `
    <section class="fp-section">
      <h2>Floor plan</h2>
      <label>Plan name<input data-field="plan-name" maxlength="100" /></label>
      <div class="fp-pair"><label>Units<select data-field="units"><option value="unit">Working units</option><option value="m">Metres</option></select></label><label>Grid<input data-field="grid" type="number" min=".01" max="100" step="any" /></label></div>
      <label class="fp-check"><input data-field="snap" type="checkbox" checked /> Snap to grid</label>
    </section>
    <section class="fp-section">
      <div class="fp-heading"><h2>Level</h2><button type="button" data-action="add-level">+ Level</button></div>
      <label><span class="fp-sr">Active level</span><select data-field="level-select" aria-label="Active level"></select></label>
      <label>Level name<input data-field="level-name" maxlength="80" /></label>
      <div class="fp-pair"><label>Elevation<input data-field="level-elevation" type="number" min="-10000" max="10000" step="any" /></label><label>Wall height<input data-field="level-height" type="number" min=".1" max="1000" step="any" /></label></div>
      <button type="button" class="fp-subtle" data-action="delete-level">Delete this level</button>
    </section>
    <section class="fp-section">
      <label>Selected item<select data-field="selection"><option value="">Nothing selected</option></select></label>
      <div class="fp-selection"></div>
    </section>
    <section class="fp-section">
      <h2>Add a room by dimensions</h2>
      <div class="fp-pair"><label>Width<input data-field="new-width" type="number" min=".2" max="100" step="any" value="4" /></label><label>Depth<input data-field="new-depth" type="number" min=".2" max="100" step="any" value="3" /></label></div>
      <button type="button" data-action="add-room">Add room at view centre</button>
      <p class="fp-small">Drag a room to move it. Select it to edit its corners and openings.</p>
    </section>
    <section class="fp-section fp-files">
      <h2>Keep and reuse</h2>
      <div class="fp-pair"><button type="button" data-action="export">Export plan</button><button type="button" data-action="import">Import plan</button></div>
      <input class="fp-file-input" type="file" accept=".json,application/json" aria-label="Import floor plan JSON" />
      <p class="fp-small">The plan stays editable with your take. Export a copy to reuse in another set or import into Blender.</p>
      <a class="fp-download" href="/director/odk_floorplan_import.py" download>Blender importer</a>
    </section>`;

  // Keep a single set of fields. Phone tabs only change which group is visible.
  const sections = [...inspectorHost.children];
  const inspectorNav = document.createElement('div'); inspectorNav.className = 'fp-inspector-navigation';
  inspectorNav.innerHTML = `<div class="fp-inspector-tabs" role="tablist" aria-label="Floor plan properties">
    <button type="button" role="tab" data-inspector-tab="selected" id="${instanceId}-selected-tab" aria-controls="${instanceId}-selected-panel" aria-selected="true">Selected</button>
    <button type="button" role="tab" data-inspector-tab="level" id="${instanceId}-level-tab" aria-controls="${instanceId}-level-panel" aria-selected="false" tabindex="-1">Level</button>
    <button type="button" role="tab" data-inspector-tab="plan" id="${instanceId}-plan-tab" aria-controls="${instanceId}-plan-panel" aria-selected="false" tabindex="-1">Plan</button>
    </div><button type="button" data-action="return-plan" class="fp-return-plan">Return to plan</button>`;
  const panels = ['selected', 'level', 'plan'].map(name => {
    const panel = document.createElement('div'); panel.dataset.inspectorPanel = name; panel.id = `${instanceId}-${name}-panel`;
    panel.setAttribute('role', 'tabpanel'); panel.setAttribute('aria-labelledby', `${instanceId}-${name}-tab`); return panel;
  });
  panels[0].append(sections[2]); panels[1].append(sections[1]); panels[2].append(sections[0], sections[3], sections[4]);
  inspectorHost.replaceChildren(inspectorNav, ...panels);
  inspectorHost.dataset.tab = inspectorTab;

  const svg = canvasHost.querySelector('.fp-svg');
  const toolbar = canvasHost.querySelector('.fp-toolbar');
  const surface = canvasHost.querySelector('.fp-surface');
  const canvasLevel = canvasHost.querySelector('[data-canvas-level]');
  const buildingHost = canvasHost.querySelector('.fp-building-host');
  const hint = canvasHost.querySelector('.fp-hint-text');
  const hintAction = canvasHost.querySelector('.fp-hint-action');
  const empty = canvasHost.querySelector('.fp-empty');
  const selectionPanel = inspectorHost.querySelector('.fp-selection');
  const input = name => inspectorHost.querySelector(`[data-field="${name}"]`);
  const current = () => draft || plan;
  const level = (p = current()) => p.levels.find(item => item.id === p.activeLevelId);
  const room = (p = current()) => p.rooms.find(item => item.id === (selection?.roomId || selection?.id));
  const connector = (p = current()) => p.connectors.find(item => item.id === selection?.id);
  const snapped = point => point.map(value => round(snap ? Math.round(value / plan.grid) * plan.grid : value));
  const units = () => plan.units === 'm' ? 'm' : 'u';
  const selectedOpening = (p = current()) => room(p)?.openings.find(item => item.id === selection?.id);
  const levelLabel = (item, p = plan) => p.levels.filter(l => l.name === item.name).length > 1 ? `${item.name} · level ${p.levels.indexOf(item) + 1}` : item.name;
  const levelOptions = () => plan.levels.map(item => new Option(levelLabel(item), item.id));
  const textMeasure = document.createElement('canvas').getContext('2d');
  function labelText(text, maxPixels, size, weight = 400) {
    const chars = Array.from(text); if (!textMeasure) return chars.length > 22 ? chars.slice(0, 21).join('') + '…' : text;
    textMeasure.font = `${weight} ${size}px system-ui, sans-serif`;
    if (textMeasure.measureText(text).width <= maxPixels) return text;
    let low = 0, high = chars.length;
    while (low < high) { const middle = Math.ceil((low + high) / 2); if (textMeasure.measureText(chars.slice(0, middle).join('') + '…').width <= maxPixels) low = middle; else high = middle - 1; }
    return chars.slice(0, low).join('') + '…';
  }
  const overview = createFloorplanOverview({ host: buildingHost, onSelectLevel: levelId => selectLevel(levelId, { returnToPlan: true }) });
  const dragBadge = document.createElement('div');
  dragBadge.className = 'fp-drag-badge'; dragBadge.hidden = true; dragBadge.setAttribute('aria-hidden', 'true'); document.body.append(dragBadge);
  for (const button of toolbar.querySelectorAll('button[data-tool]')) if (placementTools.has(button.dataset.tool)) {
    button.dataset.placeable = 'true'; button.title = `Drag ${button.textContent} onto the plan, or tap to select`;
  }

  function svgNode(tag, attributes, content) {
    const node = document.createElementNS(SVG_NS, tag);
    for (const [key, value] of Object.entries(attributes || {})) node.setAttribute(key, String(value));
    if (content !== undefined) node.textContent = content;
    svg.append(node); return node;
  }
  function shape(tag, attributes, kind, itemId, roomId) {
    return svgNode(tag, { ...attributes, 'data-kind': kind, 'data-id': itemId, ...(roomId ? { 'data-room': roomId } : {}) });
  }
  function size() { const rect = surface.getBoundingClientRect(); return { width: Math.max(1, rect.width), height: Math.max(1, rect.height), rect }; }
  function world(event) {
    const { width, height, rect } = size();
    return [view.x + (event.clientX - rect.left - width / 2) / view.zoom, view.z + (event.clientY - rect.top - height / 2) / view.zoom];
  }
  function resetGesture() {
    clearToolbarDrag();
    const pointerId = drag?.pointerId;
    draft = null; drag = null; polygon = []; hover = null; polygonClick = null;
    if (pointerId !== undefined && svg.hasPointerCapture(pointerId)) svg.releasePointerCapture(pointerId);
    renderPlan();
  }
  function setInspectorTab(name, focus = false, scroll = false) {
    if (!['selected', 'level', 'plan'].includes(name)) return;
    inspectorTab = name; inspectorHost.dataset.tab = name;
    for (const button of inspectorNav.querySelectorAll('[data-inspector-tab]')) {
      const selected = button.dataset.inspectorTab === name;
      button.setAttribute('aria-selected', String(selected)); button.tabIndex = selected ? 0 : -1;
      if (selected && focus) button.focus({ preventScroll: true });
    }
    if (scroll) inspectorHost.closest('.inspector')?.scrollTo({ top: 0, behavior: 'auto' });
  }
  function setEditorView(next) {
    if (!['plan', 'building'].includes(next)) return;
    resetGesture(); editorView = next;
    canvasHost.dataset.view = next;
    toolbar.hidden = next === 'building'; surface.hidden = next === 'building';
    canvasHost.querySelector('[data-action="view-plan"]').setAttribute('aria-pressed', String(next === 'plan'));
    canvasHost.querySelector('[data-action="view-building"]').setAttribute('aria-pressed', String(next === 'building'));
    overview.setPlan(plan); overview.setVisible(active && next === 'building');
    if (next === 'building') say('All levels and their connections. Choose a level to edit its plan.');
    else { renderPlan(); if (!fitted && (plan.rooms.length || plan.connectors.length)) fit(); say(`Plan view · ${level(plan).name}.`); }
  }
  function selectLevel(levelId, { returnToPlan = false } = {}) {
    const nextLevel = plan.levels.find(l => l.id === levelId); if (!nextLevel) return;
    resetGesture(); selection = null;
    const changed = levelId === plan.activeLevelId || change(next => { next.activeLevelId = levelId; }, `Showing ${nextLevel.name}.`);
    if (!changed) return;
    if (returnToPlan) setEditorView('plan');
    renderAll(); if (editorView === 'plan') fit(); say(`Showing ${nextLevel.name}.`);
  }
  function validSelection() {
    if (!selection) return;
    const r = room(plan), c = connector(plan);
    if (selection.kind === 'connector' ? !c || c.fromLevelId !== plan.activeLevelId && c.toLevelId !== plan.activeLevelId : !r || r.levelId !== plan.activeLevelId || selection.kind === 'opening' && !selectedOpening(plan)) selection = null;
  }
  function commit(next, message) {
    const before = clone(plan);
    try {
      const validated = validatePlan(next);
      if (JSON.stringify(before) === JSON.stringify(validated)) { draft = null; renderAll(); return false; }
      plan = validated; draft = null; validSelection();
      committing = true;
      try { onCommit?.(clone(plan), before); } finally { committing = false; }
      renderAll(); if (message) say(message); return true;
    } catch (error) {
      plan = before; draft = null; validSelection(); renderAll();
      say(error?.message || 'That change could not be applied. Your previous plan is kept.'); return false;
    }
  }
  function change(mutator, message) {
    try { const next = clone(plan); mutator(next); return commit(next, message); }
    catch (error) { renderAll(); say(error?.message || 'That change could not be applied.'); return false; }
  }
  function setTool(next) {
    resetGesture(); tool = next;
    for (const button of canvasHost.querySelectorAll('button[data-tool]')) button.setAttribute('aria-pressed', String(button.dataset.tool === tool));
    surface.dataset.tool = tool;
    const messages = { select: 'Select a room, opening or connection. Drag a corner to reshape a room.', rectangle: 'Drag from one corner to the opposite corner to draw a room.', polygon: 'Tap each corner, then the first corner to finish. Enter also finishes; Escape cancels.', door: 'Drag Door to a wall, or tap a wall to place it.', window: 'Drag Window to a wall, or tap a wall to place it.', passage: 'Drag Passage to a wall, or tap a wall to place it.', stairs: 'Drag Stairs onto the plan, or tap to place it. Choose its destination in the inspector.', elevator: 'Drag Elevator onto the plan, or tap to place it. Choose its destination in the inspector.', pan: 'Drag the plan to pan. Use + and − or the mouse wheel to zoom.' };
    const requirement = connectionRequirement(tool);
    say(requirement?.message || messages[tool], requirement?.addLevel);
  }
  function newRoom(points) {
    return { id: id('room'), levelId: plan.activeLevelId, name: `Room ${plan.rooms.length + 1}`, points, wallThickness: .15, wallColor: '#61766a', floorColor: '#ded4bd', openings: [] };
  }
  function addRoom(points) {
    const value = newRoom(points); selection = { kind: 'room', id: value.id };
    if (change(next => next.rooms.push(value), 'Room added. Select its corners to refine the outline.')) setTool('select');
  }
  function finishPolygon() {
    let points = polygon.slice();
    if (points.length > 1 && distance(points[0], points.at(-1)) < .001) points.pop();
    if (points.length < 3) { renderPlan(); say('Keep adding corners. A room needs at least three; tap the first corner to finish.'); return; }
    polygon = []; hover = null; polygonClick = null;
    addRoom(points);
  }
  function nearestWall(point) {
    let best = null;
    for (const r of current().rooms.filter(item => item.levelId === current().activeLevelId)) {
      const edge = nearestEdge(r, point);
      if (edge && (!best || edge.distance < best.distance)) best = { ...edge, room: r };
    }
    return best && best.distance < Math.max(.2, 16 / view.zoom) ? best : null;
  }
  function otherConnectionLevel() { return plan.levels.find(item => item.id !== plan.activeLevelId && Math.abs(item.elevation - level(plan).elevation) >= 1e-7); }
  function connectionRequirement(type) {
    if (!['stairs', 'elevator'].includes(type) || otherConnectionLevel()) return null;
    return { message: plan.levels.length === 1 ? `Add another level with + Level before placing ${type}.` : `Set a different elevation for another level before placing ${type}.`, addLevel: plan.levels.length === 1 };
  }
  function placementAt(type, point, itemId = id('placement')) {
    const requirement = connectionRequirement(type), position = snapped(point);
    if (requirement) return { valid: false, point: position, ...requirement };
    if ([...point, ...position].some(n => !Number.isFinite(n) || Math.abs(n) > LIMITS.coordinate)) return { valid: false, point: position, message: 'Move closer to the plan origin before placing this item.' };
    if (['stairs', 'elevator'].includes(type)) {
      if (plan.connectors.length >= LIMITS.connectors) return { valid: false, point: position, message: 'This plan has reached its connection limit.' };
      return { valid: true, kind: 'connector', point: position, message: `Release to place ${toolLabel(type)}.`, value: { id: itemId, type, name: toolLabel(type), fromLevelId: plan.activeLevelId, toLevelId: otherConnectionLevel().id, position, size: type === 'stairs' ? [1, 1.8] : [1.2, 1.2], rotation: 0 } };
    }
    const hit = nearestWall(point);
    if (!hit) return { valid: false, point: position, message: plan.rooms.some(r => r.levelId === plan.activeLevelId) ? `Place ${toolLabel(type)} on a wall edge.` : `Draw a room first, then place ${toolLabel(type)} on a wall.` };
    const a = hit.room.points[hit.edge], b = hit.room.points[(hit.edge + 1) % hit.room.points.length], length = distance(a, b);
    const width = round(Math.min(type === 'passage' ? 1.2 : type === 'window' ? 1 : .9, length * .6));
    if (width < .02) return { valid: false, point: position, message: 'That wall edge is too short for an opening.' };
    if (hit.room.openings.length >= LIMITS.openingsPerRoom || plan.rooms.reduce((sum, r) => sum + r.openings.length, 0) >= LIMITS.openings) return { valid: false, point: position, message: 'This room or plan has reached its opening limit.' };
    const wallHeight = level(plan).height, sill = type === 'window' ? Math.min(.9, wallHeight * .3) : 0;
    const height = type === 'window' ? Math.min(1.2, wallHeight - sill) : Math.min(2.1, wallHeight);
    const along = snap ? Math.round(hit.at * length / plan.grid) * plan.grid : hit.at * length;
    const at = clamp(along / length, width / (2 * length), 1 - width / (2 * length));
    const center = [a[0] + (b[0] - a[0]) * at, a[1] + (b[1] - a[1]) * at];
    return { valid: true, kind: 'opening', roomId: hit.room.id, point: center, wall: { a, b, thickness: hit.room.wallThickness }, message: `Release to place ${toolLabel(type)}.`, value: { id: itemId, type, edge: hit.edge, at, width, height: round(height), sill: round(sill) } };
  }
  function place(candidate) {
    if (!candidate.valid) { say(candidate.message, candidate.addLevel); return false; }
    const previousSelection = selection;
    selection = { kind: candidate.kind, id: candidate.value.id, ...(candidate.roomId ? { roomId: candidate.roomId } : {}) };
    const changed = change(next => {
      if (candidate.kind === 'opening') next.rooms.find(r => r.id === candidate.roomId).openings.push(candidate.value);
      else next.connectors.push(candidate.value);
    });
    if (changed) {
      setTool('select');
      if (candidate.kind === 'connector') {
        const from = plan.levels.find(l => l.id === candidate.value.fromLevelId), to = plan.levels.find(l => l.id === candidate.value.toLevelId);
        say(`${toolLabel(candidate.value.type)}: ${from.name} → ${to.name}. Edit the destination in the inspector.`);
      } else say(`${toolLabel(candidate.value.type)} added. Adjust it in the inspector.`);
    }
    else { selection = previousSelection; validSelection(); renderAll(); }
    return changed;
  }
  function addOpening(point) { return place(placementAt(tool, point)); }
  function addConnector(point) { return place(placementAt(tool, point)); }

  function clearToolbarDrag() {
    const previous = toolbarDrag; toolbarDrag = null; dragBadge.hidden = true;
    if (!previous) return null;
    suppressedClick = { button: previous.button, until: performance.now() + 800 };
    previous.button.classList.remove('fp-dragging');
    if (previous.button.hasPointerCapture(previous.pointerId)) previous.button.releasePointerCapture(previous.pointerId);
    return previous;
  }
  function canvasDropPoint(event) {
    const { rect } = size(), hit = document.elementFromPoint(event.clientX, event.clientY);
    return event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom && (hit === surface || hit === svg || svg.contains(hit)) ? world(event) : null;
  }
  function updateToolbarDrag(event) {
    if (!toolbarDrag || toolbarDrag.pointerId !== event.pointerId) return;
    const gesture = toolbarDrag;
    if (!gesture.started && Math.hypot(event.clientX - gesture.start[0], event.clientY - gesture.start[1]) < (event.pointerType === 'touch' ? 8 : 6)) return;
    gesture.started = true; gesture.button.classList.add('fp-dragging');
    const point = canvasDropPoint(event), requirement = connectionRequirement(gesture.type);
    gesture.candidate = point ? placementAt(gesture.type, point, gesture.itemId) : { valid: false, point: null, message: requirement?.message || `Drop ${toolLabel(gesture.type)} inside the plan.`, addLevel: requirement?.addLevel };
    dragBadge.hidden = false; dragBadge.dataset.valid = String(gesture.candidate.valid);
    dragBadge.textContent = gesture.candidate.valid ? `${toolLabel(gesture.type)} · release to place` : `${toolLabel(gesture.type)} · ${requirement ? (requirement.addLevel ? 'needs another level' : 'needs a different elevation') : 'move to ' + (['stairs', 'elevator'].includes(gesture.type) ? 'the plan' : 'a wall')}`;
    dragBadge.style.left = `${clamp(event.clientX, 100, Math.max(100, innerWidth - 100))}px`; dragBadge.style.top = `${Math.max(8, event.clientY - 54)}px`;
    say(gesture.candidate.message, gesture.candidate.addLevel); renderPlan();
  }
  function deleteSelection() {
    if (!selection) return;
    const selected = { ...selection };
    change(next => {
      if (selected.kind === 'room') next.rooms = next.rooms.filter(r => r.id !== selected.id);
      else if (selected.kind === 'opening') { const r = next.rooms.find(r => r.id === selected.roomId); if (r) r.openings = r.openings.filter(o => o.id !== selected.id); }
      else next.connectors = next.connectors.filter(c => c.id !== selected.id);
    }, 'Selection removed. Undo restores it.');
  }
  function fit() {
    if (editorView !== 'plan') { fitted = false; return; }
    const rooms = plan.rooms.filter(r => r.levelId === plan.activeLevelId);
    const points = rooms.flatMap(r => r.points);
    for (const c of plan.connectors.filter(c => c.fromLevelId === plan.activeLevelId || c.toLevelId === plan.activeLevelId)) {
      const angle = c.rotation * Math.PI / 180;
      for (const x of [-c.size[0] / 2, c.size[0] / 2]) for (const z of [-c.size[1] / 2, c.size[1] / 2]) points.push([c.position[0] + x * Math.cos(angle) - z * Math.sin(angle), c.position[1] + x * Math.sin(angle) + z * Math.cos(angle)]);
    }
    if (!points.length) { view = { x: 2, z: 1.5, zoom: 65 }; renderPlan(); return; }
    const xs = points.map(p => p[0]), zs = points.map(p => p[1]);
    const minX = Math.min(...xs), maxX = Math.max(...xs), minZ = Math.min(...zs), maxZ = Math.max(...zs), { width, height } = size();
    view = { x: (minX + maxX) / 2, z: (minZ + maxZ) / 2, zoom: clamp(Math.min((width - 100) / Math.max(1, maxX - minX), (height - 100) / Math.max(1, maxZ - minZ)), 6, 240) };
    fitted = true; renderPlan();
  }

  function renderPlan() {
    if (disposed) return;
    const p = current(), { width, height } = size();
    const minX = view.x - width / (2 * view.zoom), minZ = view.z - height / (2 * view.zoom), w = width / view.zoom, h = height / view.zoom;
    svg.setAttribute('viewBox', `${minX} ${minZ} ${w} ${h}`);
    svg.replaceChildren();
    let spacing = p.grid; while (spacing * view.zoom < 12) spacing *= 2;
    for (let x = Math.ceil(minX / spacing) * spacing; x < minX + w; x += spacing) svgNode('line', { x1: x, y1: minZ, x2: x, y2: minZ + h, stroke: Math.abs(x) < .0001 ? '#afc0b8' : '#dbe3df', 'stroke-width': 1, 'vector-effect': 'non-scaling-stroke', 'pointer-events': 'none' });
    for (let z = Math.ceil(minZ / spacing) * spacing; z < minZ + h; z += spacing) svgNode('line', { x1: minX, y1: z, x2: minX + w, y2: z, stroke: Math.abs(z) < .0001 ? '#afc0b8' : '#dbe3df', 'stroke-width': 1, 'vector-effect': 'non-scaling-stroke', 'pointer-events': 'none' });
    const rooms = p.rooms.filter(r => r.levelId === p.activeLevelId);
    for (const r of rooms) {
      const selected = selection && (selection.id === r.id || selection.roomId === r.id);
      shape('polygon', { points: r.points.map(v => v.join(',')).join(' '), fill: r.floorColor, 'fill-opacity': .75, stroke: selected ? '#168b66' : '#34483d', 'stroke-width': r.wallThickness, 'stroke-linejoin': 'round' }, 'room', r.id);
    }
    // Draw every wall before openings, so an adjacent room cannot paint over a shared doorway.
    for (const r of rooms) {
      const selected = selection && (selection.id === r.id || selection.roomId === r.id);
      for (const o of r.openings) {
        const a = r.points[o.edge], b = r.points[(o.edge + 1) % r.points.length]; if (!a || !b) continue;
        const len = distance(a, b); if (len < .00001) continue;
        const ux = (b[0] - a[0]) / len, uz = (b[1] - a[1]) / len, cx = a[0] + (b[0] - a[0]) * o.at, cz = a[1] + (b[1] - a[1]) * o.at;
        const x1 = cx - ux * o.width / 2, z1 = cz - uz * o.width / 2, x2 = cx + ux * o.width / 2, z2 = cz + uz * o.width / 2;
        shape('line', { x1, y1: z1, x2, y2: z2, stroke: '#f1f5f1', 'stroke-width': Math.max(r.wallThickness * 1.3, 9 / view.zoom), 'stroke-linecap': 'butt' }, 'opening', o.id, r.id);
        if (o.type === 'window') shape('line', { x1, y1: z1, x2, y2: z2, stroke: '#3e899d', 'stroke-width': 3, 'vector-effect': 'non-scaling-stroke' }, 'opening', o.id, r.id);
        if (o.type === 'door') {
          svgNode('path', { d: `M ${x2} ${z2} A ${o.width} ${o.width} 0 0 1 ${x1 - uz * o.width} ${z1 + ux * o.width}`, fill: 'none', stroke: '#537362', 'stroke-width': 1, 'vector-effect': 'non-scaling-stroke', 'pointer-events': 'none' });
          svgNode('line', { x1, y1: z1, x2: x1 - uz * o.width, y2: z1 + ux * o.width, stroke: '#537362', 'stroke-width': 2, 'vector-effect': 'non-scaling-stroke', 'pointer-events': 'none' });
        }
        shape('circle', { cx, cy: cz, r: (selection?.id === o.id ? 6 : 4) / view.zoom, fill: selection?.id === o.id ? '#087652' : '#f8fbf8', stroke: '#168b66', 'stroke-width': 1.5, 'vector-effect': 'non-scaling-stroke' }, 'opening', o.id, r.id);
      }
      const cx = r.points.reduce((s, v) => s + v[0], 0) / r.points.length, cz = r.points.reduce((s, v) => s + v[1], 0) / r.points.length;
      const label = shape('text', { x: cx, y: cz, 'font-size': 13 / view.zoom, 'font-weight': 600, 'text-anchor': 'middle', 'dominant-baseline': 'middle', fill: '#24392f', 'paint-order': 'stroke', stroke: '#f5f7f2', 'stroke-width': 3 / view.zoom, 'stroke-linejoin': 'round' }, 'room', r.id);
      label.textContent = r.name;
      if (selected) r.points.forEach((a, i) => {
        const b = r.points[(i + 1) % r.points.length], len = distance(a, b);
        svgNode('text', { x: (a[0] + b[0]) / 2, y: (a[1] + b[1]) / 2 - 10 / view.zoom, 'font-size': 10 / view.zoom, 'text-anchor': 'middle', fill: '#20533e', 'paint-order': 'stroke', stroke: '#f2f6f2', 'stroke-width': 3 / view.zoom, 'pointer-events': 'none' }, `${numberText(len)} ${units()}`);
        shape('circle', { cx: a[0], cy: a[1], r: 6 / view.zoom, fill: '#ffffff', stroke: '#087652', 'stroke-width': 2, 'vector-effect': 'non-scaling-stroke', 'data-index': i }, 'vertex', r.id, r.id);
      });
    }
    for (const c of p.connectors.filter(c => c.fromLevelId === p.activeLevelId || c.toLevelId === p.activeLevelId)) {
      const selected = selection?.id === c.id, x = c.position[0], z = c.position[1], angle = c.rotation;
      shape('rect', { x: x - c.size[0] / 2, y: z - c.size[1] / 2, width: c.size[0], height: c.size[1], transform: `rotate(${angle},${x},${z})`, fill: selected ? '#c6e2d2' : '#e8ecf4', stroke: selected ? '#087652' : '#526a8a', 'stroke-width': 2, 'stroke-dasharray': '5 3', 'vector-effect': 'non-scaling-stroke' }, 'connector', c.id);
      const targetId = c.fromLevelId === p.activeLevelId ? c.toLevelId : c.fromLevelId;
      const target = p.levels.find(l => l.id === targetId), context = `${toolLabel(c.type)} ${c.fromLevelId === p.activeLevelId ? 'to' : 'from'} ${target ? levelLabel(target, p) : ''}`;
      const maxWidth = clamp(c.size[0] * view.zoom + 24, 78, selected ? 210 : 145);
      const marker = shape('text', { x, y: z - 3 / view.zoom, 'font-size': 12 / view.zoom, 'font-weight': 600, 'text-anchor': 'middle', fill: '#243d54', 'paint-order': 'stroke', stroke: '#f4f7f1', 'stroke-width': 3 / view.zoom, 'aria-label': c.name }, 'connector', c.id); marker.textContent = labelText(c.name, maxWidth, 12, 600);
      const caption = shape('text', { x, y: z + 12 / view.zoom, 'font-size': 10 / view.zoom, 'text-anchor': 'middle', fill: '#3d536e', 'paint-order': 'stroke', stroke: '#f4f7f1', 'stroke-width': 2 / view.zoom, 'aria-label': context }, 'connector', c.id); caption.textContent = labelText(context, maxWidth, 10);
      for (const [node, titleText] of [[marker, c.name], [caption, context]]) { const title = document.createElementNS(SVG_NS, 'title'); title.textContent = titleText; node.append(title); }
    }
    if (drag?.kind === 'rectangle' && hover) {
      const a = drag.start, b = hover;
      svgNode('rect', { x: Math.min(a[0], b[0]), y: Math.min(a[1], b[1]), width: Math.abs(b[0] - a[0]), height: Math.abs(b[1] - a[1]), fill: '#a7d5bd', 'fill-opacity': .5, stroke: '#168b66', 'stroke-width': 2, 'stroke-dasharray': '6 4', 'vector-effect': 'non-scaling-stroke' });
    }
    if (polygon.length) {
      const points = [...polygon, ...(hover ? [hover] : [])];
      svgNode('polyline', { points: points.map(p => p.join(',')).join(' '), fill: 'none', stroke: '#168b66', 'stroke-width': 2, 'vector-effect': 'non-scaling-stroke', 'pointer-events': 'none' });
      polygon.forEach(p => svgNode('circle', { cx: p[0], cy: p[1], r: 4 / view.zoom, fill: '#168b66', 'pointer-events': 'none' }));
    }
    const preview = toolbarDrag?.started && toolbarDrag.candidate;
    if (preview?.point) {
      const [x, z] = preview.point, color = preview.valid ? '#087652' : '#ad3b32';
      const group = svgNode('g', { 'data-placement-ghost': toolbarDrag.type, 'data-valid': String(preview.valid), 'pointer-events': 'none' });
      const ghost = (tag, attrs) => { const node = svgNode(tag, { ...attrs, 'pointer-events': 'none' }); group.append(node); return node; };
      if (preview.kind === 'connector') {
        const [w, d] = preview.value.size;
        ghost('rect', { x: x - w / 2, y: z - d / 2, width: w, height: d, fill: '#b3edcc', 'fill-opacity': .7, stroke: color, 'stroke-width': 3, 'stroke-dasharray': '6 3', 'vector-effect': 'non-scaling-stroke' });
      } else if (preview.kind === 'opening') {
        const { a, b, thickness } = preview.wall, length = distance(a, b), ux = (b[0] - a[0]) / length, uz = (b[1] - a[1]) / length, width = preview.value.width;
        ghost('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: '#32b180', 'stroke-opacity': .35, 'stroke-width': Math.max(thickness, 12 / view.zoom) });
        ghost('line', { x1: x - ux * width / 2, y1: z - uz * width / 2, x2: x + ux * width / 2, y2: z + uz * width / 2, stroke: '#f7fff8', 'stroke-width': Math.max(thickness * 1.4, 9 / view.zoom) });
        ghost('line', { x1: x - ux * width / 2, y1: z - uz * width / 2, x2: x + ux * width / 2, y2: z + uz * width / 2, stroke: color, 'stroke-width': 4, 'vector-effect': 'non-scaling-stroke' });
      }
      ghost('circle', { cx: x, cy: z, r: 7 / view.zoom, fill: preview.valid ? '#e5fff1' : '#ffefed', stroke: color, 'stroke-width': 2, 'vector-effect': 'non-scaling-stroke' });
      if (!preview.valid) ghost('path', { d: `M ${x - 3 / view.zoom} ${z - 3 / view.zoom} L ${x + 3 / view.zoom} ${z + 3 / view.zoom} M ${x + 3 / view.zoom} ${z - 3 / view.zoom} L ${x - 3 / view.zoom} ${z + 3 / view.zoom}`, stroke: color, 'stroke-width': 1.5, 'vector-effect': 'non-scaling-stroke' });
    }
    empty.hidden = Boolean(rooms.length || polygon.length || drag || toolbarDrag?.started);
    canvasHost.querySelector('.fp-scale-level').textContent = level(p)?.name || '';
    canvasHost.querySelector('.fp-scale-grid').textContent = `grid ${numberText(p.grid)} ${units()}${snap ? ' · snap' : ''}`;
  }

  function updateValue(name, value) { const node = input(name); if (node) node.value = value; }
  function renderInspector() {
    const focused = selectionPanel.contains(document.activeElement) ? document.activeElement : null;
    const focusData = focused?.dataset.field ? { ...focused.dataset } : null;
    const openDetails = [...selectionPanel.querySelectorAll('details[open]')].map(node => node.className);
    const previousRoomId = selectionPanel.dataset.roomId;
    renderInspectorFields();
    const selectionKey = selection ? `${selection.kind}:${selection.id}` : '';
    if (selectionKey && selectionKey !== lastSelectionKey) setInspectorTab('selected');
    lastSelectionKey = selectionKey;
    const sameRoom = previousRoomId === selectionPanel.dataset.roomId;
    if (sameRoom) for (const node of selectionPanel.querySelectorAll('details')) if (openDetails.includes(node.className)) node.open = true;
    if (focusData && sameRoom) {
      const replacement = [...selectionPanel.querySelectorAll('[data-field]')].find(node => Object.entries(focusData).every(([key, value]) => node.dataset[key] === value));
      const visible = node => node && node.getClientRects().length && !node.closest('details:not([open])');
      const focusTarget = visible(replacement) ? replacement : [input('opening-type'), input('selection')].find(visible);
      focusTarget?.focus({ preventScroll: true });
    }
  }
  function renderInspectorFields() {
    validSelection(); const l = level(plan);
    updateValue('plan-name', plan.name); updateValue('units', plan.units); updateValue('grid', plan.grid);
    input('snap').checked = snap;
    const levels = input('level-select'); levels.replaceChildren(...levelOptions()); levels.value = plan.activeLevelId;
    canvasLevel.replaceChildren(...levelOptions()); canvasLevel.value = plan.activeLevelId;
    updateValue('level-name', l.name); updateValue('level-elevation', l.elevation); updateValue('level-height', l.height);
    inspectorHost.querySelector('[data-action="delete-level"]').disabled = plan.levels.length < 2;
    const items = input('selection');
    items.replaceChildren(new Option('Nothing selected', ''),
      ...plan.rooms.filter(r => r.levelId === plan.activeLevelId).flatMap(r => [new Option(`Room · ${r.name}`, r.id),
        ...r.openings.map(o => new Option(`${o.type[0].toUpperCase()}${o.type.slice(1)} · ${r.name} · edge ${o.edge + 1}`, o.id))]),
      ...plan.connectors.filter(c => c.fromLevelId === plan.activeLevelId || c.toLevelId === plan.activeLevelId).map(c => new Option(`Connection · ${c.name}`, c.id)));
    items.value = selection?.id || '';
    selectionPanel.dataset.roomId = selection?.roomId || selection?.id || '';
    if (!selection) { selectionPanel.innerHTML = '<h2>Selection</h2><p class="fp-small">Choose a room, opening or level connection on the plan to edit it.</p>'; return; }
    if (selection.kind === 'connector') {
      const c = connector(plan);
      selectionPanel.innerHTML = `<div class="fp-heading"><h2>Level connection</h2><button type="button" data-action="delete-selection">Delete</button></div>
        <p class="fp-selection-summary"></p>
        <label>Name<input data-field="connection-name" maxlength="80" /></label>
        <label>Type<select data-field="connection-type"><option value="stairs">Stairs</option><option value="elevator">Elevator</option></select></label>
        <label>From level<select data-field="connection-from"></select></label><label>To level<select data-field="connection-to"></select></label>
        <details class="fp-connection-geometry"><summary>Position and size</summary>
        <div class="fp-pair"><label>X<input data-field="connection-x" type="number" min="-10000" max="10000" step="any" /></label><label>Z<input data-field="connection-z" type="number" min="-10000" max="10000" step="any" /></label></div>
        <div class="fp-pair"><label>Width<input data-field="connection-width" type="number" min=".1" max="1000" step="any" /></label><label>Depth<input data-field="connection-depth" type="number" min=".1" max="1000" step="any" /></label></div>
        <label>Rotation °<input data-field="connection-rotation" type="number" min="-360" max="360" step="any" /></label></details>
        <p class="fp-small">Marks a planned connection between levels. Its footprint stays editable.</p>`;
      const from = plan.levels.find(item => item.id === c.fromLevelId), to = plan.levels.find(item => item.id === c.toLevelId);
      selectionPanel.querySelector('.fp-selection-summary').textContent = `${levelLabel(from)} → ${levelLabel(to)}`;
      for (const field of ['connection-from', 'connection-to']) input(field).replaceChildren(...levelOptions());
      for (const [field, value] of Object.entries({ 'connection-name': c.name, 'connection-type': c.type, 'connection-from': c.fromLevelId, 'connection-to': c.toLevelId, 'connection-x': c.position[0], 'connection-z': c.position[1], 'connection-width': c.size[0], 'connection-depth': c.size[1], 'connection-rotation': c.rotation })) updateValue(field, value);
      return;
    }
    const r = room(plan);
    selectionPanel.innerHTML = `<div class="fp-heading"><h2>${selection.kind === 'opening' ? 'Opening' : 'Room'}</h2><button type="button" data-action="delete-selection">Delete</button></div>
      <p class="fp-selection-summary"></p>
      <div class="fp-opening-properties"></div>
      ${selection.kind === 'opening' ? '<details class="fp-room-settings"><summary>Room settings</summary>' : ''}
      <label>Room name<input data-field="room-name" maxlength="80" /></label>
      <div class="fp-pair"><label>Wall thickness<input data-field="wall-thickness" type="number" min=".01" max="5" step="any" /></label><label>Move to level<select data-field="room-level"></select></label></div>
      <div class="fp-pair"><label>Floor color<input data-field="floor-color" type="color" /></label><label>Wall color<input data-field="wall-color" type="color" /></label></div>
      <label>Opening<select data-field="opening-select"><option value="">Select an opening…</option></select></label>
      <details class="fp-vertices"><summary>Corner coordinates</summary><div class="fp-vertex-fields"></div></details>
      <button type="button" class="fp-subtle" data-action="duplicate-room">Duplicate room</button>${selection.kind === 'opening' ? '</details>' : ''}`;
    selectionPanel.querySelector('.fp-selection-summary').textContent = `${r.name} · ${levelLabel(l)}`;
    input('room-level').replaceChildren(...levelOptions());
    for (const [field, value] of Object.entries({ 'room-name': r.name, 'wall-thickness': r.wallThickness, 'room-level': r.levelId, 'floor-color': r.floorColor, 'wall-color': r.wallColor })) updateValue(field, value);
    const openingSelect = input('opening-select');
    for (const [i, o] of r.openings.entries()) openingSelect.add(new Option(`${o.type[0].toUpperCase()}${o.type.slice(1)} ${i + 1} · edge ${o.edge + 1}`, o.id));
    openingSelect.value = selection.kind === 'opening' ? selection.id : '';
    if (selection.kind === 'opening') {
      const o = selectedOpening(plan);
      selectionPanel.querySelector('.fp-opening-properties').innerHTML = `<label>Opening type<select data-field="opening-type"><option value="door">Door</option><option value="window">Window</option><option value="passage">Passage</option></select></label>
        <div class="fp-pair"><label>Width<input data-field="opening-width" type="number" min=".02" max="20000" step="any" /></label><label>Height<input data-field="opening-height" type="number" min=".02" step="any" /></label></div>
        <div class="fp-pair"><label>Sill height<input data-field="opening-sill" type="number" min="0" step="any" /></label><label>Along edge %<input data-field="opening-at" type="number" min="0" max="100" step="any" /></label></div>`;
      for (const [field, value] of Object.entries({ 'opening-type': o.type, 'opening-width': o.width, 'opening-height': o.height, 'opening-sill': o.sill, 'opening-at': round(o.at * 100) })) updateValue(field, value);
      input('opening-height').max = String(l.height); input('opening-sill').max = String(l.height);
      input('opening-sill').disabled = o.type !== 'window';
    }
    const corners = selectionPanel.querySelector('.fp-vertex-fields');
    r.points.forEach((point, i) => {
      const row = document.createElement('div'); row.className = 'fp-pair';
      for (const [axis, label] of [[0, 'X'], [1, 'Z']]) {
        const wrap = document.createElement('label'); wrap.textContent = `${i + 1} · ${label}`;
        const field = document.createElement('input'); field.type = 'number'; field.step = "any"; field.min = "-10000"; field.max = "10000"; field.value = String(point[axis]); field.dataset.field = 'vertex'; field.dataset.index = String(i); field.dataset.axis = String(axis);
        wrap.append(field); row.append(wrap);
      }
      corners.append(row);
    });
  }
  function renderHistory() {
    const undo = canvasHost.querySelector('[data-action="undo"]'), redo = canvasHost.querySelector('[data-action="redo"]');
    undo.disabled = !history.undo; redo.disabled = !history.redo;
    undo.title = `Undo · ${history.undo} back`; redo.title = `Redo · ${history.redo} forward`;
  }
  function renderAll() { renderPlan(); renderInspector(); renderHistory(); overview.setPlan(plan); }

  listen(canvasLevel, 'change', event => selectLevel(event.target.value, { returnToPlan: true }));
  listen(inspectorNav, 'keydown', event => {
    const button = event.target.closest('[data-inspector-tab]'); if (!button) return;
    const names = ['selected', 'level', 'plan'], index = names.indexOf(button.dataset.inspectorTab);
    const next = event.key === 'ArrowRight' ? names[(index + 1) % names.length] : event.key === 'ArrowLeft' ? names[(index + 2) % names.length] : event.key === 'Home' ? names[0] : event.key === 'End' ? names[2] : null;
    if (next) { event.preventDefault(); setInspectorTab(next, true, true); }
  });

  listen(toolbar, 'pointerdown', event => {
    const button = event.target.closest('button[data-placeable]');
    if (!active || editorView !== 'plan' || !button || event.button !== 0 || event.isPrimary === false || drag || toolbarDrag) return;
    resetGesture(); suppressedClick = null; button.focus({ preventScroll: true }); event.preventDefault();
    toolbarDrag = { button, type: button.dataset.tool, pointerId: event.pointerId, itemId: id('placement'), start: [event.clientX, event.clientY], started: false, candidate: null };
    button.setPointerCapture(event.pointerId);
    const requirement = connectionRequirement(button.dataset.tool);
    if (requirement) say(requirement.message, requirement.addLevel);
  });
  listen(toolbar, 'pointermove', event => {
    if (!toolbarDrag || toolbarDrag.pointerId !== event.pointerId) return;
    event.preventDefault(); updateToolbarDrag(event);
  });
  listen(toolbar, 'pointerup', event => {
    if (!toolbarDrag || toolbarDrag.pointerId !== event.pointerId) return;
    event.preventDefault(); updateToolbarDrag(event);
    const completed = clearToolbarDrag(); renderPlan();
    if (completed.started) { if (place(completed.candidate)) surface.focus({ preventScroll: true }); }
    else setTool(completed.type);
  });
  const cancelToolbar = event => {
    if (!toolbarDrag || event.pointerId !== undefined && toolbarDrag.pointerId !== event.pointerId) return;
    clearToolbarDrag(); renderPlan(); say('Placement cancelled.');
  };
  listen(toolbar, 'pointercancel', cancelToolbar);
  listen(toolbar, 'lostpointercapture', cancelToolbar);
  listen(window, 'blur', cancelToolbar);
  listen(document, 'visibilitychange', () => { if (document.hidden) cancelToolbar({}); });
  // Limit native touch selection/callouts to gesture buttons. Inspector text remains selectable.
  for (const type of ['contextmenu', 'selectstart', 'dragstart']) listen(canvasHost, type, event => {
    const target = event.target instanceof Element ? event.target : event.target?.parentElement;
    if (target?.closest('.fp-toolbar button,.fp-view-controls button,.fp-hint-action')) event.preventDefault();
  });

  listen(svg, 'pointerdown', event => {
    if (!active || editorView !== 'plan' || event.button > 1 || drag || toolbarDrag || event.isPrimary === false) return;
    const point = world(event), target = event.target.closest('[data-kind]');
    surface.focus({ preventScroll: true });
    if (event.button === 1 || tool === 'pan' || event.altKey) { drag = { kind: 'pan', client: [event.clientX, event.clientY], view: { ...view } }; }
    else if (tool === 'rectangle') { drag = { kind: 'rectangle', start: snapped(point) }; hover = snapped(point); }
    else if (tool === 'polygon') {
      const next = snapped(point);
      polygonClick = { point: next, repeat: Boolean(polygonClick && distance(next, polygonClick.point) < .001), pointerType: event.pointerType };
      if (polygon.length >= 3 && distance(next, polygon[0]) < (snap ? .001 : 6 / view.zoom)) { finishPolygon(); return; }
      if (!polygon.length || distance(next, polygon.at(-1)) > .001) polygon.push(next);
      hover = next; renderPlan(); return;
    } else if (['door', 'window', 'passage'].includes(tool)) { addOpening(point); return; }
    else if (['stairs', 'elevator'].includes(tool)) { addConnector(point); return; }
    else if (target?.dataset.kind === 'vertex') {
      selection = { kind: 'room', id: target.dataset.room };
      drag = { kind: 'vertex', roomId: target.dataset.room, index: Number(target.dataset.index), before: clone(plan), start: point };
    } else if (target?.dataset.kind === 'opening') {
      selection = { kind: 'opening', id: target.dataset.id, roomId: target.dataset.room };
      drag = { kind: 'opening', before: clone(plan), start: point };
    } else if (target?.dataset.kind === 'connector') {
      selection = { kind: 'connector', id: target.dataset.id };
      drag = { kind: 'connector', before: clone(plan), start: point };
    } else if (target?.dataset.kind === 'room') {
      selection = { kind: 'room', id: target.dataset.id };
      drag = { kind: 'room', before: clone(plan), start: point };
    } else { selection = null; drag = { kind: 'pan', client: [event.clientX, event.clientY], view: { ...view } }; }
    drag.pointerId = event.pointerId;
    svg.setPointerCapture(event.pointerId); event.preventDefault(); renderAll();
  });
  listen(svg, 'pointermove', event => {
    if (!active) return;
    const point = world(event);
    if (!drag) { if (polygon.length) { hover = snapped(point); renderPlan(); } return; }
    if (drag.kind === 'pan') { view.x = drag.view.x - (event.clientX - drag.client[0]) / view.zoom; view.z = drag.view.z - (event.clientY - drag.client[1]) / view.zoom; }
    else if (drag.kind === 'rectangle') hover = snapped(point);
    else {
      draft = clone(drag.before);
      if (drag.kind === 'vertex') draft.rooms.find(r => r.id === drag.roomId).points[drag.index] = snapped(point);
      if (drag.kind === 'room') { const delta = snapped([point[0] - drag.start[0], point[1] - drag.start[1]]); const r = room(draft); r.points = r.points.map(v => [round(v[0] + delta[0]), round(v[1] + delta[1])]); }
      if (drag.kind === 'connector') { const c = connector(draft), original = connector(drag.before); c.position = snapped([original.position[0] + point[0] - drag.start[0], original.position[1] + point[1] - drag.start[1]]); }
      if (drag.kind === 'opening') {
        const r = room(draft), o = selectedOpening(draft), a = r.points[o.edge], b = r.points[(o.edge + 1) % r.points.length], len = distance(a, b);
        let along = ((point[0] - a[0]) * (b[0] - a[0]) + (point[1] - a[1]) * (b[1] - a[1])) / len;
        if (snap) along = Math.round(along / plan.grid) * plan.grid;
        o.at = clamp(along / len, o.width / (2 * len), 1 - o.width / (2 * len));
      }
    }
    renderPlan();
  });
  listen(svg, 'pointerup', event => {
    if (!drag) return;
    const completed = drag, next = draft; drag = null;
    if (svg.hasPointerCapture(event.pointerId)) svg.releasePointerCapture(event.pointerId);
    if (completed.kind === 'rectangle') {
      const a = completed.start, b = hover || snapped(world(event)); hover = null;
      if (Math.abs(a[0] - b[0]) < .1 || Math.abs(a[1] - b[1]) < .1) { renderPlan(); say('Drag a little farther to give the room width and depth.'); return; }
      addRoom([[Math.min(a[0], b[0]), Math.min(a[1], b[1])], [Math.max(a[0], b[0]), Math.min(a[1], b[1])], [Math.max(a[0], b[0]), Math.max(a[1], b[1])], [Math.min(a[0], b[0]), Math.max(a[1], b[1])]]);
    } else if (next) commit(next, 'Plan updated.');
    else renderAll();
  });
  listen(svg, 'pointercancel', () => { draft = null; drag = null; hover = null; renderAll(); });
  listen(svg, 'lostpointercapture', () => { if (drag) { draft = null; drag = null; hover = null; renderAll(); } });
  listen(svg, 'mousedown', event => {
    // Repainting SVG children during pointerdown can suppress native dblclick.
    // Mouse click count remains available here, with the same-corner check intact.
    if (tool === 'polygon' && event.detail === 2 && polygonClick?.pointerType === 'mouse' && polygonClick.repeat) { event.preventDefault(); finishPolygon(); }
  });
  listen(svg, 'dblclick', event => {
    if (tool !== 'polygon') return;
    event.preventDefault();
    // Touch browsers synthesize double-clicks for nearby distinct taps. Finish a
    // mouse double-click only when both clicks actually addressed the same corner.
    if (polygonClick?.pointerType === 'mouse' && polygonClick.repeat) finishPolygon();
  });
  listen(surface, 'contextmenu', event => event.preventDefault());
  listen(surface, 'wheel', event => {
    if (!active) return; event.preventDefault();
    const before = world(event), { width, height, rect } = size();
    view.zoom = clamp(view.zoom * Math.exp(-event.deltaY * .0015), 6, 240);
    view.x = before[0] - (event.clientX - rect.left - width / 2) / view.zoom;
    view.z = before[1] - (event.clientY - rect.top - height / 2) / view.zoom; renderPlan();
  }, { passive: false });

  function action(name) {
    if (name === 'view-plan') setEditorView('plan');
    if (name === 'view-building') setEditorView('building');
    if (name === 'return-plan') {
      if (editorView !== 'plan') setEditorView('plan');
      const inspectorScroll = inspectorHost.closest('.inspector');
      if (inspectorScroll && ['auto', 'scroll'].includes(getComputedStyle(inspectorScroll).overflowY)) inspectorScroll.scrollTo({ top: 0, behavior: 'auto' });
      else canvasHost.scrollIntoView({ block: 'start', behavior: 'auto' });
      surface.focus({ preventScroll: true });
    }
    if (name === 'preview') { resetGesture(); onPreview?.(); }
    if (name === 'undo' || name === 'redo') {
      resetGesture();
      if (!history[name]) { say(`No more changes to ${name}.`); return; }
      try { (name === 'undo' ? onUndo : onRedo)?.(); say(`${name === 'undo' ? 'Undid' : 'Redid'} the last change. Showing ${levelLabel(level(plan))}.`); }
      catch (error) { say(error?.message || `Could not ${name} that change.`); }
    }
    if (name === 'fit') fit();
    if (name === 'zoom-in' || name === 'zoom-out') { view.zoom = clamp(view.zoom * (name === 'zoom-in' ? 1.3 : 1 / 1.3), 6, 240); renderPlan(); }
    if (name === 'delete-selection') deleteSelection();
    if (name === 'add-room') {
      const width = Number(input('new-width').value), depth = Number(input('new-depth').value);
      if (!(width >= .2 && depth >= .2 && width <= 100 && depth <= 100)) { say('Use a room width and depth from 0.2 to 100.'); return; }
      const [x, z] = snapped([view.x - width / 2, view.z - depth / 2]);
      addRoom([[x, z], [round(x + width), z], [round(x + width), round(z + depth)], [x, round(z + depth)]]);
    }
    if (name === 'duplicate-room' && room(plan)) {
      const original = room(plan), copy = clone(original); copy.id = id('room'); copy.name = `${copy.name.slice(0, 68)} copy`;
      copy.points = copy.points.map(p => [round(p[0] + plan.grid * 2), round(p[1] + plan.grid * 2)]); copy.openings.forEach(o => { o.id = id('opening'); });
      selection = { kind: 'room', id: copy.id }; change(next => next.rooms.push(copy), 'Room duplicated. Drag it into place.');
    }
    if (name === 'add-level') {
      const l = level(plan), nextLevel = { id: id('level'), name: `Level ${plan.levels.length + 1}`, elevation: round(l.elevation + l.height), height: l.height };
      selection = null; if (change(next => { next.levels.push(nextLevel); next.activeLevelId = nextLevel.id; }, `${nextLevel.name} added and selected. ${l.name} is still in the level list.`)) setInspectorTab('level');
    }
    if (name === 'delete-level' && plan.levels.length > 1) {
      const removed = plan.activeLevelId; selection = null;
      change(next => { next.levels = next.levels.filter(l => l.id !== removed); next.rooms = next.rooms.filter(r => r.levelId !== removed); next.connectors = next.connectors.filter(c => c.fromLevelId !== removed && c.toLevelId !== removed); next.activeLevelId = next.levels[0].id; }, 'Level and its contents removed. Undo restores them.');
    }
    if (name === 'export') {
      try {
        const data = createPlanPackage(plan), blob = new Blob([JSON.stringify(data, null, 2) + '\n'], { type: 'application/json' }), url = URL.createObjectURL(blob);
        const link = document.createElement('a'); link.href = url; link.download = (plan.name.replace(/[^a-z0-9_-]+/gi, '-').replace(/^-|-$/g, '').slice(0, 75) || 'floor-plan') + '.floorplan.json'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
        say('Floor plan exported for reuse in the Director or Blender.');
      } catch (error) { say(error.message); }
    }
    if (name === 'import') inspectorHost.querySelector('.fp-file-input').click();
  }
  for (const host of [canvasHost, inspectorHost]) listen(host, 'click', event => {
    const button = event.target.closest('button'); if (!button || !host.contains(button)) return;
    if (suppressedClick?.button === button && performance.now() < suppressedClick.until && (event.detail > 0 || event.pointerType)) { event.preventDefault(); event.stopPropagation(); return; }
    if (button.dataset.tool) setTool(button.dataset.tool);
    if (button.dataset.inspectorTab) setInspectorTab(button.dataset.inspectorTab, false, true);
    if (button.dataset.action) action(button.dataset.action);
  });

  listen(inspectorHost, 'change', event => {
    const field = event.target.dataset.field, value = event.target.value, numeric = event.target.type === 'number' ? event.target.valueAsNumber : Number(value);
    if (!field) return;
    if (field === 'snap') { snap = event.target.checked; renderPlan(); return; }
    if (['new-width', 'new-depth'].includes(field)) return;
    if (field === 'level-select') { selectLevel(value); return; }
    if (field === 'selection') {
      resetGesture();
      const openingRoom = plan.rooms.find(r => r.openings.some(o => o.id === value));
      selection = !value ? null : openingRoom ? { kind: 'opening', id: value, roomId: openingRoom.id }
        : { kind: plan.rooms.some(r => r.id === value) ? 'room' : 'connector', id: value };
      renderAll(); return;
    }
    if (field === 'opening-select') { selection = value ? { kind: 'opening', id: value, roomId: room(plan).id } : { kind: 'room', id: room(plan).id }; renderAll(); return; }
    change(next => {
      const l = level(next), r = room(next), c = connector(next), o = selectedOpening(next);
      if (field === 'plan-name') next.name = value;
      if (field === 'units') next.units = value;
      if (field === 'grid') next.grid = numeric;
      if (field === 'level-name') l.name = value;
      if (field === 'level-elevation') l.elevation = numeric;
      if (field === 'level-height') l.height = numeric;
      if (field === 'room-name' && r) r.name = value;
      if (field === 'room-level' && r) { r.levelId = value; next.activeLevelId = value; }
      if (field === 'wall-thickness' && r) r.wallThickness = numeric;
      if (field === 'floor-color' && r) r.floorColor = value;
      if (field === 'wall-color' && r) r.wallColor = value;
      if (field === 'vertex' && r) r.points[Number(event.target.dataset.index)][Number(event.target.dataset.axis)] = numeric;
      if (field === 'opening-type' && o) { o.type = value; if (value !== 'window') o.sill = 0; }
      if (field === 'opening-width' && o) o.width = numeric;
      if (field === 'opening-height' && o) o.height = numeric;
      if (field === 'opening-sill' && o) o.sill = numeric;
      if (field === 'opening-at' && o) o.at = numeric / 100;
      if (field === 'connection-name' && c) c.name = value;
      if (field === 'connection-type' && c) c.type = value;
      if (field === 'connection-from' && c) c.fromLevelId = value;
      if (field === 'connection-to' && c) c.toLevelId = value;
      if (field === 'connection-x' && c) c.position[0] = numeric;
      if (field === 'connection-z' && c) c.position[1] = numeric;
      if (field === 'connection-width' && c) c.size[0] = numeric;
      if (field === 'connection-depth' && c) c.size[1] = numeric;
      if (field === 'connection-rotation' && c) c.rotation = numeric;
    }, 'Plan properties updated.');
  });
  listen(inspectorHost.querySelector('.fp-file-input'), 'change', async event => {
    const file = event.target.files?.[0]; event.target.value = ''; if (!file) return;
    if (file.size > 4 * 1024 * 1024) { say('Choose a floor-plan file smaller than 4 MB.'); return; }
    try {
      const value = JSON.parse(await file.text()); if (disposed) return;
      const next = validatePlan(value.schema === 'nest-floorplan-package/v1' ? value.plan : value);
      selection = null; resetGesture();
      if (commit(next, 'Floor plan imported. Undo restores your previous plan.')) fit();
    } catch (error) { say(`The plan was not imported: ${error.message}`); }
  });
  listen(document, 'keydown', event => {
    if (!active || editable(event.target)) return;
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') { event.preventDefault(); event.stopImmediatePropagation(); action(event.shiftKey ? 'redo' : 'undo'); }
    else if (event.ctrlKey && event.key.toLowerCase() === 'y') { event.preventDefault(); event.stopImmediatePropagation(); action('redo'); }
    else if (editorView === 'building') { if (event.key === 'Escape') { event.preventDefault(); setEditorView('plan'); } }
    else if (event.key === 'Escape') { event.preventDefault(); resetGesture(); setTool('select'); }
    else if (event.key === 'Enter' && tool === 'polygon' && (event.target === surface || svg.contains(event.target))) { event.preventDefault(); finishPolygon(); }
    else if (event.key === 'Delete' || event.key === 'Backspace') { event.preventDefault(); deleteSelection(); }
    else if (event.target === surface && !event.ctrlKey && !event.metaKey) {
      const directions = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
      if (directions[event.key]) {
        event.preventDefault(); resetGesture();
        const delta = directions[event.key].map(n => n * plan.grid * (event.shiftKey ? 10 : 1));
        if (!selection) { view.x += delta[0]; view.z += delta[1]; renderPlan(); }
        else change(next => {
          if (selection.kind === 'room') room(next).points = room(next).points.map(p => [round(p[0] + delta[0]), round(p[1] + delta[1])]);
          else if (selection.kind === 'connector') { const c = connector(next); c.position = [round(c.position[0] + delta[0]), round(c.position[1] + delta[1])]; }
          else {
            const r = room(next), o = selectedOpening(next), a = r.points[o.edge], b = r.points[(o.edge + 1) % r.points.length], length = distance(a, b);
            o.at = clamp(o.at + (delta[0] * (b[0] - a[0]) + delta[1] * (b[1] - a[1])) / (length * length), o.width / (2 * length), 1 - o.width / (2 * length));
          }
        }, 'Selection moved.');
      } else if (['+', '=', '-'].includes(event.key)) { event.preventDefault(); action(event.key === '-' ? 'zoom-out' : 'zoom-in'); }
      else if (event.key === '0') { event.preventDefault(); action('fit'); }
    }
  }, true);
  const resize = new ResizeObserver(() => renderPlan()); resize.observe(surface);
  renderAll();

  return Object.freeze({
    setPlan(value) {
      const next = validatePlan(value || createPlan());
      // Director syncs the current take during unrelated control updates. An unchanged
      // document must not erase a polygon, interrupt a drag, or replace a focused field.
      if (JSON.stringify(next) === JSON.stringify(plan)) return;
      resetGesture(); plan = next; validSelection(); renderAll();
      if (active && !fitted && plan.rooms.length) fit();
    },
    setActive(value) { active = Boolean(value); canvasHost.hidden = !active; overview.setVisible(active && editorView === 'building'); if (!active) resetGesture(); else { renderAll(); if (editorView === 'plan' && !fitted && plan.rooms.length) fit(); } },
    setHistory(value) {
      const previous = history; history = { undo: Number(value?.undo) || 0, redo: Number(value?.redo) || 0 }; renderHistory();
      if (!active || committing) return;
      if (history.undo < previous.undo && history.redo > previous.redo) say(`Undid the last change. Showing ${levelLabel(level(plan))}.`);
      else if (history.redo < previous.redo && history.undo > previous.undo) say(`Redid the last change. Showing ${levelLabel(level(plan))}.`);
    },
    dispose() { clearToolbarDrag(); disposed = true; overview.dispose(); resize.disconnect(); cleanups.forEach(fn => fn()); dragBadge.remove(); canvasHost.replaceChildren(); inspectorHost.replaceChildren(); },
  });
}
