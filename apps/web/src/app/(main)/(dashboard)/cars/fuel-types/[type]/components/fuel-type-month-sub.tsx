import { loadFuelTypeSearchParams } from "@web/app/(main)/(dashboard)/cars/fuel-types/[type]/components/fuel-type-shared";
import { formatMonthLabel } from "@web/utils/dates/format-month";
import { getMonthOrLatest } from "@web/utils/dates/months";
import type { SearchParams } from "nuqs/server";

/** Names what the page counts, the month it reports and its source. */
export async function FuelTypeMonthSub({
  name,
  searchParams,
}: {
  name: string;
  searchParams: Promise<SearchParams>;
}) {
  const { month: parsedMonth } = await loadFuelTypeSearchParams(searchParams);
  const { month } = await getMonthOrLatest(parsedMonth, "cars");

  return (
    <>
      New car registrations recorded as {name}, not the fleet on the road ·{" "}
      <span className="font-semibold text-foreground">
        {formatMonthLabel(month)}
      </span>{" "}
      · Source: LTA via DataMall
    </>
  );
}
