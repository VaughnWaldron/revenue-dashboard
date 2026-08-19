import { safeDiv } from './calculations';

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
