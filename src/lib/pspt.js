// PSPT — Per-Session-Per-Trip auth module (Phase 1: hand-rolled signed cookie)
//
// Env vars required (set in Vercel dashboard):
//   PSPT_SECRET   — random string, 32+ chars, used for HMAC signing
//   PSPT_CREDS    — JSON: {"dan":"<password>","trip":"<password>"} (plaintext Phase 1,
//                   hashed Phase 2). Each key is a username, value is the password.
//   GITHUB_TOKEN  — repo-scoped token (contents:write) for committing edits
//
// The cookie is an HMAC-SHA256-signed JSON payload: {user, exp}.
// No external dependencies. Uses Node.js crypto (available in Vercel serverless).

import { createHmac, timingSafeEqual } from 'node:crypto';

const COOKIE_NAME = 'pspt_session';
const MAX_AGE = 60 * 60 * 8; // 8 hours

function getSecret() {
  const s = import.meta.env.PSPT_SECRET;
  if (!s) throw new Error('PSPT_SECRET not configured');
  return s;
}

function getCreds() {
  const raw = import.meta.env.PSPT_CREDS;
  if (!raw) throw new Error('PSPT_CREDS not configured');
  try { return JSON.parse(raw); }
  catch { throw new Error('PSPT_CREDS is not valid JSON'); }
}

function hmacSign(payload) {
  const json = JSON.stringify(payload);
  const sig = createHmac('sha256', getSecret()).update(json).digest('hex');
  return Buffer.from(json).toString('base64url') + '.' + sig;
}

function hmacVerify(token) {
  if (!token || !token.includes('.')) return null;
  const [b64, sig] = token.split('.');
  let json;
  try { json = Buffer.from(b64, 'base64url').toString(); }
  catch { return null; }
  const expected = createHmac('sha256', getSecret()).update(json).digest('hex');
  // timing-safe comparison
  if (sig.length !== expected.length) return null;
  const sigBuf = Buffer.from(sig, 'utf8');
  const expBuf = Buffer.from(expected, 'utf8');
  if (!timingSafeEqual(sigBuf, expBuf)) return null;
  try {
    const payload = JSON.parse(json);
    if (payload.exp && Date.now() > payload.exp) return null; // expired
    return payload;
  } catch { return null; }
}

// Validate username + password against PSPT_CREDS
export function authenticate(username, password) {
  const creds = getCreds();
  const stored = creds[username?.toLowerCase()];
  if (!stored) return null;
  // Phase 1: plaintext comparison (Phase 2: switch to bcrypt/scrypt)
  if (stored !== password) return null;
  return username.toLowerCase();
}

// Create a signed session cookie value
export function createSession(username) {
  const payload = { user: username, exp: Date.now() + MAX_AGE * 1000 };
  return hmacSign(payload);
}

// Verify the session cookie, return { user } or null
export function verifySession(cookieHeader) {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  if (!match) return null;
  return hmacVerify(match[1]);
}

// Build Set-Cookie header for login
export function sessionCookie(token) {
  return `${COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${MAX_AGE}`;
}

// Build Set-Cookie header for logout (expire immediately)
export function clearCookie() {
  return `${COOKIE_NAME}=deleted; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`;
}

export { COOKIE_NAME };
