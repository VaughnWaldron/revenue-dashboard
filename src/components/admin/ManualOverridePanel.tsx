import type { DerivedFieldKey, Overrides } from '@/lib/types';
import type { DerivedMetrics } from '@/lib/calculations';
import { Card, SectionHeading } from '@/components/ui/Card';
import { formatCurrency, formatPercent } from '@/lib/format';

interface FieldMeta {
  key: DerivedFieldKey;
  label: string;
  format: 'currency' | 'percent' | 'number';
}

const FIELDS: FieldMeta[] = [
  { key: 'totalCash', label: 'Total Cash', format: 'currency' },
  { key: 'noShows', label: 'No-shows', format: 'number' },
  { key: 'showRate', label: 'Show Rate', format: 'percent' },
  { key: 'closeRate', label: 'Close Rate', format: 'percent' },
  { key: 'percentOfGoal', label: '% of Goal', format: 'percent' },
  { key: 'gap', label: 'Gap', format: 'currency' },
  { key: 'closesRequired', label: 'Closes Required', format: 'number' },
  { key: 'dailyRunRate', label: 'Daily Run Rate', format: 'currency' },
  { key: 'requiredDailyRunRate', label: 'Required Daily Run Rate', format: 'currency' },
  { key: 'projectedMonthEnd', label: 'Projected Month-End', format: 'currency' },
  { key: 'cashPerShow', label: 'Cash per Show', format: 'currency' },
  { key: 'callsPerClose', label: 'Calls per Close', format: 'number' },
];

function format(value: number, kind: FieldMeta['format']): string {
  if (kind === 'currency') return formatCurrency(value);
  if (kind === 'percent') return formatPercent(value, 1);
  return String(Math.round(value * 100) / 100);
}

function toEditableValue(value: number, kind: FieldMeta['format']): number {
  return kind === 'percent' ? Math.round(value * 1000) / 10 : value;
}

function fromEditableValue(input: number, kind: FieldMeta['format']): number {
  return kind === 'percent' ? input / 100 : input;
}

export function ManualOverridePanel({
  naturalMetrics,
  overrides,
  onChange,
}: {
  naturalMetrics: DerivedMetrics;
  overrides: Overrides;
  onChange: (overrides: Overrides) => void;
}) {
  const toggle = (key: DerivedFieldKey, enabled: boolean) => {
    const next = { ...overrides };
    if (enabled) {
      next[key] = naturalMetrics[key as keyof DerivedMetrics] as number;
    } else {
      delete next[key];
    }
    onChange(next);
  };

  const setValue = (key: DerivedFieldKey, kind: FieldMeta['format'], raw: number) => {
    onChange({ ...overrides, [key]: fromEditableValue(raw, kind) });
  };

  return (
    <Card className="print-avoid-break">
      <SectionHeading
        title="Manual Override"
        subtitle="Overrides win over calculated values. They're marked here only — never shown on the published report."
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {FIELDS.map((field) => {
          const isOverridden = overrides[field.key] !== undefined;
          const naturalValue = naturalMetrics[field.key as keyof DerivedMetrics] as number;
          const currentValue = isOverridden ? (overrides[field.key] as number) : naturalValue;

          return (
            <div key={field.key} className="flex items-center justify-between gap-3 rounded-lg border border-line-soft bg-surface px-3 py-2.5">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[12.5px] font-medium text-ink-soft">{field.label}</span>
                  {isOverridden && (
                    <span className="rounded-full bg-warning-tint px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wide text-warning">
                      Override
                    </span>
                  )}
                </div>
                {isOverridden && (
                  <div className="text-[11px] text-ink-muted">Calculated: {format(naturalValue, field.format)}</div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {isOverridden ? (
                  <input
                    type="number"
                    autoFocus
                    value={toEditableValue(currentValue, field.format)}
                    onChange={(e) => setValue(field.key, field.format, e.target.value === '' ? 0 : Number(e.target.value))}
                    className="w-24 rounded-md border border-line bg-surface-raised px-2 py-1 text-right text-[13px] tabular-nums outline-none focus:border-navy/40"
                  />
                ) : (
                  <span className="text-[13px] tabular-nums text-ink">{format(currentValue, field.format)}</span>
                )}
                <button
                  type="button"
                  onClick={() => toggle(field.key, !isOverridden)}
                  className={
                    isOverridden
                      ? 'text-[11.5px] font-medium text-ink-muted hover:text-negative'
                      : 'text-[11.5px] font-medium text-navy hover:underline'
                  }
                >
                  {isOverridden ? 'Reset' : 'Override'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
