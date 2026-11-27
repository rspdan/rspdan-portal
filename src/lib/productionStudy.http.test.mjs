// Actual local Astro route; synthetic credentials and isolated temporary assets.
// No remote service, native scene, model or deployment is part of this test.
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readdir, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomBytes, randomUUID, createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import { MAX_BODY_BYTES } from './productionStudySchema.js';

const repo = fileURLToPath(new URL('../../', import.meta.url));
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGP4/x8AAwAB//wl3FEAAAAASUVORK5CYII=', 'base64');
const dataUrl = `data:image/png;base64,${png.toString('base64')}`;
function draft(asset = null) {
  return { schema: 'nest-production-study/v1', title: 'HTTP draft <literal> & unaccepted',
    target: { kind: 'external-native', name: 'synthetic-study.blend', sha256: 'a'.repeat(64) },
    evidence: [{ id: 'image-1', title: 'Synthetic one-pixel fixture', kind: 'image', source: 'Local test bytes', asset, text: null }],
    cards: [{ id: 'card-1', parentId: null, origin: 'operator', observations: 'This is a fixture.', proposal: 'No value selected.',
      keepFixed: 'Camera and materials.', imageCheck: 'Preview is absent.', limits: 'No inference.', sourceIds: ['image-1'] }],
    corrections: [], selectedCardId: 'card-1', acceptedCardId: null, preview: null, nextAction: 'Review this manual draft.' };
}
async function freePort() {
  for (let port = 4379; port < 4410; port++) {
    const server = createServer();
    const available = await new Promise((resolve) => {
      server.once('error', () => resolve(false));
      server.listen(port, '127.0.0.1', () => server.close(() => resolve(true)));
    });
    if (available) return port;
  }
  throw new Error('No free isolated study-test port near 4379');
}
async function filesContaining(directory, bytes) {
  const matches = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) matches.push(...await filesContaining(path, bytes));
    else if (entry.isFile() && (await readFile(path)).equals(bytes)) matches.push(path);
  }
  return matches;
}

