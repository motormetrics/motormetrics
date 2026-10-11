/**
 * Pure series helpers for the Overview page.
 *
 * Everything here works on `YYYY-MM` strings and plain numbers so it can be
 * unit-tested without a database, and so nothing reads the clock — Cache
 * Components rejects that anywhere in the prerender path.
 */

export interface MonthTotal {
  month: string;
  total: number;
}

/** Sum per-category rows into one total per month, oldest first. */
export function sumByMonth(
  rows: { month: string; number: number | null }[],
): MonthTotal[] {
  const totals = new Map<string, number>();
  for (const row of rows) {
    totals.set(row.month, (totals.get(row.month) ?? 0) + (row.number ?? 0));
  }
  return [...totals]
    .map(([month, total]) => ({ month, total }))
    .sort((left, right) => left.month.localeCompare(right.month));
}

/**
 * The last `length` entries at or before `month`, oldest first.
 *
 * The page's month picker is fed the car-registration month list, which can
 * run ahead of the deregistration and COE series, so the window ends at the
 * newest entry that is not after the selection rather than at an exact match.
 */
export function windowEndingAt<Item extends { month: string }>(
  series: Item[],
  month: string,
  length: number,
): Item[] {
  const upTo = series.filter((item) => item.month <= month);
  return upTo.slice(Math.max(0, upTo.length - length));
}

/** Multipliers for a round axis step, repeated at every power of ten. */
const STEP_MULTIPLIERS = [1, 2, 2.5, 5, 10];

/** The smallest round step (1, 2, 2.5 or 5 × 10ⁿ) at or above `raw`. */
function roundStep(raw: number): number {
  if (raw <= 0) {
    return 1;
  }
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const multiplier =
    STEP_MULTIPLIERS.find((candidate) => candidate * magnitude >= raw) ?? 10;
  return multiplier * magnitude;
}

/**
 * Evenly spaced axis ticks on a round step, about four gaps across the data.
 *
 * `zero` anchors the axis at zero, for counts whose bar heights must be
 * honest; otherwise the axis spans the data, for shares and premiums whose
 * movement would flatten against a zero baseline.
 */
export function axisTicks(values: number[], { zero }: { zero: boolean }) {
  if (values.length === 0) {
    return [];
  }

  const high = Math.max(...values);
  const low = zero ? 0 : Math.min(...values);
  const step = roundStep((high - low) / 4);
  const first = Math.floor(low / step) * step;
  const last = Math.max(Math.ceil(high / step) * step, first + step);
  const count = Math.round((last - first) / step);

  // Multiplied rather than accumulated, so a 2.5 step never drifts to 7.4999.
  return Array.from({ length: count + 1 }, (_, index) =>
    Number((first + index * step).toFixed(6)),
  );
}
