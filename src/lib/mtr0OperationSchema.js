import { createHash } from 'node:crypto';
import { ProductionStudyError, exact, validateStudyId, validateRevisionId, validateRequestId, validateHash } from './productionStudySchema.js';
import { safeText, boundedId, domains, validateCard } from './mtr0Schema.js';

export const MAX_ENGINE_BODY_BYTES = 32 * 1024;
export const MAX_OPERATION_BYTES = 256 * 1024;
export const MAX_OPERATIONS = 512;
export const operationHash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
export function validateOperationId(value) {
  if (typeof value !== 'string' || !value.startsWith('op_')) throw new ProductionStudyError('invalid operation id');
  validateRequestId(value.slice(3)); return value;
}
export function validateOperationInput(value) {
  exact(value, ['action', 'operationId', 'studyId', 'revisionId', 'sourceIds', 'instruction', 'allowedDomains'], 'engine request');
  if (value.action !== 'generate') throw new ProductionStudyError('generate action required');
  if (!Array.isArray(value.sourceIds) || !value.sourceIds.length || value.sourceIds.length > 8 || new Set(value.sourceIds).size !== value.sourceIds.length) throw new ProductionStudyError('select a bounded unique source list');
  try {
    return { action: 'generate', operationId: validateOperationId(value.operationId), studyId: validateStudyId(value.studyId), revisionId: validateRevisionId(value.revisionId), sourceIds: value.sourceIds.map(id => boundedId(id)), instruction: safeText(value.instruction, 4096), allowedDomains: domains(value.allowedDomains) };
  } catch (error) {
    if (error instanceof ProductionStudyError) throw error;
    throw new ProductionStudyError('invalid engine instruction, source selection or domain');
  }
}
function timestamp(value) {
  if (typeof value !== 'string' || value.length > 40 || !Number.isFinite(Date.parse(value))) throw new Error('Invalid operation timestamp');
}
export function validateClaim(value) {
  exact(value, ['schema', 'id', 'previousOperationId', 'createdAt', 'inputHash', 'input', 'request'], 'operation claim');
  if (value.schema !== 'mtr0-operation-claim/v1') throw new Error('Invalid operation claim');
  validateOperationId(value.id); timestamp(value.createdAt);
  if (value.previousOperationId !== null) validateOperationId(value.previousOperationId);
  const input = validateOperationInput(value.input);
  if (input.operationId !== value.id || operationHash(input) !== value.inputHash) throw new Error('Invalid operation input identity');
  const request = value.request;
  exact(request, ['schema', 'project', 'operation', 'requestId', 'study', 'target', 'instruction', 'allowedDomains', 'sources', 'provider', 'requestSha256', 'requestBytes', 'preparedAt'], 'prepared receipt');
  if (request.schema !== 'mtr0-request/v1' || request.project !== 'MTR0' || request.operation !== 'production-card' || request.study?.id !== input.studyId || request.study?.revisionId !== input.revisionId || request.instruction !== input.instruction || JSON.stringify(request.allowedDomains) !== JSON.stringify(input.allowedDomains) || JSON.stringify(request.sources?.map(source => source.id)) !== JSON.stringify(input.sourceIds)) throw new Error('Prepared receipt differs from operation');
  validateRequestId(request.requestId); validateHash(request.study.studyHash); validateHash(request.requestSha256); timestamp(request.preparedAt);
  if (!Number.isSafeInteger(request.requestBytes) || request.requestBytes < 1 || request.requestBytes > 24 * 1024 * 1024) throw new Error('Invalid prepared request size');
  return { ...value, input };
}
export function validateResult(value, claim, claimHash) {
  exact(value, ['schema', 'id', 'claimHash', 'finishedAt', 'outcome'], 'operation result');
  if (value.schema !== 'mtr0-operation-result/v1' || value.id !== claim.id || value.claimHash !== claimHash) throw new Error('Operation result identity differs');
  timestamp(value.finishedAt);
  const outcome = value.outcome;
  if (outcome?.status === 'completed') {
    exact(outcome, ['status', 'code', 'validation', 'card', 'delivery', 'httpStatus', 'responseSha256', 'providerReportedModel', 'usage'], 'completed outcome');
    if (outcome.code !== 'completed' || !['structural-only', 'structural-and-model-identity'].includes(outcome.validation) || outcome.delivery !== 'responded') throw new Error('Invalid completed outcome');
    // Historical structural-only receipts remain readable as originally
    // recorded, without retroactively asserting a model-identity check.
    // Every new adapter completion uses the stronger marker below.
    if (outcome.validation === 'structural-and-model-identity') {
      const model = outcome.providerReportedModel;
      if (typeof model !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._:/-]{0,159}$/.test(model) || /^[a-z][a-z0-9+.-]*:\/\//i.test(model) || model !== claim.request.provider?.model) throw new Error('Completed model identity differs from configured model');
      safeText(model, 160);
    }
    validateHash(outcome.responseSha256);
    validateCard(outcome.card, claim.input.sourceIds, claim.input.allowedDomains);
  } else {
    exact(outcome, ['status', 'code', 'message', 'delivery', 'uncertain', 'httpStatus', 'responseSha256', 'retry'], 'failed outcome');
    if (outcome.status !== 'failed' || !['invalid-input', 'source-unavailable', 'image-unsupported', 'cancelled', 'timeout', 'transport', 'provider-http', 'redirect', 'response-too-large', 'truncated', 'invalid-output', 'provider-model-missing', 'provider-model-mismatch', 'already-invoked'].includes(outcome.code) || typeof outcome.uncertain !== 'boolean' || outcome.retry !== 'manual-only') throw new Error('Invalid failed outcome');
    safeText(outcome.message, 1000);
    if (outcome.responseSha256 !== null) validateHash(outcome.responseSha256);
    if (['provider-model-missing', 'provider-model-mismatch'].includes(outcome.code) && (outcome.delivery !== 'responded' || outcome.responseSha256 === null || outcome.uncertain || !Number.isInteger(outcome.httpStatus) || outcome.httpStatus < 200 || outcome.httpStatus > 299)) throw new Error('Model identity failure requires confirmed response evidence');
  }
  if (!['not-sent', 'attempted', 'responded'].includes(outcome.delivery) || (outcome.httpStatus !== null && (!Number.isInteger(outcome.httpStatus) || outcome.httpStatus < 100 || outcome.httpStatus > 599))) throw new Error('Invalid outcome transport state');
  return value;
}
