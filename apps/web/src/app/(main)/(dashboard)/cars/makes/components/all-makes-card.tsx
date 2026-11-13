import { Typography } from "@heroui/react";
import { FuelTabs } from "@web/app/(main)/(dashboard)/cars/makes/components/fuel-tabs";
import {
  loadMakeRows,
  summariseLeaders,
} from "@web/app/(main)/(dashboard)/cars/makes/components/make-rows";
import { MakesTable } from "@web/app/(main)/(dashboard)/cars/makes/components/makes-table";
import {
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
  const params = await loadSearchParams(searchParams);
  const { dir, fuel, range, sort } = params;
  const { latestMonth, rows, total } = await loadMakeRows(range, fuel);
  const summary = summariseLeaders(rows, latestMonth, range, fuel);

  return (
    <div className="flex flex-col gap-3">
      <MakesTable
        fuel={fuel}
        fuelTabs={<FuelTabs params={params} />}
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
