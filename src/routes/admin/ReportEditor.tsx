import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { EditMode, ReportRecord } from '@/lib/types';
import { computeMetrics, validateReport } from '@/lib/calculations';
import { createBlankReport } from '@/lib/demoData';
import { createReport, getReport, updateReport } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { ReportMetaForm } from '@/components/admin/ReportMetaForm';
import { SmartCalculatorForm } from '@/components/admin/SmartCalculatorForm';
import { ManualOverridePanel } from '@/components/admin/ManualOverridePanel';
import { RepsEditor } from '@/components/admin/RepsEditor';
import { DailyDataEditor } from '@/components/admin/DailyDataEditor';
import { BenchmarksEditor } from '@/components/admin/BenchmarksEditor';
import { ValidationPanel } from '@/components/admin/ValidationPanel';
import { ReportShell } from '@/components/report/ReportShell';

export function ReportEditor({ mode }: { mode: 'create' | 'edit' }) {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [report, setReport] = useState<ReportRecord | null>(mode === 'create' ? createBlankReport() : null);
  const [loading, setLoading] = useState(mode === 'edit');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<'draft' | 'publish' | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<EditMode>('smart');
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && params.id) {
      setLoading(true);
      getReport(params.id)
        .then((data) => {
          setReport(data);
          setActiveTab(data.mode);
        })
        .catch(() => setError('Could not load this report.'))
        .finally(() => setLoading(false));
    }
  }, [mode, params.id]);

  const naturalMetrics = useMemo(() => (report ? computeMetrics(report.inputs, {}) : null), [report?.inputs]);
  const metrics = useMemo(() => (report ? computeMetrics(report.inputs, report.overrides) : null), [report?.inputs, report?.overrides]);
  const warnings = useMemo(
    () => (report ? validateReport(report.inputs, report.reps, report.dailyData) : []),
    [report?.inputs, report?.reps, report?.dailyData],
  );

  if (loading) {
    return <div className="h-64 animate-pulse rounded-xl border border-line bg-surface-sunken/60" />;
  }
  if (error || !report || !metrics || !naturalMetrics) {
    return <p className="text-[13px] text-negative">{error || 'Report not found.'}</p>;
  }

  const patch = (p: Partial<ReportRecord>) => setReport({ ...report, ...p });

  const handleSave = async (nextStatus: 'draft' | 'published') => {
    setSaving(nextStatus === 'published' ? 'publish' : 'draft');
    setSaveMessage(null);
    try {
      const payload: ReportRecord = { ...report, mode: activeTab, status: nextStatus };
      if (mode === 'create' && !report.id) {
        const created = await createReport(payload);
        setReport(created);
        setSaveMessage(nextStatus === 'published' ? 'Report published.' : 'Draft saved.');
        navigate(`/admin/reports/${created.id}`, { replace: true });
      } else {
        const saved = await updateReport(report.id, payload);
        setReport(saved);
        setSaveMessage(nextStatus === 'published' ? 'Report published.' : 'Draft saved.');
      }
    } catch {
      setSaveMessage('Save failed. Please try again.');
    } finally {
      setSaving(null);
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const reportUrl = report.slug ? `${window.location.origin}/report/${report.slug}` : null;

  return (
    <div className="flex flex-col gap-6 pb-20">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <button onClick={() => navigate('/admin')} className="text-[12.5px] text-ink-muted hover:text-ink">
            &larr; All Reports
          </button>
          <h1 className="mt-1 font-display text-[20px] font-semibold text-ink">
            {report.clientName || 'New Report'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {saveMessage && <span className="text-[12.5px] text-ink-muted">{saveMessage}</span>}
          <Button variant="secondary" onClick={() => setShowPreview((v) => !v)}>
            {showPreview ? 'Hide Preview' : 'Preview'}
          </Button>
          {reportUrl && report.status === 'published' && (
            <Button variant="ghost" onClick={() => window.open(reportUrl, '_blank')}>
              Open Live Link
            </Button>
          )}
          <Button variant="secondary" disabled={saving !== null} onClick={() => handleSave('draft')}>
            {saving === 'draft' ? 'Saving…' : 'Save Draft'}
          </Button>
          <Button variant="primary" disabled={saving !== null} onClick={() => handleSave('published')}>
            {saving === 'publish' ? 'Publishing…' : 'Publish'}
          </Button>
        </div>
      </div>

      <ValidationPanel warnings={warnings} />

      <ReportMetaForm report={report} onChange={patch} />

      <div>
        <div className="mb-4">
          <Tabs
            tabs={[
              { id: 'smart', label: '⚡ Smart Calculator' },
              { id: 'manual', label: '✎ Manual Override' },
            ]}
            active={activeTab}
            onChange={(id) => setActiveTab(id as EditMode)}
          />
        </div>
        {activeTab === 'smart' ? (
          <SmartCalculatorForm inputs={report.inputs} metrics={metrics} onChange={(p) => patch({ inputs: { ...report.inputs, ...p } })} />
        ) : (
          <ManualOverridePanel
            naturalMetrics={naturalMetrics}
            overrides={report.overrides}
            onChange={(overrides) => patch({ overrides })}
          />
        )}
      </div>

      <RepsEditor reps={report.reps} onChange={(reps) => patch({ reps })} />
      <DailyDataEditor dailyData={report.dailyData} onChange={(dailyData) => patch({ dailyData })} />
      <BenchmarksEditor benchmarks={report.benchmarks} onChange={(p) => patch({ benchmarks: { ...report.benchmarks, ...p } })} />

      {showPreview && (
        <div className="rounded-xl border border-line bg-surface-sunken p-4">
          <div className="mb-3 text-[12px] font-medium text-ink-muted">
            Read-only Preview — exactly what viewers of the report link will see
          </div>
          <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-raised">
            <ReportShell report={report} animate={false} />
          </div>
        </div>
      )}
    </div>
  );
}
