import { formatCurrency } from "@motormetrics/utils/format-currency";
import {
  biddingOrdinal,
  COE_CATEGORIES,
  type CoeExercise,
  formatExercise,
  formatMonth,
  successRate,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import type { COECategory } from "@web/types";

/** "Categories A and C", "Category B". */
const listCategories = (categories: COECategory[]): string =>
  categories.length === 1
    ? categories[0]
    : `Categories ${categories.map((category) => category.replace("Category ", "")).join(" and ")}`;

/** "the second bidding of September 2026". */
const exerciseOf = (exercise: CoeExercise): string =>
  `the ${biddingOrdinal(exercise.biddingNo)} bidding of ${formatMonth(exercise.month)}`;

/**
 * The lead under the hero, e.g. "Every category drew more bids than COEs in
 * the second bidding of September 2026; Category E was the most contested, at
 * 1.60 bids per COE."
 */
export function demandLead(latest: CoeExercise): string | undefined {
  const rows = COE_CATEGORIES.flatMap((category) => {
    const figures = latest.results[category];
    return figures?.quota
      ? [{ category, figures, ratio: figures.bidsReceived / figures.quota }]
      : [];
  });
  const top = [...rows].sort((first, second) => second.ratio - first.ratio)[0];
  if (!top) {
    return undefined;
  }

  const allOver = rows.every(
    ({ figures }) => figures.bidsReceived > figures.quota,
  );
  const opening = allOver
    ? `Every category drew more bids than COEs in ${exerciseOf(latest)}; `
    : `In ${exerciseOf(latest)}, `;
  return `${opening}${top.category} was the most contested, at ${top.ratio.toFixed(2)} bids per COE.`;
}

/**
 * The caption over the premium chart, for the categories plotted, e.g. "Of
 * the categories shown, Category C rose 28.8% over the last 26 exercises, to
 * $92,144, and Category B fell 3.2%."
 */
export function chartCaption(
  exercises: CoeExercise[],
  plotted: COECategory[],
): string | undefined {
  const moves = plotted
    .flatMap((category) => {
      const first = exercises.find((exercise) => exercise.results[category])
        ?.results[category]?.premium;
      const last = exercises.at(-1)?.results[category]?.premium;
      return first && last
        ? [{ category, change: (last - first) / first, last }]
        : [];
    })
    .sort((first, second) => second.change - first.change);
  const top = moves[0];
  const bottom = moves.at(-1);
  if (!top || !bottom) {
    return undefined;
  }

  const verb = (change: number) =>
    `${change >= 0 ? "rose" : "fell"} ${Math.abs(change * 100).toFixed(1)}%`;
  const span = `over the last ${exercises.length} exercises, to ${formatCurrency(top.last)}`;

  return moves.length === 1
    ? `${top.category} ${verb(top.change)} ${span}.`
    : `Of the categories shown, ${top.category} ${verb(top.change)} ${span}, and ${bottom.category} ${verb(bottom.change)}.`;
}

/**
 * The caption over the results table, e.g. "All five categories closed lower
 * in the second bidding of September 2026 than the exercise before; Category A
 * peaked at $133,009 in the first bidding, September 2026."
 */
export function exercisesCaption(exercises: CoeExercise[]): string | undefined {
  const latest = exercises.at(-1);
  const previous = exercises.at(-2);
  if (!latest || !previous) {
    return undefined;
  }

  const fell = COE_CATEGORIES.filter((category) => {
    const now = latest.results[category]?.premium;
    const before = previous.results[category]?.premium;
    return now !== undefined && before !== undefined && now < before;
  }).length;
  const peak = exercises.reduce<CoeExercise | undefined>(
    (best, exercise) =>
      (exercise.results["Category A"]?.premium ?? 0) >
      (best?.results["Category A"]?.premium ?? 0)
        ? exercise
        : best,
    undefined,
  );
  const lower = `${fell === COE_CATEGORIES.length ? "All five categories" : `${fell} of the five categories`} closed lower in ${exerciseOf(latest)} than the exercise before`;
  const peakPremium = peak?.results["Category A"]?.premium;

  return peak && peakPremium
    ? `${lower}; Category A peaked at ${formatCurrency(peakPremium)} in the ${formatExercise(peak).charAt(0).toLowerCase()}${formatExercise(peak).slice(1)}.`
    : `${lower}.`;
}

/**
 * The caption over the records, e.g. "Category E holds the highest premium on
 * record, $158,004 in the second bidding, October 2023; Category A set its
 * record in 2026."
 */
export function recordsCaption(
  highs: Partial<Record<COECategory, CoeExercise>>,
  latestYear: string,
): string | undefined {
  const records = COE_CATEGORIES.flatMap((category) => {
    const exercise = highs[category];
    const premium = exercise?.results[category]?.premium;
    return exercise && premium ? [{ category, exercise, premium }] : [];
  });
  const top = [...records].sort(
    (first, second) => second.premium - first.premium,
  )[0];
  if (!top) {
    return undefined;
  }

  const recent = records
    .filter(({ exercise }) => exercise.month.startsWith(latestYear))
    .map(({ category }) => category);
  const recentNote =
    recent.length === 0
      ? ""
      : `; ${listCategories(recent)} set ${recent.length === 1 ? "its record" : "their records"} in ${latestYear}`;

  return `${top.category} holds the highest premium on record, ${formatCurrency(top.premium)} in the ${formatExercise(top.exercise).charAt(0).toLowerCase()}${formatExercise(top.exercise).slice(1)}${recentNote}.`;
}

/**
 * The caption over quota and demand, e.g. "Categories C and E had the lowest
 * success rate, 59% of bids; Category D the highest, 82%."
 */
export function quotaCaption(latest: CoeExercise): string | undefined {
  const rates = COE_CATEGORIES.flatMap((category) => {
    const figures = latest.results[category];
    return figures?.bidsReceived
      ? [
          {
            category,
            rate: Math.round(
              successRate(figures.bidsSuccess, figures.bidsReceived),
            ),
          },
        ]
      : [];
  });
  if (rates.length < 2) {
    return undefined;
  }

  const low = Math.min(...rates.map(({ rate }) => rate));
  const high = Math.max(...rates.map(({ rate }) => rate));
  const lows = rates
    .filter(({ rate }) => rate === low)
    .map(({ category }) => category);
  const highs = rates
    .filter(({ rate }) => rate === high)
    .map(({ category }) => category);

  return `${listCategories(lows)} had the lowest success rate, ${low}% of bids; ${listCategories(highs)} the highest, ${high}%.`;
}
