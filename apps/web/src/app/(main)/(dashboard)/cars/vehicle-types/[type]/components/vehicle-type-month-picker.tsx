import { loadVehicleTypeSearchParams } from "@web/app/(main)/(dashboard)/cars/vehicle-types/[type]/components/vehicle-type-shared";
import { MonthMenu } from "@web/components/shared/month-menu";
import { fetchMonthsForCars, getMonthOrLatest } from "@web/utils/dates/months";
import type { SearchParams } from "nuqs/server";

/** The header's month menu, flagging a month that had to fall back. */
export async function VehicleTypeMonthPicker({
  pathname,
  searchParams,
}: {
  pathname: string;
  searchParams: Promise<SearchParams>;
}) {
  const [{ month: parsedMonth }, query] = await Promise.all([
    loadVehicleTypeSearchParams(searchParams),
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
