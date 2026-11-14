import { formatCurrency } from "@motormetrics/utils/format-currency";
import {
  type CoeExercise,
  changeRatio,
  type ExercisePremium,
  premiumRangeStats,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import type { COECategory } from "@web/types";
import type { Pqp } from "@web/types/coe";
import { formatMonthShortName } from "@web/utils/dates/format-month";

/** Exercises the overview charts and ranges over: a year of twice-monthly bidding. */
export const HISTORY_EXERCISES = 24;

/**
 * Everything the /coe overview draws, for every category, shaped on the
 * server from cached reads. The client views pick the category in the URL.
 */
export interface CoeOverviewData {
  latest: CoeExercise;
  previous?: CoeExercise;
  /** The last `HISTORY_EXERCISES` exercises, oldest first, ending on `latest`. */
  history: CoeExercise[];
  /** The latest two months of PQP; `null` before the first is published. */
  pqp: {
    month: string;
    previousMonth?: string;
    rates: Pqp.Rates;
    previousRates?: Pqp.Rates;
  } | null;
}

/** "+5.3%", with a true minus for a fall and no colour. */
export const formatPercentChange = (ratio: number): string =>
  `${ratio < 0 ? "−" : "+"}${Math.abs(ratio * 100).toFixed(1)}%`;

/** "+$6,997", with a true minus for a fall. */
export const formatAmountChange = (difference: number): string =>
  `${difference < 0 ? "−" : "+"}${formatCurrency(Math.abs(difference))}`;

/** "Nov 2026 · 1st" — an exercise in the stats, tooltips and captions. */
export const exerciseLabel = (exercise: {
  biddingNo: number;
  month: string;
}): string =>
  `${formatMonthShortName(exercise.month)} ${exercise.month.slice(0, 4)} · ${exercise.biddingNo === 1 ? "1st" : "2nd"}`;

/** One category's premium across the history, oldest first. */
export function categoryHistory(
  history: CoeExercise[],
  category: COECategory,
): ExercisePremium[] {
  return history.flatMap((exercise) => {
    const premium = exercise.results[category]?.premium;
    return premium === undefined
      ? []
      : [{ biddingNo: exercise.biddingNo, month: exercise.month, premium }];
  });
}

/**
 * Where the latest premium sits between the window's low and high, for
 * Direction D's range hero: "Highest in 24 exercises", "Lowest in 24
 * exercises" or "3.1% below the high".
 */
export function rangePosition(series: ExercisePremium[]) {
  const stats = premiumRangeStats(series);
  if (!stats) {
    return undefined;
  }

  const { high, latest, low } = stats;
  const span = `${series.length} exercises`;
  const where =
    latest.premium >= high.premium
      ? `Highest in ${span}`
      : latest.premium <= low.premium
        ? `Lowest in ${span}`
        : `${(((high.premium - latest.premium) / high.premium) * 100).toFixed(1)}% below the high`;

  return { ...stats, where };
}

/** Mean premium across a run of exercises; 0 for an empty run. */
export const averagePremium = (series: ExercisePremium[]): number =>
  series.length === 0
    ? 0
    : series.reduce((total, exercise) => total + exercise.premium, 0) /
      series.length;

/**
 * A category's PQP and its change on the previous month. `undefined` for
 * Category E, which LTA publishes no PQP for.
 */
export function pqpFor(data: CoeOverviewData, category: COECategory) {
  if (!data.pqp || category === "Category E") {
    return undefined;
  }

  const key = category as keyof Pqp.Rates;
  const rate = data.pqp.rates[key];
  if (rate === undefined) {
    return undefined;
  }

  const previous = data.pqp.previousRates?.[key];
  return {
    change: previous ? changeRatio(rate, previous) : undefined,
    rate,
  };
}

/** "1.70", bids per COE; a dash when the quota is missing. */
export function bidsPerCoe(
  figures: { bidsReceived: number; quota: number } | undefined,
): string {
  return figures?.quota
    ? (figures.bidsReceived / figures.quota).toFixed(2)
    : "—";
}

/**
 * The caption under the bidding history, e.g. "Category A premiums ranged from
 * $102,009 (Mar 2026 · 1st) to $139,001 (Nov 2026 · 1st) over the last 24
 * exercises, a change of +27.5% from start to end."
 */
export function historyCaption(
  category: COECategory,
  series: ExercisePremium[],
): string | undefined {
  const stats = premiumRangeStats(series);
  if (!stats) {
    return undefined;
  }

  return `${category} premiums ranged from ${formatCurrency(stats.low.premium)} (${exerciseLabel(stats.low)}) to ${formatCurrency(stats.high.premium)} (${exerciseLabel(stats.high)}) over the last ${series.length} exercises, a change of ${formatPercentChange(stats.change)} from start to end.`;
}

/**
 * The caption over the bids-against-quota figure, e.g. "Category E drew the
 * most bids per certificate (1.76) and Category D the fewest (1.15); every
 * category received more bids than it had COEs."
 */
export function demandCaption(latest: CoeExercise): string | undefined {
  const ratios = Object.entries(latest.results).flatMap(
    ([category, figures]) =>
      figures?.quota
        ? [
            {
              category,
              over: figures.bidsReceived > figures.quota,
              ratio: figures.bidsReceived / figures.quota,
            },
          ]
        : [],
  );
  if (ratios.length < 2) {
    return undefined;
  }

  const sorted = [...ratios].sort(
    (first, second) => second.ratio - first.ratio,
  );
  const most = sorted[0];
  const fewest = sorted[sorted.length - 1];
  const allOver = ratios.every((row) => row.over);

  return `${most.category} drew the most bids per certificate (${most.ratio.toFixed(2)}) and ${fewest.category} the fewest (${fewest.ratio.toFixed(2)})${allOver ? "; every category received more bids than it had COEs." : "."}`;
}
