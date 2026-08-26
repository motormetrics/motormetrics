import { createLoader, parseAsString, parseAsStringLiteral } from "nuqs/server";

/**
 * Periods the Makes page can be read over. `ytd` is the comp's default and the
 * only one `getMakeRegistrationStats()` reports directly; the other two are
 * derived from the same query's rolling trend.
 */
export const RANGES = ["month", "ytd", "12m"] as const;
export type Range = (typeof RANGES)[number];

export const RANGE_LABELS: Record<Range, string> = {
  month: "This month",
  ytd: "Year to date",
  "12m": "Last 12 months",
};

export const searchParams = {
  /** Fuel type to narrow the table to. `null` is the "All" tab. */
  fuel: parseAsString,
  range: parseAsStringLiteral(RANGES).withDefault("ytd"),
};

export const loadSearchParams = createLoader(searchParams);
