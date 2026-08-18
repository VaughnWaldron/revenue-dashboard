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

/** Subtle count-up used only on a report's first paint — never re-triggers on data edits. */
export function CountUp({ value, format = 'number', digits, animate = true, durationMs = 900 }: CountUpProps) {
  const [display, setDisplay] = useState(animate ? 0 : value);
  const started = useRef(false);

  useEffect(() => {
    if (!animate || started.current) {
      setDisplay(value);
      return;
    }
    started.current = true;
    const start = performance.now();
    const from = 0;
    let frame: number;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (value - from) * eased);
      if (t < 1) frame = requestAnimationFrame(tick);
      else setDisplay(value);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <span>{formatValue(display, format, digits)}</span>;
}
