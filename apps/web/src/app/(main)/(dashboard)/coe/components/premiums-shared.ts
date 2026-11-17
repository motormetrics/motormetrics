import { formatCurrency } from "@motormetrics/utils/format-currency";
import {
  formatMonth,
  type PremiumRangeStats,
  premiumRangeStats,
  successRate,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import type { CategoryExercise } from "@web/queries/coe";

/** "Sep 2026 · 2nd", the short name for an exercise. */
export const exerciseStamp = (exercise: { biddingNo: number; month: string }) =>
  `${formatMonth(exercise.month, "short")} · ${exercise.biddingNo === 1 ? "1st" : "2nd"}`;

/** "+1.2%", with a true minus for a fall. */
export const formatSignedPercent = (ratio: number): string =>
  `${ratio < 0 ? "−" : "+"}${Math.abs(ratio * 100).toFixed(1)}%`;

/** "+$1,500", with a true minus for a fall. */
export const formatSignedCurrency = (amount: number): string =>
  `${amount < 0 ? "−" : "+"}${formatCurrency(Math.abs(amount))}`;

/**
 * Where the latest value sits in its window, for the range hero: "Highest in
 * 24 exercises", "Lowest in 12 months" or "4.2% below the high".
 */
export function rangePosition(
  low: number,
  high: number,
  latest: number,
  span: string,
): string {
  if (latest >= high) {
    return `Highest in ${span}`;
  }
  if (latest <= low) {
    return `Lowest in ${span}`;
  }
  return `${(((high - latest) / high) * 100).toFixed(1)}% below the high`;
}

/**
 * The lead under the head, e.g. "1,193 bids were made for 1,507 Category A
 * certificates, and 79% of them succeeded."
 */
export function premiumsLead(
  latest: CategoryExercise,
  category: string,
): string {
  if (latest.quota <= 0 || latest.bidsReceived <= 0) {
    return `${category} closed at ${formatCurrency(latest.premium)}.`;
  }

  const rate = successRate(latest.bidsSuccess, latest.bidsReceived);
  return `${latest.bidsReceived.toLocaleString("en-SG")} bids were made for ${latest.quota.toLocaleString("en-SG")} ${category} certificates, and ${rate.toFixed(0)}% of them succeeded.`;
}

/**
 * The caption over the premium chart, e.g. "Category A premiums ranged from
 * $X (Jan 2026 · 1st) to $Y (Sep 2026 · 2nd) over these 24 exercises, a change
 * of +4.1% from start to end."
 */
export function historyCaption(
  view: CategoryExercise[],
  category: string,
): string | undefined {
  const stats = premiumRangeStats(view);
  if (!stats || view.length < 2) {
    return undefined;
  }

  return `${category} premiums ranged from ${formatCurrency(stats.low.premium)} (${exerciseStamp(stats.low)}) to ${formatCurrency(stats.high.premium)} (${exerciseStamp(stats.high)}) over these ${view.length} exercises, a change of ${formatSignedPercent(stats.change)} from start to end.`;
}

/** One category's result for the all-categories caption. */
export interface CategoryResult {
  key: string;
  premium: number;
  /** Change on the previous exercise; null without one. */
  changeRatio: number | null;
}

const COUNT_WORDS = ["none", "one", "two", "three", "four", "five"];

/**
 * The caption over the all-categories table, e.g. "Category E closed highest,
 * at $137,000; three of the five categories closed lower than in the 1st
 * exercise of September 2026."
 */
export function allCategoriesCaption(
  rows: CategoryResult[],
  previousLabel: string | null,
): string | undefined {
  const top = rows.reduce<CategoryResult | undefined>(
    (best, row) => (!best || row.premium > best.premium ? row : best),
    undefined,
  );
  if (!top || top.premium <= 0) {
    return undefined;
  }

  const highest = `Category ${top.key} closed highest, at ${formatCurrency(top.premium)}`;
  if (!previousLabel) {
    return `${highest}.`;
  }

  const fell = rows.filter(
    (row) => row.changeRatio !== null && row.changeRatio < 0,
  ).length;
  const total = COUNT_WORDS[rows.length] ?? String(rows.length);
  const count =
    fell === rows.length
      ? `all ${total} categories`
      : `${COUNT_WORDS[fell] ?? fell} of the ${total} categories`;

  return `${highest}; ${count} closed lower than in the ${previousLabel}.`;
}

/**
 * The caption over the bidding history, e.g. "The Category A success rate
 * ranged from 47% (Jan 2026 · 1st) to 82% (Dec 2025 · 1st) over these 12
 * exercises." Takes the rows most recent first; the latest wins a tie.
 */
export function successRateCaption(
  rows: CategoryExercise[],
  category: string,
): string | undefined {
  const rated = rows
    .filter(({ bidsReceived }) => bidsReceived > 0)
    .map((exercise) => ({
      exercise,
      rate: Math.round(
        successRate(exercise.bidsSuccess, exercise.bidsReceived),
      ),
    }));
  const [first] = rated;
  if (!first) {
    return undefined;
  }

  let low = first;
  let high = first;
  for (const entry of rated) {
    if (entry.rate < low.rate) {
      low = entry;
    }
    if (entry.rate > high.rate) {
      high = entry;
    }
  }

  return `The ${category} success rate ranged from ${low.rate}% (${exerciseStamp(low.exercise)}) to ${high.rate}% (${exerciseStamp(high.exercise)}) over these ${rows.length} exercises.`;
}

/**
 * The caption over the premium range, e.g. "Category A has moved by $12,000
 * in 2026 to date; its all-time high is $137,000 (Sep 2026 · 2nd), set this
 * year."
 */
export function rangeCaption(
  category: string,
  year: number,
  yearRange: PremiumRangeStats | undefined,
  allTimeRange: PremiumRangeStats | undefined,
): string | undefined {
  if (!yearRange || !allTimeRange) {
    return undefined;
  }

  const { high } = allTimeRange;
  const setThisYear = high.month.startsWith(`${year}-`);

  return `${category} has moved by ${formatCurrency(yearRange.high.premium - yearRange.low.premium)} in ${year} to date; its all-time high is ${formatCurrency(high.premium)} (${exerciseStamp(high)})${setThisYear ? ", set this year." : "."}`;
}
