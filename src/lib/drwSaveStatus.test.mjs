// Self-contained regression test for the DRW E3 honest-save-status decision.
// No framework (the portal has none): run with `node src/lib/drwSaveStatus.test.mjs`.
// Exits non-zero on the first failure so a broken honesty-guarantee fails loud.
//
// What this guards: a save where the layered scene did NOT persist (sceneUrl
// null) must announce FLAT PNG ONLY, never a bare "SAVED". That is the
// "nothing gets lost includes knowing when it would" guarantee; if it ever
// silently reverts to claiming SCENE stored, the operator loses editable work
// believing it was saved. Same failure-class as the RWD codec regression.

import { saveStatusLine } from './drwSaveStatus.js';

let pass = 0, fail = 0;
function eq(label, got, want) {
  if (got === want) { pass++; return; }
  fail++;
  console.error(`FAIL: ${label}\n  got:  ${JSON.stringify(got)}\n  want: ${JSON.stringify(want)}`);
}
function ok(label, cond) {
  if (cond) { pass++; return; }
  fail++;
  console.error(`FAIL: ${label}`);
}

const STORED = 'SAVED drw_1751700000_dan · SCENE + PNG STORED';
const FLAT = 'SAVED drw_1751700000_dan · FLAT PNG ONLY (LAYERED SCENE NOT STORED · FILE > EXPORT DRAFT KEEPS THE EDITABLE COPY)';

// 1. Scene stored (sceneUrl present) -> honest "SCENE + PNG STORED".
eq('scene stored -> SCENE + PNG STORED',
  saveStatusLine({ id: 'drw_1751700000_dan', sceneUrl: 'https://x.public.blob.vercel-storage.com/a.scene.json' }),
  STORED);

// 2. THE GUARDED CASE: sceneUrl null (no blob token / too large / blob error) ->
//    FLAT PNG ONLY, never a bare SAVED. This is the data-loss disclosure.
eq('sceneUrl null -> FLAT PNG ONLY',
  saveStatusLine({ id: 'drw_1751700000_dan', sceneUrl: null }),
  FLAT);

// 3. sceneUrl undefined (field absent) -> degraded, same as null.
eq('sceneUrl undefined -> FLAT PNG ONLY',
  saveStatusLine({ id: 'drw_1751700000_dan' }),
  FLAT);

// 4. sceneUrl empty string is falsy -> degraded (a stored blob url is never empty).
eq('sceneUrl empty string -> FLAT PNG ONLY',
  saveStatusLine({ id: 'drw_1751700000_dan', sceneUrl: '' }),
  FLAT);

// 5. The disclosure NEVER claims the scene stored when it did not (the core invariant).
ok('degraded status never says "SCENE + PNG STORED"',
  !saveStatusLine({ id: 'drw_1751700000_dan', sceneUrl: null }).includes('SCENE + PNG STORED'));
ok('degraded status names the editable-copy escape hatch (EXPORT DRAFT)',
  saveStatusLine({ id: 'drw_1751700000_dan', sceneUrl: null }).includes('EXPORT DRAFT'));

// 6. Defensive: a malformed drawing object still yields an honest degraded line, not a crash.
ok('null drawing -> degraded, no throw',
  saveStatusLine(null) === 'SAVED (unknown) · FLAT PNG ONLY (LAYERED SCENE NOT STORED · FILE > EXPORT DRAFT KEEPS THE EDITABLE COPY)');

// 7. The exact public copy is byte-locked (public-facing status text must not drift silently).
ok('stored copy is exactly "· SCENE + PNG STORED"',
  saveStatusLine({ id: 'x', sceneUrl: 'https://y.public.blob.vercel-storage.com/z' }) === 'SAVED x · SCENE + PNG STORED');

console.log(`drwSaveStatus: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
