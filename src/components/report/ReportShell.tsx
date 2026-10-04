import { useMemo, useState } from 'react';
import type { ReportRecord } from '@/lib/types';
import { compareBenchmarks, computeMetrics } from '@/lib/calculations';
import { generateHistoricalPeriod, generateQuarterPeriod, listPeriodOptions } from '@/lib/historicalGenerate';
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
  const [granularity, setGranularity] = useState<'month' | 'quarter'>('month');
  const [offset, setOffset] = useState(0);
  const [compareEnabled, setCompareEnabled] = useState(false);

  const periodOptions = useMemo(() => listPeriodOptions(report), [report]);
  const period = useMemo(
    () => (granularity === 'quarter' ? generateQuarterPeriod(report) : generateHistoricalPeriod(report, offset)),
    [report, offset, granularity],
  );
  const previousPeriod = useMemo(
    () => (granularity === 'month' && compareEnabled ? generateHistoricalPeriod(report, offset + 1) : null),
    [report, offset, compareEnabled, granularity],
  );

  // Manual overrides were set against the report's real, current-month
  // numbers — they don't apply to a fabricated historical month or quarter.
  const overrides = granularity === 'month' && offset === 0 ? report.overrides : {};
  const metrics = useMemo(() => computeMetrics(period.inputs, overrides), [period.inputs, overrides]);
  const previousMetrics = useMemo(
    () => (previousPeriod ? computeMetrics(previousPeriod.inputs, {}) : null),
    [previousPeriod],
  );
  const benchmarkComparisons = useMemo(
    () => compareBenchmarks(metrics, period.inputs, report.benchmarks),
    [metrics, period.inputs, report.benchmarks],
  );

  // An in-progress month (e.g. day 4 of 31) should compare against the prior
  // month's pace at the same point, not its full-month total.
  const inProgress = period.inputs.currentDay < period.inputs.daysInMonth;
  const previousTotalCash =
    previousMetrics && previousPeriod
      ? inProgress
        ? previousMetrics.totalCash * (period.inputs.currentDay / Math.max(1, previousPeriod.inputs.daysInMonth))
        : previousMetrics.totalCash
      : undefined;

  const periodLabel = granularity === 'quarter' ? 'Last Quarter' : `${period.month} ${period.year}`;
  const headerReport = { ...report, month: period.month, year: period.year };
  const isCurrentMonth = granularity === 'month' && offset === 0;

  return (
    <div className="print-container mx-auto flex w-full max-w-[1180px] flex-col gap-6 px-4 py-8 sm:px-8 sm:py-10">
      <ReportHeader report={headerReport} showLive={isCurrentMonth} periodLabel={periodLabel} />

      <div className="no-print flex flex-wrap items-start justify-between gap-3">
        <PillFilterBar
          options={periodOptions}
          offset={offset}
          onOffsetChange={setOffset}
          compareEnabled={compareEnabled}
          onCompareChange={setCompareEnabled}
          granularity={granularity}
          onGranularityChange={setGranularity}
        />
        <ThemeToggle />
      </div>

      <ExecutiveSummary
        inputs={period.inputs}
        metrics={metrics}
        animate={animate}
        previousTotalCash={previousTotalCash}
        periodNoun={granularity === 'quarter' ? 'quarterly' : 'monthly'}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <MonthPacing
          inputs={period.inputs}
          metrics={metrics}
          animate={animate}
          periodNoun={granularity === 'quarter' ? 'quarterly' : 'monthly'}
        />
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
        <span>{periodLabel}</span>
      </footer>
    </div>
  );
}
