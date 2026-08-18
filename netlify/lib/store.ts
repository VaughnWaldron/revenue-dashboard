import { getStore } from '@netlify/blobs';
import type { ReportRecord } from '../../src/lib/types';

const REPORTS_STORE = 'reports';

function reportsStore() {
  return getStore(REPORTS_STORE);
}

export async function listAllReports(): Promise<ReportRecord[]> {
  const s = reportsStore();
  const { blobs } = await s.list();
  const reports = await Promise.all(blobs.map((b) => s.get(b.key, { type: 'json' }) as Promise<ReportRecord | null>));
  return reports.filter((r): r is ReportRecord => Boolean(r));
}

export async function getReportById(id: string): Promise<ReportRecord | null> {
  return (await reportsStore().get(id, { type: 'json' })) as ReportRecord | null;
}

export async function getReportBySlug(slug: string): Promise<ReportRecord | null> {
  const all = await listAllReports();
  return all.find((r) => r.slug === slug) ?? null;
}

export async function saveReport(report: ReportRecord): Promise<void> {
  await reportsStore().setJSON(report.id, report);
}

export async function deleteReportById(id: string): Promise<void> {
  await reportsStore().delete(id);
}

export function slugify(input: string): string {
  return input.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'report';
}
