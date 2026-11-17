import { Skeleton } from "@heroui/react";
import { FilterTabs } from "@web/app/(main)/(dashboard)/cars/makes/components/filter-tabs";
import {
  loadMakeRows,
  type MakeRow,
  MIN_BASE,
  periodLabel,
} from "@web/app/(main)/(dashboard)/cars/makes/components/make-rows";
import {
  MakeSearch,
  MakeSearchField,
  MakesTable,
} from "@web/app/(main)/(dashboard)/cars/makes/components/makes-table";
import { RangeTabs } from "@web/app/(main)/(dashboard)/cars/makes/components/range-tabs";
import {
  FUEL_FILTERS,
  loadSearchParams,
  serialize,
} from "@web/app/(main)/(dashboard)/cars/makes/search-params";
import { FigureCard } from "@web/components/shared/figure-card";
import { getCarsLatestMonth } from "@web/queries/cars";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";

interface IndexProps {
  searchParams: Promise<SearchParams>;
}

/** Tab id for "All", which clears `?fuel=`. */
const ALL_FUEL = "all";

/**
 * The change on a year earlier, or `null` when there is none or the
 * year-earlier base was under `MIN_BASE` cars, where a percentage says little.
 */
export function comparableChange(
  row: Pick<MakeRow, "count" | "yoyChange">,
): number | null {
  if (row.yoyChange === null) {
    return null;
  }
  return row.count / (1 + row.yoyChange / 100) < MIN_BASE
    ? null
    : row.yoyChange;
}

/** "Year to date", "Last 12 months", for the cards that follow the switch. */
export async function IndexPeriod({ searchParams }: IndexProps) {
  const [{ fuel, range }, latestMonth] = await Promise.all([
    loadSearchParams(searchParams),
    getCarsLatestMonth(),
  ]);
  if (!latestMonth) {
    return null;
  }

  return (
    <>
      {periodLabel(latestMonth, range)}
      {fuel ? `, ${fuel.toLowerCase()} cars` : ""}
    </>
  );
}

async function PowertrainTabs({ searchParams }: IndexProps) {
  const params = await loadSearchParams(searchParams);

  return (
    <FilterTabs
      aria-label="Powertrain"
      filter="fuel"
      selectedKey={params.fuel ?? ALL_FUEL}
      tabs={[
        {
          href: serialize("/cars/makes", { ...params, fuel: null }),
          id: ALL_FUEL,
          label: "All",
        },
        ...FUEL_FILTERS.map((fuel) => ({
          href: serialize("/cars/makes", { ...params, fuel }),
          id: fuel,
          label: fuel,
        })),
      ]}
    />
  );
}

async function PeriodTabs({ searchParams }: IndexProps) {
  const [params, latestMonth] = await Promise.all([
    loadSearchParams(searchParams),
    getCarsLatestMonth(),
  ]);

  return latestMonth ? (
    <RangeTabs latestMonth={latestMonth} params={params} />
  ) : null;
}

/**
 * The period and powertrain switches for the toolbar. Both are server-built
 * links, so only they wait on the search params.
 */
export function MakesControls({ searchParams }: IndexProps) {
  return (
    <>
      {/* Tabs do not wrap, so on a phone each row scrolls sideways inside its
          own box rather than widening the page. */}
      <div className="max-w-full overflow-x-auto">
        <Suspense fallback={<Skeleton className="h-10 w-80 max-w-full" />}>
          <PowertrainTabs searchParams={searchParams} />
        </Suspense>
      </div>
      <div className="max-w-full overflow-x-auto">
        <Suspense fallback={<Skeleton className="h-10 w-72 max-w-full" />}>
          <PeriodTabs searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}

async function MakesTableRows({ searchParams }: IndexProps) {
  const { fuel, range } = await loadSearchParams(searchParams);
  const { latestMonth, rows } = await loadMakeRows(range, fuel);
  if (!latestMonth) {
    return null;
  }

  return (
    <MakesTable
      label={`All makes, ${periodLabel(latestMonth, range)}`}
      rows={rows.map((row) => ({
        count: row.count,
        logoUrl: row.logoUrl,
        make: row.make,
        rank: row.rank,
        share: row.share,
        slug: row.slug,
        yoyChange: comparableChange(row),
      }))}
    />
  );
}

/**
 * Every make for the selected period and powertrain, searchable, each row
 * linking to the make's page.
 */
export function MakesTableCard({ searchParams }: IndexProps) {
  return (
    <FigureCard
      description={
        <Suspense fallback={" "}>
          <IndexPeriod searchParams={searchParams} />
        </Suspense>
      }
      title="All makes"
      trailing={
        // The search reads `?q=` in the browser, so until it does the field
        // shows empty and read-only.
        <Suspense fallback={<MakeSearchField isReadOnly />}>
          <MakeSearch />
        </Suspense>
      }
    >
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <MakesTableRows searchParams={searchParams} />
      </Suspense>
    </FigureCard>
  );
}
