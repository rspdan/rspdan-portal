export function safeRedirectPath(value, fallback = '/admin/fleet', origin = 'https://rspdan.com') {
  if (typeof value !== 'string' || !value) return fallback;
  if (!value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return fallback;

  try {
    const resolved = new URL(value, origin);
    if (resolved.origin !== origin) return fallback;
    return `${resolved.pathname}${resolved.search}${resolved.hash}`;
  } catch {
    return fallback;
  }
}
