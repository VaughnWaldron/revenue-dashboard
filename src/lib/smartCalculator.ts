import { safeDiv } from './calculations';
import type { Benchmarks } from './types';

/** A realistic ceiling for info-product/coaching sales — not a hard limit, just a sensible default target. */
export const DEFAULT_BENCHMARK_SHOW_RATE = 0.75;
export const DEFAULT_BENCHMARK_CLOSE_RATE = 0.35;

export interface SmartCalcDerived {
  installmentCash: number;
  newCash: number;
  totalCloses: number;
  showUps: number;
  conductedCalls: number;
}

/**
 * The exact derivation chain: installments → new cash → closes → shows →
 * calls, each rounded before feeding the next step. Rates are 0-1.
 */
export function deriveFromSmartCalc(
  totalCashCollected: number,
  showRate: number,
  closeRate: number,
  avgDealSize: number,
  installmentPct: number,
): SmartCalcDerived {
  const installmentCash = Math.round(totalCashCollected * installmentPct);
  const newCash = totalCashCollected - installmentCash;
  const totalCloses = Math.round(safeDiv(newCash, avgDealSize));
  const showUps = Math.round(safeDiv(totalCloses, closeRate));
  const conductedCalls = Math.round(safeDiv(showUps, showRate));
  return { installmentCash, newCash, totalCloses, showUps, conductedCalls };
}

/** Assumes 9 calls/rep/day (midpoint of the 8-10 range) as a starting suggestion. */
export function suggestReps(conductedCalls: number, currentDay: number): number {
  if (currentDay <= 0) return 1;
  return Math.max(1, Math.round(safeDiv(conductedCalls, currentDay * 9)));
}

export function callsPerRepPerDay(conductedCalls: number, currentDay: number, repCount: number): number {
  if (currentDay <= 0 || repCount <= 0) return 0;
  return safeDiv(conductedCalls, currentDay * repCount);
}

/**
 * Sensible starting benchmark targets, derived from the same Smart
 * Calculator numbers rather than requiring blind manual entry. Show/close
 * rate targets are fixed defaults (editable after); monthly closes and cash
 * per show are computed so they actually relate to this report's goal.
 */
export function suggestBenchmarks(monthlyGoal: number, avgDealSize: number, installmentPct: number): Benchmarks {
  const monthlyCloses = avgDealSize > 0 ? Math.ceil(safeDiv(monthlyGoal, avgDealSize)) : 0;
  const cashPerShow = Math.round(safeDiv(DEFAULT_BENCHMARK_CLOSE_RATE * avgDealSize, 1 - installmentPct));
  return {
    monthlyCloses,
    showRate: DEFAULT_BENCHMARK_SHOW_RATE,
    closeRate: DEFAULT_BENCHMARK_CLOSE_RATE,
    cashPerShow,
  };
}
