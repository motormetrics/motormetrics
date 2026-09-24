import { loadMakeRows } from "@web/app/(main)/(dashboard)/cars/makes/components/make-rows";
import { MakesTable } from "@web/app/(main)/(dashboard)/cars/makes/components/makes-table";
import {
  isFuelFilter,
  loadSearchParams,
  RANGE_LABELS,
} from "@web/app/(main)/(dashboard)/cars/makes/search-params";
import type { SearchParams } from "nuqs/server";

export async function AllMakesCard({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { fuel, range } = await loadSearchParams(searchParams);
  const { rows } = await loadMakeRows(range, fuel);

  return (
    <MakesTable
      fuel={isFuelFilter(fuel) ? fuel : null}
      rangeLabel={RANGE_LABELS[range]}
      rows={rows.map(({ trend: _trend, ...row }) => row)}
    />
  );
}
