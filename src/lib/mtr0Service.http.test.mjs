// Actual local Astro route, synthetic saved work and a disposable HTTP provider.
// No real inference, private evidence, deployed server or device is used.
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomBytes, randomUUID, createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { createServer as createProbe } from 'node:net';
import { createServer as createProvider } from 'node:http';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import { createProductionStudyService } from './productionStudyService.js';
import { createProductionStudyStore } from './productionStudyStore.js';
import { MAX_ENGINE_BODY_BYTES } from './mtr0OperationSchema.js';

const repo = fileURLToPath(new URL('../../', import.meta.url));
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGP4/x8AAwAB//wl3FEAAAAASUVORK5CYII=', 'base64');
const actor = { kind: 'operator', user: 'dan' };
const digest = (bytes) => createHash('sha256').update(bytes).digest('hex');
const card = {
  schema: 'mtr0-production-card/v1',
  observations: [{ text: 'An invented one-pixel source and text are selected.', sourceIds: ['picture', 'source-note'] }],
  proposal: { domain: 'lighting', text: 'Consider one separately controlled light study.', sourceIds: ['source-note'] },
  keepFixed: ['Keep camera and materials unchanged.'],
  imageCheck: { text: 'Compare only after an actual preview exists.', sourceIds: ['picture'] },
  limits: ['Synthetic provider output does not establish visual reasoning.'],
};
const completion = () => ({ model: 'synthetic-response-model', choices: [{ finish_reason: 'stop', message: { role: 'assistant', content: JSON.stringify(card) } }] });

async function freePort() {
  for (let port = 4389; port < 4420; port++) {
    const probe = createProbe();
    const available = await new Promise((resolve) => {
      probe.once('error', () => resolve(false));
      probe.listen(port, '127.0.0.1', () => probe.close(() => resolve(true)));
    });
    if (available) return port;
  }
  throw new Error('No free isolated engine-test port near 4389');
}

