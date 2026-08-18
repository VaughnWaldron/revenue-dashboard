import type { Context } from '@netlify/functions';
import { isAuthenticated, json } from '../lib/auth';
import { deleteReportById, getReportById, saveReport } from '../lib/store';
import type { ReportRecord } from '../../src/lib/types';

export default async (req: Request, context: Context) => {
  if (!isAuthenticated(req)) return json({ error: 'Unauthorized' }, 401);

  const id = context.params.id;
  if (!id) return json({ error: 'Missing id' }, 400);

  if (req.method === 'GET') {
    const report = await getReportById(id);
    if (!report) return json({ error: 'Not found' }, 404);
    return json(report, 200);
  }

  if (req.method === 'PUT') {
    const existing = await getReportById(id);
    if (!existing) return json({ error: 'Not found' }, 404);
    let body: Partial<ReportRecord>;
    try {
      body = await req.json();
    } catch {
      return json({ error: 'Invalid request body.' }, 400);
    }
    const updated: ReportRecord = {
      ...existing,
      ...body,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    };
    await saveReport(updated);
    return json(updated, 200);
  }

  if (req.method === 'DELETE') {
    await deleteReportById(id);
    return json({ ok: true }, 200);
  }

  return json({ error: 'Method Not Allowed' }, 405);
};

export const config = { path: '/api/admin/reports/:id' };
