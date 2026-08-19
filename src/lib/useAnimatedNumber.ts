import { useEffect, useRef, useState } from 'react';

/** Animates from 0 on first mount only; every later value change snaps instantly. */
export function useAnimatedNumber(value: number, animate = true, durationMs = 900): number {
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

  return display;
}
