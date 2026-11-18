import { CAR_DIMENSIONS } from "@web/app/(main)/(dashboard)/cars/components/dimensions";
import { RANGES } from "@web/app/(main)/(dashboard)/cars/components/ranges";
import { getMonthOrLatest } from "@web/utils/dates/months";
import type { SearchParams } from "nuqs/server";
import { createLoader, parseAsString, parseAsStringLiteral } from "nuqs/server";

export const searchParams = {
  month: parseAsString,
  dimension: parseAsStringLiteral(CAR_DIMENSIONS).withDefault("make"),
  /**
   * Fuel type to narrow the page to, as LTA records it — `Petrol`, `Electric`,
   * `Petrol-Electric (Plug-In)` and so on. `null` is the unfiltered view. Not a
   * string literal union: the values come from the data, so a new fuel type in
   * a DataMall drop should appear without a code change.
   */
  fuelType: parseAsString,
  range: parseAsStringLiteral(RANGES).withDefault("1Y"),
  /** The two months of "Compare two months"; unset, they follow `month`. */
  compareA: parseAsString,
  compareB: parseAsString,
};

export const loadSearchParams = createLoader(searchParams);

/**
 * The month every block on the page reads.
 *
 * Each block resolves it independently from the same promise so the page can
 * stay a static shell and stream the data blocks in, rather than awaiting the
 * search params once at the top and turning the whole route dynamic.
 */
export async function resolveCarsMonth(
  searchParamsPromise: Promise<SearchParams>,
): Promise<string> {
  const { month: requestedMonth } = await loadSearchParams(searchParamsPromise);
  const { month } = await getMonthOrLatest(requestedMonth, "cars");

  return month;
}