test('actual study route enforces local auth/origin/body limits and reopens exact private work after restart', { timeout: 180000 }, async (t) => {
  const directory = await mkdtemp(join(tmpdir(), 'nest-production-study-http-'));
  const password = randomBytes(24).toString('hex'); const otherPassword = randomBytes(24).toString('hex');
  const signingSecret = randomBytes(32).toString('hex'); const serviceKey = randomBytes(32).toString('hex');
  const port = await freePort(); const origin = `http://127.0.0.1:${port}`;
  let child;
  async function start(enabled = true) {
    const env = { ...process.env, PSPT_SECRET: signingSecret, PSPT_CREDS: JSON.stringify({ dan: password, other: otherPassword }),
      NEST_API_KEY: serviceKey, DIRECTOR_STUDY_STORE_DIR: enabled ? directory : '',
      UPSTASH_REDIS_REST_URL: '', UPSTASH_REDIS_REST_TOKEN: '', BLOB_READ_WRITE_TOKEN: '', ASTRO_TELEMETRY_DISABLED: '1' };
    child = spawn(process.execPath, ['./node_modules/astro/astro.js', 'dev', '--host', '127.0.0.1', '--port', String(port)],
      { cwd: repo, env, stdio: ['ignore', 'ignore', 'pipe'], detached: true });
    // Drain stderr without emitting raw process environment or session material.
    child.stderr.on('data', () => {});
    for (let attempt = 0; attempt < 160; attempt++) {
      if (child.exitCode !== null) throw new Error(`Isolated Astro process exited with status ${child.exitCode}`);
      try {
        const response = await fetch(`${origin}/api/director-study`, { signal: AbortSignal.timeout(1500) });
        if (response.status === 401) return;
      } catch {}
      await delay(250);
    }
    throw new Error('Isolated Astro study route did not become ready');
  }
  async function stop() {
    if (!child || child.exitCode !== null) return;
    const running = child;
    const exited = new Promise((resolve) => running.once('exit', resolve));
    const killer = setTimeout(() => { try { process.kill(-running.pid, 'SIGKILL'); } catch {} }, 5000);
    try { process.kill(-running.pid, 'SIGTERM'); await exited; }
    finally { clearTimeout(killer); }
  }
  t.after(async () => { await stop(); await rm(directory, { recursive: true, force: true }); });
  await start();
  async function login(username, secret) {
    const response = await fetch(`${origin}/api/pspt/login`, { method: 'POST', redirect: 'manual',
      body: new URLSearchParams({ username, password: secret, next: '/director' }) });
    assert.equal(response.status, 302); assert.equal(response.headers.get('location'), '/director');
    const cookie = response.headers.get('set-cookie')?.split(';')[0]; assert.ok(cookie, 'synthetic session established');
    return cookie;
  }
  const cookie = await login('dan', password); const otherCookie = await login('other', otherPassword);
  const post = (body, headers = {}) => fetch(`${origin}/api/director-study`, { method: 'POST',
    headers: { cookie, origin, 'content-type': 'application/json', ...headers }, body: JSON.stringify(body) });
  const get = (query = '', activeCookie = cookie) => fetch(`${origin}/api/director-study${query}`, { headers: { cookie: activeCookie } });
  assert.equal((await fetch(`${origin}/api/director-study`)).status, 401);
  assert.equal((await fetch(`${origin}/api/director-study`, { method: 'POST', headers: { origin, 'content-type': 'application/json' }, body: '{}' })).status, 401);
  assert.equal((await fetch(`${origin}/api/director-study`, { headers: { 'x-nest-key': serviceKey } })).status, 401, 'API key is not an operator session');
  assert.equal((await get('', 'pspt_session=invalid')).status, 401);
  assert.equal((await post({ action: 'asset', dataUrl }, { origin: 'https://other.example' })).status, 403);
  assert.equal((await fetch(`${origin}/api/director-study`, { method: 'POST', headers: { cookie, 'content-type': 'application/json' }, body: '{}' })).status, 403);
  assert.equal((await post({}, { 'content-type': 'text/plain' })).status, 415);
  assert.equal((await fetch(`${origin}/api/director-study`, { method: 'POST', headers: { cookie, origin, 'content-type': 'application/json' }, body: '{' })).status, 400);
  assert.equal((await post({ action: 'send' })).status, 400, 'the study route has no external-send operation');
  const upload = await post({ action: 'asset', dataUrl });
  const uploaded = await upload.json(); assert.equal(upload.status, 200, JSON.stringify(uploaded));
  assert.equal(uploaded.storage, 'local-workspace'); assert.equal(uploaded.shared, false);
  assert.equal(uploaded.asset.sha256, createHash('sha256').update(png).digest('hex'));
  const assetResponse = await get(`?asset=${uploaded.asset.sha256}`);
  assert.equal(assetResponse.status, 200); assert.match(assetResponse.headers.get('content-type'), /^image\/png/);
  assert.deepEqual(Buffer.from(await assetResponse.arrayBuffer()), png);
  assert.equal((await get(`?asset=${uploaded.asset.sha256}`, otherCookie)).status, 404);
  assert.equal((await get('?asset=../../private')).status, 400);
  const request = { action: 'save', requestId: randomUUID(), studyId: `study_${randomUUID()}`, baseRevisionId: null, study: draft(uploaded.asset) };
  const response = await post(request); const saved = await response.json(); assert.equal(response.status, 200, JSON.stringify(saved));
  assert.equal(saved.study.preview, null); assert.equal(saved.study.acceptedCardId, null);
  assert.equal(saved.storage, 'local-workspace'); assert.equal(saved.shared, false);
  assert.deepEqual(await (await post(request)).json(), saved);
  const changedReuse = structuredClone(request); changedReuse.study.nextAction = 'Changed body under same request';
  assert.equal((await post(changedReuse)).status, 409);
  const next = structuredClone(request); next.requestId = randomUUID(); next.baseRevisionId = saved.saved.revisionId;
  next.study.nextAction = 'A later draft action';
  const nextResponse = await post(next); const revised = await nextResponse.json();
  assert.equal(nextResponse.status, 200, JSON.stringify(revised));
  assert.equal((await post({ ...next, requestId: randomUUID(), baseRevisionId: saved.saved.revisionId })).status, 409);
  assert.equal((await get(`?id=${request.studyId}`, otherCookie)).status, 404);
  assert.deepEqual((await (await get('', otherCookie)).json()).studies, []);
  const missing = { ...request, studyId: `study_${randomUUID()}`, requestId: randomUUID(), study: draft({ ...uploaded.asset, sha256: 'b'.repeat(64) }) };
  assert.equal((await post(missing)).status, 409, 'claimed asset bytes must exist before saving');
  const tooBig = await fetch(`${origin}/api/director-study`, { method: 'POST',
    headers: { cookie, origin, 'content-type': 'application/json' }, body: ' '.repeat(MAX_BODY_BYTES + 1) });
  assert.equal(tooBig.status, 413);
  await stop(); await start();
  const reopened = await (await get(`?id=${request.studyId}`)).json();
  assert.deepEqual(reopened, revised);
  assert.deepEqual(await (await get(`?id=${request.studyId}&revision=${saved.saved.revisionId}`)).json(), saved);
  assert.deepEqual(await (await post(request)).json(), saved, 'old retry remains its original revision after restart');
  assert.deepEqual(Buffer.from(await (await get(`?asset=${uploaded.asset.sha256}`)).arrayBuffer()), png);
  assert.equal((await get(`?asset=${uploaded.asset.sha256}`, otherCookie)).status, 404);
  assert.equal((await (await get()).json()).studies.length, 1);
  const storedBlobs = await filesContaining(directory, png); assert.equal(storedBlobs.length, 1);
  const altered = Buffer.from(png); altered[44] ^= 1;
  await writeFile(storedBlobs[0], altered);
  const corruptAsset = await get(`?asset=${uploaded.asset.sha256}`);
  assert.equal(corruptAsset.status, 503, 'authenticated GET cannot return bytes whose hash no longer matches');
  assert.match(corruptAsset.headers.get('content-type'), /application\/json/);
  assert.equal((await corruptAsset.json()).ok, false);
  assert.equal((await get(`?id=${request.studyId}`)).status, 503, 'readback cannot claim intact referenced evidence');
  assert.equal((await post(request)).status, 503, 'idempotent retry cannot hide corrupted attachment bytes');
  await stop(); await start(false);
  assert.equal((await get()).status, 503, 'unconfigured local storage stays disabled');
  assert.equal((await post(request)).status, 503);
  assert.equal((await get(`?asset=${uploaded.asset.sha256}`)).status, 503);
});
