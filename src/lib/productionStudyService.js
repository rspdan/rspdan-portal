import { ProductionStudyError, exact, validateOwner, validateStudyId, validateRevisionId, validateHash, validateSaveInput, validateStudyTransition } from './productionStudySchema.js';
import { decodeAssetDataUrl } from './productionStudyAssets.js';
import { studyDigest, MAX_STUDY_COMMITS } from './productionStudyStore.js';

export function createProductionStudyService({ store, now = () => new Date().toISOString() }) {
  function owner(actor) {
    if (actor?.kind !== 'operator') throw new ProductionStudyError('operator session required', 403);
    return validateOwner(actor.user);
  }
  const meta = { storage: store.storage, shared: false };
  const summary = (record) => ({ id: record.id, revisionId: record.revisionId, baseRevisionId: record.baseRevisionId, title: record.study.title, createdAt: record.createdAt, studyHash: record.studyHash });
  const response = (record) => ({ ok: true, saved: summary(record), study: record.study, ...meta });
  async function verifyAssets(user, study) {
    const descriptors = study.evidence.map((item) => item.asset).filter(Boolean);
    if (study.preview) descriptors.push(study.preview.asset);
    const checked = new Map();
    for (const asset of descriptors) {
      if (!checked.has(asset.sha256)) checked.set(asset.sha256, await store.getAsset(user, asset.sha256));
      const existing = checked.get(asset.sha256);
      if (!existing || JSON.stringify(existing.asset) !== JSON.stringify(asset)) throw new ProductionStudyError('referenced image is missing or differs; upload its exact bytes before saving or reopening', 409);
    }
  }
  return {
    async list(actor) {
      const rows = await store.records(owner(actor));
      const heads = new Map();
      for (const row of rows) heads.set(row.id, row);
      return { ok: true, studies: [...heads.values()].reverse().map(summary), ...meta };
    },
    async get(id, actor, revision = null) {
      const user = owner(actor); validateStudyId(id);
      if (revision !== null) validateRevisionId(revision);
      const rows = await store.records(user);
      const record = rows.findLast((row) => row.id === id && (revision === null || row.revisionId === revision));
      if (!record) throw new ProductionStudyError('study not found', 404);
      await verifyAssets(user, record.study);
      return response(record);
    },
    async save(input, actor) {
      const user = owner(actor), request = validateSaveInput(input);
      const requestHash = studyDigest(request), studyHash = studyDigest(request.study);
      await verifyAssets(user, request.study);
      // A different study may win the owner's global commit slot. Retry that
      // append, while rechecking this study's unchanged base on every attempt.
      for (let attempt = 0; attempt < 16; attempt++) {
        const rows = await store.records(user);
        const duplicate = rows.find((row) => row.requestId === request.requestId);
        if (duplicate) {
          if (duplicate.requestHash !== requestHash) throw new ProductionStudyError('requestId already belongs to a different save; use a new requestId', 409);
          return response(duplicate);
        }
        const head = rows.findLast((row) => row.id === request.studyId);
        if ((head?.revisionId || null) !== request.baseRevisionId) throw new ProductionStudyError('study changed since this draft; reopen the latest revision before saving', 409);
        validateStudyTransition(head?.study, request.study);
        if (rows.length >= MAX_STUDY_COMMITS) throw new ProductionStudyError('local study revision capacity reached; preserve this workspace before starting a new one', 409);
        const previousCommitId = rows.at(-1)?.revisionId || null;
        const record = { schema: 'nest-production-study-commit/v1', id: request.studyId, revisionId: `rev_${request.requestId}`, baseRevisionId: request.baseRevisionId, previousCommitId, requestId: request.requestId, requestHash, createdAt: now(), studyHash, study: request.study };
        if (await store.append(user, previousCommitId, record)) {
          // Independent filesystem readback before reporting a saved revision.
          const saved = (await store.records(user)).find((row) => row.revisionId === record.revisionId);
          if (!saved || saved.requestHash !== requestHash) throw new Error('Study readback failed');
          await verifyAssets(user, saved.study);
          return response(saved);
        }
      }
      throw new ProductionStudyError('local study store is busy; retry with the same requestId', 503);
    },
    async asset(input, actor) {
      const user = owner(actor);
      exact(input, ['action', 'dataUrl'], 'asset request');
      if (input.action !== 'asset') throw new ProductionStudyError('asset action required');
      const { asset, buffer } = decodeAssetDataUrl(input.dataUrl);
      const stored = await store.putAsset(user, asset, buffer);
      return { ok: true, asset: stored, ...meta };
    },
    async getAsset(hash, actor) {
      const user = owner(actor); validateHash(hash);
      const record = await store.getAsset(user, hash);
      if (!record) throw new ProductionStudyError('image not found', 404);
      return record;
    },
  };
}
