import { isAuthenticated, json } from '../lib/auth';

export default async (req: Request) => {
  return json({ authenticated: isAuthenticated(req) }, 200);
};

export const config = { path: '/api/auth/check' };
