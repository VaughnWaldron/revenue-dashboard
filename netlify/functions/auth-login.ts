import { buildSessionCookie, createSessionToken, json, verifyPassword } from '../lib/auth';

export default async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'Method Not Allowed' }, 405);

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return json({ error: 'Admin password is not configured on the server.' }, 500);
  }

  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid request body.' }, 400);
  }

  if (!body.password || !verifyPassword(body.password, adminPassword)) {
    return json({ error: 'Incorrect password.' }, 401);
  }

  const token = createSessionToken();
  return json({ ok: true }, 200, { 'Set-Cookie': buildSessionCookie(req, token) });
};

export const config = { path: '/api/auth/login' };
