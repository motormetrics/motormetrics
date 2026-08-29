import { createLoader, parseAsString, parseAsStringLiteral } from "nuqs/server";

/**
 * How far back the monthly chart reaches. The comp draws three tabs; each one
 * is just a different `limit` on `getMonthlyRegistrationTotals()`.
 */
export const RANGES = ["1Y", "3Y", "All"] as const;
export type Range = (typeof RANGES)[number];

/** Months fetched per range. `All` is capped high rather than unbounded. */
export const RANGE_MONTHS: Record<Range, number> = {
  "1Y": 12,
  "3Y": 36,
  All: 600,
};

export const carsSearchParams = {
  month: parseAsString,
  compareA: parseAsString,
  compareB: parseAsString,
  /**
   * Fuel type to narrow the page to, as LTA records it — `Petrol`, `Electric`,
   * `Petrol-Electric (Plug-In)` and so on. `null` is the unfiltered view. Not a
   * string literal union: the values come from the data, so a new fuel type in
   * a DataMall drop should appear without a code change.
   */
  fuelType: parseAsString,
  range: parseAsStringLiteral(RANGES).withDefault("1Y"),
};

export const loadSearchParams = createLoader(carsSearchParams);
