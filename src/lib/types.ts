// ---------------------------------------------------------------------------
// Core domain types. This file is the single schema shared by the admin
// editor, the read-only report view, and the Netlify Functions that persist
// reports. Keep it framework-agnostic (no React imports).
// ---------------------------------------------------------------------------

export type DataStatus = 'verified' | 'case_study' | 'modeled';

export const DATA_STATUS_LABEL: Record<DataStatus, string> = {
  verified: 'Verified Performance',
  case_study: 'Network Case Study',
  modeled: 'Modeled Benchmark',
};

export type ReportStatus = 'draft' | 'published' | 'archived';

export type EditMode = 'smart' | 'manual';

export interface Rep {
  id: string;
  name: string;
  newCash: number;
  installmentCash: number;
  calls: number;
  shows: number;
  closes: number;
}

export interface DailyDataPoint {
  day: number; // 1-indexed day of month
  closes: number;
  newCash: number;
  bookedCalls: number;
  conductedCalls: number;
}

export interface Benchmarks {
  monthlyCloses: number;
  showRate: number; // stored as 0-1
  closeRate: number; // stored as 0-1
  cashPerShow: number;
}

/** The primary, independently-entered inputs. Everything else is derived. */
export interface ReportInputs {
  newCash: number;
  installmentCash: number;
  monthlyGoal: number;
  avgNewCashPerClose: number;
  totalBookedCalls: number;
  conductedCalls: number;
  showUps: number;
  totalCloses: number;
  currentDay: number;
  daysInMonth: number;
}

/** Keys of every derived (calculated) metric, used for manual overrides. */
export type DerivedFieldKey =
  | 'totalCash'
  | 'noShows'
  | 'showRate'
  | 'closeRate'
  | 'percentOfGoal'
  | 'gap'
  | 'closesRequired'
  | 'dailyRunRate'
  | 'requiredDailyRunRate'
  | 'projectedMonthEnd'
  | 'cashPerShow'
  | 'callsPerClose';

export type Overrides = Partial<Record<DerivedFieldKey, number>>;

/**
 * The Smart Calculator's own reduced set of inputs — what the admin actually
 * typed, kept separate from ReportInputs so re-opening a saved report shows
 * the original percentages instead of numbers reverse-derived from totals.
 */
export interface SmartCalcInputs {
  totalCashCollected: number;
  showRate: number; // 0-1, of total calls
  closeRate: number; // 0-1, of shows
  installmentPct: number; // 0-1, of total cash collected
  repCount: number;
}

export interface ReportRecord {
  id: string;
  slug: string;
  status: ReportStatus;
  dataStatus: DataStatus;

  agencyName: string;
  clientName: string;
  logoUrl?: string;
  month: string; // e.g. "March"
  year: number;

  mode: EditMode;
  inputs: ReportInputs;
  smartCalcInputs?: SmartCalcInputs;
  overrides: Overrides;

  reps: Rep[];
  dailyData: DailyDataPoint[];
  benchmarks: Benchmarks;

  createdAt: string; // ISO
  updatedAt: string; // ISO

  /** Password-gated admin notes; never surfaced in /report view. */
  internalNotes?: string;
}

export type ReportInput = Omit<ReportRecord, 'id' | 'createdAt' | 'updatedAt'>;

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function daysInMonth(monthName: string, year: number): number {
  const idx = MONTH_NAMES.indexOf(monthName);
  if (idx === -1) return 30;
  return new Date(year, idx + 1, 0).getDate();
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
