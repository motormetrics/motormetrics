import { formatPercentage } from "@motormetrics/utils/format-percentage";
import { changeRatio } from "@web/utils/change-ratio";
import {
  formatMonthLabel,
  formatMonthName,
} from "@web/utils/dates/format-month";

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

/** Fewer months back and "the most since" is noise. */
const MIN_SINCE_MONTHS = 3;

/**
 * The summary line under a monthly chart, e.g. "April 2026: 4,210 new cars
 * registered, up 6.2% on March, the most since December 2025; BMW led." Plain
 * text gives search engines the month as a sentence, not only as chart bars.
 * `detail` is the page's own closing clause.
 */
export function summariseMonth(
  series: MonthTotal[],
  month: string,
  unit: string,
  detail?: string,
): string | undefined {
  const index = series.findIndex((row) => row.month === month);
  if (index < 0) {
    return undefined;
  }

  const { total } = series[index];
  const parts = [
    `${formatMonthLabel(month)}: ${total.toLocaleString("en-SG")} ${unit}`,
  ];
  const earlier = series.slice(0, index);
  const previous = earlier.at(-1);

  if (previous && previous.total > 0) {
    const ratio = changeRatio(total, previous.total);
    const previousName =
      previous.month.slice(0, 4) === month.slice(0, 4)
        ? formatMonthName(previous.month)
        : formatMonthLabel(previous.month);

    if (ratio === 0) {
      parts.push(`unchanged on ${previousName}`);
    } else {
      const rose = ratio > 0;
      parts.push(
        `${rose ? "up" : "down"} ${formatPercentage(Math.abs(ratio * 100))} on ${previousName}`,
      );

      // The last earlier month that matched or beat this total, or for a
      // fall, the last one at or below it.
      const sinceIndex = earlier.findLastIndex((row) =>
        rose ? row.total >= total : row.total <= total,
      );
      if (sinceIndex >= 0 && index - sinceIndex >= MIN_SINCE_MONTHS) {
        parts.push(
          `the ${rose ? "most" : "fewest"} since ${formatMonthLabel(earlier[sinceIndex].month)}`,
        );
      }
    }
  }

  return `${parts.join(", ")}${detail ? `; ${detail}` : ""}.`;
}
