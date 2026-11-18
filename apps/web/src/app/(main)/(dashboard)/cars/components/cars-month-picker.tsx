import { loadSearchParams } from "@web/app/(main)/(dashboard)/cars/search-params";
import { MonthSelect } from "@web/components/shared/month-select";
import { getCarsMonths } from "@web/queries/cars";
import { getMonthOrLatest } from "@web/utils/dates/months";
import type { SearchParams } from "nuqs/server";

/**
 * The month select in the page head. Writes to `?month=`, which every block
 * on the page reads back.
 */
export async function CarsMonthPicker({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const [{ month: requestedMonth }, monthRows] = await Promise.all([
    loadSearchParams(searchParams),
    getCarsMonths(),
  ]);

  if (monthRows.length === 0) {
    return null;
  }

  const months = monthRows.map((row) => row.month);
  const { wasAdjusted } = await getMonthOrLatest(requestedMonth, "cars");

  return (
    <MonthSelect
      latestMonth={months[0]}
      months={months}
      wasAdjusted={wasAdjusted}
    />
  );
}
