import { MONTH_NAMES, daysInMonth as daysInMonthFor } from './types';
import type { DailyDataPoint, ReportInputs, ReportRecord, Rep } from './types';
import { generateDailyData, generateReps } from './generate';

export interface PeriodOption {
  label: string;
  month: string;
  year: number;
  offset: number; // 0 = the report's own configured month; 1+ = months back
}

/** Trailing period list ending at the report's own month (offset 0 = "real" data). */
export function listPeriodOptions(anchor: ReportRecord, monthsBack = 11): PeriodOption[] {
  const anchorIdx = MONTH_NAMES.indexOf(anchor.month);
  return Array.from({ length: monthsBack + 1 }, (_, offset) => {
    const totalIdx = anchorIdx - offset;
    const year = anchor.year + Math.floor(totalIdx / 12);
    const month = MONTH_NAMES[((totalIdx % 12) + 12) % 12];
    return { label: `${month} ${year}`, month, year, offset };
  });
}

// Deterministic pseudo-random in [0, 1), seeded so the same offset always
// fabricates the same numbers rather than reshuffling on every render.
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 999.37) * 43758.5453;
  return x - Math.floor(x);
}

export interface GeneratedPeriod {
  month: string;
  year: number;
  inputs: ReportInputs;
  reps: Rep[];
  dailyData: DailyDataPoint[];
}

/**
 * Fabricates a plausible prior month by scaling the report's real, entered
 * numbers backward with gentle deterministic growth + noise. Offset 0 always
 * returns the report's actual data untouched. Every fabricated month is run
 * back through the same calculation model, so it stays internally consistent
 * — it just isn't real.
 */
export function generateHistoricalPeriod(anchor: ReportRecord, offset: number): GeneratedPeriod {
  if (offset === 0) {
    return { month: anchor.month, year: anchor.year, inputs: anchor.inputs, reps: anchor.reps, dailyData: anchor.dailyData };
  }

  const anchorIdx = MONTH_NAMES.indexOf(anchor.month);
  const totalIdx = anchorIdx - offset;
  const year = anchor.year + Math.floor(totalIdx / 12);
  const month = MONTH_NAMES[((totalIdx % 12) + 12) % 12];
  const totalDays = daysInMonthFor(month, year);

  const monthlyGrowth = 0.055; // assumed trailing month-over-month growth
  const noise = 0.85 + seededRandom(offset) * 0.3; // 0.85–1.15, deterministic per offset
  const decay = Math.pow(1 / (1 + monthlyGrowth), offset) * noise;
  const scale = (v: number) => Math.max(0, Math.round(v * decay));

  const inputs: ReportInputs = {
    newCash: scale(anchor.inputs.newCash),
    installmentCash: scale(anchor.inputs.installmentCash),
    monthlyGoal: scale(anchor.inputs.monthlyGoal),
    avgNewCashPerClose: anchor.inputs.avgNewCashPerClose,
    totalBookedCalls: scale(anchor.inputs.totalBookedCalls),
    conductedCalls: scale(anchor.inputs.conductedCalls),
    showUps: scale(anchor.inputs.showUps),
    totalCloses: scale(anchor.inputs.totalCloses),
    currentDay: totalDays, // a past month is fully elapsed
    daysInMonth: totalDays,
  };

  // Scaling every field by the same factor preserves ratios, but rounding
  // independently can rarely push one just past another — clamp the chain.
  inputs.showUps = Math.min(inputs.showUps, inputs.conductedCalls);
  inputs.totalCloses = Math.min(inputs.totalCloses, inputs.showUps);
  inputs.conductedCalls = Math.min(inputs.conductedCalls, inputs.totalBookedCalls);

  const repCount = Math.max(1, anchor.reps.length || 3);

  return {
    month,
    year,
    inputs,
    reps: generateReps(inputs, repCount),
    dailyData: generateDailyData(inputs),
  };
}
