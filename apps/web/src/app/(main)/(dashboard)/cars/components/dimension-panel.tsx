import { DimensionTable } from "@web/app/(main)/(dashboard)/cars/components/dimension-table";
import {
  loadSearchParams,
  resolveCarsMonth,
} from "@web/app/(main)/(dashboard)/cars/search-params";
import { getDimensionStats } from "@web/queries/cars";
import { getCarLogoMap } from "@web/queries/logos";
import { formatMonthLabel } from "@web/utils/dates/format-month";
import type { SearchParams } from "nuqs/server";

/**
 * Fetches the rows for whichever dimension the URL selects and hands them to
 * the client table, which searches and sorts them without another round trip.
 *
 * Logos are only looked up for makes; the other two dimensions have no marks
 * and fall back to their initial.
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
  const [rows, logoUrlBySlug] = await Promise.all([
    getDimensionStats(dimension, month),
    dimension === "make" ? getCarLogoMap() : Promise.resolve({}),
  ]);

  return (
    <DimensionTable
      dimension={dimension}
      logoUrlBySlug={logoUrlBySlug}
      monthLabel={formatMonthLabel(month)}
      rows={rows}
    />
  );
}
