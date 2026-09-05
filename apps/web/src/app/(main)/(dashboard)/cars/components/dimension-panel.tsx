import { DimensionTable } from "@web/app/(main)/(dashboard)/cars/components/dimension-table";
import { formatMonthLabel } from "@web/app/(main)/(dashboard)/cars/components/format-month";
import { buildLogoMap } from "@web/app/(main)/(dashboard)/cars/makes/components/make-rows";
import {
  loadSearchParams,
  resolveCarsMonth,
} from "@web/app/(main)/(dashboard)/cars/search-params";
import { getDimensionStats } from "@web/queries/cars";
import { getAllCarLogos } from "@web/queries/logos";
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
  const [rows, logoResult] = await Promise.all([
    getDimensionStats(dimension, month),
    dimension === "make" ? getAllCarLogos() : Promise.resolve({ logos: [] }),
  ]);

  return (
    <DimensionTable
      dimension={dimension}
      logoUrlBySlug={buildLogoMap(
        "logos" in logoResult ? logoResult.logos : [],
      )}
      monthLabel={formatMonthLabel(month)}
      rows={rows}
    />
  );
}
