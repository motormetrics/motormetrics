import { formatCurrency } from "@motormetrics/utils/format-currency";
import type { CategoryKey } from "@web/app/(main)/(dashboard)/coe/components/search-params";
import type { COECategory, COEResult } from "@web/types";
import {
  formatMonthLabel,
  formatMonthShortLabel,
  formatMonthShortName,
} from "@web/utils/dates/format-month";

export const COE_CATEGORIES: COECategory[] = [
  "Category A",
  "Category B",
  "Category C",
  "Category D",
  "Category E",
];

/** The one-line note under each category name in the "All categories" table. */
export const CATEGORY_DESCRIPTIONS: Record<COECategory, string> = {
  "Category A": "Cars up to 1,600cc and 130bhp",
  "Category B": "Cars above 1,600cc or 130bhp",
  "Category C": "Goods vehicles and buses",
  "Category D": "Motorcycles",
  "Category E": "Open category",
};

export const toCategory = (key: CategoryKey): COECategory =>
  `Category ${key}` as COECategory;

export const toCategoryKey = (category: COECategory): CategoryKey =>
  category.replace("Category ", "") as CategoryKey;

export interface CategoryFigures {
  bidsReceived: number;
  bidsSuccess: number;
  premium: number;
  quota: number;
}

export interface CoeExercise {
  biddingNo: number;
  /** Stable identity for a bidding exercise, e.g. `2026-04:2`. */
  key: string;
  month: string;
  results: Partial<Record<COECategory, CategoryFigures>>;
}

/**
 * Collapse flat `coe` rows into one entry per bidding exercise, oldest first.
 *
 * A bidding exercise is `(month, biddingNo)` — the unit every block on this
 * page counts in — so the shaping happens once here rather than in each block.
 */
export function groupByExercise(results: COEResult[]): CoeExercise[] {
  const exercises = new Map<string, CoeExercise>();

  for (const result of results) {
    const key = `${result.month}:${result.biddingNo}`;
    const exercise = exercises.get(key) ?? {
      biddingNo: result.biddingNo,
      key,
      month: result.month,
      results: {},
    };

    exercise.results[result.vehicleClass] = {
      bidsReceived: result.bidsReceived,
      bidsSuccess: result.bidsSuccess,
      premium: result.premium,
      quota: result.quota,
    };
    exercises.set(key, exercise);
  }

  return Array.from(exercises.values()).sort(
    (first, second) =>
      first.month.localeCompare(second.month) ||
      first.biddingNo - second.biddingNo,
  );
}

interface CategoryYear {
  average: number;
  high: number;
  low: number;
}

export interface CoeYear {
  year: string;
  categories: Partial<Record<COECategory, CategoryYear>>;
}

/**
 * Average, high and low closing premium per category for each calendar year,
 * newest first. The average is across every exercise in the year, so a year
 * still in progress averages only the exercises held so far.
 */
export function summariseByYear(exercises: CoeExercise[]): CoeYear[] {
  const premiumsByYear = new Map<string, Map<COECategory, number[]>>();

  for (const exercise of exercises) {
    const year = exercise.month.slice(0, 4);
    const categories = premiumsByYear.get(year) ?? new Map();

    for (const category of COE_CATEGORIES) {
      const premium = exercise.results[category]?.premium;
      if (premium === undefined) {
        continue;
      }
      categories.set(category, [...(categories.get(category) ?? []), premium]);
    }
    premiumsByYear.set(year, categories);
  }

  return Array.from(premiumsByYear, ([year, categories]) => ({
    year,
    categories: Object.fromEntries(
      Array.from(categories, ([category, premiums]) => [
        category,
        {
          average: Math.round(
            premiums.reduce((total, premium) => total + premium, 0) /
              premiums.length,
          ),
          high: Math.max(...premiums),
          low: Math.min(...premiums),
        },
      ]),
    ),
  })).sort((first, second) => second.year.localeCompare(first.year));
}

/**
 * The exercise with the highest closing premium per category. The earliest
 * exercise wins a tie, so the record names when the high was first set.
 */
export function recordHighs(
  exercises: CoeExercise[],
): Partial<Record<COECategory, CoeExercise>> {
  const highs: Partial<Record<COECategory, CoeExercise>> = {};

  for (const exercise of exercises) {
    for (const category of COE_CATEGORIES) {
      const premium = exercise.results[category]?.premium;
      const record = highs[category]?.results[category]?.premium;
      if (premium !== undefined && (record === undefined || premium > record)) {
        highs[category] = exercise;
      }
    }
  }

  return highs;
}

const ORDINALS = ["first", "second", "third"];

/** `1` → "first". Falls back to the bare number for an unexpected round. */
export const biddingOrdinal = (biddingNo: number): string =>
  ORDINALS[biddingNo - 1] ?? `round ${biddingNo}`;

export const formatMonth = (
  month: string,
  style: "long" | "short" = "long",
): string =>
  style === "short" ? formatMonthShortLabel(month) : formatMonthLabel(month);

/** "Second bidding, April 2026" — the page's name for an exercise. */
export const formatExercise = (exercise: {
  biddingNo: number;
  month: string;
}): string => {
  const ordinal = biddingOrdinal(exercise.biddingNo);
  const name = ordinal.charAt(0).toUpperCase() + ordinal.slice(1);
  return `${name} bidding, ${formatMonth(exercise.month)}`;
};

/** "Apr 2" — the column labels on the premiums chart. */
export const formatExerciseTick = (exercise: {
  biddingNo: number;
  month: string;
}): string => `${formatMonthShortName(exercise.month)} ${exercise.biddingNo}`;

