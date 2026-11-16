import { loadFuelTypeSearchParams } from "@web/app/(main)/(dashboard)/cars/fuel-types/[type]/components/fuel-type-shared";
import { MonthMenu } from "@web/components/shared/month-menu";
import { fetchMonthsForCars, getMonthOrLatest } from "@web/utils/dates/months";
import type { SearchParams } from "nuqs/server";

/** The header's month menu, flagging a month that had to fall back. */
export async function FuelTypeMonthPicker({
  pathname,
  searchParams,
}: {
  pathname: string;
  searchParams: Promise<SearchParams>;
}) {
  const [{ month: parsedMonth }, query] = await Promise.all([
    loadFuelTypeSearchParams(searchParams),
    searchParams,
  ]);

  const [months, { month, wasAdjusted }] = await Promise.all([
    fetchMonthsForCars(),
    getMonthOrLatest(parsedMonth, "cars"),
  ]);

  return (
    <MonthMenu
      latestMonth={months[0]}
      month={month}
      months={months}
      pathname={pathname}
      query={query}
      wasAdjusted={wasAdjusted}
    />
  );
}
