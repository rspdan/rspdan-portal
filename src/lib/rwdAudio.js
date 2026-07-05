// Pure, dependency-free audio data-URL decode for the RWD server (rspdan.com/api/rwd),
// extracted here so the codecs-parameter behavior is unit-testable outside the
// Astro/Vercel import chain (see src/lib/rwdAudio.test.mjs).
//
// The media type may carry parameters: Chrome and Firefox MediaRecorder emit
// data:audio/webm;codecs=opus;base64,... . So capture the whole audio/ media type
// up to the ;base64, marker. The pre-070426 /([^;]+)/ stopped at the first ';'
// and rejected the codecs form, which 400'd every recorded take on the two
// commonest browsers (external cross-witness catch 070426; Safari's paramless
// audio/mp4 is why it hid). The audio/ prefix is enforced in-regex, so non-audio
// and malformed inputs still return null.
export function decodeAudioDataUrl(dataUrl) {
  const match = /^data:(audio\/[^,]+);base64,(.+)$/s.exec(dataUrl || '');
  if (!match) return null;
  try {
    return { bytes: Buffer.from(match[2], 'base64'), contentType: match[1] };
  } catch {
    return null;
  }
}
