import { periodRange } from "@web/app/(main)/(dashboard)/cars/vehicle-types/[type]/components/period";
import { loadVehicleTypeSearchParams } from "@web/app/(main)/(dashboard)/cars/vehicle-types/[type]/components/vehicle-type-shared";
import { getMonthOrLatest } from "@web/utils/dates/months";
import type { SearchParams } from "nuqs/server";

/** Names the months the page reports, what it counts and its source. */
export async function VehicleTypePeriodSub({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { month: parsedMonth, period } =
    await loadVehicleTypeSearchParams(searchParams);
  const { month } = await getMonthOrLatest(parsedMonth, "cars");

  return (
    <>
      <span className="font-semibold text-foreground">
        {periodRange(period, month)}
      </span>{" "}
      · new registrations, not the fleet on the road · Source: LTA via DataMall
    </>
  );
}
