// Actual-browser regression using the disposable local study fixture.
// PLAYWRIGHT_MODULE may name an existing installation; no live credentials are used.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fixtureCommand = process.env.STUDY_FIXTURE_COMMAND
  ? JSON.parse(process.env.STUDY_FIXTURE_COMMAND)
  : [process.execPath, fileURLToPath(new URL('./fixture_server.mjs', import.meta.url))];
const fixture = spawn(fixtureCommand[0], fixtureCommand.slice(1), {
  stdio: ['pipe', 'pipe', 'ignore'], windowsHide: true,
});
const lines = [], waiters = [];
createInterface({ input: fixture.stdout }).on('line', line => {
  const value = JSON.parse(line);
  if (waiters.length) waiters.shift()(value); else lines.push(value);
});
async function receive() {
  let timer;
  try {
    return await Promise.race([
      lines.length ? Promise.resolve(lines.shift()) : new Promise(resolve => waiters.push(resolve)),
      new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('Fixture timeout')), 60000); }),
    ]);
  } finally { clearTimeout(timer); }
}
let browser, sequence = 0;
async function command(command) {
  const id = ++sequence;
  fixture.stdin.write(JSON.stringify({ id, command }) + '\n');
  const result = await receive();
  assert.equal(result.ok, true); assert.equal(result.id, id);
  return result;
}
try {
  const ready = await receive(); assert.equal(ready.ok, true, ready.error);
  async function api(query = '', body) {
    const response = await fetch(`${ready.origin}/api/director-study${query}`, {
      headers: { Cookie: ready.cookie, Origin: ready.origin, 'Content-Type': 'application/json' },
      ...(body ? { method: 'POST', body: JSON.stringify(body) } : {}),
    });
    const value = await response.json(); assert.equal(response.ok, true, value.error);
    return value;
  }
  const id = `study_${randomUUID()}`;
  const study = { schema: 'nest-production-study/v1', title: 'Original reading',
    target: { kind: 'external-native', name: 'Synthetic reader test', sha256: null },
    evidence: [{ id: 'source', title: 'Original source', kind: 'text', source: 'Synthetic test', asset: null, text: 'Original words.\r\nSecond line.' }],
    cards: [], corrections: [], selectedCardId: null, acceptedCardId: null, preview: null, nextAction: '' };
  const first = await api('', { action: 'save', requestId: randomUUID(), studyId: id, baseRevisionId: null, study });
  const second = await api('', { action: 'save', requestId: randomUUID(), studyId: id,
    baseRevisionId: first.saved.revisionId, study: { ...study, title: 'Later reading' } });
  browser = await chromium.launch({ headless: true,
    ...(process.env.BROWSER_PATH ? { executablePath: process.env.BROWSER_PATH } : {}) });
  const context = await browser.newContext();
  const separator = ready.cookie.indexOf('=');
  await context.addCookies([{ name: ready.cookie.slice(0, separator), value: ready.cookie.slice(separator + 1), url: ready.origin }]);
  if (process.env.STUDY_BROWSER_SOURCE) {
    const body = await readFile(process.env.STUDY_BROWSER_SOURCE, 'utf8');
    await context.route('**/director/production-study.js', route => route.fulfill({ contentType: 'text/javascript', body }));
  }
  const page = await context.newPage();
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  page.on('dialog', dialog => dialog.accept());
  page.setDefaultTimeout(15000);
  const waitStatus = text => page.waitForFunction(text => document.querySelector('#ps-status')?.textContent.includes(text), text);
  const revision = () => new URL(page.url()).searchParams.get('revision');
  await page.goto(`${ready.origin}/director?study=${id}&revision=${first.saved.revisionId}&reader=kept#evidence`);
  await waitStatus('Study reopened');
  assert.equal(await page.locator('#ps-title').inputValue(), 'Original reading');
  const copied = page.url();
  await page.reload();
  await waitStatus('Study reopened');
  assert.equal(await page.locator('#ps-title').inputValue(), 'Original reading',
    'Copying/reopening the address must retain the viewed revision after a newer head exists');
  assert.equal(revision(), first.saved.revisionId);
  assert.equal(new URL(copied).searchParams.get('revision'), first.saved.revisionId);
  assert.equal(new URL(page.url()).searchParams.get('reader'), 'kept');
  assert.equal(new URL(page.url()).hash, '#evidence');
  console.log('PASS exact revision survives address copy and reload after a newer save');

  await page.locator('#ps-studies').selectOption(id);
  await page.locator('#ps-open').click();
  await page.waitForFunction(() => document.querySelector('#ps-title').value === 'Later reading');
  assert.equal(revision(), null);
  console.log('PASS explicit library Open reaches the current head without pinning it');

  await page.goto(`${ready.origin}/director?study=${id}&revision=${second.saved.revisionId}`);
  await waitStatus('Study reopened');

  await page.locator('#ps-next').fill('A new unsaved direction');
  assert.equal(revision(), second.saved.revisionId);
  await page.locator('#ps-save').click();
  await waitStatus('Saved locally and independently read back');
  const saved = await api(`?id=${id}`);
  assert.equal(revision(), saved.saved.revisionId);
  assert.equal(saved.study.nextAction, 'A new unsaved direction');
  assert.deepEqual(saved.study.evidence, study.evidence);
  console.log('PASS a confirmed save advances the address while unsaved edits do not');

  await api('', { action: 'save', requestId: randomUUID(), studyId: id,
    baseRevisionId: saved.saved.revisionId, study: { ...saved.study, title: 'Concurrent newer head' } });
  await page.locator('#ps-next').fill('Keep this conflicting draft');
  await page.locator('#ps-save').click(); await waitStatus('This study changed');
  assert.equal(revision(), saved.saved.revisionId);
  assert.equal(await page.locator('#ps-next').inputValue(), 'Keep this conflicting draft');
  console.log('PASS a rejected stale save keeps its prior revision and draft');

  await page.locator('#ps-copy').click(); await waitStatus('Saved locally and independently read back');
  const copyId = new URL(page.url()).searchParams.get('study');
  assert.notEqual(copyId, id);
  const copy = await api(`?id=${copyId}`);
  assert.equal(revision(), null);
  assert.equal(copy.saved.baseRevisionId, null);
  assert.equal(copy.study.nextAction, 'Keep this conflicting draft');
  console.log('PASS Save a copy creates an ordinary link to its new study');

  const stats = await command('stats');
  assert.equal(stats.calls.A.length + stats.calls.B.length, 0);
  assert.deepEqual(errors, []);
  console.log('PASS no provider invocation or browser script error');
} finally {
  await browser?.close();
  try { await command('stop'); } finally { fixture.stdin.end(); }
}
