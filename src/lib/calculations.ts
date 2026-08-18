// ---------------------------------------------------------------------------
// Single source of truth for every derived metric shown across the app.
// Both the admin editor and the read-only report view call computeMetrics()
// so the two experiences can never drift out of mathematical sync.
// ---------------------------------------------------------------------------

import type {
  Benchmarks,
  DailyDataPoint,
  DerivedFieldKey,
  Overrides,
  Rep,
  ReportInputs,
} from './types';

/** Divide safely — returns 0 instead of NaN/Infinity when the denominator is 0. */
export function safeDiv(numerator: number, denominator: number): number {
  if (!denominator || !Number.isFinite(denominator)) return 0;
  const result = numerator / denominator;
  return Number.isFinite(result) ? result : 0;
}

export interface DerivedMetrics {
  totalCash: number;
  noShows: number;
  showRate: number; // 0-1
  closeRate: number; // 0-1
  percentOfGoal: number; // 0-1
  gap: number;
  closesRequired: number;
  daysRemaining: number;
  dailyRunRate: number;
  requiredDailyRunRate: number;
  projectedMonthEnd: number;
  cashPerShow: number;
  callsPerClose: number;
  paceRatio: number; // actual vs expected pace, 1 = exactly on pace
  paceStatus: 'ahead' | 'on_track' | 'behind';
}

const RAW_KEYS: DerivedFieldKey[] = [
  'totalCash', 'noShows', 'showRate', 'closeRate', 'percentOfGoal', 'gap',
  'closesRequired', 'dailyRunRate', 'requiredDailyRunRate', 'projectedMonthEnd',
  'cashPerShow', 'callsPerClose',
];

export function overriddenKeys(overrides: Overrides): DerivedFieldKey[] {
  return RAW_KEYS.filter((k) => overrides[k] !== undefined && overrides[k] !== null);
}

/**
 * Computes every derived metric from primary inputs, applying manual
 * overrides last so the admin's explicit numbers always win.
 */
export function computeMetrics(inputs: ReportInputs, overrides: Overrides = {}): DerivedMetrics {
  const {
    newCash, installmentCash, monthlyGoal, avgNewCashPerClose,
    conductedCalls, showUps, totalCloses, currentDay, daysInMonth,
  } = inputs;

  const totalCash = overrides.totalCash ?? (newCash + installmentCash);
  const noShows = overrides.noShows ?? Math.max(0, conductedCalls - showUps);
  const showRate = overrides.showRate ?? safeDiv(showUps, conductedCalls);
  const closeRate = overrides.closeRate ?? safeDiv(totalCloses, showUps);
  const percentOfGoal = overrides.percentOfGoal ?? safeDiv(totalCash, monthlyGoal);
  const gap = overrides.gap ?? (monthlyGoal - totalCash);
  const closesRequired = overrides.closesRequired ?? Math.max(0, Math.ceil(safeDiv(gap, avgNewCashPerClose)));

  const daysRemaining = Math.max(0, daysInMonth - currentDay);
  const dailyRunRate = overrides.dailyRunRate ?? safeDiv(totalCash, currentDay);
  const requiredDailyRunRate = overrides.requiredDailyRunRate ?? safeDiv(gap, daysRemaining);
  const projectedMonthEnd = overrides.projectedMonthEnd ?? (dailyRunRate * daysInMonth);
  const cashPerShow = overrides.cashPerShow ?? safeDiv(totalCash, showUps);
  const callsPerClose = overrides.callsPerClose ?? safeDiv(conductedCalls, totalCloses);

  const expectedFraction = safeDiv(currentDay, daysInMonth);
  const expectedCash = expectedFraction * monthlyGoal;
  const paceRatio = expectedCash > 0 ? safeDiv(totalCash, expectedCash) : 1;
  const paceStatus: DerivedMetrics['paceStatus'] =
    paceRatio >= 1.05 ? 'ahead' : paceRatio < 0.9 ? 'behind' : 'on_track';

  return {
    totalCash, noShows, showRate, closeRate, percentOfGoal, gap,
    closesRequired, daysRemaining, dailyRunRate, requiredDailyRunRate,
    projectedMonthEnd, cashPerShow, callsPerClose,
    paceRatio, paceStatus,
  };
}

export interface ValidationWarning {
  field: string;
  message: string;
  severity: 'warning' | 'error';
}

/**
 * Cross-checks entered data for internal consistency. Purely advisory —
 * used only inside the admin editor, never blocks saving.
 */
