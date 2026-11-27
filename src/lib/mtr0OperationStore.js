// Durable local claims precede provider invocation. Results are separate immutable
// records: an incomplete claim is recoverable uncertainty, never a retry queue.
import { mkdir, open, link, unlink } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { ProductionStudyError, exact, validateOwner, validateStudyId } from './productionStudySchema.js';
import { operationHash, validateOperationId, validateOperationInput, validateClaim, validateResult, MAX_OPERATION_BYTES, MAX_OPERATIONS } from './mtr0OperationSchema.js';

import { validateContinuationStep, sameSelection } from './mtr0ContinuationSchema.js';

export function createMtr0OperationStore(directory) {
  if (typeof directory !== 'string' || !directory.trim()) throw new Error('Local operation directory required');
  const root = join(resolve(directory), 'mtr0');
  const home = owner => join(root, 'owners', createHash('sha256').update(validateOwner(owner)).digest('hex'));
  async function read(path) {
    let file;
    try {
      file = await open(path, 'r'); const stat = await file.stat();
      if (!stat.isFile() || stat.size > MAX_OPERATION_BYTES) throw new Error('Invalid operation file');
      const bytes = await file.readFile();
      if (bytes.length > MAX_OPERATION_BYTES) throw new Error('Invalid operation file');
      const envelope = JSON.parse(bytes.toString('utf8'));
      if (!envelope || Object.keys(envelope).length !== 2 || !Object.hasOwn(envelope, 'payload') || operationHash(envelope.payload) !== envelope.sha256) throw new Error('Operation integrity check failed');
      return envelope;
    } catch (error) { if (error.code === 'ENOENT') return null; throw error; }
    finally { await file?.close(); }
  }
  async function install(directory, name, payload) {
    const bytes = Buffer.from(JSON.stringify({ sha256: operationHash(payload), payload }));
    if (bytes.length > MAX_OPERATION_BYTES) throw new Error('Operation record exceeds bound');
    await mkdir(directory, { recursive: true, mode: 0o700 });
    const temporary = join(directory, `.tmp-${randomUUID()}`); let file, created = false;
    try {
      file = await open(temporary, 'wx', 0o600); created = true;
      await file.writeFile(bytes); await file.sync(); await file.close(); file = null;
      try { await link(temporary, join(directory, name)); }
      catch (error) { if (error.code === 'EEXIST') return false; throw error; }
      let folder;
      try { folder = await open(directory, 'r'); await folder.sync(); }
      catch (error) { if (!['EINVAL', 'ENOTSUP', 'EISDIR', 'EPERM', 'EACCES'].includes(error.code)) throw error; }
      finally { await folder?.close(); }
      return true;
    } finally { await file?.close(); if (created) await unlink(temporary).catch(error => { if (error.code !== 'ENOENT') throw error; }); }
  }
  // Selected inputs and direct generation share the same owner-wide identity
  // arbitration. This binds input only: it is not a provider claim or effect.
  async function bindings(owner) {
    const rows = [], seen = new Set(); let previous = null;
    while (true) {
      const stored = await read(join(home(owner), 'inputs', `next_${previous || 'root'}.json`));
      if (!stored) return rows;
      const value = stored.payload;
      exact(value, ['schema', 'previousOperationId', 'input'], 'operation input binding');
      const input = validateOperationInput(value.input);
      if (value.schema !== 'mtr0-operation-input/v1' || value.previousOperationId !== previous ||
          rows.length >= MAX_OPERATIONS || seen.has(input.operationId)) throw new Error('Invalid operation input binding chain');
      rows.push(input); seen.add(input.operationId); previous = input.operationId;
    }
  }
  async function bindInput(owner, value) {
    const input = validateOperationInput(value), hash = operationHash(input);
    for (let attempt = 0; attempt < 16; attempt++) {
      // Preserve old claims that predate input reservations.
      const legacy = (await claims(owner)).find(row => row.claim.id === input.operationId);
      if (legacy && legacy.claim.inputHash !== hash) throw new ProductionStudyError('operationId already belongs to a different request', 409);
      const rows = await bindings(owner), earlier = rows.find(row => row.operationId === input.operationId);
      if (earlier) {
        if (operationHash(earlier) !== hash) throw new ProductionStudyError('operationId already belongs to a different selected input', 409);
        return;
      }
      if (rows.length >= MAX_OPERATIONS) throw new ProductionStudyError('local operation input capacity reached; preserve this workspace', 409);
      const previousOperationId = rows.at(-1)?.operationId || null;
      if (await install(join(home(owner), 'inputs'), `next_${previousOperationId || 'root'}.json`,
          { schema: 'mtr0-operation-input/v1', previousOperationId, input })) {
        const saved = (await bindings(owner)).find(row => row.operationId === input.operationId);
        if (!saved || operationHash(saved) !== hash) throw new Error('Operation input binding did not read back');
        return;
      }
    }
    throw new Error('Operation input store is busy');
  }
  async function claims(owner) {
    const rows = [], seen = new Set(); let previous = null;
    while (true) {
      const stored = await read(join(home(owner), 'claims', `next_${previous || 'root'}.json`));
      if (!stored) return rows;
      try {
        const claim = validateClaim(stored.payload);
        if (rows.length >= MAX_OPERATIONS || claim.previousOperationId !== previous || seen.has(claim.id)) throw new Error('Invalid operation chain');
        rows.push({ claim, claimHash: stored.sha256 }); seen.add(claim.id); previous = claim.id;
      } catch { throw new Error('Operation claim integrity check failed'); }
    }
  }
  async function withResult(owner, row) {
    const stored = await read(join(home(owner), 'results', `${row.claim.id}.json`));
    let result = null;
    if (stored) {
      try { result = validateResult(stored.payload, row.claim, row.claimHash); }
      catch { throw new Error('Operation result integrity check failed'); }
    }
    return { ...row, result };
  }
  return {
    storage: 'local-workspace',
    async continuations(owner, studyId) {
      validateStudyId(studyId);
      const rows = [], seen = new Set(); let previous = null;
      while (true) {
        const stored = await read(join(home(owner), 'continuations', studyId, `next_${previous || 'root'}.json`));
        if (!stored) return rows;
        const step = validateContinuationStep(stored.payload), selection = step.selection;
        const id = selection.input.operationId;
        if (rows.length >= MAX_OPERATIONS || selection.input.studyId !== studyId ||
            selection.previousOperationId !== previous || seen.has(id)) throw new Error('Invalid continuation chain');
        if (previous !== null) {
          const predecessor = await this.get(owner, previous);
          if (predecessor?.result?.outcome.status !== 'completed' || operationHash(predecessor.result) !== selection.previousResultHash) {
            throw new Error('Continuation predecessor result differs');
          }
        }
        const reserved = (await bindings(owner)).find(input => input.operationId === id);
        if (!reserved || operationHash(reserved) !== operationHash(selection.input)) throw new Error('Continuation input reservation differs');
        const operation = await this.get(owner, id);
        if (operation && operation.claim.inputHash !== operationHash(selection.input)) throw new Error('Continuation operation input differs');
        rows.push(step); seen.add(id); previous = id;
      }
    },
    async appendContinuation(owner, value) {
      const step = validateContinuationStep(value), selection = step.selection;
      const rows = await this.continuations(owner, selection.input.studyId);
      const earlier = rows.find(row => row.selection.input.operationId === selection.input.operationId);
      if (earlier) {
        if (sameSelection(earlier.selection, selection)) return false;
        throw new ProductionStudyError('operationId already belongs to another continuation step', 409);
      }
      if ((rows.at(-1)?.selection.input.operationId || null) !== selection.previousOperationId) return false;
      if (rows.length >= MAX_OPERATIONS) throw new ProductionStudyError('local continuation capacity reached; preserve this workspace', 409);
      if (selection.previousOperationId !== null) {
        const previous = await this.get(owner, selection.previousOperationId);
        if (previous?.result?.outcome.status !== 'completed' || operationHash(previous.result) !== selection.previousResultHash) {
          throw new ProductionStudyError('continuation requires its retained completed predecessor result', 409);
        }
      }
      await bindInput(owner, selection.input);
      return install(join(home(owner), 'continuations', selection.input.studyId),
        `next_${selection.previousOperationId || 'root'}.json`, step);
    },
    async get(owner, id) {
      validateOperationId(id);
      const row = (await claims(owner)).find(row => row.claim.id === id);
      return row ? withResult(owner, row) : null;
    },
    async list(owner, studyId) {
      const rows = (await claims(owner)).filter(row => !studyId || row.claim.input.studyId === studyId);
      const result = [];
      for (const row of rows) result.push(await withResult(owner, row));
      return result;
    },
    async claim(owner, value) {
      const candidate = validateClaim({ ...value, previousOperationId: null });
      await bindInput(owner, candidate.input);
      for (let attempt = 0; attempt < 16; attempt++) {
        const rows = await claims(owner);
        if (rows.some(row => row.claim.id === value.id)) return false;
        if (rows.length >= MAX_OPERATIONS) throw new ProductionStudyError('local engine operation capacity reached; preserve this workspace', 409);
        const previousOperationId = rows.at(-1)?.claim.id || null;
        const claim = validateClaim({ ...value, previousOperationId });
        if (await install(join(home(owner), 'claims'), `next_${previousOperationId || 'root'}.json`, claim)) return true;
      }
      throw new Error('Operation store is busy');
    },
    async complete(owner, value) {
      const row = await this.get(owner, value.id);
      if (!row) throw new Error('Claim missing before result');
      const result = validateResult(value, row.claim, row.claimHash);
      const installed = await install(join(home(owner), 'results'), `${value.id}.json`, result);
      const saved = await this.get(owner, value.id);
      if (!saved?.result || operationHash(saved.result) !== operationHash(result)) throw new Error('Operation result did not read back unchanged');
      return installed;
    },
  };
}
