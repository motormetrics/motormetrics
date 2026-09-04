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
  const [year, monthPart] = month.split("-").map(Number);
  const index = year * 12 + monthPart; // already the following month
  return `${Math.floor(index / 12)}-${String((index % 12) + 1).padStart(2, "0")}`;
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

export interface DonutArc {
  color: string;
  dashArray: string;
  dashOffset: string;
  key: string;
}

/**
 * Dash geometry for a gapped-segment ring, drawn as dash offsets on a single
 * circle so the rounded caps stay consistent at any share. Lifted from the
 * shared `DonutGauge`, which stacks its legend under the ring; the Overview
 * comp puts the legend beside it.
 */
export function donutArcs(
  segments: { color: string; label: string; value: number }[],
  radius: number,
  gap: number,
): DonutArc[] {
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((sum, item) => sum + item.value, 0) || 1;

  let consumed = 0;
  return segments.map((segment) => {
    const full = (segment.value / total) * circumference;
    // Floor at 2px so a rounding-to-zero share still shows as a tick rather
    // than vanishing from the ring.
    const dash = Math.max(2, full - gap);
    const arc = {
      color: segment.color,
      dashArray: `${dash.toFixed(2)} ${(circumference - dash).toFixed(2)}`,
      dashOffset: (-(consumed + gap / 2)).toFixed(2),
      key: segment.label,
    };
    consumed += full;
    return arc;
  });
}

/** Signed month-over-month change as a ratio, `0` when there is no baseline. */
export function changeRatio(current: number, previous: number | undefined) {
  if (!previous || previous <= 0) {
    return 0;
  }
  return (current - previous) / previous;
}
