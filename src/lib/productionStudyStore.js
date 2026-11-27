// Explicit local adapter: one immutable atomic commit chain per owner.
// link(next_<previous>) is the compare-and-swap. There is no mutable head/index,
// lock lease or two-file transaction to recover after an uncertain response.
import { mkdir, open, link, unlink } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { MAX_ASSET_BYTES, MAX_STUDY_BYTES, validateOwner, validateHash, validateRevisionId, validateStudyId, validateRequestId, validateStudy } from './productionStudySchema.js';
import { rasterDescriptor } from './productionStudyAssets.js';

export const MAX_STUDY_COMMITS = 512;
export const studyDigest = (value) => createHash('sha256').update(JSON.stringify(value)).digest('hex');

export function createProductionStudyStore(directory) {
  if (typeof directory !== 'string' || !directory.trim()) throw new Error('Study store directory required');
  const root = resolve(directory);
  const home = (owner) => join(root, 'owners', createHash('sha256').update(validateOwner(owner)).digest('hex'));
  async function read(path, limit) {
    let file;
    try {
      file = await open(path, 'r');
      const stat = await file.stat();
      if (!stat.isFile() || stat.size > limit) throw new Error('Invalid local study file');
      return await file.readFile();
    } catch (error) { if (error.code === 'ENOENT') return null; throw error; }
    finally { await file?.close(); }
  }
  async function syncDirectory(directory) {
    let file;
    try { file = await open(directory, 'r'); await file.sync(); }
    catch (error) {
      // Directory fsync is unavailable on some Windows filesystems. File data
      // is still synced before atomic installation; do not promise power-loss
      // durability beyond the executing filesystem's contract.
      if (!['EINVAL', 'ENOTSUP', 'EISDIR', 'EPERM', 'EACCES'].includes(error.code)) throw error;
    } finally { await file?.close(); }
  }
  async function install(directory, name, bytes) {
    await mkdir(directory, { recursive: true, mode: 0o700 });
    const temporary = join(directory, `.tmp-${randomUUID()}`);
    let file, created = false;
    try {
      file = await open(temporary, 'wx', 0o600); created = true;
      await file.writeFile(bytes); await file.sync(); await file.close(); file = null;
      try { await link(temporary, join(directory, name)); }
      catch (error) { if (error.code === 'EEXIST') return false; throw error; }
      await syncDirectory(directory);
      return true;
    } finally {
      await file?.close();
      if (created) await unlink(temporary).catch((error) => { if (error.code !== 'ENOENT') throw error; });
    }
  }
  return {
    storage: 'local-workspace', shared: false,
    async records(owner) {
      const directory = join(home(owner), 'commits');
      const records = [], seen = new Set();
      let previous = null;
      while (true) {
        const bytes = await read(join(directory, `next_${previous || 'root'}.json`), MAX_STUDY_BYTES + 4096);
        if (!bytes) return records;
        if (records.length >= MAX_STUDY_COMMITS) throw new Error('Local study commit limit exceeded');
        const record = JSON.parse(bytes.toString('utf8'));
        try {
        if (record.schema !== 'nest-production-study-commit/v1' || record.previousCommitId !== previous || record.revisionId !== `rev_${validateRequestId(record.requestId)}` || seen.has(record.revisionId)) throw new Error('Invalid local study chain');
        validateRevisionId(record.revisionId); validateStudyId(record.id);
        if (record.baseRevisionId !== null) validateRevisionId(record.baseRevisionId);
        if (typeof record.createdAt !== 'string' || !Number.isFinite(Date.parse(record.createdAt))) throw new Error('Invalid study timestamp');
        const study = validateStudy(record.study);
        if (studyDigest(study) !== record.studyHash || studyDigest({ action: 'save', requestId: record.requestId, studyId: record.id, baseRevisionId: record.baseRevisionId, study }) !== record.requestHash) throw new Error('Local study integrity check failed');
        const previousStudy = records.findLast((item) => item.id === record.id);
        if ((previousStudy?.revisionId || null) !== record.baseRevisionId) throw new Error('Broken study revision chain');
        records.push({ ...record, study }); seen.add(record.revisionId); previous = record.revisionId;
        } catch { throw new Error('Local study integrity check failed'); }
      }
    },
    async append(owner, previousCommitId, record) {
      if (previousCommitId !== null) validateRevisionId(previousCommitId);
      return install(join(home(owner), 'commits'), `next_${previousCommitId || 'root'}.json`, Buffer.from(JSON.stringify(record)));
    },
    async putAsset(owner, asset, buffer) {
      validateHash(asset.sha256);
      await install(join(home(owner), 'assets'), `${asset.sha256}.bin`, buffer);
      const stored = await this.getAsset(owner, asset.sha256);
      if (!stored || JSON.stringify(stored.asset) !== JSON.stringify(asset) || !stored.buffer.equals(buffer)) throw new Error('Local asset readback failed');
      return stored.asset;
    },
    async getAsset(owner, hash) {
      validateHash(hash);
      const buffer = await read(join(home(owner), 'assets', `${hash}.bin`), MAX_ASSET_BYTES);
      if (!buffer) return null;
      if (createHash('sha256').update(buffer).digest('hex') !== hash) throw new Error('Local asset integrity check failed');
      let asset;
      try { asset = rasterDescriptor(buffer); }
      catch { throw new Error('Invalid stored raster image'); }
      return { asset, buffer };
    },
  };
}
