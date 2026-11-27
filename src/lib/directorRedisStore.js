// Redis keeps the complete editable take, not just a thumbnail or public URL.
// Each save/index pair and each explicit route/receipt pair is a single script.
import { directorCursor } from './directorService.js';
const PREFIX = 'director:v1:';
const SAVE = `
local existing = redis.call('GET', KEYS[1])
if existing then return existing end
local indexType = redis.call('TYPE', KEYS[2]).ok
if indexType ~= 'none' and indexType ~= 'zset' then return redis.error_reply('Director index has wrong type') end
redis.call('SET', KEYS[1], ARGV[1])
redis.call('ZADD', KEYS[2], 0, ARGV[2])
return ARGV[1]`;
const ROUTE = `
local existing = redis.call('GET', KEYS[1])
if existing then return existing end
for i = 2, 4 do
  local indexType = redis.call('TYPE', KEYS[i]).ok
  if indexType ~= 'none' and indexType ~= 'zset' then return redis.error_reply('Director route index has wrong type') end
end
redis.call('SET', KEYS[1], ARGV[1])
redis.call('ZADD', KEYS[2], ARGV[2], ARGV[3])
redis.call('ZADD', KEYS[3], ARGV[2], ARGV[3])
redis.call('ZADD', KEYS[4], 0, ARGV[4])
return ARGV[1]`;
const parse = (value) => typeof value === 'string' ? JSON.parse(value) : value;

export function createRedisDirectorStore(redis) {
  async function get(id) { return parse(await redis.get(`${PREFIX}take:${id}`)); }
  async function index(key, { before, limit }) {
    const cursors = await redis.zrange(key, before === null ? '+' : `(${before}`, '-', { byLex: true, rev: true, offset: 0, count: limit });
    return (await Promise.all(cursors.map((cursor) => get(cursor.slice(cursor.indexOf(':') + 1))))).filter(Boolean);
  }
  return {
    storage: 'nest-shared', shared: true,
    get,
    async save(record) {
      return parse(await redis.eval(SAVE,
        [`${PREFIX}take:${record.id}`, `${PREFIX}owner:${record.owner}`],
        [JSON.stringify(record), directorCursor(record)]));
    },
    list(owner, options) { return index(`${PREFIX}owner:${owner}`, options); },
    listRouted(options) { return index(`${PREFIX}routed`, options); },
    async route(record, request) {
      const ts = Date.parse(request.createdAt);
      const receipt = { ...request, takeId: record.id, takeHash: record.takeHash,
        owner: record.owner, channel: 'bridge' };
      const message = { id: request.id, from: record.owner, to: 'bridge', type: 'director-take',
        context: `${request.sourceOrigin}/director`, ts,
        content: `[Director] ${record.take.name || 'Untitled take'} · ${request.href} · asset ${record.take.asset.id} · take SHA256 ${record.takeHash}`,
        director: { takeId: record.id, takeHash: record.takeHash, asset: record.take.asset } };
      return parse(await redis.eval(ROUTE,
        [`${PREFIX}send:${request.id}`, 'ch:bridge', 'ch:all', `${PREFIX}routed`],
        [JSON.stringify(receipt), ts, JSON.stringify(message), directorCursor(record)]));
    },
  };
}
