import { ProductionStudyError, exact, validateHash } from './productionStudySchema.js';
import { validateOperationId, validateOperationInput, operationHash } from './mtr0OperationSchema.js';

export function validateContinuationSelection(value) {
  exact(value, ['action', 'input', 'previousOperationId', 'previousResultHash'], 'continuation selection');
  if (value.action !== 'select') throw new ProductionStudyError('select action required');
  const input = validateOperationInput(value.input);
  const previousOperationId = value.previousOperationId === null ? null : validateOperationId(value.previousOperationId);
  const previousResultHash = value.previousResultHash === null ? null : validateHash(value.previousResultHash);
  if ((previousOperationId === null) !== (previousResultHash === null) || previousOperationId === input.operationId) {
    throw new ProductionStudyError('continuation requires a distinct predecessor and its retained result hash');
  }
  return { action: 'select', input, previousOperationId, previousResultHash };
}
export function validateContinuationStep(value) {
  exact(value, ['schema', 'createdAt', 'selection'], 'continuation step');
  if (value.schema !== 'mtr0-continuation-step/v1' || typeof value.createdAt !== 'string' ||
      value.createdAt.length > 40 || !Number.isFinite(Date.parse(value.createdAt))) throw new Error('Invalid continuation step');
  return { schema: value.schema, createdAt: value.createdAt, selection: validateContinuationSelection(value.selection) };
}
export const sameSelection = (a, b) => operationHash(a) === operationHash(b);
