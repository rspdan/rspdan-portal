import { validatePlan } from './floorplan-model.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const numberText = value => String(Object.is(value, -0) ? 0 : value);
const typeLabel = type => type === 'stairs' ? 'Stairs' : 'Elevator';

// The same clockwise-on-screen rotation used by the plan editor and overview.
function footprint(connection) {
  const angle = connection.rotation * Math.PI / 180;
  const cos = Math.cos(angle), sin = Math.sin(angle);
  return [[-.5, -.5], [.5, -.5], [.5, .5], [-.5, .5]].map(([x, z]) => {
    x *= connection.size[0]; z *= connection.size[1];
    return [connection.position[0] + x * cos - z * sin,
      connection.position[1] + x * sin + z * cos];
  });
}

function sharedBounds(rooms, corners) {
  let minX = Infinity, minZ = Infinity, maxX = -Infinity, maxZ = -Infinity;
  for (const points of [...rooms.map(room => room.points), corners]) {
    for (const [x, z] of points) {
      minX = Math.min(minX, x); maxX = Math.max(maxX, x);
      minZ = Math.min(minZ, z); maxZ = Math.max(maxZ, z);
    }
  }
  // One padded 8:5 drawing window for both endpoints; never fit cards separately.
  const width = Math.max(maxX - minX, (maxZ - minZ) * 1.6, .1) * 1.16;
  const height = width / 1.6;
  return [minX + (maxX - minX) / 2 - width / 2,
    minZ + (maxZ - minZ) / 2 - height / 2, width, height];
}

