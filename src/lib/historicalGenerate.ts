import { MONTH_NAMES, daysInMonth as daysInMonthFor } from './types';
import type { DailyDataPoint, ReportInputs, ReportRecord, Rep } from './types';
import { generateDailyData, generateReps } from './generate';
import { safeDiv } from './calculations';
import { deriveFromSmartCalc } from './smartCalculator';

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

  // The anchor month is usually still in progress (e.g. day 4 of 31), so its
  // cash is a partial total and can't scale a finished month. Each past month
  // is built goal-first: goal stays close to the anchor's (slightly below),
  // and the month finished at or a bit above it. Everything else follows from
  // the anchor's own conversion rates via the Smart Calculator's chain.
  const goalFactor = Math.pow(1 / 1.01, offset) * (0.95 + seededRandom(offset) * 0.06); // ~0.93-1.00
  const monthlyGoal = Math.round(anchor.inputs.monthlyGoal * goalFactor);
  const attainment = 0.98 + seededRandom(offset + 7) * 0.12; // 98%-110%
  const totalCash = Math.round(monthlyGoal * attainment);

  const a = anchor.inputs;
  const anchorCash = a.newCash + a.installmentCash;
  const jitter = (seed: number) => 0.97 + seededRandom(offset + seed) * 0.06;
  const showRate = Math.min(0.95, (safeDiv(a.showUps, a.conductedCalls) || 0.7) * jitter(3));
  const closeRate = Math.min(0.9, (safeDiv(a.totalCloses, a.showUps) || 0.2) * jitter(5));
  const installmentPct = anchorCash > 0 ? safeDiv(a.installmentCash, anchorCash) : 0.1;
  const avgDealSize = a.avgNewCashPerClose || 5000;

  const derived = deriveFromSmartCalc(totalCash, showRate, closeRate, avgDealSize, installmentPct);
  const bookedRatio = Math.max(1, safeDiv(a.totalBookedCalls, a.conductedCalls) || 1);

  const inputs: ReportInputs = {
    newCash: derived.newCash,
    installmentCash: derived.installmentCash,
    monthlyGoal,
    avgNewCashPerClose: avgDealSize,
    totalBookedCalls: Math.round(derived.conductedCalls * bookedRatio),
    conductedCalls: derived.conductedCalls,
    showUps: derived.showUps,
    totalCloses: derived.totalCloses,
    currentDay: totalDays, // a past month is fully elapsed
    daysInMonth: totalDays,
  };

  const repCount = Math.max(1, anchor.reps.length || 3);

  return {
    month,
    year,
    inputs,
    reps: generateReps(inputs, repCount),
    dailyData: generateDailyData(inputs),
  };
}

/**
 * "Last Quarter" — the three fully-completed months before the report's own
 * (still-in-progress) month, summed together. Deliberately excludes the
 * current month itself, since a quarter view implies a closed-out period,
 * not one still being collected.
 */
export function generateQuarterPeriod(anchor: ReportRecord): GeneratedPeriod {
  const months = [1, 2, 3].map((offset) => generateHistoricalPeriod(anchor, offset));

  const sum = (key: keyof ReportInputs) => months.reduce((s, m) => s + m.inputs[key], 0);
  const newCash = sum('newCash');
  const totalCloses = sum('totalCloses');

  const inputs: ReportInputs = {
    newCash,
    installmentCash: sum('installmentCash'),
    monthlyGoal: sum('monthlyGoal'),
    avgNewCashPerClose: Math.round(safeDiv(newCash, totalCloses)) || anchor.inputs.avgNewCashPerClose,
    totalBookedCalls: sum('totalBookedCalls'),
    conductedCalls: sum('conductedCalls'),
    showUps: sum('showUps'),
    totalCloses,
    currentDay: sum('daysInMonth'),
    daysInMonth: sum('daysInMonth'),
  };

  const repCount = Math.max(1, anchor.reps.length || 3);

  // Chronological day-by-day trend across the full quarter: oldest month
  // first, each month's days offset to continue where the last left off.
  const dailyData: DailyDataPoint[] = [];
  let dayOffset = 0;
  for (const m of [...months].reverse()) {
    for (const d of m.dailyData) {
      dailyData.push({ ...d, day: d.day + dayOffset });
    }
    dayOffset += m.inputs.daysInMonth;
  }

  return {
    month: 'Last Quarter',
    year: anchor.year,
    inputs,
    reps: generateReps(inputs, repCount),
    dailyData,
  };
}
