import type { SearchParams } from "nuqs/server";
import { loadSearchParams, RANGE_LABELS } from "../search-params";
import { isFuelFilter, loadMakeRows } from "./make-rows";
import { MakesTable } from "./makes-table";

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