export function validateReport(
  inputs: ReportInputs,
  reps: Rep[],
  dailyData: DailyDataPoint[],
): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];
  const push = (field: string, message: string, severity: ValidationWarning['severity'] = 'warning') =>
    warnings.push({ field, message, severity });

  if (inputs.showUps > inputs.conductedCalls) {
    push('showUps', 'Show-ups exceed conducted calls.', 'error');
  }
  if (inputs.totalCloses > inputs.showUps) {
    push('totalCloses', 'Closes exceed show-ups.', 'error');
  }
  if (inputs.currentDay > inputs.daysInMonth) {
    push('currentDay', 'Current day exceeds days in month.', 'error');
  }
  if (inputs.conductedCalls > inputs.totalBookedCalls) {
    push('conductedCalls', 'Conducted calls exceed total booked calls.', 'warning');
  }

  for (const [key, value] of Object.entries(inputs)) {
    if (typeof value === 'number' && (!Number.isFinite(value) || value < 0)) {
      push(key, `${key} has an invalid value.`, 'error');
    }
  }

  if (reps.length > 0) {
    const repNewCash = reps.reduce((s, r) => s + r.newCash, 0);
    const repInstallment = reps.reduce((s, r) => s + r.installmentCash, 0);
    const repCalls = reps.reduce((s, r) => s + r.calls, 0);
    const repShows = reps.reduce((s, r) => s + r.shows, 0);
    const repCloses = reps.reduce((s, r) => s + r.closes, 0);

    if (Math.abs(repNewCash - inputs.newCash) > 1) {
      push('reps', `Rep new cash totals ($${repNewCash.toLocaleString()}) do not match reported new cash ($${inputs.newCash.toLocaleString()}).`);
    }
    if (Math.abs(repInstallment - inputs.installmentCash) > 1) {
      push('reps', `Rep installment totals ($${repInstallment.toLocaleString()}) do not match reported installments ($${inputs.installmentCash.toLocaleString()}).`);
    }
    if (repCalls !== inputs.conductedCalls) {
      push('reps', `Rep call totals (${repCalls}) do not match conducted calls (${inputs.conductedCalls}).`);
    }
    if (repShows !== inputs.showUps) {
      push('reps', `Rep show totals (${repShows}) do not match reported show-ups (${inputs.showUps}).`);
    }
    if (repCloses !== inputs.totalCloses) {
      push('reps', `Rep close totals (${repCloses}) do not match reported closes (${inputs.totalCloses}).`);
    }
  }

  if (dailyData.length > 0) {
    const dailyNewCash = dailyData.reduce((s, d) => s + d.newCash, 0);
    const dailyCloses = dailyData.reduce((s, d) => s + d.closes, 0);
    if (Math.abs(dailyNewCash - inputs.newCash) > 1) {
      push('dailyData', `Daily new-cash totals ($${dailyNewCash.toLocaleString()}) do not match reported new cash ($${inputs.newCash.toLocaleString()}).`);
    }
    if (dailyCloses !== inputs.totalCloses) {
      push('dailyData', `Daily close totals (${dailyCloses}) do not match reported closes (${inputs.totalCloses}).`);
    }
  }

  return warnings;
}

export function benchmarkDelta(actual: number, target: number): number {
  return target > 0 ? safeDiv(actual, target) : 0;
}

export interface BenchmarkComparison {
  label: string;
  actual: number;
  target: number;
  format: 'currency' | 'percent' | 'number';
  ratio: number;
}

export function compareBenchmarks(metrics: DerivedMetrics, inputs: ReportInputs, benchmarks: Benchmarks): BenchmarkComparison[] {
  return [
    {
      label: 'Closes / month',
      actual: inputs.totalCloses,
      target: benchmarks.monthlyCloses,
      format: 'number',
      ratio: benchmarkDelta(inputs.totalCloses, benchmarks.monthlyCloses),
    },
    {
      label: 'Show rate',
      actual: metrics.showRate,
      target: benchmarks.showRate,
      format: 'percent',
      ratio: benchmarkDelta(metrics.showRate, benchmarks.showRate),
    },
    {
      label: 'Close rate',
      actual: metrics.closeRate,
      target: benchmarks.closeRate,
      format: 'percent',
      ratio: benchmarkDelta(metrics.closeRate, benchmarks.closeRate),
    },
    {
      label: 'Cash per show',
      actual: metrics.cashPerShow,
      target: benchmarks.cashPerShow,
      format: 'currency',
      ratio: benchmarkDelta(metrics.cashPerShow, benchmarks.cashPerShow),
    },
  ];
}
