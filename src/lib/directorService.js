import { createHash } from 'node:crypto';
import { DirectorError, validateOwner, validateRequestId, validateTake, validateTakeId } from './directorSchema.js';

export const directorCursor = (record) => `${Date.parse(record.createdAt)}:${record.id}`;

export function createDirectorService({ store, registry, origin, now = () => new Date().toISOString() }) {
  function owner(actor) {
    if (actor?.kind !== 'operator') throw new DirectorError('operator session required', 403);
    return validateOwner(actor.user);
  }
  async function owned(id, actor) {
    validateTakeId(id);
    const record = await store.get(id);
    if (!record || (actor?.kind !== 'crew' && record.owner !== owner(actor))) throw new DirectorError('take not found', 404);
    return record;
  }
  function summary(record) {
    return { id: record.id, version: record.version, owner: record.owner, name: record.take.name,
      createdAt: record.createdAt, takeHash: record.takeHash, asset: record.take.asset,
      keyframes: record.take.keyframes.length, look: record.take.look,
      href: `/director?take=${record.id}` };
  }
  return {
    async save(input, actor) {
      const user = owner(actor);
      const requestId = validateRequestId(input.requestId);
      const take = validateTake(input.take, registry);
      const takeHash = createHash('sha256').update(JSON.stringify(take)).digest('hex');
      const record = { id: `dir_${requestId}`, version: 1, owner: user, createdAt: now(), takeHash, take };
      // The store creates the immutable document and its index in one atomic
      // operation. Retrying an acknowledged or uncertain request is safe.
      const saved = await store.save(record);
      if (saved.owner !== user || saved.takeHash !== takeHash) throw new DirectorError('requestId already belongs to a different save; use a new requestId', 409);
      return { ok: true, saved: summary(saved), storage: store.storage, shared: store.shared };
    },
    async get(id, actor) {
      const record = await owned(id, actor);
      return { ok: true, saved: summary(record), take: record.take, storage: store.storage, shared: store.shared };
    },
    async list(actor, { before = null, limit = 24 } = {}) {
      if (!Number.isInteger(limit) || limit < 1 || limit > 50) throw new DirectorError('limit must be between 1 and 50');
      if (before !== null && (typeof before !== 'string' || !/^\d{13}:dir_[0-9a-f-]{36}$/.test(before))) throw new DirectorError('invalid list cursor');
      const rows = actor?.kind === 'crew'
        ? await store.listRouted({ before, limit: limit + 1 })
        : await store.list(owner(actor), { before, limit: limit + 1 });
      const page = rows.slice(0, limit);
      return { ok: true, takes: page.map(summary), next: rows.length > limit ? directorCursor(page.at(-1)) : null,
        storage: store.storage, shared: store.shared };
    },
    async send(input, actor) {
      owner(actor);
      validateRequestId(input.requestId);
      const record = await owned(input.id, actor);
      // The route supplies its own deployment origin. Never take a destination
      // from editable take data, POST fields, or a hardcoded production host.
      let source;
      try { source = new URL(origin); } catch { throw new DirectorError('Director route origin is not configured', 503); }
      if (!['https:', 'http:'].includes(source.protocol) || source.origin !== origin) throw new DirectorError('Director route origin is not configured', 503);
      const href = new URL(`/director?take=${record.id}`, source).href;
      const receipt = await store.route(record, { id: `dirsend_${input.requestId}`, createdAt: now(), sourceOrigin: source.origin, href });
      if (receipt.takeId !== record.id || receipt.owner !== record.owner) throw new DirectorError('requestId already belongs to a different send', 409);
      return { ok: true, saved: summary(record), relay: receipt, storage: store.storage, shared: store.shared,
        delivery: store.shared ? 'posted-to-bridge' : 'local-workspace-only' };
    },
  };
}
