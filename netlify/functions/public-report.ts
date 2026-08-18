import type { Context } from '@netlify/functions';
import { json } from '../lib/auth';
import { getReportBySlug } from '../lib/store';

export default async (_req: Request, context: Context) => {
  const slug = context.params.slug;
  if (!slug) return json({ error: 'Not found' }, 404);

  const report = await getReportBySlug(slug);
  if (!report || report.status !== 'published') {
    return json({ error: 'Not found' }, 404);
  }

  // Never leak internal admin notes through the public route.
  const publicReport = { ...report };
  delete publicReport.internalNotes;
  return json(publicReport, 200);
};

export const config = { path: '/api/report/:slug' };