export { changeRatio } from "@web/utils/change-ratio";

/**
 * The grey sentence under the headline premium, e.g. "+2.0% (+$2,610) vs first
 * bidding, Sep at $130,500". Signs use a true minus (U+2212), never colour.
 */
export function formatPremiumChange(
  premium: number,
  previous?: { biddingNo: number; month: string; premium: number },
): string {
  if (!previous?.premium) {
    return "No earlier exercise to compare";
  }

  const difference = premium - previous.premium;
  const sign = difference < 0 ? "−" : "+";
  const percentage = Math.abs((difference / previous.premium) * 100).toFixed(1);

  return `${sign}${percentage}% (${sign}${formatCurrency(Math.abs(difference))}) vs ${biddingOrdinal(previous.biddingNo)} bidding, ${formatMonthShortName(previous.month)} at ${formatCurrency(previous.premium)}`;
}

export interface ExercisePremium {
  biddingNo: number;
  month: string;
  premium: number;
}

export interface PremiumRangeStats {
  /** The exercise the range opens on, which the change is measured from. */
  first: ExercisePremium;
  high: ExercisePremium;
  latest: ExercisePremium;
  low: ExercisePremium;
  /** Change from the first exercise to the latest, as a ratio. */
  change: number;
}

/**
 * Latest, high and low premium across a run of exercises, oldest first, and
 * the change from its first exercise to its last. The earliest exercise wins a
 * tie for the high or the low. `undefined` for an empty run.
 */
export function premiumRangeStats(
  view: ExercisePremium[],
): PremiumRangeStats | undefined {
  const first = view[0];
  const latest = view.at(-1);
  if (!first || !latest) {
    return undefined;
  }

  let high = first;
  let low = first;
  for (const exercise of view) {
    if (exercise.premium > high.premium) {
      high = exercise;
    }
    if (exercise.premium < low.premium) {
      low = exercise;
    }
  }

  return {
    change: first.premium
      ? (latest.premium - first.premium) / first.premium
      : 0,
    first,
    high,
    latest,
    low,
  };
}

const AXIS_STEPS = [
  250, 500, 1000, 2000, 2500, 5000, 10_000, 20_000, 25_000, 50_000, 100_000,
];

/**
 * Y-axis ticks for a premium chart: a round step of about a quarter of the
 * range, running from just below the lowest value to just above the highest.
 * A flat series still gets two ticks, so the line sits on a real scale.
 */
export function premiumAxisTicks(values: number[]): number[] {
  if (values.length === 0) {
    return [];
  }

  const high = Math.max(...values);
  const low = Math.min(...values);
  const step =
    AXIS_STEPS.find((candidate) => candidate >= (high - low) / 4) ??
    AXIS_STEPS[AXIS_STEPS.length - 1];
  const first = Math.floor(low / step) * step;
  const last = Math.max(Math.ceil(high / step) * step, first + step);

  return Array.from(
    { length: (last - first) / step + 1 },
    (_, index) => first + index * step,
  );
}

export interface BidsAgainstQuotaRow {
  bids: number;
  /** Bid bar width, as a percentage of the shared scale. */
  bidWidth: number;
  category: COECategory;
  /** Bids beyond the quota; 0 when bids fall short of it. */
  overflow: number;
  quota: number;
  /** Quota span width, as a percentage of the shared scale. */
  quotaWidth: number;
  /** Bids per COE to 2 decimal places, e.g. "1.67". */
  ratio: string;
}

/**
 * Bids and quota per category for one exercise, on one zero-based scale set
 * by the largest figure in the exercise, so every bar reads against the same
 * axis and no quota span runs past the track.
 */
export function bidsAgainstQuota(exercise: CoeExercise): BidsAgainstQuotaRow[] {
  const figures = COE_CATEGORIES.map((category) => ({
    bids: exercise.results[category]?.bidsReceived ?? 0,
    category,
    quota: exercise.results[category]?.quota ?? 0,
  }));
  const scale = Math.max(
    ...figures.flatMap((figure) => [figure.bids, figure.quota]),
    1,
  );

  return figures.map(({ bids, category, quota }) => ({
    bidWidth: (bids / scale) * 100,
    bids,
    category,
    overflow: Math.max(bids - quota, 0),
    quota,
    quotaWidth: (quota / scale) * 100,
    ratio: (quota > 0 ? bids / quota : 0).toFixed(2),
  }));
}

/** Successful bids as a percentage of bids received; 0 when none were received. */
export function successRate(bidsSuccess: number, bidsReceived: number): number {
  return bidsReceived > 0 ? (bidsSuccess / bidsReceived) * 100 : 0;
}

/**
 * The exercise that follows the given one: the second round of the same month,
 * or the first round of the next month.
 *
 * Derived from the data rather than from the calendar, so the bidding calendar
 * panel needs no current-time read (see `components/footer.tsx`).
 */
export function nextExercise(exercise: { biddingNo: number; month: string }): {
  biddingNo: number;
  month: string;
} {
  if (exercise.biddingNo < 2) {
    return { biddingNo: exercise.biddingNo + 1, month: exercise.month };
  }

  const [year, monthPart] = exercise.month.split("-").map(Number);
  const rollsOver = monthPart === 12;

  return {
    biddingNo: 1,
    month: rollsOver
      ? `${year + 1}-01`
      : `${year}-${String(monthPart + 1).padStart(2, "0")}`,
  };
}
