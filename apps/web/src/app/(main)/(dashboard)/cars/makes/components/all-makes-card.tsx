import type { SearchParams } from "nuqs/server";
import { loadSearchParams, RANGE_LABELS } from "../search-params";
import { loadMakeRows } from "./make-rows";
import { MakesFuelTabs } from "./makes-fuel-tabs";
import { MakesTable } from "./makes-table";

export async function AllMakesCard({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { fuel, range } = await loadSearchParams(searchParams);
  const { fuelTypes, rows } = await loadMakeRows(range, fuel);

  return (
    <MakesTable
      fuelTabs={<MakesFuelTabs fuelTypes={fuelTypes} />}
      rangeLabel={RANGE_LABELS[range]}
      rows={rows.map(({ trend: _trend, ...row }) => row)}
    />
  );
}
