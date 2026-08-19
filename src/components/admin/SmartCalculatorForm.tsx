import { useState } from 'react';
import type { DailyDataPoint, ReportInputs, ReportRecord, Rep, SmartCalcInputs } from '@/lib/types';
import { computeMetrics, safeDiv } from '@/lib/calculations';
import { callsPerRepPerDay, deriveFromSmartCalc, suggestReps } from '@/lib/smartCalculator';
import { generateDailyData, generateReps } from '@/lib/generate';
import { Card, SectionHeading } from '@/components/ui/Card';
import { NumberField } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatNumber } from '@/lib/format';

interface FormState {
  totalCashCollected: number;
  showRatePct: number;
  closeRatePct: number;
  avgDealSize: number;
  monthlyGoal: number;
  currentDay: number;
  daysInMonth: number;
  installmentPct: number;
  repCount: number;
}

function seedFromReport(report: ReportRecord): FormState {
  const stored = report.smartCalcInputs;
  if (stored) {
    return {
      totalCashCollected: stored.totalCashCollected,
      showRatePct: Math.round(stored.showRate * 1000) / 10,
      closeRatePct: Math.round(stored.closeRate * 1000) / 10,
      avgDealSize: report.inputs.avgNewCashPerClose,
      monthlyGoal: report.inputs.monthlyGoal,
      currentDay: report.inputs.currentDay,
      daysInMonth: report.inputs.daysInMonth,
      installmentPct: Math.round(stored.installmentPct * 1000) / 10,
      repCount: stored.repCount,
    };
  }

  // No stored Smart Calculator state (report created via Manual Edit, or
  // predates this feature) — reverse-derive reasonable starting values.
  const metrics = computeMetrics(report.inputs, {});
  const totalCashCollected = metrics.totalCash;
  return {
    totalCashCollected,
    showRatePct: Math.round(metrics.showRate * 1000) / 10,
    closeRatePct: Math.round(metrics.closeRate * 1000) / 10,
    avgDealSize: report.inputs.avgNewCashPerClose,
    monthlyGoal: report.inputs.monthlyGoal,
    currentDay: report.inputs.currentDay,
    daysInMonth: report.inputs.daysInMonth,
    installmentPct: Math.round(safeDiv(report.inputs.installmentCash, totalCashCollected) * 1000) / 10,
    repCount: report.reps.length || suggestReps(report.inputs.conductedCalls, report.inputs.currentDay),
  };
}

export function SmartCalculatorForm({
  report,
  onGenerate,
}: {
  report: ReportRecord;
  onGenerate: (payload: { inputs: ReportInputs; smartCalcInputs: SmartCalcInputs; reps: Rep[]; dailyData: DailyDataPoint[] }) => void;
}) {
  const [form, setForm] = useState<FormState>(() => seedFromReport(report));
  const set = <K extends keyof FormState>(key: K) => (value: number) => setForm((f) => ({ ...f, [key]: value }));

  const derived = deriveFromSmartCalc(
    form.totalCashCollected,
    form.showRatePct / 100,
    form.closeRatePct / 100,
    form.avgDealSize,
    form.installmentPct / 100,
  );
  const suggested = suggestReps(derived.conductedCalls, form.currentDay);
  const perRepPerDay = callsPerRepPerDay(derived.conductedCalls, form.currentDay, form.repCount);

  const handleGenerate = () => {
    const inputs: ReportInputs = {
      newCash: derived.newCash,
      installmentCash: derived.installmentCash,
      monthlyGoal: form.monthlyGoal,
      avgNewCashPerClose: form.avgDealSize,
      totalBookedCalls: derived.conductedCalls,
      conductedCalls: derived.conductedCalls,
      showUps: derived.showUps,
      totalCloses: derived.totalCloses,
      currentDay: form.currentDay,
      daysInMonth: form.daysInMonth,
    };
    const smartCalcInputs: SmartCalcInputs = {
      totalCashCollected: form.totalCashCollected,
      showRate: form.showRatePct / 100,
      closeRate: form.closeRatePct / 100,
      installmentPct: form.installmentPct / 100,
      repCount: form.repCount,
    };
    onGenerate({
      inputs,
      smartCalcInputs,
      reps: generateReps(inputs, form.repCount),
      dailyData: generateDailyData(inputs),
    });
  };

  return (
    <Card className="print-avoid-break">
      <SectionHeading
        title="Smart Calculator"
        subtitle="Enter your numbers — we'll build the whole report. Rep count auto-suggests from call volume (8–10 calls/rep/day)."
      />

      <div className="mb-5">
        <div className="mb-3 text-[12px] font-medium text-ink-muted">Performance numbers</div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <NumberField
            label="Total Cash Collected"
            prefix="$"
            value={form.totalCashCollected}
            onChange={set('totalCashCollected')}
            hint="New cash + installments combined"
          />
          <NumberField
            label="Show Rate"
            suffix="%"
            step={0.5}
            value={form.showRatePct}
            onChange={set('showRatePct')}
            hint="% of total calls that show up"
          />
          <NumberField
            label="Close Rate"
            suffix="%"
            step={0.5}
            value={form.closeRatePct}
            onChange={set('closeRatePct')}
            hint="% of shows that close"
          />
          <NumberField
            label="Avg Deal Size"
            prefix="$"
            value={form.avgDealSize}
            onChange={set('avgDealSize')}
            hint="Average new cash per close"
          />
        </div>
      </div>

      <div className="mb-6">
        <div className="mb-3 text-[12px] font-medium text-ink-muted">Goal & time</div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <NumberField label="Monthly Goal" prefix="$" value={form.monthlyGoal} onChange={set('monthlyGoal')} />
          <NumberField label="Day of Month" value={form.currentDay} onChange={set('currentDay')} min={1} hint="Current day" />
          <NumberField label="Days in Month" value={form.daysInMonth} onChange={set('daysInMonth')} min={1} />
          <NumberField
            label="Installment %"
            suffix="%"
            step={0.5}
            value={form.installmentPct}
            onChange={set('installmentPct')}
            hint="% of total cash that's installments"
          />
          <div>
            <NumberField label="Number of Reps" value={form.repCount} onChange={set('repCount')} min={1} />
            <button
              type="button"
              onClick={() => set('repCount')(suggested)}
              className="mt-1 inline-flex items-center gap-1 rounded-full bg-navy-tint px-2 py-0.5 text-[10.5px] font-semibold text-navy hover:opacity-80"
            >
              AUTO: {suggested}
            </button>
            <span className="ml-1.5 text-[11.5px] text-ink-muted">{perRepPerDay.toFixed(1)}/day</span>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-line-soft bg-surface p-4">
        <div className="mb-3 text-[12px] font-medium text-ink-muted">Will auto-calculate →</div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
          <DerivedStat label="Total Calls" value={formatNumber(derived.conductedCalls)} />
          <DerivedStat label="Show Ups" value={formatNumber(derived.showUps)} />
          <DerivedStat label="Closes" value={formatNumber(derived.totalCloses)} />
          <DerivedStat label="New Cash" value={formatCurrency(derived.newCash)} />
          <DerivedStat label="Installments" value={formatCurrency(derived.installmentCash)} />
          <DerivedStat label={`${form.repCount} Rep${form.repCount === 1 ? '' : 's'}`} value={`${perRepPerDay.toFixed(1)} calls/rep/day`} />
        </div>
        <Button variant="primary" onClick={handleGenerate} className="mt-4 w-full justify-center sm:w-auto">
          ⚡ Generate Report
        </Button>
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
