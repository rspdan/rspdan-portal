import { createMtr0Adapter } from './mtr0Adapter.js';
import { Mtr0Error, deepFreeze } from './mtr0Schema.js';
import { ProductionStudyError, validateOwner, validateStudyId } from './productionStudySchema.js';
import { validateOperationId, validateOperationInput, operationHash } from './mtr0OperationSchema.js';

export function createMtr0Service({ store, studyService, provider = null, now = () => new Date().toISOString() }) {
  const meta = { storage: 'local-workspace', shared: false }, active = new Set();
  let adapter = null;
  let configuration = { configured: false, serviceId: null, model: null, declaredImageInput: false, reason: 'unconfigured' };
  if (provider && Object.values(provider).some(value => value !== '' && value != null && value !== false)) {
    try {
      adapter = createMtr0Adapter({ ...provider, studyService });
      configuration = { configured: true, serviceId: provider.serviceId, model: provider.model, declaredImageInput: provider.imageInput === true, reason: null };
    } catch { configuration.reason = 'invalid-configuration'; }
  }
  configuration = deepFreeze(configuration);
  function owner(actor) {
    if (actor?.kind !== 'operator') throw new ProductionStudyError('operator session required', 403);
    return validateOwner(actor.user);
  }
  const activeKey = (user, id) => `${user}:${id}`;
  function view(row, user) {
    const { claim, result } = row;
    return { id: claim.id, studyId: claim.input.studyId, revisionId: claim.input.revisionId, createdAt: claim.createdAt, finishedAt: result?.finishedAt || null, status: result ? result.outcome.status : active.has(activeKey(user, claim.id)) ? 'pending' : 'unknown', request: claim.request, outcome: result?.outcome || null };
  }
  const response = operation => ({ ok: true, operation, ...meta });
  async function existing(user, input, inputHash) {
    const row = await store.get(user, input.operationId);
    if (!row) return null;
    if (row.claim.inputHash !== inputHash) throw new ProductionStudyError('operationId already belongs to a different request', 409);
    return response(view(row, user));
  }
  return {
    async status(actor, studyId = null) {
      const user = owner(actor);
      if (studyId !== null) validateStudyId(studyId);
      const rows = studyId === null ? [] : await store.list(user, studyId);
      const operations = rows.reverse().map(row => {
        const operation = view(row, user);
        return { id: operation.id, studyId: operation.studyId, revisionId: operation.revisionId, createdAt: operation.createdAt, finishedAt: operation.finishedAt, status: operation.status, serviceId: operation.request.provider.serviceId, model: operation.request.provider.model, sourceIds: [...row.claim.input.sourceIds], allowedDomains: [...row.claim.input.allowedDomains] };
      });
      return { ok: true, configuration, operations, ...meta };
    },
    async get(operationId, actor) {
      const user = owner(actor); validateOperationId(operationId);
      const row = await store.get(user, operationId);
      if (!row) throw new ProductionStudyError('engine operation not found', 404);
      return response(view(row, user));
    },
    async generate(value, actor) {
      const user = owner(actor), who = { kind: 'operator', user }, input = validateOperationInput(value), inputHash = operationHash(input);
      const earlier = await existing(user, input, inputHash); if (earlier) return earlier;
      if (!adapter) throw new ProductionStudyError('MTR0 provider is not configured for new calls', 503);
      let head = await studyService.get(input.studyId, who);
      if (head.saved.revisionId !== input.revisionId) throw new ProductionStudyError('study revision is no longer current; save or reopen current work first', 409);
      let prepared;
      try { prepared = await adapter.prepare({ actor: who, studyId: input.studyId, revisionId: input.revisionId, sourceIds: input.sourceIds, instruction: input.instruction, allowedDomains: input.allowedDomains }); }
      catch (error) {
        if (error instanceof Mtr0Error) throw new ProductionStudyError(error.code === 'source-unavailable' ? 'selected saved sources could not be verified' : 'invalid instruction, selected sources or provider capability', error.code === 'source-unavailable' ? 409 : 400);
        throw error;
      }
      // A duplicate may have completed while source preparation was pending.
      const raced = await existing(user, input, inputHash); if (raced) return raced;
      head = await studyService.get(input.studyId, who);
      if (head.saved.revisionId !== input.revisionId) throw new ProductionStudyError('study changed during preparation; no provider call was sent', 409);
      const claim = { schema: 'mtr0-operation-claim/v1', id: input.operationId, createdAt: now(), inputHash, input, request: prepared };
      if (!await store.claim(user, claim)) {
        const winner = await existing(user, input, inputHash);
        if (!winner) throw new Error('Claim did not read back');
        return winner;
      }
      const recorded = await store.get(user, input.operationId);
      if (!recorded || recorded.claim.inputHash !== inputHash || recorded.claim.request.requestId !== prepared.requestId) throw new Error('Claim identity did not read back');
      const key = activeKey(user, input.operationId); active.add(key);
      try {
        let result;
        try { result = await adapter.invoke(prepared); }
        catch {
          result = { request: prepared, outcome: { status: 'failed', code: 'transport', message: 'The provider operation did not return a confirmed outcome; completion may be unknown.', delivery: 'attempted', uncertain: true, httpStatus: null, responseSha256: null, retry: 'manual-only' } };
        }
        if (operationHash(result.request) !== operationHash(prepared)) throw new Error('Adapter result request identity differs');
        await store.complete(user, { schema: 'mtr0-operation-result/v1', id: input.operationId, claimHash: recorded.claimHash, finishedAt: now(), outcome: result.outcome });
      } catch {
        // The claim remains durable even if completion cannot be recorded. A
        // subsequent read may find a successfully installed final file; never
        // expose a volatile outcome as if it were durably saved.
      } finally { active.delete(key); }
      const final = await store.get(user, input.operationId);
      if (!final) throw new Error('Operation claim is unavailable');
      return response(view(final, user));
    },
  };
}
