import { createLoader, parseAsString, parseAsStringLiteral } from "nuqs/server";

/**
 * Periods the make page can be read over, anchored on the selected month
 * rather than on the latest one. The vocabulary matches the Makes overview
 * (`cars/makes/search-params.ts`) so the two pages read the same way.
 */
export const RANGES = ["month", "ytd", "12m"] as const;
export type Range = (typeof RANGES)[number];

export const RANGE_LABELS: Record<Range, string> = {
  month: "This month",
  ytd: "Year to date",
  "12m": "Last 12 months",
};

export const searchParams = {
  /**
   * Fuel type to narrow the page to, as LTA records it — `Petrol`, `Electric`,
   * `Petrol-Electric (Plug-In)` and so on. `null` is the unfiltered view. Not a
   * string literal union: the values come from the data, so a new fuel type in
   * a DataMall drop should appear without a code change.
   */
  fuelType: parseAsString,
  month: parseAsString,
  range: parseAsStringLiteral(RANGES).withDefault("ytd"),
};

export const loadSearchParams = createLoader(searchParams);
