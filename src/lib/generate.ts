import type { DailyDataPoint, ReportInputs, Rep } from './types';

const FIRST_NAMES = [
  'Sasha', 'Malik', 'Priya', 'Owen', 'Jordan', 'Elena', 'Marcus', 'Nadia',
  'Devon', 'Kayla', 'Theo', 'Amara', 'Lucas', 'Simone', 'Ravi', 'Ingrid',
  'Miles', 'Zara', 'Colin', 'Yuki', 'Diego', 'Freya', 'Andre', 'Lena',
];

const LAST_NAMES = [
  'Rivera', 'Osei', 'Chandra', 'Bennett', 'Whitfield', 'Marsh', 'Delgado',
  'Okafor', 'Sinclair', 'Voss', 'Bianchi', 'Hartley', 'Nakamura', 'Reyes',
  'Larsen', 'Abara', 'Castellano', 'Ferreira', 'Novak', 'Doyle', 'Kessler',
  'Amaro', 'Solberg', 'Kimura',
];

function shuffled<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Unique "First Last" combinations for generated reps — never Rep 1/2/3. */
function generateRepNames(count: number): string[] {
  const firsts = shuffled(FIRST_NAMES);
  const lasts = shuffled(LAST_NAMES);
  // Zipping two independently-shuffled lists gives every rep a distinct
  // first AND last name within the batch (no two reps sharing a surname).
  return Array.from({ length: count }, (_, i) => `${firsts[i % firsts.length]} ${lasts[i % lasts.length]}`);
}

/**
 * Splits `total` across `weights` as integers that sum exactly to `total`,
 * using the largest-remainder method so proportions stay faithful to the
 * weights without ever drifting from the true total.
 */
function weightedSplit(total: number, weights: number[]): number[] {
  const weightSum = weights.reduce((s, w) => s + w, 0);
  if (weightSum <= 0 || total <= 0) return weights.map(() => 0);

  const raw = weights.map((w) => (total * w) / weightSum);
  const floors = raw.map(Math.floor);
  let remainder = total - floors.reduce((s, v) => s + v, 0);

  const order = raw
    .map((v, i) => ({ i, frac: v - Math.floor(v) }))
    .sort((a, b) => b.frac - a.frac);

  const result = [...floors];
  for (let k = 0; k < order.length && remainder > 0; k++, remainder--) {
    result[order[k].i] += 1;
  }
  return result;
}

/** Descending weights (rank 1 gets the most) for a natural top-performer curve. */
function descendingWeights(count: number): number[] {
  return Array.from({ length: count }, (_, i) => count - i);
}

/** Deterministic, gently-varying weights for day-by-day distribution — no true randomness, so results are reproducible. */
function dailyWeights(days: number, phase: number): number[] {
  return Array.from({ length: days }, (_, i) => 1 + 0.4 * Math.sin((i + 1) * 2.1 + phase));
}

export function suggestedRepCount(inputs: ReportInputs): number {
  if (inputs.currentDay <= 0) return 1;
  const callsPerRepPerDay = 9;
  return Math.max(1, Math.round(inputs.conductedCalls / (inputs.currentDay * callsPerRepPerDay)));
}

/** Generates a full rep roster from the primary inputs, ranked by a descending performance curve. */
export function generateReps(inputs: ReportInputs, repCount: number): Rep[] {
  const count = Math.max(1, Math.round(repCount));
  const weights = descendingWeights(count);
  const names = generateRepNames(count);

  const newCash = weightedSplit(inputs.newCash, weights);
  const installmentCash = weightedSplit(inputs.installmentCash, weights);
  const calls = weightedSplit(inputs.conductedCalls, weights);
  const shows = weightedSplit(inputs.showUps, weights);
  const closes = weightedSplit(inputs.totalCloses, weights);

  return Array.from({ length: count }, (_, i) => ({
    id: `rep-${Date.now().toString(36)}-${i}`,
    name: names[i],
    newCash: newCash[i],
    installmentCash: installmentCash[i],
    calls: calls[i],
    shows: shows[i],
    closes: closes[i],
  }));
}

/** Generates day-by-day chart data for every elapsed day (1..currentDay) from the primary inputs. */
export function generateDailyData(inputs: ReportInputs): DailyDataPoint[] {
  const days = Math.max(0, Math.min(inputs.currentDay, inputs.daysInMonth));
  if (days === 0) return [];

  const newCash = weightedSplit(inputs.newCash, dailyWeights(days, 0));
  const closes = weightedSplit(inputs.totalCloses, dailyWeights(days, 0.6));
  const bookedCalls = weightedSplit(inputs.totalBookedCalls, dailyWeights(days, 1.2));
  const conductedCalls = weightedSplit(inputs.conductedCalls, dailyWeights(days, 1.8));

  return Array.from({ length: days }, (_, i) => ({
    day: i + 1,
    newCash: newCash[i],
    closes: closes[i],
    bookedCalls: bookedCalls[i],
    conductedCalls: conductedCalls[i],
  }));
}
