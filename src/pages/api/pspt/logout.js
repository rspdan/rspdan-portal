// POST /api/pspt/logout — clear session cookie
import { clearCookie } from '../../../lib/pspt.js';

export const prerender = false;

export async function POST() {
  return new Response(null, {
    status: 302,
    headers: {
      Location: '/pspt',
      'Set-Cookie': clearCookie(),
    },
  });
}
