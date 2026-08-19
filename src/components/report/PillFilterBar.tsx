import type { PeriodOption } from '@/lib/historicalGenerate';
import { cn } from '@/lib/cn';

interface PillFilterBarProps {
  options: PeriodOption[];
  offset: number;
  onOffsetChange: (offset: number) => void;
  compareEnabled: boolean;
  onCompareChange: (enabled: boolean) => void;
}

function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" strokeLinecap="round" />
    </svg>
  );
}

function CompareIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
      <path d="M7 4v13M7 17l-3-3M7 17l3-3M17 20V7M17 7l-3 3M17 7l3 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PillFilterBar({ options, offset, onOffsetChange, compareEnabled, onCompareChange }: PillFilterBarProps) {
  const isFiltered = offset !== 0 || compareEnabled;

  return (
    <div className="no-print flex flex-wrap items-center gap-2">
      <div className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-raised py-1.5 pl-3 pr-2 text-[13px] font-medium text-ink shadow-soft">
        <CalendarIcon />
        <select
          value={offset}
          onChange={(e) => onOffsetChange(Number(e.target.value))}
          className="cursor-pointer appearance-none bg-transparent pr-1 outline-none"
          aria-label="Reporting period"
        >
          {options.map((opt) => (
            <option key={opt.offset} value={opt.offset}>
              {opt.label}
              {opt.offset === 0 ? ' (current)' : ''}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onClick={() => onCompareChange(!compareEnabled)}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-medium shadow-soft transition-colors',
          compareEnabled
            ? 'border-navy/25 bg-navy-tint text-navy'
            : 'border-line bg-surface-raised text-ink-soft hover:text-ink',
        )}
        aria-pressed={compareEnabled}
      >
        <CompareIcon />
        Compare to Previous Period
      </button>

      {isFiltered && (
        <button
          type="button"
          onClick={() => {
            onOffsetChange(0);
            onCompareChange(false);
          }}
          className="text-[12.5px] text-ink-muted hover:text-ink"
        >
          Clear all
        </button>
      )}

      {offset > 0 && <span className="text-[11.5px] text-ink-muted">Modeled from current-month figures</span>}
    </div>
  );
}
