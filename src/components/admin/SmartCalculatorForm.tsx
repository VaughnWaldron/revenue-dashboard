import { useState } from 'react';
import type { ReportInputs } from '@/lib/types';
import type { DerivedMetrics } from '@/lib/calculations';
import { suggestedRepCount } from '@/lib/generate';
import { Card, SectionHeading } from '@/components/ui/Card';
import { NumberField } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatPercent } from '@/lib/format';

export function SmartCalculatorForm({
  inputs,
  metrics,
  onChange,
  onGenerate,
}: {
  inputs: ReportInputs;
  metrics: DerivedMetrics;
  onChange: (patch: Partial<ReportInputs>) => void;
  onGenerate: (repCount: number) => void;
}) {
  const set = (key: keyof ReportInputs) => (value: number) => onChange({ [key]: value });
  const [repCount, setRepCount] = useState(() => suggestedRepCount(inputs));

  return (
    <Card className="print-avoid-break">
      <SectionHeading title="Smart Calculator" subtitle="Enter the primary numbers — every other metric derives automatically." />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <NumberField label="New Cash" prefix="$" value={inputs.newCash} onChange={set('newCash')} />
        <NumberField label="Installment Cash" prefix="$" value={inputs.installmentCash} onChange={set('installmentCash')} />
        <NumberField label="Monthly Goal" prefix="$" value={inputs.monthlyGoal} onChange={set('monthlyGoal')} />
        <NumberField label="Avg New Cash / Close" prefix="$" value={inputs.avgNewCashPerClose} onChange={set('avgNewCashPerClose')} />
        <NumberField label="Total Booked Calls" value={inputs.totalBookedCalls} onChange={set('totalBookedCalls')} />
        <NumberField label="Conducted Calls" value={inputs.conductedCalls} onChange={set('conductedCalls')} />
        <NumberField label="Show-ups" value={inputs.showUps} onChange={set('showUps')} />
        <NumberField label="Total Closes" value={inputs.totalCloses} onChange={set('totalCloses')} />
        <NumberField label="Current Day" value={inputs.currentDay} onChange={set('currentDay')} min={1} />
        <NumberField label="Days in Month" value={inputs.daysInMonth} onChange={set('daysInMonth')} min={1} />
      </div>

      <div className="mb-6 rounded-lg border border-line-soft bg-surface p-4">
        <div className="mb-3 text-[12px] font-medium text-ink-muted">Derived automatically</div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
          <DerivedStat label="Total Cash" value={formatCurrency(metrics.totalCash)} />
          <DerivedStat label="% of Goal" value={formatPercent(metrics.percentOfGoal)} />
          <DerivedStat label="Gap" value={formatCurrency(metrics.gap)} />
          <DerivedStat label="Closes Required" value={String(metrics.closesRequired)} />
          <DerivedStat label="Show Rate" value={formatPercent(metrics.showRate)} />
          <DerivedStat label="Close Rate" value={formatPercent(metrics.closeRate)} />
          <DerivedStat label="Daily Run Rate" value={formatCurrency(metrics.dailyRunRate)} />
          <DerivedStat label="Projected Month-End" value={formatCurrency(metrics.projectedMonthEnd)} />
        </div>
      </div>

      <div className="rounded-lg border border-line-soft bg-surface p-4">
        <div className="mb-3 text-[12px] font-medium text-ink-muted">
          Generate reps &amp; daily data from the numbers above
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <NumberField label="Number of Reps" value={repCount} onChange={setRepCount} min={1} className="w-32" />
          <Button variant="primary" onClick={() => onGenerate(repCount)}>
            ⚡ Generate Reps &amp; Daily Data
          </Button>
        </div>
        <p className="mt-2 text-[12px] text-ink-muted">
          Splits new cash, installments, calls, shows, and closes across {repCount} rep{repCount === 1 ? '' : 's'} on a
          descending performance curve, and spreads the same totals across days 1–{inputs.currentDay}. Rename reps
          afterward as needed. This replaces any existing rep and daily-data rows.
        </p>
      </div>
    </Card>
  );
}

function DerivedStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] text-ink-muted">{label}</div>
      <div className="text-[14px] font-semibold tabular-nums text-ink">{value}</div>
    </div>
  );
}
