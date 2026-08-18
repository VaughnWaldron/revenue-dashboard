import type { ReportInputs } from '@/lib/types';
import type { DerivedMetrics } from '@/lib/calculations';
import { Card, SectionHeading } from '@/components/ui/Card';
import { MetricTile } from '@/components/ui/MetricTile';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { CountUp } from '@/components/ui/CountUp';
import { formatCurrency, formatPercent } from '@/lib/format';

export function ExecutiveSummary({
  inputs,
  metrics,
  animate,
}: {
  inputs: ReportInputs;
  metrics: DerivedMetrics;
  animate: boolean;
}) {
  const goalTone = metrics.percentOfGoal >= 1 ? 'positive' : metrics.percentOfGoal >= 0.75 ? 'default' : 'warning';

  return (
    <Card className="print-avoid-break">
      <SectionHeading title="Executive Revenue Summary" subtitle="Cash collected against the monthly target" />

      <div className="mb-6 flex flex-col gap-3 rounded-lg border border-line-soft bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-[12.5px] text-ink-muted">Total cash collected</div>
          <div className="mt-1 font-display text-[36px] font-bold leading-none tracking-tight text-ink">
            <CountUp value={metrics.totalCash} format="currency" animate={animate} />
          </div>
          <div className="mt-1.5 text-[13px] text-ink-muted">of {formatCurrency(inputs.monthlyGoal)} monthly goal</div>
        </div>
        <div className="w-full sm:w-64">
          <div className="mb-1.5 flex items-center justify-between text-[12.5px] font-medium">
            <span className="text-ink-soft">{formatPercent(metrics.percentOfGoal)} to goal</span>
            <span className="text-ink-muted">{formatCurrency(metrics.gap)} gap</span>
          </div>
          <ProgressBar fraction={metrics.percentOfGoal} tone={goalTone === 'warning' ? 'warning' : 'navy'} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
        <MetricTile label="New Cash" value={inputs.newCash} format="currency" animate={animate} />
        <MetricTile label="Installment Cash" value={inputs.installmentCash} format="currency" animate={animate} />
        <MetricTile label="% of Goal" value={metrics.percentOfGoal} format="percent" tone={goalTone} animate={animate} />
        <MetricTile label="Remaining Gap" value={metrics.gap} format="currency" tone={metrics.gap <= 0 ? 'positive' : goalTone} animate={animate} />
        <MetricTile label="Avg Deal Size" value={inputs.avgNewCashPerClose} format="currency" animate={animate} />
        <MetricTile label="Total Closes" value={inputs.totalCloses} format="number" animate={animate} />
        <MetricTile label="Closes to Hit Goal" value={metrics.closesRequired} format="number" animate={animate} />
      </div>
    </Card>
  );
}
