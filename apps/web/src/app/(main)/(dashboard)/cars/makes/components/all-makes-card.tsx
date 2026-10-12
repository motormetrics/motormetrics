import { Typography } from "@heroui/react";
import {
  loadMakeRows,
  summariseLeaders,
} from "@web/app/(main)/(dashboard)/cars/makes/components/make-rows";
import { MakesTable } from "@web/app/(main)/(dashboard)/cars/makes/components/makes-table";
import {
  isFuelFilter,
  loadSearchParams,
  RANGE_LABELS,
  sortMakeRows,
} from "@web/app/(main)/(dashboard)/cars/makes/search-params";
import type { SearchParams } from "nuqs/server";

export async function AllMakesCard({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { dir, fuel, range, sort } = await loadSearchParams(searchParams);
  const { latestMonth, rows, total } = await loadMakeRows(range, fuel);
  const fuelFilter = isFuelFilter(fuel) ? fuel : null;
  const summary = summariseLeaders(rows, latestMonth, range, fuelFilter);

  return (
    <div className="flex flex-col gap-3">
      <MakesTable
        fuel={fuelFilter}
        rangeLabel={RANGE_LABELS[range]}
        total={total}
        rows={sortMakeRows(
          rows.map(({ trend: _trend, ...row }) => row),
          sort,
          dir,
        )}
      />
      {summary ? (
        <Typography.Paragraph className="tabular-nums" color="muted" size="sm">
          {summary}
        </Typography.Paragraph>
      ) : null}
    </div>
  );
}
