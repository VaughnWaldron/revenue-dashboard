import { cn } from '@/lib/cn';
import { safeDiv } from '@/lib/calculations';
import { formatPercent } from '@/lib/format';

/** Colors only the delta itself, never the whole metric — matches how Baremetrics, Mercury, and Plausible do it. */
export function DeltaBadge({ current, previous, className }: { current: number; previous: number; className?: string }) {
  if (previous === 0) return null;
  const pct = safeDiv(current - previous, Math.abs(previous));
  const isUp = pct >= 0;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold',
        isUp ? 'bg-positive-tint text-positive' : 'bg-negative-tint text-negative',
        className,
      )}
    >
      {isUp ? '↑' : '↓'} {formatPercent(Math.abs(pct), 1)}
    </span>
  );
}
