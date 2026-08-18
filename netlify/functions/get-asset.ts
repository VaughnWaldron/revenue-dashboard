import type { Context } from '@netlify/functions';
import { getStore } from '@netlify/blobs';

export default async (_req: Request, context: Context) => {
  const id = context.params.id;
  if (!id) return new Response('Not found', { status: 404 });

  const result = await getStore('logo-assets').getWithMetadata(id, { type: 'arrayBuffer' });
  if (!result) return new Response('Not found', { status: 404 });

  const contentType = (result.metadata?.contentType as string) || 'application/octet-stream';
  return new Response(result.data as ArrayBuffer, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};

export const config = { path: '/api/assets/:id' };
