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

export function isRange(value: string): value is Range {
  return RANGES.includes(value as Range);
}

export function isFuelFilter(value: string | null): value is FuelFilter {
  return FUEL_FILTERS.includes(value as FuelFilter);
}

/** Columns the "All makes" table can be sorted by. */
export const SORT_KEYS = ["count", "make", "yoyChange"] as const;
export type SortKey = (typeof SORT_KEYS)[number];

export const SORT_DIRECTIONS = ["asc", "desc"] as const;
export type SortDirection = (typeof SORT_DIRECTIONS)[number];

/**
 * The table sort, shared by the server loader and the client table so both
 * read `?sort=…&dir=…` the same way. The defaults are the table's natural
 * order, and nuqs clears a default from the URL, so the default view stays
 * clean.
 */
export const sortSearchParams = {
  sort: parseAsStringLiteral(SORT_KEYS).withDefault("count"),
  dir: parseAsStringLiteral(SORT_DIRECTIONS).withDefault("desc"),
};

/** The fields the table sort reads, so the server and the client sort alike. */
interface SortableMakeRow {
  count: number;
  make: string;
  yoyChange: number | null;
}

function compareRows(
  a: SortableMakeRow,
  b: SortableMakeRow,
  key: SortKey,
): number {
  if (key === "make") {
    return a.make.localeCompare(b.make);
  }
  if (key === "yoyChange") {
    // A make with no prior year to compare against sorts as the lowest value
    // rather than pretending to be a 0% change.
    const left = a.yoyChange ?? Number.NEGATIVE_INFINITY;
    const right = b.yoyChange ?? Number.NEGATIVE_INFINITY;
    if (left === right) {
      return 0;
    }
    return left < right ? -1 : 1;
  }
  return a.count - b.count;
}

/**
 * Orders the table rows by `?sort=…&dir=…`. The server applies it to the rows
 * it hands over, so the first render is already in the URL's order, and the
 * client applies it again on every re-sort.
 */
export function sortMakeRows<Row extends SortableMakeRow>(
  rows: readonly Row[],
  sort: SortKey,
  dir: SortDirection,
): Row[] {
  return [...rows].sort((a, b) => {
    const order = compareRows(a, b, sort);
    return dir === "desc" ? -order : order;
  });
}

export const searchParams = {
  /** Fuel type to narrow the table to. `null` is the "All" tab. */
  fuel: parseAsString,
  range: parseAsStringLiteral(RANGES).withDefault("ytd"),
  ...sortSearchParams,
};

export const loadSearchParams = createLoader(searchParams);
