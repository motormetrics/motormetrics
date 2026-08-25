import { DimensionTable } from "@web/app/(main)/(dashboard)/cars/components/dimension-table";
import { formatMonthLabel } from "@web/app/(main)/(dashboard)/cars/components/format-month";
import {
  loadSearchParams,
  resolveCarsMonth,
} from "@web/app/(main)/(dashboard)/cars/search-params";
import { getDimensionStats } from "@web/queries/cars";
import type { SearchParams } from "nuqs/server";

/**
 * Fetches the rows for whichever dimension the URL selects and hands them to
 * the client table, which searches and sorts them without another round trip.
 */
export async function DimensionPanel({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const [{ dimension }, month] = await Promise.all([
    loadSearchParams(searchParams),
    resolveCarsMonth(searchParams),
  ]);
  const rows = await getDimensionStats(dimension, month);

  return (
    <DimensionTable
      dimension={dimension}
      monthLabel={formatMonthLabel(month)}
      rows={rows}
    />
  );
}
