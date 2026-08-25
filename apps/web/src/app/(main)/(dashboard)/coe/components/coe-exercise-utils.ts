import type { COECategory, COEResult } from "@web/types";
import type { CategoryKey } from "./search-params";

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

const ORDINALS = ["first", "second", "third"];

/** `1` → "first". Falls back to the bare number for an unexpected round. */
export const biddingOrdinal = (biddingNo: number): string =>
  ORDINALS[biddingNo - 1] ?? `round ${biddingNo}`;

const monthDate = (month: string) => {
  const [year, monthPart] = month.split("-");
  return new Date(Number(year), Number(monthPart) - 1);
};

export const formatMonth = (
  month: string,
  style: "long" | "short" = "long",
): string =>
  monthDate(month).toLocaleString("en-SG", { month: style, year: "numeric" });

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
}): string =>
  `${monthDate(exercise.month).toLocaleString("en-SG", { month: "short" })} ${exercise.biddingNo}`;

/**
 * Signed change as a ratio. Returns 0 when there is no usable baseline, which
 * every caller renders as "no movement" rather than as an infinite jump.
 */
export const changeRatio = (current: number, previous: number): number =>
  previous > 0 ? (current - previous) / previous : 0;

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
