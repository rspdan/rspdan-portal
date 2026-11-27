// A selected step is durable before dispatch. Selecting a successor consumes
// the predecessor result in that same immutable record, not a second write.
// This service neither chooses the next input nor adopts a proposal into a study.
import { ProductionStudyError, exact, validateOwner, validateStudyId } from './productionStudySchema.js';
import { validateOperationId, operationHash } from './mtr0OperationSchema.js';
import { validateContinuationSelection, sameSelection } from './mtr0ContinuationSchema.js';

export function createMtr0ContinuationService({ store, studyService, engine, now = () => new Date().toISOString() }) {
  const meta = { storage: 'local-workspace', shared: false };
  function owner(actor) {
    if (actor?.kind !== 'operator') throw new ProductionStudyError('operator session required', 403);
    return validateOwner(actor.user);
  }
  async function view(step, rows, user, actor) {
    const input = step.selection.input, row = await store.get(user, input.operationId);
    if (row && (row.claim.id !== input.operationId || row.claim.inputHash !== operationHash(input))) {
      throw new ProductionStudyError('continuation operation input differs', 409);
    }
    // Bind the actual returned snapshot, not just an earlier chain validation.
    // Only an authoritative successful absence read permits an unclaimed state.
    const operation = row ? { id: row.claim.id, studyId: row.claim.input.studyId,
      revisionId: row.claim.input.revisionId, createdAt: row.claim.createdAt,
      finishedAt: row.result?.finishedAt || null, status: row.result?.outcome.status || 'unknown',
      request: row.claim.request, outcome: row.result?.outcome || null } : null;
    // One durable snapshot supplies both outcome and hash. Another process's
    // unfinished claim remains unknown here; it is never a dispatch invitation.
    const status = operation?.status || 'unclaimed';
    const next = status === 'completed' ? 'select-next'
      : status === 'unclaimed' ? 'dispatch'
      : status === 'pending' ? 'await-result'
      : status === 'failed' && !operation.outcome.uncertain ? 'inspect-failure' : 'reconcile';
    return { ok: true, continuation: { ...step, currentOperationId: rows.at(-1).selection.input.operationId,
      status, next, resultHash: row?.result ? operationHash(row.result) : null },
      operation, ...meta };
  }
  return {
    async get(studyId, actor) {
      const user = owner(actor); validateStudyId(studyId);
      const rows = await store.continuations(user, studyId);
      if (!rows.length) throw new ProductionStudyError('continuation not found', 404);
      return view(rows.at(-1), rows, user, actor);
    },
    async select(value, actor) {
      const user = owner(actor), selection = validateContinuationSelection(value), input = selection.input;
      let rows = await store.continuations(user, input.studyId);
      const duplicate = rows.find(row => row.selection.input.operationId === input.operationId);
      if (duplicate) {
        if (!sameSelection(duplicate.selection, selection)) throw new ProductionStudyError('operationId already belongs to another continuation selection', 409);
        return view(duplicate, rows, user, actor);
      }
      const head = rows.at(-1);
      if ((head?.selection.input.operationId || null) !== selection.previousOperationId) {
        throw new ProductionStudyError('continuation changed; reopen its current step', 409);
      }
      if (head) {
        const previous = await store.get(user, selection.previousOperationId);
        if (previous?.result?.outcome.status !== 'completed' || operationHash(previous.result) !== selection.previousResultHash) {
          throw new ProductionStudyError('a matching retained completed result is required before advancing', 409);
        }
      }
      const study = await studyService.get(input.studyId, actor);
      if (study.saved.revisionId !== input.revisionId) throw new ProductionStudyError('select the current saved study revision', 409);
      const existing = await store.get(user, input.operationId);
      if (existing && existing.claim.inputHash !== operationHash(input)) throw new ProductionStudyError('operationId already belongs to a different request', 409);
      await store.appendContinuation(user, { schema: 'mtr0-continuation-step/v1', createdAt: now(), selection });
      // Reconcile the atomic slot independently, including an identical winner.
      rows = await store.continuations(user, input.studyId);
      const saved = rows.find(row => row.selection.input.operationId === input.operationId);
      if (!saved || !sameSelection(saved.selection, selection)) throw new ProductionStudyError('another next step won this continuation; reopen it', 409);
      return view(saved, rows, user, actor);
    },
    async resume(value, actor) {
      const user = owner(actor);
      exact(value, ['studyId', 'operationId'], 'continuation resume');
      validateStudyId(value.studyId); validateOperationId(value.operationId);
      const rows = await store.continuations(user, value.studyId), step = rows.at(-1);
      if (!step) throw new ProductionStudyError('continuation not found', 404);
      if (step.selection.input.operationId !== value.operationId) throw new ProductionStudyError('continuation changed; do not dispatch a different step', 409);
      const existing = await store.get(user, value.operationId);
      // generate retains claim arbitration for simultaneous first dispatches.
      // A pending/unknown/failed/completed claim is only read, never replayed.
      if (!existing) await engine.generate(step.selection.input, actor);
      return view(step, await store.continuations(user, value.studyId), user, actor);
    },
  };
}
