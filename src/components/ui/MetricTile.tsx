import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { CountUp } from './CountUp';

interface MetricTileProps {
  label: string;
  value: number;
  format?: 'currency' | 'percent' | 'number';
  formatDigits?: number;
  caption?: string;
  tone?: 'default' | 'positive' | 'warning' | 'negative';
  animate?: boolean;
  size?: 'default' | 'lg';
  icon?: ReactNode;
}

const TONE_TEXT: Record<NonNullable<MetricTileProps['tone']>, string> = {
  default: 'text-ink',
  positive: 'text-positive',
  warning: 'text-warning',
  negative: 'text-negative',
};

export function MetricTile({
  label,
  value,
  format = 'number',
  formatDigits,
  caption,
  tone = 'default',
  animate = false,
  size = 'default',
  icon,
}: MetricTileProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5 text-[12.5px] text-ink-muted">
        {icon}
        {label}
      </div>
      <div
        className={cn(
          'font-display font-semibold tabular-nums tracking-[-0.015em]',
          size === 'lg' ? 'text-[34px] leading-none' : 'text-[21px] leading-none',
          TONE_TEXT[tone],
        )}
      >
        <CountUp value={value} format={format} digits={formatDigits} animate={animate} />
      </div>
      {caption && <div className="text-[12.5px] text-ink-muted">{caption}</div>}
    </div>
  );
}
