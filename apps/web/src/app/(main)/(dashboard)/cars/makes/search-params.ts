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

/**
 * The powertrain tabs above the table. `Hybrid` is not a `cars.fuelType` value
 * but the family `HYBRID_REGEX` describes; `make-rows` resolves it into the
 * breakdown queries it needs. Kept here, away from the queries, so the client
 * tabs can import it without dragging the cached loaders into the browser.
 */
export const FUEL_FILTERS = ["Petrol", "Hybrid", "Electric"] as const;
export type FuelFilter = (typeof FUEL_FILTERS)[number];

export function isFuelFilter(value: string | null): value is FuelFilter {
  return FUEL_FILTERS.includes(value as FuelFilter);
}

export const searchParams = {
  /** Fuel type to narrow the table to. `null` is the "All" tab. */
  fuel: parseAsString,
  range: parseAsStringLiteral(RANGES).withDefault("ytd"),
};

export const loadSearchParams = createLoader(searchParams);
