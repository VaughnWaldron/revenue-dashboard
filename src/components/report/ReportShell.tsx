import { useMemo, useState } from 'react';
import type { ReportRecord } from '@/lib/types';
import { compareBenchmarks, computeMetrics } from '@/lib/calculations';
import { generateHistoricalPeriod, listPeriodOptions } from '@/lib/historicalGenerate';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { ReportHeader } from './ReportHeader';
import { PillFilterBar } from './PillFilterBar';
import { ExecutiveSummary } from './ExecutiveSummary';
import { MonthPacing } from './MonthPacing';
import { SalesPerformance } from './SalesPerformance';
import { RepLeaderboard } from './RepLeaderboard';
import { PerformanceCharts } from './PerformanceCharts';
import { BenchmarksSection } from './BenchmarksSection';

export function ReportShell({ report, animate = true }: { report: ReportRecord; animate?: boolean }) {
  const [offset, setOffset] = useState(0);
  const [compareEnabled, setCompareEnabled] = useState(false);

  const periodOptions = useMemo(() => listPeriodOptions(report), [report]);
  const period = useMemo(() => generateHistoricalPeriod(report, offset), [report, offset]);
  const previousPeriod = useMemo(
    () => (compareEnabled ? generateHistoricalPeriod(report, offset + 1) : null),
    [report, offset, compareEnabled],
  );

  // Manual overrides were set against the report's real, current-month
  // numbers — they don't apply to a fabricated historical month.
  const overrides = offset === 0 ? report.overrides : {};
  const metrics = useMemo(() => computeMetrics(period.inputs, overrides), [period.inputs, overrides]);
  const previousMetrics = useMemo(
    () => (previousPeriod ? computeMetrics(previousPeriod.inputs, {}) : null),
    [previousPeriod],
  );
  const benchmarkComparisons = useMemo(
    () => compareBenchmarks(metrics, period.inputs, report.benchmarks),
    [metrics, period.inputs, report.benchmarks],
  );

  const headerReport = { ...report, month: period.month, year: period.year };

  return (
    <div className="print-container mx-auto flex w-full max-w-[1180px] flex-col gap-6 px-4 py-8 sm:px-8 sm:py-10">
      <ReportHeader report={headerReport} showLive={offset === 0} />

      <div className="no-print flex flex-wrap items-center justify-between gap-2">
        <PillFilterBar
          options={periodOptions}
          offset={offset}
          onOffsetChange={setOffset}
          compareEnabled={compareEnabled}
          onCompareChange={setCompareEnabled}
        />
        <ThemeToggle />
      </div>

      <ExecutiveSummary
        inputs={period.inputs}
        metrics={metrics}
        animate={animate}
        previousTotalCash={previousMetrics?.totalCash}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <MonthPacing inputs={period.inputs} metrics={metrics} animate={animate} />
        <SalesPerformance inputs={period.inputs} metrics={metrics} animate={animate} />
      </div>

      <RepLeaderboard reps={period.reps} />

      <PerformanceCharts
        dailyData={period.dailyData}
        previousDailyData={previousPeriod?.dailyData}
        inputs={period.inputs}
        totalCash={metrics.totalCash}
      />

      <BenchmarksSection comparisons={benchmarkComparisons} />

      <footer className="print-avoid-break flex items-center justify-between border-t border-line pt-5 text-[12px] text-ink-muted">
        <span>{report.agencyName} &mdash; Confidential</span>
        <span>{period.month} {period.year}</span>
      </footer>
    </div>
  );
}
