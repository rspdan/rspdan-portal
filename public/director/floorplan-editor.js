import { createPlan, validatePlan, nearestEdge, createPlanPackage } from './floorplan-model.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const clone = value => structuredClone(value);
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const round = value => Math.round(value * 10000) / 10000;
const id = prefix => `${prefix}-${globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)}`;
const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const numberText = value => Number(value.toFixed(2)).toString();
const editable = target => target instanceof Element && Boolean(target.closest('input,textarea,select,[contenteditable="true"]'));

/** A self-contained overhead editor. The host owns saving and undo history. */
export function createFloorplanEditor({ canvasHost, inspectorHost, onCommit, onStatus, onPreview, onUndo, onRedo }) {
  if (!canvasHost || !inspectorHost) throw new Error('The floor plan needs a canvas and inspector host.');
  let plan = createPlan(), draft = null, active = false, disposed = false;
  let selection = null, tool = 'select', snap = true, drag = null, polygon = [], hover = null;
  let view = { x: 2, z: 1.5, zoom: 65 }, fitted = false;
  let history = { undo: 0, redo: 0 };
  const cleanups = [];
  const listen = (node, event, fn, options) => { node.addEventListener(event, fn, options); cleanups.push(() => node.removeEventListener(event, fn, options)); };
  const say = message => { if (!disposed) { hint.textContent = message; onStatus?.(message); } };

  canvasHost.classList.add('fp-canvas-host');
  inspectorHost.classList.add('fp-inspector');
  canvasHost.innerHTML = `
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
      <div class="fp-scale" aria-hidden="true"></div>
    </div>
    <div class="fp-hint" role="status" aria-live="polite">Draw rooms and place openings on their edges.</div>`;
  inspectorHost.innerHTML = `
    <section class="fp-section">
      <h2>Floor plan</h2>
      <label>Plan name<input data-field="plan-name" maxlength="100" /></label>
      <div class="fp-pair"><label>Units<select data-field="units"><option value="unit">Working units</option><option value="m">Metres</option></select></label><label>Grid<input data-field="grid" type="number" min=".01" max="100" step="any" /></label></div>
      <label class="fp-check"><input data-field="snap" type="checkbox" checked /> Snap to grid</label>
    </section>
    <section class="fp-section">
      <div class="fp-heading"><h2>Level</h2><button type="button" data-action="add-level">+ Level</button></div>
      <label><span class="fp-sr">Active level</span><select data-field="level-select"></select></label>
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

  const svg = canvasHost.querySelector('.fp-svg');
  const surface = canvasHost.querySelector('.fp-surface');
  const hint = canvasHost.querySelector('.fp-hint');
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
    const pointerId = drag?.pointerId;
    draft = null; drag = null; polygon = []; hover = null;
    if (pointerId !== undefined && svg.hasPointerCapture(pointerId)) svg.releasePointerCapture(pointerId);
    renderPlan();
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
      onCommit?.(clone(plan), before);
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
    const messages = { select: 'Select a room, opening or connection. Drag a corner to reshape a room.', rectangle: 'Drag from one corner to the opposite corner to draw a room.', polygon: 'Click each corner. Press Enter or double-click to finish; Escape cancels.', door: 'Click a wall edge to place a door.', window: 'Click a wall edge to place a window.', passage: 'Click a wall edge to make an open passage.', stairs: 'Click to place a stair connection, then choose its other level.', elevator: 'Click to place an elevator connection, then choose its other level.', pan: 'Drag the plan to pan. Use + and − or the mouse wheel to zoom.' };
    say(messages[tool]);
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
    polygon = []; hover = null;
    if (points.length < 3) { renderPlan(); say('A room needs at least three different corners.'); return; }
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
  function addOpening(point) {
    const hit = nearestWall(point);
    if (!hit) { say('Place the opening on a room’s wall edge.'); return; }
    const length = distance(hit.room.points[hit.edge], hit.room.points[(hit.edge + 1) % hit.room.points.length]);
    const width = round(Math.min(tool === 'passage' ? 1.2 : tool === 'window' ? 1 : .9, length * .6));
    const wallHeight = level().height;
    const sill = tool === 'window' ? Math.min(.9, wallHeight * .3) : 0;
    const height = tool === 'window' ? Math.min(1.2, wallHeight - sill) : Math.min(2.1, wallHeight);
    const opening = { id: id('opening'), type: tool, edge: hit.edge, at: clamp(hit.at, width / (2 * length), 1 - width / (2 * length)), width: round(width), height: round(height), sill: round(sill) };
    selection = { kind: 'opening', id: opening.id, roomId: hit.room.id };
    if (change(next => next.rooms.find(r => r.id === hit.room.id).openings.push(opening), 'Opening added. Adjust its dimensions in the inspector.')) setTool('select');
  }
  function addConnector(point) {
    const other = plan.levels.find(item => item.id !== plan.activeLevelId);
    if (!other) { say('Add another level before placing a stair or elevator connection.'); return; }
    const value = { id: id('connection'), type: tool, name: tool === 'stairs' ? 'Stairs' : 'Elevator', fromLevelId: plan.activeLevelId, toLevelId: other.id, position: snapped(point), size: tool === 'stairs' ? [1, 1.8] : [1.2, 1.2], rotation: 0 };
    selection = { kind: 'connector', id: value.id };
    if (change(next => next.connectors.push(value), 'Level connection added. Choose its destination in the inspector.')) setTool('select');
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
      const marker = shape('text', { x, y: z - 3 / view.zoom, 'font-size': 12 / view.zoom, 'text-anchor': 'middle', fill: '#314b68' }, 'connector', c.id); marker.textContent = c.type === 'stairs' ? '↗ Stairs' : '↕ Elevator';
      const targetId = c.fromLevelId === p.activeLevelId ? c.toLevelId : c.fromLevelId;
      const caption = shape('text', { x, y: z + 12 / view.zoom, 'font-size': 10 / view.zoom, 'text-anchor': 'middle', fill: '#526a8a' }, 'connector', c.id); caption.textContent = p.levels.find(l => l.id === targetId)?.name || '';
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
    empty.hidden = Boolean(rooms.length || polygon.length || drag);
    canvasHost.querySelector('.fp-scale').textContent = `${level(p)?.name || ''} · grid ${numberText(p.grid)} ${units()}${snap ? ' · snap' : ''}`;
  }

  function updateValue(name, value) { const node = input(name); if (node) node.value = value; }
  function renderInspector() {
    const focused = selectionPanel.contains(document.activeElement) ? document.activeElement : null;
    const focusData = focused?.dataset.field ? { ...focused.dataset } : null;
    const cornersOpen = selectionPanel.querySelector('.fp-vertices')?.open;
    const previousRoomId = selectionPanel.dataset.roomId;
    renderInspectorFields();
    const sameRoom = previousRoomId === selectionPanel.dataset.roomId;
    if (sameRoom && cornersOpen && selectionPanel.querySelector('.fp-vertices')) selectionPanel.querySelector('.fp-vertices').open = true;
    if (focusData && sameRoom) {
      const replacement = [...selectionPanel.querySelectorAll('[data-field]')].find(node => Object.entries(focusData).every(([key, value]) => node.dataset[key] === value));
      replacement?.focus({ preventScroll: true });
    }
  }
  function renderInspectorFields() {
    validSelection(); const l = level(plan);
    updateValue('plan-name', plan.name); updateValue('units', plan.units); updateValue('grid', plan.grid);
    input('snap').checked = snap;
    const levels = input('level-select'); levels.replaceChildren(...plan.levels.map(item => new Option(item.name, item.id))); levels.value = plan.activeLevelId;
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
        <label>Name<input data-field="connection-name" maxlength="80" /></label>
        <label>Type<select data-field="connection-type"><option value="stairs">Stairs</option><option value="elevator">Elevator</option></select></label>
        <label>From level<select data-field="connection-from"></select></label><label>To level<select data-field="connection-to"></select></label>
        <div class="fp-pair"><label>X<input data-field="connection-x" type="number" min="-10000" max="10000" step="any" /></label><label>Z<input data-field="connection-z" type="number" min="-10000" max="10000" step="any" /></label></div>
        <div class="fp-pair"><label>Width<input data-field="connection-width" type="number" min=".1" max="1000" step="any" /></label><label>Depth<input data-field="connection-depth" type="number" min=".1" max="1000" step="any" /></label></div>
        <label>Rotation °<input data-field="connection-rotation" type="number" min="-360" max="360" step="any" /></label>
        <p class="fp-small">Marks a planned connection between levels. Its footprint stays editable.</p>`;
      for (const field of ['connection-from', 'connection-to']) input(field).replaceChildren(...plan.levels.map(item => new Option(item.name, item.id)));
      for (const [field, value] of Object.entries({ 'connection-name': c.name, 'connection-type': c.type, 'connection-from': c.fromLevelId, 'connection-to': c.toLevelId, 'connection-x': c.position[0], 'connection-z': c.position[1], 'connection-width': c.size[0], 'connection-depth': c.size[1], 'connection-rotation': c.rotation })) updateValue(field, value);
      return;
    }
    const r = room(plan);
    selectionPanel.innerHTML = `<div class="fp-heading"><h2>${selection.kind === 'opening' ? 'Opening' : 'Room'}</h2><button type="button" data-action="delete-selection">Delete</button></div>
      <label>Room name<input data-field="room-name" maxlength="80" /></label>
      <div class="fp-pair"><label>Wall thickness<input data-field="wall-thickness" type="number" min=".01" max="5" step="any" /></label><label>Move to level<select data-field="room-level"></select></label></div>
      <div class="fp-pair"><label>Floor color<input data-field="floor-color" type="color" /></label><label>Wall color<input data-field="wall-color" type="color" /></label></div>
      <label>Opening<select data-field="opening-select"><option value="">Select an opening…</option></select></label>
      <div class="fp-opening-properties"></div>
      <details class="fp-vertices"><summary>Corner coordinates</summary><div class="fp-vertex-fields"></div></details>
      <button type="button" class="fp-subtle" data-action="duplicate-room">Duplicate room</button>`;
    input('room-level').replaceChildren(...plan.levels.map(item => new Option(item.name, item.id)));
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
  function renderAll() { renderPlan(); renderInspector(); renderHistory(); }

  listen(svg, 'pointerdown', event => {
    if (!active || event.button > 1 || drag || event.isPrimary === false) return;
    const point = world(event), target = event.target.closest('[data-kind]');
    surface.focus({ preventScroll: true });
    if (event.button === 1 || tool === 'pan' || event.altKey) { drag = { kind: 'pan', client: [event.clientX, event.clientY], view: { ...view } }; }
    else if (tool === 'rectangle') { drag = { kind: 'rectangle', start: snapped(point) }; hover = snapped(point); }
    else if (tool === 'polygon') {
      if (event.detail > 1) return;
      const next = snapped(point);
      if (polygon.length >= 3 && distance(next, polygon[0]) < 12 / view.zoom) { finishPolygon(); return; }
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
  listen(svg, 'dblclick', event => { if (tool === 'polygon') { event.preventDefault(); finishPolygon(); } });
  listen(surface, 'contextmenu', event => event.preventDefault());
  listen(surface, 'wheel', event => {
    if (!active) return; event.preventDefault();
    const before = world(event), { width, height, rect } = size();
    view.zoom = clamp(view.zoom * Math.exp(-event.deltaY * .0015), 6, 240);
    view.x = before[0] - (event.clientX - rect.left - width / 2) / view.zoom;
    view.z = before[1] - (event.clientY - rect.top - height / 2) / view.zoom; renderPlan();
  }, { passive: false });

  function action(name) {
    if (name === 'preview') { resetGesture(); onPreview?.(); }
    if (name === 'undo') { resetGesture(); onUndo?.(); }
    if (name === 'redo') { resetGesture(); onRedo?.(); }
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
      selection = null; change(next => { next.levels.push(nextLevel); next.activeLevelId = nextLevel.id; }, 'Level added. Name it and set its elevation.');
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
    if (button.dataset.tool) setTool(button.dataset.tool);
    if (button.dataset.action) action(button.dataset.action);
  });

  listen(inspectorHost, 'change', event => {
    const field = event.target.dataset.field, value = event.target.value, numeric = event.target.type === 'number' ? event.target.valueAsNumber : Number(value);
    if (!field) return;
    if (field === 'snap') { snap = event.target.checked; renderPlan(); return; }
    if (['new-width', 'new-depth'].includes(field)) return;
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
      if (field === 'level-select') { next.activeLevelId = value; selection = null; }
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
    else if (event.key === 'Escape') { event.preventDefault(); resetGesture(); setTool('select'); }
    else if (event.key === 'Enter' && tool === 'polygon') { event.preventDefault(); finishPolygon(); }
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
    setActive(value) { active = Boolean(value); canvasHost.hidden = !active; if (!active) resetGesture(); else { renderAll(); if (!fitted && plan.rooms.length) fit(); } },
    setHistory(value) { history = { undo: Number(value?.undo) || 0, redo: Number(value?.redo) || 0 }; renderHistory(); },
    dispose() { disposed = true; resize.disconnect(); cleanups.forEach(fn => fn()); canvasHost.replaceChildren(); inspectorHost.replaceChildren(); },
  });
}
