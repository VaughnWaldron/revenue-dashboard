import { useEffect, useRef, useState } from 'react';
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

/** Animates from 0 on first paint only; every later value change (edits, period switches) snaps instantly. */
export function CountUp({ value, format = 'number', digits, animate = true, durationMs = 900 }: CountUpProps) {
  const [display, setDisplay] = useState(animate ? 0 : value);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!animate || hasAnimated.current) {
      setDisplay(value);
      return;
    }
    hasAnimated.current = true;
    const start = performance.now();
    let frame: number;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(value * eased);
      if (t < 1) frame = requestAnimationFrame(tick);
      else setDisplay(value);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, animate, durationMs]);

  return <span>{formatValue(display, format, digits)}</span>;
}
