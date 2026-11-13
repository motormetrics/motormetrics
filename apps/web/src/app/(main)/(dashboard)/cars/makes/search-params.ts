import {
  createLoader,
  createSerializer,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs/server";

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
 * Powertrains `make-rows` can narrow its rows to, by their LTA DataMall
 * `cars.fuelType` value.
 */
export const FUEL_FILTERS = ["Petrol", "Petrol-Electric", "Electric"] as const;
export type FuelFilter = (typeof FUEL_FILTERS)[number];

export function isRange(value: string): value is Range {
  return RANGES.includes(value as Range);
}

/** The index's sort switch: most cars first, or A to Z. */
export const SORTS = ["count", "make"] as const;
export type Sort = (typeof SORTS)[number];

export const makesSearchParams = {
  /**
   * The selected make's slug. Turns the card grid into a list beside that
   * make's detail. `null` is the plain index.
   */
  make: parseAsString,
  /** Powertrain to narrow the page to. `null` is the "All" tab. */
  fuel: parseAsStringLiteral(FUEL_FILTERS),
  range: parseAsStringLiteral(RANGES).withDefault("ytd"),
  sort: parseAsStringLiteral(SORTS).withDefault("count"),
  /** The "Find a make" filter, applied in the browser as the reader types. */
  q: parseAsString.withDefault(""),
};

export const loadSearchParams = createLoader(makesSearchParams);

export type MakesSearchParams = Awaited<ReturnType<typeof loadSearchParams>>;

/**
 * Builds the make, powertrain, period and sort links on the server. Defaults
 * drop out of the query string, so the default view is plain /cars/makes.
 */
export const serialize = createSerializer(makesSearchParams);
