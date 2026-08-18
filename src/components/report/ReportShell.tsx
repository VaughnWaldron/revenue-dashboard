import { useMemo } from 'react';
import type { ReportRecord } from '@/lib/types';
import { compareBenchmarks, computeMetrics } from '@/lib/calculations';
import { ReportHeader } from './ReportHeader';
import { ExecutiveSummary } from './ExecutiveSummary';
import { MonthPacing } from './MonthPacing';
import { SalesPerformance } from './SalesPerformance';
import { RepLeaderboard } from './RepLeaderboard';
import { PerformanceCharts } from './PerformanceCharts';
import { BenchmarksSection } from './BenchmarksSection';

export function ReportShell({ report, animate = true }: { report: ReportRecord; animate?: boolean }) {
  const metrics = useMemo(() => computeMetrics(report.inputs, report.overrides), [report.inputs, report.overrides]);
  const benchmarkComparisons = useMemo(
    () => compareBenchmarks(metrics, report.inputs, report.benchmarks),
    [metrics, report.inputs, report.benchmarks],
  );

  return (
    <div className="print-container mx-auto flex w-full max-w-[1180px] flex-col gap-6 px-4 py-8 sm:px-8 sm:py-10">
      <ReportHeader report={report} />

      <ExecutiveSummary inputs={report.inputs} metrics={metrics} animate={animate} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <MonthPacing inputs={report.inputs} metrics={metrics} animate={animate} />
        <SalesPerformance inputs={report.inputs} metrics={metrics} animate={animate} />
      </div>

      <RepLeaderboard reps={report.reps} />

      <PerformanceCharts dailyData={report.dailyData} inputs={report.inputs} totalCash={metrics.totalCash} />

      <BenchmarksSection comparisons={benchmarkComparisons} />

      <footer className="print-avoid-break flex items-center justify-between border-t border-line pt-5 text-[12px] text-ink-muted">
        <span>{report.agencyName} &mdash; Confidential</span>
        <span>{report.month} {report.year}</span>
      </footer>
    </div>
  );
}
