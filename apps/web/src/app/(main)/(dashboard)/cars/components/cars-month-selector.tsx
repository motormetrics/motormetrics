import { loadSearchParams } from "@web/app/(main)/(dashboard)/cars/search-params";
import { MonthSelector } from "@web/components/shared/month-selector";
import { fetchMonthsForCars, getMonthOrLatest } from "@web/utils/dates/months";
import type { SearchParams } from "nuqs/server";

/**
 * The month selector in the header of the cars report pages. Writes to
 * `?month=`, which every block on the page reads back.
 */
export async function CarsMonthSelector({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { month: parsedMonth } = await loadSearchParams(searchParams);

  const [{ wasAdjusted }, months] = await Promise.all([
    getMonthOrLatest(parsedMonth, "cars"),
    fetchMonthsForCars(),
  ]);

  return (
    <MonthSelector
      latestMonth={months[0]}
      months={months}
      wasAdjusted={wasAdjusted}
    />
  );
}
