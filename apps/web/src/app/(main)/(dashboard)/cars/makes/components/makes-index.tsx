import { Skeleton } from "@heroui/react";
import { FilterTabs } from "@web/app/(main)/(dashboard)/cars/makes/components/filter-tabs";
import {
  type MakeCard,
  MakeCards,
  MakeSearch,
  MakeSearchField,
} from "@web/app/(main)/(dashboard)/cars/makes/components/make-cards";
import {
  loadMakeRows,
  type MakeRow,
  MIN_BASE,
  periodLabel,
} from "@web/app/(main)/(dashboard)/cars/makes/components/make-rows";
import { RangeTabs } from "@web/app/(main)/(dashboard)/cars/makes/components/range-tabs";
import {
  FUEL_FILTERS,
  loadSearchParams,
  type Range,
  serialize,
} from "@web/app/(main)/(dashboard)/cars/makes/search-params";
import { SectionHead, SourceNote } from "@web/components/shared/overview";
import { getCarsLatestMonth } from "@web/queries/cars";
import { formatMonthLabel } from "@web/utils/dates/format-month";
import type { SearchParams } from "nuqs/server";
import { type ReactNode, Suspense } from "react";

const SORT_TABS = [
  { id: "count", label: "Most cars" },
  { id: "make", label: "A–Z" },
] as const;

/** Cards the fallback draws while the makes load: two rows on a wide page. */
const SKELETON_CARDS = 10;

interface IndexProps {
  searchParams: Promise<SearchParams>;
}

/** "+12.3% on 2025", or why there is no change to show. */
export function changeLabel(
  row: Pick<MakeRow, "count" | "yoyChange">,
  range: Range,
  latestMonth: string,
): string {
  const against =
    range === "ytd"
      ? String(Number(latestMonth.slice(0, 4)) - 1)
      : "a year earlier";

  if (row.yoyChange === null) {
    return range === "ytd" ? `no ${against} base` : "no base a year earlier";
  }
  if (row.count / (1 + row.yoyChange / 100) < MIN_BASE) {
    return `base under ${MIN_BASE}`;
  }

  const sign = row.yoyChange < 0 ? "−" : "+";
  return `${sign}${Math.abs(row.yoyChange).toFixed(1)}% on ${against}`;
}

/** The eyebrow over the index: "October 2026", "2026 to date", "Last 12 months". */
function indexLabel(range: Range, latestMonth: string): string {
  if (range === "month") {
    return formatMonthLabel(latestMonth);
  }
  if (range === "ytd") {
    return `${latestMonth.slice(0, 4)} to date`;
  }
  return "Last 12 months";
}

/** The period after "Index" in the eyebrow, which follows `?range=`. */
async function IndexPeriod({ searchParams }: IndexProps) {
  const [{ range }, latestMonth] = await Promise.all([
    loadSearchParams(searchParams),
    getCarsLatestMonth(),
  ]);

  return latestMonth ? ` · ${indexLabel(range, latestMonth)}` : null;
}

/** What the shares are a share of, in the source line. */
async function IndexBasis({ searchParams }: IndexProps) {
  const { fuel, range } = await loadSearchParams(searchParams);
  const { latestMonth, total } = await loadMakeRows(range, fuel);

  return latestMonth
    ? ` · ${periodLabel(latestMonth, range)}, share of ${total.toLocaleString("en-SG")} new${fuel ? ` ${fuel.toLowerCase()}` : ""} cars`
    : null;
}

/** Tab id for "All", which clears `?fuel=`. */
const ALL_FUEL = "all";

/**
 * The powertrain switch D's index left out. Kept because about a fifth of
 * Makes visitors used it before the redesign, more than used the period.
 */
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

async function SortTabs({ searchParams }: IndexProps) {
  const params = await loadSearchParams(searchParams);

  return (
    <FilterTabs
      aria-label="Sort"
      filter="sort"
      selectedKey={params.sort}
      tabs={SORT_TABS.map(({ id, label }) => ({
        href: serialize("/cars/makes", { ...params, sort: id }),
        id,
        label,
      }))}
    />
  );
}

