// Disposable local receiving fixture. Stdout is a private JSONL protocol:
// its first message contains synthetic session cookies for the test process.
// All provider calls stay on loopback; no production build or real inference.
import { spawn } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import { mkdtemp, open, rm } from 'node:fs/promises';
import { createServer as createHttpServer } from 'node:http';
import { createServer as createProbe } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createInterface } from 'node:readline';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

const repo = fileURLToPath(new URL('../../', import.meta.url));
const digest = (bytes) => createHash('sha256').update(bytes).digest('hex');
const send = (value) => process.stdout.write(`${JSON.stringify(value)}\n`);
const secret = () => randomBytes(32).toString('hex');
const signingSecret = secret();
const password = secret();
const otherPassword = secret();
const providerKeys = { A: secret(), B: secret() };
const serviceKey = secret();
const calls = { A: [], B: [] };
const providers = {};
let workspace;
let origin;
let port;
let portLock;
let child;
let configuration = 'A';
let closing = false;
let starting = true;
let cleanupPromise;

function completion(label) {
  const card = {
    schema: 'mtr0-production-card/v1',
    observations: [{ text: `Fixture ${label} received synthetic selected evidence.`, sourceIds: ['picture', 'source-note'] }],
    proposal: { domain: 'lighting', text: `Consider one bounded synthetic lighting study from fixture ${label}.`, sourceIds: ['source-note'] },
    keepFixed: ['Keep the camera and materials unchanged.'],
    imageCheck: { text: 'Compare only after an actual preview exists.', sourceIds: ['picture'] },
    limits: ['A synthetic fixture response does not establish visual reasoning.'],
  };
  return { model: `synthetic-model-${label}`, choices: [{ finish_reason: 'stop', message: { role: 'assistant', content: JSON.stringify(card) } }] };
}

async function freePort() {
  for (let candidate = 4491; candidate < 4521; candidate++) {
    // A TCP probe alone races another fixture during Astro's startup delay.
    const lock = join(tmpdir(), `mtr0-operator-port-${candidate}.lock`);
    try {
      const handle = await open(lock, 'wx', 0o600);
      await handle.close();
    } catch (error) {
      if (error.code === 'EEXIST') continue;
      throw error;
    }
    const probe = createProbe();
    const available = await new Promise((resolve) => {
      probe.once('error', () => resolve(false));
      probe.listen(candidate, '127.0.0.1', () => probe.close(() => resolve(true)));
    });
    if (available) { portLock = lock; return candidate; }
    await rm(lock, { force: true });
  }
  throw new Error('No isolated fixture port available near 4491');
}

async function startProvider(label) {
  const provider = createHttpServer(async (request, response) => {
    try {
      if (request.method !== 'POST' || request.url !== '/v1/chat/completions') {
        response.writeHead(404); response.end(); return;
      }
      if (request.headers.authorization !== `Bearer ${providerKeys[label]}`) {
        response.writeHead(401); response.end(); return;
      }
      const chunks = []; let count = 0;
      for await (const chunk of request) {
        count += chunk.length;
        if (count > 24 * 1024 * 1024) throw new Error('Fixture request exceeds bound');
        chunks.push(chunk);
      }
      const bytes = Buffer.concat(chunks);
      const body = JSON.parse(bytes.toString('utf8'));
      const images = body.messages.flatMap((message) => Array.isArray(message.content) ? message.content : [])
        .filter((part) => part.type === 'image_url')
        .map((part) => {
          const match = /^data:([^;,]+);base64,(.*)$/.exec(part.image_url.url);
          if (!match) throw new Error('Fixture accepts attached images only');
          const image = Buffer.from(match[2], 'base64');
          return { sha256: digest(image), bytes: image.length, mime: match[1] };
        });
      // No headers, credentials or session tokens are retained in diagnostics.
      calls[label].push({ model: body.model, requestSha256: digest(bytes), requestBytes: bytes.length, body, images });
      response.writeHead(200, { 'content-type': 'application/json' });
      response.end(JSON.stringify(completion(label)));
    } catch {
      if (!response.destroyed) { response.writeHead(500); response.end(); }
    }
  });
  await new Promise((resolve, reject) => {
    provider.once('error', reject);
    provider.listen(0, '127.0.0.1', resolve);
  });
  providers[label] = provider;
}

async function stopAstro() {
  const running = child;
  child = null;
  if (!running || !running.pid || running.exitCode !== null || running.signalCode !== null) return;
  const exited = new Promise((resolve) => running.once('exit', resolve));
  const killer = setTimeout(() => {
    try { process.kill(-running.pid, 'SIGKILL'); } catch {}
  }, 5000);
  try {
    try { process.kill(-running.pid, 'SIGTERM'); } catch (error) { if (error.code !== 'ESRCH') throw error; }
    await exited;
  } finally { clearTimeout(killer); }
}