/** Read-only endpoint comparison. Visibility and navigation belong to the caller. */
export function createConnectionView({ host, onEditLevel } = {}) {
  if (!host?.ownerDocument || typeof host.replaceChildren !== 'function') {
    throw new Error('The connection comparison needs an element host.');
  }
  if (onEditLevel !== undefined && typeof onEditLevel !== 'function') {
    throw new TypeError('onEditLevel must be a function.');
  }
  const doc = host.ownerDocument;
  const original = { role: host.getAttribute('role'), label: host.getAttribute('aria-label'),
    classPresent: host.classList.contains('fp-connection-view') };
  let plan, selected, signature = '', disposed = false;
  const element = (tag, className, text) => {
    const node = doc.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const svgNode = (tag, attributes = {}, text) => {
    const node = doc.createElementNS(SVG_NS, tag);
    for (const [name, value] of Object.entries(attributes)) node.setAttribute(name, String(value));
    if (text !== undefined) node.textContent = text;
    return node;
  };
  host.classList.add('fp-connection-view');
  host.setAttribute('role', 'region');
  host.setAttribute('aria-label', 'Connection comparison');

  function empty(message) {
    host.replaceChildren(element('h2', '', 'Connection comparison'),
      element('p', 'fp-connection-empty-selection', message));
  }

  function miniPlan(rooms, corners, bounds, levelLabel) {
    const svg = svgNode('svg', { viewBox: bounds.join(' '), preserveAspectRatio: 'xMidYMid meet',
      role: 'img', 'aria-label': `${levelLabel}: ${rooms.length} ${rooms.length === 1 ? 'room' : 'rooms'}. ${selected.name}, highlighted planned footprint. Same coordinates and scale as the other endpoint.` });
    svg.classList.add('fp-connection-mini');
    svg.append(svgNode('title', {}, `${levelLabel} · ${selected.name}`));
    svg.append(svgNode('desc', {}, 'Read-only overhead comparison. Room outlines and the selected connection retain their plan coordinates. The footprint does not create built stairs, a shaft or openings.'));
    const pointsText = points => points.map(point => point.join(',')).join(' ');
    for (const room of rooms) {
      const polygon = svgNode('polygon', { points: pointsText(room.points), fill: room.floorColor,
        class: 'fp-connection-room', 'data-connection-room': room.id, 'vector-effect': 'non-scaling-stroke' });
      polygon.append(svgNode('title', {}, room.name)); svg.append(polygon);
    }
    const group = svgNode('g', { 'data-connection-footprint': selected.id });
    group.append(svgNode('title', {}, `${selected.name} · ${typeLabel(selected.type)} · planned footprint`));
    group.append(svgNode('polygon', { points: pointsText(corners), class: 'fp-connection-halo',
      'vector-effect': 'non-scaling-stroke' }));
    group.append(svgNode('polygon', { points: pointsText(corners), class: 'fp-connection-footprint',
      'vector-effect': 'non-scaling-stroke' }));
    // A center marker remains visible even when the authored footprint is tiny
    // compared with the rooms. The outline itself keeps its true dimensions.
    group.append(svgNode('circle', { cx: selected.position[0], cy: selected.position[1],
      r: bounds[2] / 320 * 2.5, class: 'fp-connection-center', 'vector-effect': 'non-scaling-stroke' }));
    svg.append(group);
    return svg;
  }

  function render() {
    const focused = host.contains(doc.activeElement) ? doc.activeElement?.dataset?.connectionEditLevel : null;
    if (!selected) {
      empty('No connection selected. Choose a planned connection to compare its endpoint levels.');
      return;
    }
    const units = plan.units === 'm' ? 'm' : 'units';
    const endpoints = [selected.fromLevelId, selected.toLevelId].map(id => plan.levels.find(level => level.id === id));
    const rooms = plan.rooms.filter(room => endpoints.some(level => level.id === room.levelId));
    const corners = footprint(selected), bounds = sharedBounds(rooms, corners);
    const labelForLevel = level => plan.levels.filter(other => other.name === level.name).length > 1
      ? `${level.name} · ID ${level.id}` : level.name;
    const fragment = doc.createDocumentFragment();
    const heading = element('header', 'fp-connection-heading');
    heading.append(element('p', 'fp-connection-kicker', 'Connection comparison'),
      element('h2', '', selected.name),
      element('p', 'fp-connection-details', `${typeLabel(selected.type)} · vertical difference ${numberText(Math.abs(endpoints[1].elevation - endpoints[0].elevation))} ${units}`));
    const explanation = element('p', 'fp-connection-caption', 'Same coordinates, scale and orientation. Amber marks the planned footprint.');
    const legend = element('p', 'fp-connection-legend');
    const swatch = element('span', 'fp-connection-swatch'); swatch.setAttribute('aria-hidden', 'true');
    legend.append(swatch, doc.createTextNode('Selected connection footprint'));
    fragment.append(heading, explanation, legend);

    const cards = element('div', 'fp-connection-cards');
    endpoints.forEach((level, index) => {
      const label = labelForLevel(level), levelRooms = rooms.filter(room => room.levelId === level.id);
      const card = element('article', 'fp-connection-card'); card.dataset.connectionLevel = level.id;
      const title = element('header', 'fp-connection-card-heading');
      title.append(element('p', 'fp-connection-endpoint', index === 0 ? 'From level' : 'To level'),
        element('h3', '', label), element('p', 'fp-connection-elevation', `Elevation ${numberText(level.elevation)} ${units}`));
      card.append(title, miniPlan(levelRooms, corners, bounds, label));
      if (levelRooms.length) {
        const list = element('ul', 'fp-connection-room-list'); list.setAttribute('aria-label', `Rooms on ${label}`);
        for (const room of levelRooms) list.append(element('li', '', room.name));
        card.append(list);
      } else card.append(element('p', 'fp-connection-no-rooms', 'No rooms drawn on this level. Only the planned footprint is shown.'));
      const edit = element('button', 'fp-connection-edit', 'Edit this level');
      edit.type = 'button'; edit.dataset.connectionEditLevel = level.id;
      edit.setAttribute('aria-label', `Edit ${label}, elevation ${numberText(level.elevation)} ${units}, for ${selected.name}`);
      card.append(edit); cards.append(card);
    });
    const scopeNote = element('p', 'fp-connection-scope-note', 'The planned footprint does not add built stairs, a shaft or openings.');
    fragment.append(cards, scopeNote); host.replaceChildren(fragment);
    if (focused) [...host.querySelectorAll('[data-connection-edit-level]')]
      .find(node => node.dataset.connectionEditLevel === focused)?.focus({ preventScroll: true });
  }

  function click(event) {
    const target = event.target?.nodeType === 1 ? event.target : event.target?.parentElement;
    const button = target?.closest('button[data-connection-edit-level]');
    if (disposed || !selected || !button || !host.contains(button)) return;
    const levelId = button.dataset.connectionEditLevel;
    if (levelId === selected.fromLevelId || levelId === selected.toLevelId) onEditLevel?.(levelId, selected.id);
  }
  host.addEventListener('click', click);
  empty('Choose a planned connection to compare its endpoint levels.');

  return {
    setPlan(value, connectionId) {
      if (disposed) return;
      // Canonical validation bounds all counts, coordinates and authored strings
      // and returns detached data. Rejected input cannot replace a valid view.
      const next = validatePlan(value);
      const nextSelected = next.connectors.find(connection => connection.id === connectionId);
      const nextSignature = JSON.stringify([next, nextSelected?.id ?? null]);
      if (nextSignature === signature) return;
      plan = next; selected = nextSelected; signature = nextSignature; render();
    },
    dispose() {
      if (disposed) return;
      disposed = true; host.removeEventListener('click', click); host.replaceChildren();
      if (!original.classPresent) host.classList.remove('fp-connection-view');
      for (const [attribute, value] of [['role', original.role], ['aria-label', original.label]]) {
        if (value === null) host.removeAttribute(attribute); else host.setAttribute(attribute, value);
      }
      plan = selected = undefined; signature = '';
    },
  };
}
