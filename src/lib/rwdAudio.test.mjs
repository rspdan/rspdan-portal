// Regression guard for the RWD audio decode (external cross-witness catch 070426).
// The blocker: decodeAudioDataUrl used /([^;]+)/, which stops at the first ';' and
// rejected data:audio/webm;codecs=opus;base64,... (what Chrome + Firefox
// MediaRecorder emit), so every recorded take 400'd on the two commonest browsers.
// This test locks in the codecs-parameter behavior so the class cannot regress.
//
// Self-contained, no test framework (the portal has none): `node src/lib/rwdAudio.test.mjs`.
// Exits non-zero on any failure.

import { decodeAudioDataUrl } from './rwdAudio.js';

let failures = 0;
function check(name, cond) {
  if (cond) { console.log(`PASS ${name}`); }
  else { failures++; console.log(`FAIL ${name}`); }
}

// A tiny valid base64 payload ("RWD" -> "UldE") so round-trip is verifiable.
const B64 = Buffer.from('RWD').toString('base64');

// 1. THE REGRESSION: Chrome/Firefox codecs MIME must decode (this is what used to 400).
const chrome = decodeAudioDataUrl(`data:audio/webm;codecs=opus;base64,${B64}`);
check('chrome webm;codecs=opus accepted', chrome !== null);
check('chrome contentType keeps codecs', chrome?.contentType === 'audio/webm;codecs=opus');
check('chrome bytes round-trip', chrome?.bytes?.toString() === 'RWD');

// 2. Firefox ogg;codecs=vorbis (another parameterized form).
const ff = decodeAudioDataUrl(`data:audio/ogg;codecs=vorbis;base64,${B64}`);
check('firefox ogg;codecs=vorbis accepted', ff?.contentType === 'audio/ogg;codecs=vorbis');

// 3. Safari paramless audio/mp4 (the form that always worked) still works.
const safari = decodeAudioDataUrl(`data:audio/mp4;base64,${B64}`);
check('safari audio/mp4 accepted', safari?.contentType === 'audio/mp4');
check('safari bytes round-trip', safari?.bytes?.toString() === 'RWD');

// 4. The audio-only guard must still hold: non-audio and malformed inputs reject.
check('image/png rejected (audio-only guard)', decodeAudioDataUrl(`data:image/png;base64,${B64}`) === null);
check('bare string rejected', decodeAudioDataUrl('notadataurl') === null);
check('empty rejected', decodeAudioDataUrl('') === null);
check('null rejected', decodeAudioDataUrl(null) === null);
check('missing base64 marker rejected', decodeAudioDataUrl('data:audio/webm,rawnotb64') === null);

// 5. The OLD regex is the proof of the bug: it must have rejected the Chrome form.
const OLD = /^data:([^;]+);base64,(.+)$/s;
check('old regex would have 400d the Chrome form', OLD.exec(`data:audio/webm;codecs=opus;base64,${B64}`) === null);

console.log(`\n${failures} failure(s)`);
process.exit(failures ? 1 : 0);
