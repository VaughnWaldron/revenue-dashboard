import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { ReportRecord } from '@/lib/types';
import { ApiError, fetchPublicReport } from '@/lib/api';
import { ReportShell } from '@/components/report/ReportShell';
import { ReportError, ReportLoading } from '@/components/report/ReportStates';

export function ReportView() {
  const { slug } = useParams<{ slug: string }>();
  const [report, setReport] = useState<ReportRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (!slug) return;
    setLoading(true);
    setError(null);
    fetchPublicReport(slug)
      .then((data) => {
        if (!cancelled) setReport(data);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof ApiError && err.status === 404 ? 'not_found' : 'error');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    if (report) {
      document.title = `${report.clientName} — ${report.month} ${report.year} Report`;
    }
  }, [report]);

  if (loading) return <ReportLoading />;
  if (error || !report) return <ReportError />;

  return <ReportShell report={report} animate />;
}
