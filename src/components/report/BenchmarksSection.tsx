import type { BenchmarkComparison } from '@/lib/calculations';
import { Card, SectionHeading } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { formatCurrency, formatPercent } from '@/lib/format';

function formatValue(value: number, format: BenchmarkComparison['format']): string {
  if (format === 'currency') return formatCurrency(value);
  if (format === 'percent') return formatPercent(value);
  return String(Math.round(value));
}

export function BenchmarksSection({ comparisons }: { comparisons: BenchmarkComparison[] }) {
  return (
    <Card className="print-avoid-break">
      <SectionHeading title="Benchmarks" subtitle="Current performance against configured targets" />
      <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
        {comparisons.map((c) => {
          const tone = c.ratio >= 1 ? 'positive' : c.ratio >= 0.85 ? 'warning' : 'negative';
          return (
            <div key={c.label}>
              <div className="mb-1.5 flex items-baseline justify-between">
                <span className="text-[13px] font-medium text-ink-soft">{c.label}</span>
                <span className="text-[13px] tabular-nums text-ink-muted">
                  <span className="font-semibold text-ink">{formatValue(c.actual, c.format)}</span>
                  {' / '}
                  {formatValue(c.target, c.format)}
                </span>
              </div>
              <ProgressBar fraction={c.ratio} tone={tone} />
            </div>
          );
        })}
      </div>
    </Card>
  );
}
