import type { ReportInputs } from '@/lib/types';
import type { DerivedMetrics } from '@/lib/calculations';
import { Card, SectionHeading } from '@/components/ui/Card';
import { MetricTile } from '@/components/ui/MetricTile';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';
import { formatPercent } from '@/lib/format';

const STATUS_COPY: Record<DerivedMetrics['paceStatus'], { label: string; tone: 'positive' | 'default' | 'warning' }> = {
  ahead: { label: 'Ahead of Pace', tone: 'positive' },
  on_track: { label: 'On Track', tone: 'default' },
  behind: { label: 'Behind Pace', tone: 'warning' },
};

export function MonthPacing({ inputs, metrics, animate }: { inputs: ReportInputs; metrics: DerivedMetrics; animate: boolean }) {
  const status = STATUS_COPY[metrics.paceStatus];
  const dayFraction = inputs.daysInMonth > 0 ? inputs.currentDay / inputs.daysInMonth : 0;

  return (
    <Card className="print-avoid-break">
      <SectionHeading
        title="Month Pacing"
        subtitle={`Day ${inputs.currentDay} of ${inputs.daysInMonth}`}
        right={
          <Badge tone={status.tone === 'default' ? 'navy' : status.tone}>
            {status.label} &middot; {formatPercent(metrics.paceRatio)} of expected pace
          </Badge>
        }
      />

      <div className="mb-6">
        <div className="mb-1.5 flex items-center justify-between text-[12px] text-ink-muted">
          <span>Day 1</span>
          <span>Day {inputs.daysInMonth}</span>
        </div>
        <ProgressBar fraction={dayFraction} tone="navy" />
        <div className="mt-1.5 text-[12.5px] text-ink-muted">{metrics.daysRemaining} days remaining in the month</div>
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
        <MetricTile label="Days Remaining" value={metrics.daysRemaining} format="number" animate={animate} />
        <MetricTile label="Daily Run Rate" value={metrics.dailyRunRate} format="currency" animate={animate} caption="current pace" />
        <MetricTile
          label="Required Run Rate"
          value={metrics.requiredDailyRunRate}
          format="currency"
          animate={animate}
          caption="needed to close the gap"
          tone={metrics.requiredDailyRunRate > metrics.dailyRunRate ? 'warning' : 'positive'}
        />
        <MetricTile
          label="Projected Month-End"
          value={metrics.projectedMonthEnd}
          format="currency"
          animate={animate}
          tone={metrics.projectedMonthEnd >= inputs.monthlyGoal ? 'positive' : 'warning'}
        />
        <MetricTile label="Current Day" value={inputs.currentDay} format="number" animate={animate} />
        <MetricTile label="Days in Month" value={inputs.daysInMonth} format="number" animate={animate} />
      </div>
    </Card>
  );
}
