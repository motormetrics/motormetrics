/**
 * How far back the monthly chart reaches. Each range is a different slice of
 * the monthly totals.
 *
 * Kept apart from `search-params.ts` so the client-side filter can import the
 * list: that module reaches the database client, which must never end up in a
 * browser bundle.
 */
export const RANGES = ["1Y", "3Y", "All"] as const;
export type Range = (typeof RANGES)[number];

/** Months fetched per range. `All` is capped high rather than unbounded. */
export const RANGE_MONTHS: Record<Range, number> = {
  "1Y": 12,
  "3Y": 36,
  All: 600,
};

/** The labels the trend range filter shows. */
export const RANGE_LABELS: Record<Range, string> = {
  "1Y": "1 year",
  "3Y": "3 years",
  All: "All",
};
