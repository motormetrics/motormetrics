import { formatCurrency } from "@motormetrics/utils/format-currency";
import type { COECategory, COEResult } from "@web/types";
import {
  formatMonthLabel,
  formatMonthShortLabel,
} from "@web/utils/dates/format-month";

/** A COE category as a bare letter, e.g. `"B"` for Category B. */
export type CategoryKey = "A" | "B" | "C" | "D" | "E";

export const COE_CATEGORIES: COECategory[] = [
  "Category A",
  "Category B",
  "Category C",
  "Category D",
  "Category E",
];

/**
 * Categories A and B are read side by side until LTA's merged car category is
 * in force, so selecting either on the overview shows both. Remove once the
 * merger takes effect.
 */
export const toCategory = (key: CategoryKey): COECategory =>
  `Category ${key}` as COECategory;

export const toCategoryKey = (category: COECategory): CategoryKey =>
  category.replace("Category ", "") as CategoryKey;

interface CategoryFigures {
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

export { changeRatio } from "@web/utils/change-ratio";

/** Three months of twice-monthly bidding: a shorter "highest since" is noise. */
const _MIN_SINCE_EXERCISES = 6;

/** "up $4,200 on September", "down $900 on September" or "level with September". */
const _describeChange = (
  current: number,
  previous: number,
  against: string,
) => {
  const difference = current - previous;
  if (difference === 0) {
    return `level with ${against}`;
  }
  return `${difference > 0 ? "up" : "down"} ${formatCurrency(Math.abs(difference))} on ${against}`;
};

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

/** Successful bids as a percentage of bids received; 0 when none were received. */
export function successRate(bidsSuccess: number, bidsReceived: number): number {
  return bidsReceived > 0 ? (bidsSuccess / bidsReceived) * 100 : 0;
}
