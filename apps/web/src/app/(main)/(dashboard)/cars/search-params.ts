import { CAR_DIMENSIONS } from "@web/app/(main)/(dashboard)/cars/components/dimensions";
import { getMonthOrLatest } from "@web/utils/dates/months";
import type { SearchParams } from "nuqs/server";
import { createLoader, parseAsString, parseAsStringLiteral } from "nuqs/server";

export const searchParams = {
  month: parseAsString,
  dimension: parseAsStringLiteral(CAR_DIMENSIONS).withDefault("make"),
};

export const loadSearchParams = createLoader(searchParams);

/**
 * The month every block on the Cars overview reads.
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
