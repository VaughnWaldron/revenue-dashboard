import { buildClearCookie, json } from '../lib/auth';

export default async (req: Request) => {
  return json({ ok: true }, 200, { 'Set-Cookie': buildClearCookie(req) });
};

export const config = { path: '/api/auth/logout' };
