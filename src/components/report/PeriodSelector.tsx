import type { PeriodOption } from '@/lib/historicalGenerate';

export function PeriodSelector({
  options,
  offset,
  onChange,
}: {
  options: PeriodOption[];
  offset: number;
  onChange: (offset: number) => void;
}) {
  return (
    <div className="print-avoid-break flex items-center gap-2">
      <label htmlFor="period-select" className="text-[12.5px] text-ink-muted">
        Viewing
      </label>
      <select
        id="period-select"
        value={offset}
        onChange={(e) => onChange(Number(e.target.value))}
        className="rounded-lg border border-line bg-surface-raised px-2.5 py-1.5 text-[13px] font-medium text-ink outline-none focus:border-navy/40 focus:ring-2 focus:ring-navy/10"
      >
        {options.map((opt) => (
          <option key={opt.offset} value={opt.offset}>
            {opt.label}
            {opt.offset === 0 ? ' (current)' : ''}
          </option>
        ))}
      </select>
      {offset > 0 && <span className="text-[11.5px] text-ink-muted">Modeled from current-month figures</span>}
    </div>
  );
}
