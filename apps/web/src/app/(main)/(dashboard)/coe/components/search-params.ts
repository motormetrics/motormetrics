import { createLoader, parseAsStringLiteral } from "nuqs/server";

/**
 * URL state for the COE overview bento.
 *
 * Kept separate from `coe/search-params.ts` — that loader is shared with
 * `/coe/premiums` and `/coe/results`, which have no category or range control.
 *
 * The category travels as a bare letter so the URL reads `?category=B` rather
 * than the encoded `?category=Category%20B`.
 */
export const CATEGORY_KEYS = ["A", "B", "C", "D", "E"] as const;
export type CategoryKey = (typeof CATEGORY_KEYS)[number];

/**
 * Range tabs, counted in bidding exercises rather than months: two exercises
 * run each month, so a month-based window would give the column chart an
 * awkward number of bars.
 */
export const EXERCISE_RANGES = ["6", "12", "24"] as const;
export type ExerciseRange = (typeof EXERCISE_RANGES)[number];

export const RANGE_LABELS: Record<ExerciseRange, string> = {
  "6": "Last 6 exercises",
  "12": "Last 12 exercises",
  "24": "Last 24 exercises",
};

export const coeOverviewSearchParams = {
  category: parseAsStringLiteral(CATEGORY_KEYS).withDefault("A"),
  range: parseAsStringLiteral(EXERCISE_RANGES).withDefault("12"),
};

export const loadCoeOverviewSearchParams = createLoader(
  coeOverviewSearchParams,
);
