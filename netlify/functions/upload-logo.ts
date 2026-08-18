import type { Context } from '@netlify/functions';
import { getStore } from '@netlify/blobs';
import { randomUUID } from 'node:crypto';
import { isAuthenticated, json } from '../lib/auth';

const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED = /^image\/(png|jpeg|jpg|svg\+xml)$/;

export default async (req: Request, _context: Context) => {
  if (!isAuthenticated(req)) return json({ error: 'Unauthorized' }, 401);
  if (req.method !== 'POST') return json({ error: 'Method Not Allowed' }, 405);

  let body: { dataUrl?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid request body.' }, 400);
  }

  const match = body.dataUrl?.match(/^data:([^;]+);base64,(.*)$/);
  if (!match) return json({ error: 'Invalid image data.' }, 400);

  const [, contentType, base64] = match;
  if (!ALLOWED.test(contentType)) return json({ error: 'Unsupported image type.' }, 400);

  const buffer = Buffer.from(base64, 'base64');
  if (buffer.byteLength > MAX_BYTES) return json({ error: 'Image too large (max 2MB).' }, 400);

  const id = randomUUID();
  await getStore('logo-assets').set(id, buffer, { metadata: { contentType } });

  return json({ url: `/api/assets/${id}` }, 200);
};

export const config = { path: '/api/admin/upload-logo' };
