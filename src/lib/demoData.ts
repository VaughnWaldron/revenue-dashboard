import type { ReportRecord } from './types';

// Fully self-consistent demonstration report — every sum (rep totals, daily
// totals) reconciles exactly against the primary inputs, so it renders with
// zero validation warnings in the admin editor.
export const DEMO_REPORT: ReportRecord = {
  id: 'demo-northbeam-august-2026',
  slug: 'northbeam-elevate-august-2026',
  status: 'published',
  dataStatus: 'modeled',

  agencyName: 'Northbeam Media Group',
  clientName: 'Elevate Coaching Collective',
  logoUrl: undefined,
  month: 'August',
  year: 2026,

  mode: 'smart',
  inputs: {
    newCash: 96000,
    installmentCash: 18000,
    monthlyGoal: 150000,
    avgNewCashPerClose: 6400,
    totalBookedCalls: 210,
    conductedCalls: 168,
    showUps: 121,
    totalCloses: 21,
    currentDay: 18,
    daysInMonth: 31,
  },
  overrides: {},

  reps: [
    { id: 'rep-1', name: 'Sasha Rivera', newCash: 34000, installmentCash: 6000, calls: 52, shows: 40, closes: 8 },
    { id: 'rep-2', name: 'Malik Osei', newCash: 26000, installmentCash: 5000, calls: 46, shows: 33, closes: 6 },
    { id: 'rep-3', name: 'Priya Chandra', newCash: 22000, installmentCash: 4000, calls: 40, shows: 28, closes: 5 },
    { id: 'rep-4', name: 'Owen Bennett', newCash: 14000, installmentCash: 3000, calls: 30, shows: 20, closes: 2 },
  ],

  dailyData: [
    { day: 1, bookedCalls: 13, conductedCalls: 11, closes: 1, newCash: 5000 },
    { day: 2, bookedCalls: 12, conductedCalls: 9, closes: 1, newCash: 5000 },
    { day: 3, bookedCalls: 10, conductedCalls: 8, closes: 2, newCash: 7000 },
    { day: 4, bookedCalls: 13, conductedCalls: 11, closes: 1, newCash: 5000 },
    { day: 5, bookedCalls: 12, conductedCalls: 9, closes: 1, newCash: 5000 },
    { day: 6, bookedCalls: 10, conductedCalls: 8, closes: 1, newCash: 5000 },
    { day: 7, bookedCalls: 13, conductedCalls: 11, closes: 1, newCash: 5000 },
    { day: 8, bookedCalls: 12, conductedCalls: 9, closes: 1, newCash: 5000 },
    { day: 9, bookedCalls: 10, conductedCalls: 8, closes: 2, newCash: 7000 },
    { day: 10, bookedCalls: 13, conductedCalls: 11, closes: 1, newCash: 5000 },
    { day: 11, bookedCalls: 12, conductedCalls: 9, closes: 1, newCash: 5000 },
    { day: 12, bookedCalls: 10, conductedCalls: 8, closes: 1, newCash: 5000 },
    { day: 13, bookedCalls: 13, conductedCalls: 11, closes: 1, newCash: 5000 },
    { day: 14, bookedCalls: 12, conductedCalls: 9, closes: 1, newCash: 5000 },
    { day: 15, bookedCalls: 10, conductedCalls: 8, closes: 2, newCash: 7000 },
    { day: 16, bookedCalls: 13, conductedCalls: 11, closes: 1, newCash: 5000 },
    { day: 17, bookedCalls: 12, conductedCalls: 9, closes: 1, newCash: 5000 },
    { day: 18, bookedCalls: 10, conductedCalls: 8, closes: 1, newCash: 5000 },
  ],

  benchmarks: {
    monthlyCloses: 24,
    showRate: 0.75,
    closeRate: 0.22,
    cashPerShow: 950,
  },

  createdAt: '2026-08-01T09:00:00.000Z',
  updatedAt: '2026-08-18T14:32:00.000Z',
};

export function createBlankReport(): ReportRecord {
  const now = new Date().toISOString();
  return {
    id: '',
    slug: '',
    status: 'draft',
    dataStatus: 'modeled',
    agencyName: '',
    clientName: '',
    month: 'January',
    year: new Date().getFullYear(),
    mode: 'smart',
    inputs: {
      newCash: 0,
      installmentCash: 0,
      monthlyGoal: 0,
      avgNewCashPerClose: 0,
      totalBookedCalls: 0,
      conductedCalls: 0,
      showUps: 0,
      totalCloses: 0,
      currentDay: 1,
      daysInMonth: 30,
    },
    overrides: {},
    reps: [],
    dailyData: [],
    benchmarks: {
      monthlyCloses: 0,
      showRate: 0,
      closeRate: 0,
      cashPerShow: 0,
    },
    createdAt: now,
    updatedAt: now,
  };
}
