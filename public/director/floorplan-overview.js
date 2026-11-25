import { createPlan, validatePlan } from './floorplan-model.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const numberText = value => String(Object.is(value, -0) ? 0 : value);
const labelForType = type => type === 'stairs' ? 'Stairs' : 'Elevator';
const element = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};
const svgNode = (tag, attributes = {}, text) => {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [name, value] of Object.entries(attributes)) node.setAttribute(name, String(value));
  if (text !== undefined) node.textContent = text;
  return node;
};

/** A read-only overview. Level selection is passed back to the editor. */
export function createFloorplanOverview({ host, onSelectLevel }) {
  if (!host) throw new Error('The building overview needs a host.');
  let plan = createPlan(), signature = '', disposed = false;
  host.classList.add('fp-building-overview');
  host.hidden = true;
  host.setAttribute('role', 'region');
  host.setAttribute('aria-label', 'Building overview');

  function selectButton(level, label, className = 'fp-overview-level-button') {
    const button = element('button', className, label);
    button.type = 'button'; button.dataset.overviewSelect = level.id;
    if (level.id === plan.activeLevelId) button.setAttribute('aria-current', 'true');
    return button;
  }

  function miniPlan(level, rooms, connections) {
    const svg = svgNode('svg', { viewBox: '0 0 320 180', role: 'img', 'aria-label': `${level.name}: ${rooms.length ? rooms.map(r => r.name).join(', ') : 'no rooms drawn'}. Plan fitted to this level.` });
    svg.classList.add('fp-overview-mini');
    svg.append(svgNode('title', {}, `${level.name} overhead plan`));
    if (!rooms.length && !connections.length) {
      svg.append(svgNode('text', { x: 160, y: 92, 'text-anchor': 'middle', class: 'fp-overview-empty-label' }, 'No rooms drawn'));
      return svg;
    }
    const openingShape = (room, opening) => {
      const a = room.points[opening.edge], b = room.points[(opening.edge + 1) % room.points.length];
      const length = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / length, uz = (b[1] - a[1]) / length;
      const center = [a[0] + (b[0] - a[0]) * opening.at, a[1] + (b[1] - a[1]) * opening.at];
      const start = [center[0] - ux * opening.width / 2, center[1] - uz * opening.width / 2];
      const end = [center[0] + ux * opening.width / 2, center[1] + uz * opening.width / 2];
      return { start, end, leaf: [start[0] - uz * opening.width * .8, start[1] + ux * opening.width * .8] };
    };
    const allPoints = rooms.flatMap(room => room.points);
    // Door glyphs may extend outside a clockwise or narrow room; include them
    // in the fit so every opening remains visible without changing its source.
    for (const room of rooms) for (const opening of room.openings) if (opening.type === 'door') allPoints.push(openingShape(room, opening).leaf);
    const corners = connection => {
      const angle = connection.rotation * Math.PI / 180, cos = Math.cos(angle), sin = Math.sin(angle);
      return [[-.5, -.5], [.5, -.5], [.5, .5], [-.5, .5]].map(([x, z]) => {
        x *= connection.size[0]; z *= connection.size[1];
        return [connection.position[0] + x * cos - z * sin, connection.position[1] + x * sin + z * cos];
      });
    };
    connections.forEach(connection => allPoints.push(...corners(connection)));
    const xs = allPoints.map(point => point[0]), zs = allPoints.map(point => point[1]);
    const minX = Math.min(...xs), maxX = Math.max(...xs), minZ = Math.min(...zs), maxZ = Math.max(...zs);
    const width = Math.max(.01, maxX - minX), depth = Math.max(.01, maxZ - minZ);
    const scale = Math.min(286 / width, 146 / depth), left = (320 - width * scale) / 2, top = (180 - depth * scale) / 2;
    const point = ([x, z]) => [left + (x - minX) * scale, top + (z - minZ) * scale];
    const polygonPoints = points => points.map(p => point(p).join(',')).join(' ');
    for (const room of rooms) {
      const polygon = svgNode('polygon', { points: polygonPoints(room.points), fill: room.floorColor, stroke: '#344a3d', 'stroke-width': 3, 'stroke-linejoin': 'round' });
      polygon.append(svgNode('title', {}, room.name)); svg.append(polygon);
    }
    // Openings draw after every outline so shared walls cannot cover their gaps.
    for (const room of rooms) for (const opening of room.openings) {
      const openingPoints = openingShape(room, opening);
      const p = point(openingPoints.start), q = point(openingPoints.end);
      const attrs = { x1: p[0], y1: p[1], x2: q[0], y2: q[1] };
      svg.append(svgNode('line', { ...attrs, stroke: '#f3f7f2', 'stroke-width': 5 }));
      if (opening.type === 'window') svg.append(svgNode('line', { ...attrs, stroke: '#3989a1', 'stroke-width': 2 }));
      if (opening.type === 'door') {
        const leaf = point(openingPoints.leaf);
        svg.append(svgNode('line', { x1: p[0], y1: p[1], x2: leaf[0], y2: leaf[1], stroke: '#867047', 'stroke-width': 1.5 }));
      }
    }
    connections.forEach(connection => {
      const n = plan.connectors.findIndex(c => c.id === connection.id) + 1, center = point(connection.position);
      const group = svgNode('g', { 'data-overview-connection': connection.id });
      group.append(svgNode('polygon', { points: polygonPoints(corners(connection)), fill: '#e6edf9', 'fill-opacity': .8, stroke: '#49638e', 'stroke-width': 1.5, 'stroke-dasharray': '4 3' }));
      group.append(svgNode('text', { x: center[0], y: center[1] + 4, 'text-anchor': 'middle', class: 'fp-overview-marker-label' }, `C${n}`));
      group.append(svgNode('title', {}, `${connection.name} (${labelForType(connection.type)}), planning connection`));
      svg.append(group);
    });
    return svg;
  }

  function render() {
    const focused = host.contains(document.activeElement) ? document.activeElement?.dataset?.overviewSelect : null;
    const sorted = plan.levels.map((level, index) => ({ ...level, index })).sort((a, b) => b.elevation - a.elevation || a.index - b.index);
    const units = plan.units === 'm' ? 'm' : 'u';
    const duplicateNames = new Set(plan.levels.filter((level, i, all) => all.some((other, j) => i !== j && other.name === level.name)).map(level => level.name));
    const name = level => duplicateNames.has(level.name) ? `${level.name} · level ${plan.levels.findIndex(l => l.id === level.id) + 1}` : level.name;
    const levelDescription = level => `${name(level)} · ${numberText(level.elevation)} ${units}`;
    const byId = new Map(plan.levels.map(level => [level.id, level]));
    const countRooms = level => plan.rooms.filter(room => room.levelId === level.id).length;
    const fragment = document.createDocumentFragment();
    const heading = element('header', 'fp-overview-heading');
    heading.append(element('h2', '', 'Building overview'), element('p', '', `${plan.levels.length} ${plan.levels.length === 1 ? 'level' : 'levels'} · ${plan.rooms.length} ${plan.rooms.length === 1 ? 'room' : 'rooms'} · ${plan.connectors.length} planned ${plan.connectors.length === 1 ? 'connection' : 'connections'}`));
    fragment.append(heading);

    const upper = element('div', 'fp-overview-summary');
    const levelsSection = element('section', 'fp-overview-levels');
    levelsSection.append(element('h3', '', 'Levels'), element('p', 'fp-overview-caption', 'Highest to lowest. Elevations are exact; vertical spacing is schematic.'));
    const levelStack = element('ol', 'fp-overview-stack');
    const groups = [];
    for (const level of sorted) {
      const previous = groups.at(-1);
      if (previous && Math.abs(previous[0].elevation - level.elevation) < 1e-7) previous.push(level);
      else groups.push([level]);
    }
    for (const levels of groups) {
      const row = element('li', 'fp-overview-stack-row'); row.dataset.elevation = levels[0].elevation;
      row.append(element('span', 'fp-overview-elevation', `${numberText(levels[0].elevation)} ${units}`));
      const choices = element('div', 'fp-overview-stack-choices');
      if (levels.length > 1) choices.append(element('span', 'fp-overview-same-height', 'Same elevation'));
      for (const level of levels) {
        const button = selectButton(level);
        button.append(element('strong', '', name(level)), element('span', '', `${countRooms(level)} ${countRooms(level) === 1 ? 'room' : 'rooms'} · walls ${numberText(level.height)} ${units}${level.id === plan.activeLevelId ? ' · Active' : ''}`));
        button.setAttribute('aria-label', `Edit ${levelDescription(level)}`);
        choices.append(button);
      }
      row.append(choices); levelStack.append(row);
    }
    levelsSection.append(levelStack); upper.append(levelsSection);

    const linksSection = element('section', 'fp-overview-connections');
    linksSection.append(element('h3', '', 'Planned connections'), element('p', 'fp-overview-caption', 'These links mark intended stairs and elevators, not built shafts or openings.'));
    if (!plan.connectors.length) linksSection.append(element('p', 'fp-overview-empty', 'No connections yet. Add a level at a different elevation, then place Stairs or Elevator in the plan.'));
    const links = element('ol', 'fp-overview-link-list');
    plan.connectors.forEach((connection, index) => {
      const from = byId.get(connection.fromLevelId), to = byId.get(connection.toLevelId);
      const item = element('li', 'fp-overview-link'); item.dataset.overviewConnection = connection.id;
      const title = element('div', 'fp-overview-link-title');
      title.append(element('span', 'fp-overview-marker', `C${index + 1}`), element('strong', '', connection.name));
      item.append(title, element('span', 'fp-overview-link-type', `${labelForType(connection.type)} · vertical difference ${numberText(Math.abs(to.elevation - from.elevation))} ${units}`));
      const endpoints = element('div', 'fp-overview-endpoints');
      endpoints.append(selectButton(from, `From: ${levelDescription(from)}`, 'fp-overview-endpoint'), element('span', 'fp-overview-arrow', '↕'), selectButton(to, `To: ${levelDescription(to)}`, 'fp-overview-endpoint'));
      item.append(endpoints); links.append(item);
    });
    linksSection.append(links); upper.append(linksSection); fragment.append(upper);

    const floorSection = element('section', 'fp-overview-floors');
    floorSection.append(element('h3', '', 'Floor plans'), element('p', 'fp-overview-caption', 'Each plan is fitted separately. Shapes keep their proportions; cards do not share a drawing scale.'));
    const cards = element('div', 'fp-overview-cards');
    for (const level of sorted) {
      const rooms = plan.rooms.filter(room => room.levelId === level.id);
      const connections = plan.connectors.filter(connection => connection.fromLevelId === level.id || connection.toLevelId === level.id);
      const card = element('article', 'fp-overview-card'); card.dataset.overviewLevel = level.id;
      if (level.id === plan.activeLevelId) card.dataset.active = 'true';
      const title = element('div', 'fp-overview-card-title');
      const text = element('div'); text.append(element('h4', '', name(level)), element('p', '', `Elevation ${numberText(level.elevation)} ${units} · walls ${numberText(level.height)} ${units}`));
      title.append(text); if (level.id === plan.activeLevelId) title.append(element('span', 'fp-overview-active', 'Active'));
      card.append(title, miniPlan(level, rooms, connections));
      if (rooms.length) {
        const roomList = element('ul', 'fp-overview-room-list');
        for (const room of rooms) {
          const item = element('li'); item.append(element('span', 'fp-overview-room-dot'), element('span', '', room.name));
          item.firstChild.style.backgroundColor = room.floorColor; roomList.append(item);
        }
        card.append(roomList);
      } else card.append(element('p', 'fp-overview-empty', 'No rooms drawn on this level.'));
      card.append(element('p', 'fp-overview-card-counts', `${rooms.reduce((total, room) => total + room.openings.length, 0)} openings · ${connections.length} planned ${connections.length === 1 ? 'connection' : 'connections'}`));
      const edit = selectButton(level, 'Edit this level', 'fp-overview-edit'); edit.setAttribute('aria-label', `Edit floor plan for ${levelDescription(level)}`); card.append(edit);
      cards.append(card);
    }
    floorSection.append(cards); fragment.append(floorSection);
    host.replaceChildren(fragment);
    if (focused) [...host.querySelectorAll('[data-overview-select]')].find(node => node.dataset.overviewSelect === focused)?.focus({ preventScroll: true });
  }

  function click(event) {
    const target = event.target instanceof Element ? event.target : event.target?.parentElement;
    const button = target?.closest('button[data-overview-select]');
    if (!button || !host.contains(button) || disposed) return;
    onSelectLevel?.(button.dataset.overviewSelect);
  }
  host.addEventListener('click', click);
  return {
    setPlan(value) {
      if (disposed) return;
      const next = validatePlan(value || createPlan()), nextSignature = JSON.stringify(next);
      if (nextSignature === signature) return;
      plan = next; signature = nextSignature; render();
    },
    setVisible(value) { if (!disposed) { host.hidden = !value; if (value && !signature) { signature = JSON.stringify(plan); render(); } } },
    dispose() { if (disposed) return; disposed = true; host.removeEventListener('click', click); host.replaceChildren(); host.classList.remove('fp-building-overview'); },
  };
}
