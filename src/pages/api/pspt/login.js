// POST /api/pspt/login — authenticate and set session cookie
import { authenticate, createSession, sessionCookie } from '../../../lib/pspt.js';
import { safeRedirectPath } from '../../../lib/safeRedirectPath.js';

export const prerender = false;

export async function POST({ request }) {
  try {
    const form = await request.formData();
    const username = form.get('username')?.toString().trim();
    const password = form.get('password')?.toString();
    const next = safeRedirectPath(form.get('next')?.toString(), '/admin/fleet', new URL(request.url).origin);

    if (!username || !password) {
      return new Response(null, { status: 302, headers: { Location: `/pspt?error=missing&next=${encodeURIComponent(next)}` } });
    }

    const user = authenticate(username, password);
    if (!user) {
      return new Response(null, { status: 302, headers: { Location: `/pspt?error=invalid&next=${encodeURIComponent(next)}` } });
    }

    const token = createSession(user);
    return new Response(null, {
      status: 302,
      headers: {
        Location: next,
        'Set-Cookie': sessionCookie(token),
      },
    });
  } catch (e) {
    console.error('PSPT login error:', e.message);
    return new Response(null, { status: 302, headers: { Location: '/pspt?error=config' } });
  }
}
