import { RANGES } from "@web/app/(main)/(dashboard)/cars/makes/search-params";
import { createLoader, parseAsString, parseAsStringLiteral } from "nuqs/server";

/**
 * Periods the make page can be read over, anchored on the selected month
 * rather than on the latest one. The vocabulary is the Makes overview's
 * (`cars/makes/search-params.ts`) so the two pages read the same way.
 */
export {
  RANGE_LABELS,
  RANGES,
  type Range,
} from "@web/app/(main)/(dashboard)/cars/makes/search-params";

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
