import { useAnimatedNumber } from '@/lib/useAnimatedNumber';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/format';

interface CountUpProps {
  value: number;
  format?: 'currency' | 'percent' | 'number';
  digits?: number;
  animate?: boolean;
  durationMs?: number;
}

function formatValue(value: number, format: CountUpProps['format'], digits?: number): string {
  if (format === 'currency') return formatCurrency(value);
  if (format === 'percent') return formatPercent(value, digits ?? 0);
  return formatNumber(value, digits ?? 0);
}

export function CountUp({ value, format = 'number', digits, animate = true, durationMs = 900 }: CountUpProps) {
  const display = useAnimatedNumber(value, animate, durationMs);
  return <span>{formatValue(display, format, digits)}</span>;
}
