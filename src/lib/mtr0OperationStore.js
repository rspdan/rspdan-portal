// Durable local claims precede provider invocation. Results are separate immutable
// records: an incomplete claim is recoverable uncertainty, never a retry queue.
import { mkdir, open, link, unlink } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { ProductionStudyError, validateOwner } from './productionStudySchema.js';
import { operationHash, validateOperationId, validateClaim, validateResult, MAX_OPERATION_BYTES, MAX_OPERATIONS } from './mtr0OperationSchema.js';

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
