import { loadVehicleTypeSearchParams } from "@web/app/(main)/(dashboard)/cars/vehicle-types/[type]/components/vehicle-type-shared";
import { MonthMenu } from "@web/components/shared/month-menu";
import { fetchMonthsForCars, getMonthOrLatest } from "@web/utils/dates/months";
import type { SearchParams } from "nuqs/server";

/** The header's month menu, flagging a month that had to fall back. */
export async function VehicleTypeMonthPicker({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { month: parsedMonth } =
    await loadVehicleTypeSearchParams(searchParams);

  const [months, { wasAdjusted }] = await Promise.all([
    fetchMonthsForCars(),
    getMonthOrLatest(parsedMonth, "cars"),
  ]);

  return (
    <MonthMenu
      latestMonth={months[0]}
      months={months}
      wasAdjusted={wasAdjusted}
    />
  );
}
