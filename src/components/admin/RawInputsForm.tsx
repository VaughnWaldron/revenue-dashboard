import type { ReportInputs } from '@/lib/types';
import { Card, SectionHeading } from '@/components/ui/Card';
import { NumberField } from '@/components/ui/Field';

export function RawInputsForm({
  inputs,
  onChange,
}: {
  inputs: ReportInputs;
  onChange: (patch: Partial<ReportInputs>) => void;
}) {
  const set = (key: keyof ReportInputs) => (value: number) => onChange({ [key]: value });

  return (
    <Card className="print-avoid-break">
      <SectionHeading title="Edit Every Number Directly" subtitle="Bypasses the Smart Calculator — use this when the real figures don't fit the formula." />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
    </Card>
  );
}
