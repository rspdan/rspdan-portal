import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { randomBytes, createHmac } from 'node:crypto';

// Exercise the actual module with explicit server environment fixtures. Astro
// normally injects import.meta.env; Node's test runner has no such injection.
const source = await readFile(new URL('./pspt.js', import.meta.url), 'utf8');
async function configured(env) {
  const moduleText = `const env = ${JSON.stringify(env)};\n${source.replaceAll('import.meta.env', 'env')}`;
  return import(`data:text/javascript;base64,${Buffer.from(moduleText).toString('base64')}`);
}
function signed(payload, secret) {
  const text = JSON.stringify(payload);
  return `${Buffer.from(text).toString('base64url')}.${createHmac('sha256', secret).update(text).digest('hex')}`;
}

test('configured users retain login, signed cookie roundtrip and logout', async () => {
  const secret = randomBytes(32).toString('hex'); const password = randomBytes(24).toString('hex');
  const auth = await configured({ PSPT_SECRET: secret, PSPT_CREDS: JSON.stringify({ dan: password }) });
  assert.equal(auth.authenticate('DAN', password), 'dan');
  assert.equal(auth.authenticate('dan', 'drw'), null, 'old temporary login cannot bypass configured credentials');
  const token = auth.createSession('dan');
  assert.equal(auth.verifySession(`pspt_session=${token}`).user, 'dan');
  assert.match(auth.sessionCookie(token), /HttpOnly; Secure; SameSite=Strict/);
  assert.match(auth.clearCookie(), /Max-Age=0/);
});

test('missing configuration fails closed without crashing page session checks', async () => {
  const auth = await configured({});
  assert.equal(auth.authenticate('dan', 'drw'), null);
  assert.equal(auth.verifySession(null), null);
  assert.equal(auth.verifySession(`pspt_session=${signed({ user: 'dan', exp: Date.now() + 10000 }, 'anything')}`), null);
  assert.throws(() => auth.createSession('dan'), /not configured/);
});

test('expired, malformed and differently signed cookies cannot authenticate', async () => {
  const secret = randomBytes(32).toString('hex');
  const auth = await configured({ PSPT_SECRET: secret });
  for (const token of [
    'not-a-cookie', signed({ user: 'dan', exp: Date.now() - 1 }, secret),
    signed({ user: 'dan' }, secret), signed({ user: 'dan', exp: Date.now() + 10000 }, 'different-secret'),
    signed({ exp: Date.now() + 10000 }, secret),
    `e30.${'é'.repeat(64)}`, `${signed({ user: 'dan', exp: Date.now() + 10000 }, secret)}.extra`,
  ]) assert.equal(auth.verifySession(`pspt_session=${token}`), null);
});