test('actual engine route gates requests and preserves historical operations after provider-disabled restart', { timeout: 180000 }, async (t) => {
  const directory = await mkdtemp(join(tmpdir(), 'nest-mtr0-http-'));
  const studyService = createProductionStudyService({ store: createProductionStudyStore(directory) });
  const image = (await studyService.asset({ action: 'asset', dataUrl: `data:image/png;base64,${png.toString('base64')}` }, actor)).asset;
  const study = {
    schema: 'nest-production-study/v1', title: 'Invented HTTP engine study',
    target: { kind: 'external-native', name: 'PRIVATE_TARGET_CANARY.blend', sha256: 'a'.repeat(64) },
    evidence: [
      { id: 'picture', title: 'Synthetic PNG', kind: 'image', source: 'PRIVATE_LOCATOR_CANARY', asset: image, text: null },
      { id: 'source-note', title: 'Source note', kind: 'text', source: 'PRIVATE_TEXT_LOCATOR_CANARY', asset: null, text: 'A source note for an invented lighting study.' },
      { id: 'not-selected', title: 'Not selected', kind: 'text', source: 'Unused fixture', asset: null, text: 'UNSELECTED_TEXT_CANARY' },
    ],
    cards: [{ id: 'manual', parentId: null, origin: 'operator', observations: 'MANUAL_CARD_CANARY', proposal: 'A manual draft.', keepFixed: 'No implicit changes.', imageCheck: 'No preview.', limits: 'No inference.', sourceIds: ['not-selected'] }],
    corrections: [], selectedCardId: 'manual', acceptedCardId: null, preview: null, nextAction: 'NEXT_ACTION_CANARY',
  };
  const saved = await studyService.save({ action: 'save', requestId: randomUUID(), studyId: `study_${randomUUID()}`, baseRevisionId: null, study }, actor);
  const input = { action: 'generate', operationId: `op_${randomUUID()}`, studyId: saved.saved.id, revisionId: saved.saved.revisionId,
    sourceIds: ['picture', 'source-note'], instruction: 'Propose a bounded lighting study from these selected sources.', allowedDomains: ['lighting'] };
  const password = randomBytes(24).toString('hex'); const otherPassword = randomBytes(24).toString('hex');
  const signingSecret = randomBytes(32).toString('hex'); const serviceKey = randomBytes(32).toString('hex');
  const providerKey = randomBytes(32).toString('hex');
  const calls = []; let releaseProvider; let arrive;
  const arrived = new Promise((resolve) => { arrive = resolve; });
  const provider = createProvider(async (req, res) => {
    try {
      const chunks = []; for await (const part of req) chunks.push(part);
      const bytes = Buffer.concat(chunks); calls.push({ bytes, body: JSON.parse(bytes.toString('utf8')), authorization: req.headers.authorization });
      releaseProvider = () => { res.writeHead(200, { 'content-type': 'application/json' }); res.end(JSON.stringify(completion())); };
      arrive();
    } catch { if (!res.destroyed) { res.writeHead(500); res.end(); } }
  });
  await new Promise((resolve, reject) => { provider.once('error', reject); provider.listen(0, '127.0.0.1', resolve); });
  const endpoint = `http://127.0.0.1:${provider.address().port}/v1/chat/completions`;
  const port = await freePort(); const origin = `http://127.0.0.1:${port}`;
  let child;
  async function start({ enabled = true, localStore = true, invalidModel = false } = {}) {
    const env = { ...process.env,
      PSPT_SECRET: signingSecret, PSPT_CREDS: JSON.stringify({ dan: password, other: otherPassword }), NEST_API_KEY: serviceKey,
      DIRECTOR_STUDY_STORE_DIR: localStore ? directory : '',
      MTR0_ENDPOINT: enabled ? endpoint : '', MTR0_SERVICE_ID: enabled ? 'synthetic-service' : '',
      MTR0_MODEL: enabled ? (invalidModel ? 'C:/private/UNSAFE_MODEL_CANARY' : 'synthetic-model') : '',
      MTR0_API_KEY: enabled ? providerKey : '', MTR0_IMAGE_INPUT: enabled ? 'true' : '', MTR0_ALLOW_LOOPBACK_HTTP: enabled ? 'true' : '',
      UPSTASH_REDIS_REST_URL: '', UPSTASH_REDIS_REST_TOKEN: '', BLOB_READ_WRITE_TOKEN: '', ASTRO_TELEMETRY_DISABLED: '1',
    };
    child = spawn(process.execPath, ['./node_modules/astro/astro.js', 'dev', '--host', '127.0.0.1', '--port', String(port)],
      { cwd: repo, env, stdio: ['ignore', 'ignore', 'pipe'], detached: true });
    child.stderr.on('data', () => {}); // Do not expose environment/session material in receiving logs.
    for (let attempt = 0; attempt < 160; attempt++) {
      if (child.exitCode !== null) throw new Error(`Isolated Astro process exited with status ${child.exitCode}`);
      try {
        if ((await fetch(`${origin}/api/director-engine`, { signal: AbortSignal.timeout(1500) })).status === 401) return;
      } catch {}
      await delay(250);
    }
    throw new Error('Isolated Astro engine route did not become ready');
  }
  async function stop() {
    if (!child || child.exitCode !== null) return;
    const running = child; const exited = new Promise((resolve) => running.once('exit', resolve));
    const killer = setTimeout(() => { try { process.kill(-running.pid, 'SIGKILL'); } catch {} }, 5000);
    try { process.kill(-running.pid, 'SIGTERM'); await exited; } finally { clearTimeout(killer); }
  }
  t.after(async () => {
    await stop(); provider.closeAllConnections(); await new Promise((resolve) => provider.close(resolve));
    await rm(directory, { recursive: true, force: true });
  });
  await start();
  async function login(username, value) {
    const response = await fetch(`${origin}/api/pspt/login`, { method: 'POST', redirect: 'manual', body: new URLSearchParams({ username, password: value, next: '/director' }) });
    assert.equal(response.status, 302); assert.equal(response.headers.get('location'), '/director');
    const cookie = response.headers.get('set-cookie')?.split(';')[0]; assert.ok(cookie, 'synthetic session established'); return cookie;
  }
  const cookie = await login('dan', password); const otherCookie = await login('other', otherPassword);
  const get = (query = '', activeCookie = cookie) => fetch(`${origin}/api/director-engine${query}`, { headers: { cookie: activeCookie } });
  const post = (body, headers = {}, query = '') => fetch(`${origin}/api/director-engine${query}`, { method: 'POST',
    headers: { cookie, origin, 'content-type': 'application/json', ...headers }, body: JSON.stringify(body) });
  const parsed = async (response, status = 200) => { assert.equal(response.status, status); return response.json(); };
  const checkPublic = (value) => {
    const raw = JSON.stringify(value);
    for (const omitted of [endpoint, providerKey, 'UNSAFE_MODEL_CANARY', 'PRIVATE_LOCATOR_CANARY', 'data:image/']) {
      assert.equal(raw.includes(omitted), false, 'public result omits provider secrets and image payloads');
    }
  };

  assert.equal((await fetch(`${origin}/api/director-engine`)).status, 401);
  assert.equal((await fetch(`${origin}/api/director-engine`, { method: 'POST', headers: { origin, 'content-type': 'application/json' }, body: '{}' })).status, 401);
  assert.equal((await get('', 'pspt_session=invalid')).status, 401);
  assert.equal((await fetch(`${origin}/api/director-engine`, { headers: { 'x-nest-key': serviceKey } })).status, 401, 'an API key does not establish an operator session');
  assert.equal((await post(input, { origin: 'https://other.example' })).status, 403);
  assert.equal((await fetch(`${origin}/api/director-engine`, { method: 'POST', headers: { cookie, 'content-type': 'application/json' }, body: '{}' })).status, 403);
  assert.equal((await post(input, { 'content-type': 'text/plain' })).status, 415);
  assert.equal((await fetch(`${origin}/api/director-engine`, { method: 'POST', headers: { cookie, origin, 'content-type': 'application/json' }, body: '{' })).status, 400);
  for (const query of ['?unknown=1', '?operationId=bad', '?studyId=bad', `?studyId=${input.studyId}&studyId=${input.studyId}`,
    `?studyId=${input.studyId}&operationId=${input.operationId}`]) assert.equal((await get(query)).status, 400);
  for (const patch of [{ actor }, { endpoint }, { action: 'save' }, { operationId: 'not-an-operation' }, { extra: true }]) {
    assert.equal((await post({ ...input, ...patch })).status, 400);
  }
  assert.equal((await post(input, {}, '?unknown=1')).status, 400);
  const exactBound = await fetch(`${origin}/api/director-engine`, { method: 'POST', headers: { cookie, origin, 'content-type': 'application/json' }, body: ' '.repeat(MAX_ENGINE_BODY_BYTES) });
  assert.equal(exactBound.status, 400, 'a bounded but invalid JSON body reaches validation');
  const huge = await fetch(`${origin}/api/director-engine`, { method: 'POST', headers: { cookie, origin, 'content-type': 'application/json' }, body: ' '.repeat(MAX_ENGINE_BODY_BYTES + 1) });
  assert.equal(huge.status, 413);
  const streamed = await fetch(`${origin}/api/director-engine`, { method: 'POST', headers: { cookie, origin, 'content-type': 'application/json' }, duplex: 'half',
    body: (async function* () { yield ' '.repeat(MAX_ENGINE_BODY_BYTES); yield ' '; })() });
  assert.equal(streamed.status, 413, 'the byte bound also applies without Content-Length');
  assert.equal(calls.length, 0);
  const initial = await parsed(await get()); checkPublic(initial);
  assert.equal(initial.storage, 'local-workspace'); assert.equal(initial.shared, false); assert.deepEqual(initial.operations, []);
  assert.equal(initial.configuration.configured, true); assert.equal(initial.configuration.serviceId, 'synthetic-service');
  assert.equal(initial.configuration.model, 'synthetic-model'); assert.equal(initial.configuration.declaredImageInput, true);

  const generating = post(input); let arrivalTimer;
  try { await Promise.race([arrived, new Promise((_, reject) => { arrivalTimer = setTimeout(() => reject(new Error('Synthetic provider request did not arrive')), 15000); })]); }
  finally { clearTimeout(arrivalTimer); }
  const pending = await parsed(await get(`?operationId=${input.operationId}`));
  assert.equal(pending.operation.status, 'pending'); assert.equal(pending.operation.outcome, null); assert.equal(pending.operation.finishedAt, null);
  const duplicate = await parsed(await post(input), 202); assert.equal(duplicate.operation.status, 'pending');
  assert.equal((await post({ ...input, instruction: 'Changed request under the same operation ID.' })).status, 409);
  assert.equal(calls.length, 1); releaseProvider();
  const completed = await parsed(await generating); checkPublic(completed);
  assert.equal(completed.operation.status, 'completed'); assert.deepEqual(completed.operation.outcome.card, card);
  assert.ok(completed.operation.finishedAt); assert.equal(completed.operation.id, input.operationId);
  assert.equal(completed.operation.request.study.revisionId, input.revisionId);
  assert.equal(completed.operation.request.requestSha256, digest(calls[0].bytes));
  assert.equal(calls[0].authorization, `Bearer ${providerKey}`);
  const wire = calls[0].body.messages.find((message) => message.role === 'user').content;
  const images = wire.filter((part) => part.type === 'image_url'); assert.equal(images.length, 1);
  assert.deepEqual(Buffer.from(images[0].image_url.url.split(',')[1], 'base64'), png);
  for (const canary of ['MANUAL_CARD_CANARY', 'UNSELECTED_TEXT_CANARY', 'NEXT_ACTION_CANARY', 'PRIVATE_LOCATOR_CANARY', 'PRIVATE_TARGET_CANARY']) {
    assert.equal(calls[0].bytes.includes(Buffer.from(canary)), false);
  }
  assert.deepEqual(await parsed(await post(input)), completed); assert.equal(calls.length, 1);
  assert.deepEqual(await parsed(await get(`?operationId=${input.operationId}`)), completed);
  const listing = await parsed(await get(`?studyId=${input.studyId}`)); assert.equal(listing.operations.length, 1);
  assert.equal(listing.operations[0].status, 'completed'); assert.deepEqual(listing.operations[0].sourceIds, input.sourceIds);
  assert.equal((await get(`?operationId=${input.operationId}`, otherCookie)).status, 404);
  assert.deepEqual((await parsed(await get(`?studyId=${input.studyId}`, otherCookie))).operations, [], 'a study filter lists only the active owner operations; it does not prove study existence');
  assert.deepEqual((await parsed(await get('', otherCookie))).operations, []);
  assert.deepEqual(await studyService.get(saved.saved.id, actor), saved, 'the route does not adopt a generated result into authored study work');

  const newer = structuredClone(study); newer.nextAction = 'A later operator action.';
  const revised = await studyService.save({ action: 'save', requestId: randomUUID(), studyId: saved.saved.id, baseRevisionId: saved.saved.revisionId, study: newer }, actor);
  assert.equal((await post({ ...input, operationId: `op_${randomUUID()}` })).status, 409, 'a fresh operation requires the current saved revision');
  assert.deepEqual(await parsed(await post(input)), completed, 'historical retries remain readable after study revision advances');
  await stop(); await start({ enabled: false });
  const disabled = await parsed(await get()); checkPublic(disabled); assert.equal(disabled.configuration.configured, false);
  assert.equal(disabled.configuration.reason, 'unconfigured');
  assert.deepEqual(await parsed(await get(`?operationId=${input.operationId}`)), completed);
  assert.deepEqual(await parsed(await post(input)), completed, 'restart with no provider does not resend historical work');
  const fresh = { ...input, operationId: `op_${randomUUID()}`, revisionId: revised.saved.revisionId };
  assert.equal((await post(fresh)).status, 503); assert.equal(calls.length, 1);
  await stop(); await start({ invalidModel: true });
  const invalid = await parsed(await get()); checkPublic(invalid); assert.equal(invalid.configuration.configured, false);
  assert.equal(invalid.configuration.reason, 'invalid-configuration');
  assert.deepEqual(await parsed(await post(input)), completed, 'unsafe current provider labels do not replace historical configured identity');
  assert.equal((await post(fresh)).status, 503); assert.equal(calls.length, 1);
  await stop(); await start({ localStore: false });
  assert.equal((await get()).status, 503); assert.equal((await post(input)).status, 503);
  assert.equal(calls.length, 1);
});
