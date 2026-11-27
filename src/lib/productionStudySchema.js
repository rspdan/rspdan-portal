// Separate authored study documents. No take, floor-plan or scene normalization.
export const MAX_STUDY_BYTES = 1024 * 1024;
export const MAX_ASSET_BYTES = 8 * 1024 * 1024;
export const MAX_BODY_BYTES = 12 * 1024 * 1024;
export const ASSET_MIMES = ['image/png', 'image/jpeg', 'image/webp'];
export class ProductionStudyError extends Error {
  constructor(message, status = 400) { super(message); this.name = 'ProductionStudyError'; this.status = status; }
}
export function exact(value, keys, label, optional = []) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new ProductionStudyError(`${label} must be an object`);
  if (Object.keys(value).some((key) => !keys.includes(key))) throw new ProductionStudyError(`${label} has unknown fields`);
  if (keys.some((key) => !optional.includes(key) && !Object.hasOwn(value, key))) throw new ProductionStudyError(`${label} has missing fields`);
  return value;
}
function text(value, label, max = 8192, nonempty = false) {
  if (typeof value !== 'string' || value.length > max || (nonempty && !value.trim())) throw new ProductionStudyError(`${label} must be ${nonempty ? 'nonempty ' : ''}text of at most ${max} characters`);
  return value; // Preserve authored whitespace and literal text.
}
function items(value, label, max) {
  if (!Array.isArray(value) || value.length > max) throw new ProductionStudyError(`${label} must have at most ${max} items`);
  return value;
}
const UUID = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
function matched(value, pattern, label) {
  if (typeof value !== 'string' || !pattern.test(value)) throw new ProductionStudyError(`invalid ${label}`);
  return value;
}
export const validateRequestId = (v) => matched(v, new RegExp(`^${UUID}$`), 'requestId');
export const validateStudyId = (v) => matched(v, new RegExp(`^study_${UUID}$`), 'studyId');
export const validateRevisionId = (v) => matched(v, new RegExp(`^rev_${UUID}$`), 'revisionId');
export const validateHash = (v) => matched(v, /^[0-9a-f]{64}$/, 'sha256');
export const validateOwner = (v) => matched(v, /^[a-z0-9][a-z0-9_-]{0,31}$/, 'operator');
const itemId = (v) => matched(v, /^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$/, 'item id');
function unique(values, label) {
  if (new Set(values).size !== values.length) throw new ProductionStudyError(`duplicate ${label}`);
}
export function validateAsset(value) {
  exact(value, ['sha256', 'mime', 'bytes'], 'asset');
  if (!ASSET_MIMES.includes(value.mime)) throw new ProductionStudyError('asset must be PNG, JPEG or WebP');
  if (!Number.isInteger(value.bytes) || value.bytes < 1 || value.bytes > MAX_ASSET_BYTES) throw new ProductionStudyError('invalid asset byte count');
  return { sha256: validateHash(value.sha256), mime: value.mime, bytes: value.bytes };
}
export function validateStudy(value) {
  exact(value, ['schema', 'title', 'target', 'evidence', 'cards', 'corrections', 'selectedCardId', 'acceptedCardId', 'preview', 'nextAction'], 'study');
  if (value.schema !== 'nest-production-study/v1') throw new ProductionStudyError('unsupported study schema');
  let serialized;
  try { serialized = JSON.stringify(value); }
  catch { throw new ProductionStudyError('study must be bounded JSON data'); }
  if (Buffer.byteLength(serialized) > MAX_STUDY_BYTES) throw new ProductionStudyError('study is too large', 413);
  exact(value.target, ['kind', 'name', 'sha256'], 'target', ['sha256']);
  if (value.target.kind !== 'external-native') throw new ProductionStudyError('unsupported study target');
  const target = { kind: 'external-native', name: text(value.target.name, 'target name', 240, true), sha256: value.target.sha256 == null ? null : validateHash(value.target.sha256) };
  const evidence = items(value.evidence, 'evidence', 24).map((e) => {
    exact(e, ['id', 'title', 'kind', 'source', 'asset', 'text'], 'evidence item');
    const base = { id: itemId(e.id), title: text(e.title, 'evidence title', 240, true), kind: e.kind, source: text(e.source, 'evidence source', 2048) };
    if (e.kind === 'image' && e.text === null) return { ...base, asset: e.asset === null ? null : validateAsset(e.asset), text: null };
    if (e.kind === 'text' && e.asset === null) return { ...base, asset: null, text: text(e.text, 'evidence text', 16384) };
    throw new ProductionStudyError('image evidence requires text:null; text evidence requires asset:null and text');
  });
  unique(evidence.map((e) => e.id), 'evidence id');
  const sources = new Set(evidence.map((e) => e.id));
  const seenCards = new Set();
  const cards = items(value.cards, 'cards', 64).map((c) => {
    exact(c, ['id', 'parentId', 'origin', 'observations', 'proposal', 'keepFixed', 'imageCheck', 'limits', 'sourceIds'], 'card');
    const id = itemId(c.id);
    if (seenCards.has(id)) throw new ProductionStudyError('duplicate card id');
    if (c.parentId !== null && !seenCards.has(itemId(c.parentId))) throw new ProductionStudyError('card parent must precede its child');
    if (c.origin !== 'operator') throw new ProductionStudyError('only operator-authored cards are supported');
    const sourceIds = items(c.sourceIds, 'card sourceIds', 24).map(itemId);
    unique(sourceIds, 'card source id');
    if (sourceIds.some((source) => !sources.has(source))) throw new ProductionStudyError('card references unknown evidence');
    seenCards.add(id);
    return { id, parentId: c.parentId, origin: 'operator', observations: text(c.observations, 'observations'), proposal: text(c.proposal, 'proposal'), keepFixed: text(c.keepFixed, 'keepFixed'), imageCheck: text(c.imageCheck, 'imageCheck'), limits: text(c.limits, 'limits'), sourceIds };
  });
  const cardMap = new Map(cards.map((c) => [c.id, c]));
  const corrections = items(value.corrections, 'corrections', 64).map((c) => {
    exact(c, ['id', 'fromCardId', 'toCardId', 'text'], 'correction');
    const fromCardId = itemId(c.fromCardId), toCardId = itemId(c.toCardId);
    if (!cardMap.has(fromCardId) || cardMap.get(toCardId)?.parentId !== fromCardId) throw new ProductionStudyError('correction must connect a retained card to its direct child');
    return { id: itemId(c.id), fromCardId, toCardId, text: text(c.text, 'correction text', 8192, true) };
  });
  unique(corrections.map((c) => c.id), 'correction id');
  unique(corrections.map((c) => c.toCardId), 'corrected child');
  function selection(id, label) {
    if (id === null) return null;
    if (!cardMap.has(itemId(id))) throw new ProductionStudyError(`${label} references unknown card`);
    return id;
  }
  const selectedCardId = selection(value.selectedCardId, 'selectedCardId');
  const acceptedCardId = selection(value.acceptedCardId, 'acceptedCardId');
  let preview = null;
  if (value.preview !== null) {
    exact(value.preview, ['asset', 'cardId', 'settingsText', 'targetSha256'], 'preview');
    if (!acceptedCardId || value.preview.cardId !== acceptedCardId) throw new ProductionStudyError('preview must reference the accepted card');
    if (!target.sha256 || value.preview.targetSha256 !== target.sha256) throw new ProductionStudyError('preview must match a known target sha256');
    preview = { asset: validateAsset(value.preview.asset), cardId: acceptedCardId, settingsText: text(value.preview.settingsText, 'preview settings', 16384, true), targetSha256: target.sha256 };
  }
  const study = { schema: value.schema, title: text(value.title, 'study title', 160, true), target, evidence, cards, corrections, selectedCardId, acceptedCardId, preview, nextAction: text(value.nextAction, 'nextAction', 4096) };
  // Also bound the normalized shape (optional target hash becomes null).
  if (Buffer.byteLength(JSON.stringify(study)) > MAX_STUDY_BYTES) throw new ProductionStudyError('study is too large', 413);
  return study;
}
export function validateStudyTransition(previous, next) {
  if (!previous) return;
  for (const key of ['evidence', 'cards', 'corrections']) {
    const newer = new Map(next[key].map((item) => [item.id, item]));
    for (const item of previous[key]) {
      if (JSON.stringify(newer.get(item.id)) !== JSON.stringify(item)) {
        const remedy = key === 'evidence' ? 'add new evidence with a new ID and cite it from a new child card' : 'create a new child card';
        throw new ProductionStudyError(`saved ${key} must be retained unchanged; ${remedy}`, 409);
      }
    }
  }
}
export function validateSaveInput(value) {
  exact(value, ['action', 'requestId', 'studyId', 'baseRevisionId', 'study'], 'save request');
  if (value.action !== 'save') throw new ProductionStudyError('save action required');
  return { action: 'save', requestId: validateRequestId(value.requestId), studyId: validateStudyId(value.studyId), baseRevisionId: value.baseRevisionId === null ? null : validateRevisionId(value.baseRevisionId), study: validateStudy(value.study) };
}
