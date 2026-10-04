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

export function MonthPacing({
  inputs,
  metrics,
  animate,
  periodNoun = 'monthly',
}: {
  inputs: ReportInputs;
  metrics: DerivedMetrics;
  animate: boolean;
  periodNoun?: 'monthly' | 'quarterly';
}) {
  const word = periodNoun === 'quarterly' ? 'quarter' : 'month';
  const Word = word === 'quarter' ? 'Quarter' : 'Month';
  const status = STATUS_COPY[metrics.paceStatus];
  const dayFraction = inputs.daysInMonth > 0 ? inputs.currentDay / inputs.daysInMonth : 0;
  const complete = inputs.currentDay >= inputs.daysInMonth;
  const overUnder = metrics.totalCash - inputs.monthlyGoal;

  return (
    <Card className="print-avoid-break">
      <SectionHeading
        title={`${Word} Pacing`}
        subtitle={complete ? `${Word} complete · ${inputs.daysInMonth} days` : `Day ${inputs.currentDay} of ${inputs.daysInMonth}`}
        right={
          <Badge tone={status.tone === 'default' ? 'navy' : status.tone}>
            {status.label} &middot; {formatPercent(metrics.paceRatio)} of {complete ? 'goal' : 'expected pace'}
          </Badge>
        }
      />

      <div className="mb-6">
        <div className="mb-1.5 flex items-center justify-between text-[12px] text-ink-muted">
          <span>Day 1</span>
          <span>Day {inputs.daysInMonth}</span>
        </div>
        <ProgressBar fraction={dayFraction} tone="navy" />
        <div className="mt-1.5 text-[12.5px] text-ink-muted">
          {complete ? `Full ${word} collected` : `${metrics.daysRemaining} days remaining in the ${word}`}
        </div>
      </div>

      {complete ? (
        <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
          <MetricTile label={`Days in ${Word}`} value={inputs.daysInMonth} format="number" animate={animate} />
          <MetricTile label="Daily Average" value={metrics.dailyRunRate} format="currency" animate={animate} caption={`across the ${word}`} />
          <MetricTile
            label="Goal per Day"
            value={inputs.daysInMonth > 0 ? inputs.monthlyGoal / inputs.daysInMonth : 0}
            format="currency"
            animate={animate}
          />
          <MetricTile label={`Final ${Word} Total`} value={metrics.totalCash} format="currency" animate={animate} />
          <MetricTile
            label="Goal Attainment"
            value={metrics.percentOfGoal}
            format="percent"
            animate={animate}
            tone={metrics.percentOfGoal >= 1 ? 'positive' : 'warning'}
          />
          <MetricTile
            label={overUnder >= 0 ? 'Over Goal' : 'Under Goal'}
            value={Math.abs(overUnder)}
            format="currency"
            animate={animate}
            tone={overUnder >= 0 ? 'positive' : 'warning'}
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
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
            label={`Projected ${Word}-End`}
            value={metrics.projectedMonthEnd}
            format="currency"
            animate={animate}
            tone={metrics.projectedMonthEnd >= inputs.monthlyGoal ? 'positive' : 'warning'}
          />
          <MetricTile label="Current Day" value={inputs.currentDay} format="number" animate={animate} />
          <MetricTile label={`Days in ${Word}`} value={inputs.daysInMonth} format="number" animate={animate} />
        </div>
      )}
    </Card>
  );
}