/**
 * One labelled switch. The label is in the static shell; the tabs read the
 * search params for their links and selection, so only they wait.
 */
function Switch({
  children,
  label,
  skeleton,
}: {
  children: ReactNode;
  label: string;
  /** The width of the tabs while they load. */
  skeleton: string;
}) {
  return (
    <div className="flex min-w-0 max-w-full flex-col gap-1">
      <span className="font-medium text-muted text-sm">{label}</span>
      <Suspense
        fallback={<Skeleton className={`h-10 max-w-full ${skeleton}`} />}
      >
        {children}
      </Suspense>
    </div>
  );
}

/** The makes for the selected period, powertrain and sort, as cards. */
async function MakeResults({ searchParams }: IndexProps) {
  const params = await loadSearchParams(searchParams);
  const { latestMonth, rows } = await loadMakeRows(params.range, params.fuel);

  if (!latestMonth) {
    return null;
  }

  const ordered =
    params.sort === "make"
      ? [...rows].sort((a, b) => a.make.localeCompare(b.make))
      : rows;

  const cards: MakeCard[] = ordered.map((row) => ({
    change: changeLabel(row, params.range, latestMonth),
    count: row.count.toLocaleString("en-SG"),
    // The make's own page, with no search params: one cached page per make
    // rather than a variant of this one for every filter combination.
    href: `/cars/makes/${row.slug}`,
    logoUrl: row.logoUrl,
    make: row.make,
    rank: row.rank,
    share: row.share < 0.1 ? "<0.1%" : `${row.share.toFixed(1)}%`,
    slug: row.slug,
    trend: row.trend,
  }));

  return <MakeCards cards={cards} />;
}

/**
 * Direction D's makes index: every make with registrations in the selected
 * period as a card linking to its page, with the powertrain, period and sort
 * as server-built links and a search that filters the cards in the browser.
 *
 * The heading, the labels and the source line are in the static shell. Each
 * part that reads the search params waits behind its own boundary.
 */
export function MakesIndex({ searchParams }: IndexProps) {
  return (
    <section aria-label="Makes index" className="flex flex-col gap-6">
      <SectionHead
        eyebrow={
          <>
            Index
            <Suspense fallback={null}>
              <IndexPeriod searchParams={searchParams} />
            </Suspense>
          </>
        }
        title="All makes by registrations"
      />
      <div className="@container flex flex-col gap-5">
        <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
          {/* The search reads `?q=` in the browser, so until it does the
              field shows empty and read-only. */}
          <Suspense fallback={<MakeSearchField isReadOnly />}>
            <MakeSearch />
          </Suspense>
          <Switch label="Powertrain" skeleton="w-80">
            <PowertrainTabs searchParams={searchParams} />
          </Switch>
          <Switch label="Period" skeleton="w-72">
            <PeriodTabs searchParams={searchParams} />
          </Switch>
          <Switch label="Sort" skeleton="w-40">
            <SortTabs searchParams={searchParams} />
          </Switch>
        </div>
        <Suspense
          fallback={
            <div className="grid @3xl:grid-cols-3 @5xl:grid-cols-4 @7xl:grid-cols-5 @md:grid-cols-2 grid-cols-1 gap-2.5">
              {Array.from({ length: SKELETON_CARDS }, (_, index) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: identical placeholders
                <Skeleton className="h-36 rounded-lg" key={index} />
              ))}
            </div>
          }
        >
          <MakeResults searchParams={searchParams} />
        </Suspense>
      </div>
      <SourceNote>
        Source: LTA via DataMall
        <Suspense fallback={null}>
          <IndexBasis searchParams={searchParams} />
        </Suspense>
        . Change is withheld when the year-earlier base was under {MIN_BASE}{" "}
        cars.
      </SourceNote>
    </section>
  );
}
