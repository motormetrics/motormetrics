import { shiftMonth } from "@web/utils/dates/month-arithmetic";

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

/** `2025-10` → `2025-11`, with the year rolling over as needed. */
export function nextMonth(month: string): string {
  return shiftMonth(month, 1);
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

/**
 * The PQP month whose rates apply to renewals the month after `month`, and
 * the month before it for the change chip.
 *
 * A PQP is published for the month it applies to, so a page showing October
 * quotes the November renewal rate. When the feed has not caught up yet the
 * newest month not after the target stands in.
 */
export function pqpMonthsFor(
  publishedMonths: string[],
  month: string,
): { current: string; previous: string | undefined } | null {
  const sorted = [...publishedMonths].sort();
  if (sorted.length === 0) {
    return null;
  }

  const target = nextMonth(month);
  const eligible = sorted.filter((candidate) => candidate <= target);
  const current = eligible.at(-1) ?? sorted[0];
  const currentIndex = sorted.indexOf(current);

  return {
    current,
    previous: currentIndex > 0 ? sorted[currentIndex - 1] : undefined,
  };
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
