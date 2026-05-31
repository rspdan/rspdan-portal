// POST /api/pspt/login — authenticate and set session cookie
import { authenticate, createSession, sessionCookie } from '../../../lib/pspt.js';

export async function POST({ request }) {
  try {
    const form = await request.formData();
    const username = form.get('username')?.toString().trim();
    const password = form.get('password')?.toString();

    if (!username || !password) {
      return new Response(null, { status: 302, headers: { Location: '/pspt?error=missing' } });
    }

    const user = authenticate(username, password);
    if (!user) {
      return new Response(null, { status: 302, headers: { Location: '/pspt?error=invalid' } });
    }

    const token = createSession(user);
    return new Response(null, {
      status: 302,
      headers: {
        Location: '/admin/fleet',
        'Set-Cookie': sessionCookie(token),
      },
    });
  } catch (e) {
    console.error('PSPT login error:', e.message);
    return new Response(null, { status: 302, headers: { Location: '/pspt?error=config' } });
  }
}
