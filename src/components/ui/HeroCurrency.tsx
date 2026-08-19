import { useAnimatedNumber } from '@/lib/useAnimatedNumber';

function splitParts(value: number): { wholeStr: string; cents: string | null } {
  const totalCents = Math.round(value * 100);
  const wholeDollars = Math.trunc(totalCents / 100);
  const cents = Math.abs(totalCents % 100);
  const wholeStr = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(wholeDollars);
  return { wholeStr, cents: cents === 0 ? null : String(cents).padStart(2, '0') };
}

/**
 * Hero currency display — renders cents smaller and lighter than the whole
 * dollar amount, the way Mercury does. Only shows cents when the value
 * genuinely has them; never pads whole numbers with a fake ".00".
 */
export function HeroCurrency({ value, animate = true, durationMs = 900 }: { value: number; animate?: boolean; durationMs?: number }) {
  const display = useAnimatedNumber(value, animate, durationMs);
  const { wholeStr, cents } = splitParts(display);

  return (
    <span>
      {wholeStr}
      {cents && <span className="text-[0.5em] font-medium text-ink-muted">.{cents}</span>}
    </span>
  );
}
