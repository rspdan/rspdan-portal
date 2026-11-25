// Runs the actual Astro route against a disposable filesystem store, including
// server restart. No production credentials, Redis writes or Crew messages.
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomBytes, randomUUID } from 'node:crypto';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const repo = fileURLToPath(new URL('../../', import.meta.url));
const origin = 'http://127.0.0.1:4327';

test('actual API authenticates, saves, restarts and reopens editable take; explicit local send stays local', { timeout: 120000 }, async (t) => {
  const directory = await mkdtemp(join(tmpdir(), 'nest-director-http-'));
  const password = randomBytes(24).toString('hex');
  const signingSecret = randomBytes(32).toString('hex');
  const crewKey = randomBytes(32).toString('hex');
  const env = { ...process.env, PSPT_SECRET: signingSecret, PSPT_CREDS: JSON.stringify({ dan: password }), NEST_API_KEY: crewKey, DIRECTOR_DEV_STORE_DIR: directory, ASTRO_TELEMETRY_DISABLED: '1' };
  let child; let logs = '';
  async function start() {
    child = spawn(process.execPath, ['./node_modules/astro/astro.js', 'dev', '--host', '127.0.0.1', '--port', '4327'], { cwd: repo, env, stdio: ['ignore', 'pipe', 'pipe'], detached: true });
    child.stdout.on('data', (data) => { logs += data; });
    child.stderr.on('data', (data) => { logs += data; });
    for (let i = 0; i < 160; i++) {
      if (child.exitCode !== null) throw new Error(`Astro stopped: ${logs}`);
      try { const response = await fetch(`${origin}/api/director`); if (response.status === 401) return; } catch {}
      await delay(250);
    }
    throw new Error(`Astro did not become ready: ${logs}`);
  }
  async function stop() {
    if (!child || child.exitCode !== null) return;
    const exited = new Promise((resolve) => child.once('exit', resolve));
    process.kill(-child.pid, 'SIGTERM');
    await exited;
  }
  t.after(async () => { await stop(); await rm(directory, { recursive: true, force: true }); });
  await start();
  const registry = JSON.parse(await readFile(join(root, 'data/director-assets.json'), 'utf8'));
  const asset = registry.assets[0]; assert.ok(asset, 'exporter must supply actual asset registry');
  const pose = { bones: Object.fromEntries(asset.bones.map((name) => [name, { position: [0, 0, 0], rotation: [0, 0, 0, 1], scale: [1, 1, 1] }])), morphs: Object.fromEntries(asset.morphs.map((name) => [name, .25])) };
  const take = { schema: 'nest-director-take/v1', asset: { id: asset.id, sha256: asset.sha256 }, name: 'HTTP roundtrip', notes: 'Saved without a browser download.', look: 'trip', fps: 12, frame: 2, range: { start: 1, end: 48 }, stage: { background: 'green' }, camera: { mode: 'perspective', position: [2, 2, 4], target: [0, 1, 0], fov: .8, orthoSize: 3 }, pose, keyframes: [{ frame: 1, pose }, { frame: 2, pose }] };
  const login = await fetch(`${origin}/api/pspt/login`, { method: 'POST', redirect: 'manual', body: new URLSearchParams({ username: 'dan', password, next: '/director' }) });
  assert.equal(login.status, 302); assert.equal(login.headers.get('location'), '/director');
  const cookie = login.headers.get('set-cookie')?.split(';')[0]; assert.ok(cookie);
  async function request(body, extra = {}) {
    return fetch(`${origin}/api/director`, { method: 'POST', headers: { cookie, origin, 'content-type': 'application/json', ...extra }, body: JSON.stringify(body) });
  }
  assert.equal((await fetch(`${origin}/api/director`)).status, 401);
  assert.equal((await request({ take, requestId: randomUUID() }, { origin: 'https://other.example' })).status, 403);
  const requestId = randomUUID();
  const savedResponse = await request({ take, requestId });
  const saved = await savedResponse.json(); assert.equal(savedResponse.status, 200, JSON.stringify(saved));
  assert.equal(saved.shared, false); assert.equal(saved.storage, 'local-workspace');
  const id = saved.saved.id;
  assert.deepEqual(await (await request({ take, requestId })).json(), saved);
  const crewList = await (await fetch(`${origin}/api/director`, { headers: { 'x-nest-key': crewKey } })).json();
  assert.equal(crewList.takes.length, 0, 'save did not post anything');
  const invalid = structuredClone(take); invalid.pose.bones[asset.bones[0]].rotation = [0, 0, 0, 0];
  assert.equal((await request({ take: invalid, requestId: randomUUID() })).status, 400);
  assert.equal((await fetch(`${origin}/api/director`, { method: 'POST', headers: { cookie, origin, 'content-type': 'application/json' }, body: 'x'.repeat(2 * 1024 * 1024 + 1) })).status, 413);
  await stop(); await start();
  const reopened = await (await fetch(`${origin}/api/director?id=${id}`, { headers: { cookie } })).json();
  assert.deepEqual(reopened.take, take); assert.equal(reopened.saved.takeHash, saved.saved.takeHash);
  const sent = await (await request({ action: 'send', id, requestId: randomUUID() })).json();
  assert.equal(sent.delivery, 'local-workspace-only'); assert.equal(sent.shared, false);
  assert.equal((await (await fetch(`${origin}/api/director`, { headers: { 'x-nest-key': crewKey } })).json()).takes[0].id, id);
});
