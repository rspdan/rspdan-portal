// MTR0's generated proposal contract is separate from operator-authored study v1.
export const MTR0_DOMAINS = Object.freeze(['camera', 'lighting', 'composition']);
export const MTR0_MAX_SOURCES = 8;
export const MTR0_MAX_IMAGE_BYTES = 16 * 1024 * 1024;
export class Mtr0Error extends Error {
  constructor(code, message) { super(message); this.name = 'Mtr0Error'; this.code = code; }
}
export function fail(code, message) { throw new Mtr0Error(code, message); }
export function exact(value, keys, code = 'invalid-input') {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).length !== keys.length || keys.some(key => !Object.hasOwn(value, key))) fail(code, 'Unexpected object fields.');
}
export function safeText(value, max, secret = '', code = 'invalid-input') {
  if (typeof value !== 'string' || !value.trim() || value.length > max) fail(code, 'Text is absent or exceeds its bound.');
  // Reject known configured credentials and recognizable credential/path syntax.
  // This is not semantic secret detection or OCR of selected raster evidence.
  const path = /file:\/\/|(?:^|[\s"'=(])(?:\/[a-zA-Z0-9_.~-]|[a-zA-Z]:[\\/]|\\\\|\.{1,2}[\\/])/;
  const credential = /\bBearer\s+\S+|\bsk-[a-zA-Z0-9_-]{12,}|(?:api[_ -]?key|password|secret|access[_ -]?token)["']?\s*[:=]\s*["']?\S+/i;
  if ((secret && value.includes(secret)) || path.test(value) || credential.test(value)) fail(code, 'Remove credentials and local file locations from transmitted text.');
  return value;
}
export function boundedId(value, code = 'invalid-input') {
  if (typeof value !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$/.test(value)) fail(code, 'Invalid source identifier.');
  return value;
}
export function domains(value) {
  if (!Array.isArray(value) || !value.length || value.length > MTR0_DOMAINS.length || new Set(value).size !== value.length || value.some(v => !MTR0_DOMAINS.includes(v))) fail('invalid-input', 'Select explicit supported proposal domains.');
  return [...value];
}
export function deepFreeze(value) {
  if (value && typeof value === 'object') { Object.values(value).forEach(deepFreeze); Object.freeze(value); }
  return value;
}

export function cardJsonSchema(sourceIds, allowedDomains) {
  const text = { type: 'string', minLength: 1, maxLength: 2000 };
  const refs = { type: 'array', minItems: 1, maxItems: sourceIds.length, uniqueItems: true, items: { type: 'string', enum: [...sourceIds] } };
  const linked = { type: 'object', additionalProperties: false, required: ['text', 'sourceIds'], properties: { text, sourceIds: refs } };
  const list = { type: 'array', minItems: 1, maxItems: 12, items: { type: 'string', minLength: 1, maxLength: 500 } };
  return {
    type: 'object', additionalProperties: false,
    required: ['schema', 'observations', 'proposal', 'keepFixed', 'imageCheck', 'limits'],
    properties: {
      schema: { type: 'string', const: 'mtr0-production-card/v1' },
      observations: { type: 'array', minItems: 1, maxItems: 12, items: linked },
      proposal: { type: 'object', additionalProperties: false, required: ['domain', 'text', 'sourceIds'], properties: { domain: { type: 'string', enum: [...allowedDomains] }, text, sourceIds: refs } },
      keepFixed: list, imageCheck: linked, limits: list,
    },
  };
}

export function validateCard(value, sourceIds, allowedDomains, secret = '') {
  const code = 'invalid-output';
  exact(value, ['schema', 'observations', 'proposal', 'keepFixed', 'imageCheck', 'limits'], code);
  if (value.schema !== 'mtr0-production-card/v1') fail(code, 'Unsupported response schema.');
  const known = new Set(sourceIds);
  function linked(item, proposal = false) {
    exact(item, proposal ? ['domain', 'text', 'sourceIds'] : ['text', 'sourceIds'], code);
    if (!Array.isArray(item.sourceIds) || !item.sourceIds.length || item.sourceIds.length > known.size || new Set(item.sourceIds).size !== item.sourceIds.length || item.sourceIds.some(id => !known.has(id))) fail(code, 'Response cites an unselected or invalid source.');
    if (proposal && !allowedDomains.includes(item.domain)) fail(code, 'Proposal domain is not allowed.');
    return { ...(proposal ? { domain: item.domain } : {}), text: safeText(item.text, 2000, secret, code), sourceIds: [...item.sourceIds] };
  }
  function list(items) {
    if (!Array.isArray(items) || !items.length || items.length > 12) fail(code, 'Response list exceeds its bound.');
    return items.map(item => safeText(item, 500, secret, code));
  }
  if (!Array.isArray(value.observations) || !value.observations.length || value.observations.length > 12) fail(code, 'Observation count exceeds its bound.');
  return {
    schema: value.schema, observations: value.observations.map(item => linked(item)), proposal: linked(value.proposal, true),
    keepFixed: list(value.keepFixed), imageCheck: linked(value.imageCheck), limits: list(value.limits),
  };
}
