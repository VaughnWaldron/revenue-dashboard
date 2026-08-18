import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Tone = 'navy' | 'positive' | 'warning' | 'negative' | 'neutral';

const TONE_CLASSES: Record<Tone, string> = {
  navy: 'bg-navy-tint text-navy border-navy/10',
  positive: 'bg-positive-tint text-positive border-positive/10',
  warning: 'bg-warning-tint text-warning border-warning/10',
  negative: 'bg-negative-tint text-negative border-negative/10',
  neutral: 'bg-surface-sunken text-ink-soft border-line',
};

export function Badge({ children, tone = 'neutral', className }: { children: ReactNode; tone?: Tone; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium',
        TONE_CLASSES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
