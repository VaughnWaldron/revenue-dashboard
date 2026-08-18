import { cn } from '@/lib/cn';

interface ProgressBarProps {
  fraction: number; // 0-1, can exceed 1
  tone?: 'navy' | 'positive' | 'warning' | 'negative';
  className?: string;
  markers?: { fraction: number; label?: string }[];
}

const TONE_BG: Record<NonNullable<ProgressBarProps['tone']>, string> = {
  navy: 'bg-navy',
  positive: 'bg-positive',
  warning: 'bg-warning',
  negative: 'bg-negative',
};

export function ProgressBar({ fraction, tone = 'navy', className, markers }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(1, fraction)) * 100;
  return (
    <div className={cn('relative', className)}>
      <div className="h-2 w-full overflow-hidden rounded-full bg-surface-sunken">
        <div
          className={cn('h-full rounded-full transition-[width] duration-700 ease-out', TONE_BG[tone])}
          style={{ width: `${pct}%` }}
        />
      </div>
      {markers?.map((m, i) => (
        <div
          key={i}
          className="absolute top-0 h-2 w-px bg-ink/20"
          style={{ left: `${Math.max(0, Math.min(1, m.fraction)) * 100}%` }}
          title={m.label}
        />
      ))}
    </div>
  );
}
