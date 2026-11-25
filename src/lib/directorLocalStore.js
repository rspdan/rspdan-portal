// Explicit development adapter. It never masquerades as a shared Crew save.
// Immutable files are installed atomically using link(), so a torn temp write
// cannot appear as a completed take. The directory itself is the index.
import { mkdir, open, link, unlink, readFile, readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { validateTakeId } from './directorSchema.js';
import { directorCursor } from './directorService.js';

export function createLocalDirectorStore(directory) {
  const root = resolve(directory);
  async function read(name) {
    try { return JSON.parse(await readFile(join(root, name), 'utf8')); }
    catch (error) { if (error.code === 'ENOENT') return null; throw error; }
  }
  async function install(name, value) {
    await mkdir(root, { recursive: true });
    const temporary = join(root, `.tmp-${randomUUID()}`);
    const handle = await open(temporary, 'wx', 0o600);
    try {
      await handle.writeFile(JSON.stringify(value));
      await handle.sync();
    } finally { await handle.close(); }
    try { await link(temporary, join(root, name)); }
    catch (error) { if (error.code !== 'EEXIST') throw error; }
    finally { await unlink(temporary); }
    return read(name);
  }
  async function rows(prefix) {
    let names;
    try { names = await readdir(root); }
    catch (error) { if (error.code === 'ENOENT') return []; throw error; }
    return Promise.all(names.filter((name) => name.startsWith(prefix) && name.endsWith('.json')).map(read));
  }
  const select = (records, { before, limit }) => records.filter((record) => before === null || directorCursor(record) < before)
    .sort((a, b) => directorCursor(b).localeCompare(directorCursor(a))).slice(0, limit);
  return {
    storage: 'local-workspace', shared: false,
    async get(id) { validateTakeId(id); return read(`${id}.json`); },
    async save(record) { validateTakeId(record.id); return install(`${record.id}.json`, record); },
    async list(owner, options) { return select((await rows('dir_')).filter((record) => record.owner === owner), options); },
    async listRouted(options) {
      const routed = new Set((await rows('dirsend_')).map((receipt) => receipt.takeId));
      return select((await rows('dir_')).filter((record) => routed.has(record.id)), options);
    },
    async route(record, request) {
      return install(`${request.id}.json`, { ...request, takeId: record.id, takeHash: record.takeHash,
        owner: record.owner, channel: 'local-workspace' });
    },
  };
}
