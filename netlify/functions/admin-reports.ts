import type { Context } from '@netlify/functions';
import { randomUUID } from 'node:crypto';
import { isAuthenticated, json } from '../lib/auth';
import { listAllReports, saveReport, slugify } from '../lib/store';
import type { ReportRecord } from '../../src/lib/types';

export default async (req: Request, _context: Context) => {
  if (!isAuthenticated(req)) return json({ error: 'Unauthorized' }, 401);

  if (req.method === 'GET') {
    const reports = await listAllReports();
    reports.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return json(reports, 200);
  }

  if (req.method === 'POST') {
    let body: Partial<ReportRecord>;
    try {
      body = await req.json();
    } catch {
      return json({ error: 'Invalid request body.' }, 400);
    }
    const now = new Date().toISOString();
    const report: ReportRecord = {
      ...(body as ReportRecord),
      id: randomUUID(),
      slug: body.slug ? slugify(body.slug) : slugify(`${body.clientName}-${body.month}-${body.year}`),
      createdAt: now,
      updatedAt: now,
    };
    await saveReport(report);
    return json(report, 201);
  }

  return json({ error: 'Method Not Allowed' }, 405);
};

export const config = { path: '/api/admin/reports' };
