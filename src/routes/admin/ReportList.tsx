import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { ReportRecord } from '@/lib/types';
import { DATA_STATUS_LABEL } from '@/lib/types';
import { createReport, deleteReport, listReports, updateReport } from '@/lib/api';
import { DEMO_REPORT } from '@/lib/demoData';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';

const STATUS_TONE: Record<ReportRecord['status'], 'positive' | 'neutral' | 'warning'> = {
  published: 'positive',
  draft: 'neutral',
  archived: 'warning',
};

const STATUS_LABEL: Record<ReportRecord['status'], string> = {
  published: 'Published',
  draft: 'Draft',
  archived: 'Archived',
};

export function ReportList() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<ReportRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const load = () => {
    listReports()
      .then(setReports)
      .catch(() => setError('Could not load reports.'));
  };

  useEffect(load, []);

  const handleDuplicate = async (report: ReportRecord) => {
    setBusyId(report.id);
    try {
      const { id, createdAt, updatedAt, ...rest } = report;
      const copy = await createReport({
        ...rest,
        clientName: `${report.clientName} (Copy)`,
        slug: `${report.slug}-copy-${Date.now().toString(36)}`,
        status: 'draft',
      });
      navigate(`/admin/reports/${copy.id}`);
    } catch {
      setError('Could not duplicate report.');
    } finally {
      setBusyId(null);
    }
  };

  const handleArchive = async (report: ReportRecord) => {
    setBusyId(report.id);
    try {
      const next = report.status === 'archived' ? 'draft' : 'archived';
      await updateReport(report.id, { status: next });
      load();
    } catch {
      setError('Could not update report status.');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (report: ReportRecord) => {
    if (!confirm(`Permanently delete "${report.clientName}"? This cannot be undone.`)) return;
    setBusyId(report.id);
    try {
      await deleteReport(report.id);
      load();
    } catch {
      setError('Could not delete report.');
    } finally {
      setBusyId(null);
    }
  };

  const handleCopyLink = (slug: string, id: string) => {
    const url = `${window.location.origin}/report/${slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    });
  };

  const handleCreateDemo = async () => {
    setError(null);
    try {
      const { id, createdAt, updatedAt, ...rest } = DEMO_REPORT;
      const created = await createReport(rest);
      navigate(`/admin/reports/${created.id}`);
    } catch {
      setError('Could not create the demo report.');
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-[20px] font-semibold text-ink">Reports</h1>
          <p className="mt-0.5 text-[13px] text-ink-muted">Create, edit, and publish client performance reports.</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/admin/reports/new')}>
          + New Report
        </Button>
      </div>

      {error && <p className="mb-4 text-[13px] text-negative">{error}</p>}

      {!reports ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[0, 1].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl border border-line bg-surface-sunken/60" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <p className="text-[13.5px] text-ink-muted">No reports yet. Create your first report to get started.</p>
            <Button variant="secondary" size="sm" onClick={handleCreateDemo}>
              Load Sample Demo Report
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {reports.map((report) => (
            <Card key={report.id} className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[11px] font-medium text-ink-muted">{report.agencyName || 'Untitled agency'}</div>
                  <Link to={`/admin/reports/${report.id}`} className="font-display text-[15px] font-semibold text-ink hover:underline">
                    {report.clientName || 'Untitled report'}
                  </Link>
                  <div className="mt-0.5 text-[12.5px] text-ink-muted">{report.month} {report.year}</div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <Badge tone={STATUS_TONE[report.status]}>{STATUS_LABEL[report.status]}</Badge>
                  <span className="text-[10.5px] text-ink-muted">{DATA_STATUS_LABEL[report.dataStatus]}</span>
                </div>
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-1.5 border-t border-line-soft pt-3">
                <Button size="sm" variant="secondary" onClick={() => navigate(`/admin/reports/${report.id}`)}>
                  Edit
                </Button>
                <Button size="sm" variant="ghost" disabled={busyId === report.id} onClick={() => handleDuplicate(report)}>
                  Duplicate
                </Button>
                <Button size="sm" variant="ghost" disabled={busyId === report.id} onClick={() => handleArchive(report)}>
                  {report.status === 'archived' ? 'Unarchive' : 'Archive'}
                </Button>
                {report.status === 'published' && (
                  <Button size="sm" variant="ghost" onClick={() => handleCopyLink(report.slug, report.id)}>
                    {copiedId === report.id ? 'Copied!' : 'Copy Link'}
                  </Button>
                )}
                <Button size="sm" variant="danger" disabled={busyId === report.id} onClick={() => handleDelete(report)} className="ml-auto">
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