async function startAstro(label) {
  if (closing) throw new Error('Fixture is closing');
  const provider = providers[label];
  const endpoint = `http://127.0.0.1:${provider.address().port}/v1/chat/completions`;
  // Only runtime basics and disposable fixture settings enter the child.
  const env = Object.fromEntries(['PATH', 'HOME', 'TMPDIR', 'LANG', 'LC_ALL', 'SYSTEMROOT']
    .filter((name) => process.env[name] !== undefined).map((name) => [name, process.env[name]]));
  Object.assign(env, {
    PSPT_SECRET: signingSecret, PSPT_CREDS: JSON.stringify({ fixture: password, other: otherPassword }),
    NEST_API_KEY: serviceKey, DIRECTOR_STUDY_STORE_DIR: workspace,
    MTR0_ENDPOINT: endpoint, MTR0_SERVICE_ID: `synthetic-service-${label}`, MTR0_MODEL: `synthetic-model-${label}`,
    MTR0_API_KEY: providerKeys[label], MTR0_IMAGE_INPUT: 'true', MTR0_ALLOW_LOOPBACK_HTTP: 'true',
    UPSTASH_REDIS_REST_URL: '', UPSTASH_REDIS_REST_TOKEN: '', BLOB_READ_WRITE_TOKEN: '',
    ASTRO_TELEMETRY_DISABLED: '1',
  });
  const running = spawn(process.execPath, ['./node_modules/astro/astro.js', 'dev', '--host', '127.0.0.1', '--port', String(port)],
    { cwd: repo, env, stdio: ['ignore', 'ignore', 'ignore'], detached: true });
  child = running;
  let spawnFailed = false;
  running.once('error', () => { spawnFailed = true; });
  for (let attempt = 0; attempt < 160; attempt++) {
    if (closing) throw new Error('Fixture is closing');
    if (spawnFailed || running.exitCode !== null || running.signalCode !== null) throw new Error('Isolated Astro process exited');
    try {
      if ((await fetch(`${origin}/api/director-engine`, { signal: AbortSignal.timeout(1500) })).status === 401) {
        configuration = label;
        return;
      }
    } catch {}
    await delay(250);
  }
  throw new Error('Isolated Astro fixture did not become ready');
}

async function login(username, value) {
  const response = await fetch(`${origin}/api/pspt/login`, {
    method: 'POST', redirect: 'manual', signal: AbortSignal.timeout(15000),
    body: new URLSearchParams({ username, password: value, next: '/director' }),
  });
  const cookie = response.headers.get('set-cookie')?.split(';')[0];
  if (response.status !== 302 || response.headers.get('location') !== '/director' || !cookie) throw new Error('Synthetic session establishment failed');
  return cookie;
}

function cleanup() {
  if (cleanupPromise) return cleanupPromise;
  closing = true;
  cleanupPromise = (async () => {
    await stopAstro();
    for (const provider of Object.values(providers)) {
      provider.closeAllConnections();
      await new Promise((resolve) => provider.close(resolve));
    }
    if (workspace) await rm(workspace, { recursive: true, force: true });
    if (portLock) await rm(portLock, { force: true });
  })();
  return cleanupPromise;
}

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, () => {
    closing = true;
    if (!starting) void cleanup().finally(() => process.exit(0));
  });
}
process.stdout.on('error', () => {
  closing = true;
  if (!starting) void cleanup().finally(() => process.exit(1));
});

try {
  // Attach stdin immediately so premature parent exit also cleans startup work.
  const input = createInterface({ input: process.stdin, crlfDelay: Infinity });
  input.once('close', () => {
    closing = true;
    if (!starting) void cleanup();
  });
  workspace = await mkdtemp(join(tmpdir(), 'mtr0-operator-fixture-'));
  port = await freePort();
  origin = `http://127.0.0.1:${port}`;
  await startProvider('A');
  await startProvider('B');
  await startAstro('A');
  const cookie = await login('fixture', password);
  const otherCookie = await login('other', otherPassword);
  if (closing) throw new Error('Fixture is closing');
  starting = false;
  send({ ok: true, origin, cookie, otherCookie, configuration });
  for await (const line of input) {
    if (!line.trim()) continue;
    let request;
    try { request = JSON.parse(line); } catch { send({ ok: false, error: 'Invalid fixture JSON command' }); continue; }
    const id = request?.id ?? null;
    try {
      if (request.command === 'stats') send({ id, ok: true, configuration, calls });
      else if (request.command === 'restart' && ['A', 'B'].includes(request.configuration)) {
        await stopAstro();
        await startAstro(request.configuration);
        send({ id, ok: true, origin, configuration });
      } else if (request.command === 'stop') {
        await cleanup();
        send({ id, ok: true });
        input.close();
        break;
      } else send({ id, ok: false, error: 'Unknown fixture command' });
    } catch {
      send({ id, ok: false, error: 'Fixture command failed' });
    }
  }
  await cleanup();
} catch {
  starting = false;
  // Never emit raw process diagnostics, request bodies or environment values.
  send({ ok: false, error: 'Fixture startup failed' });
  await cleanup();
  process.exitCode = 1;
}
