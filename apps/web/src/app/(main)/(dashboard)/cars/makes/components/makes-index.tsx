import { FilterTabs } from "@web/app/(main)/(dashboard)/cars/makes/components/filter-tabs";
import {
  type MakeCard,
  MakeCards,
} from "@web/app/(main)/(dashboard)/cars/makes/components/make-cards";
import { MakeDetail } from "@web/app/(main)/(dashboard)/cars/makes/components/make-detail";
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
  type MakesSearchParams,
  type Range,
  serialize,
} from "@web/app/(main)/(dashboard)/cars/makes/search-params";
import { SectionHead, SourceNote } from "@web/components/shared/overview";
import { formatMonthLabel } from "@web/utils/dates/format-month";
import type { SearchParams } from "nuqs/server";

const SORT_TABS = [
  { id: "count", label: "Most cars" },
  { id: "make", label: "A–Z" },
] as const;

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

/** Tab id for "All", which clears `?fuel=`. */
const ALL_FUEL = "all";

/**
 * The powertrain switch D's index left out. Kept because about a fifth of
 * Makes visitors used it before the redesign, more than used the period.
 */
function PowertrainTabs({ params }: { params: MakesSearchParams }) {
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

function SortTabs({ params }: { params: MakesSearchParams }) {
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
 * Direction D's makes index: every make with registrations in the selected
 * period as a card that selects it (`?make=`), with the powertrain, period and
 * sort as server-built links and a search that filters the cards in the
 * browser. A selected make shows as a list beside that make's detail.
 */
export async function MakesIndex({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await loadSearchParams(searchParams);
  const { latestMonth, rows, total } = await loadMakeRows(
    params.range,
    params.fuel,
  );

  if (!latestMonth) {
    return null;
  }

  const ordered =
    params.sort === "make"
      ? [...rows].sort((a, b) => a.make.localeCompare(b.make))
      : rows;

  // A make with nothing registered in the period has no row, so `?make=` for
  // it falls back to the plain index.
  const selected = rows.find((row) => row.slug === params.make);

  const cards: MakeCard[] = ordered.map((row) => ({
    change: changeLabel(row, params.range, latestMonth),
    count: row.count.toLocaleString("en-SG"),
    href: serialize("/cars/makes", { ...params, make: row.slug }),
    logoUrl: row.logoUrl,
    make: row.make,
    rank: row.rank,
    share: row.share < 0.1 ? "<0.1%" : `${row.share.toFixed(1)}%`,
    slug: row.slug,
    trend: row.trend,
  }));

  return (
    <section aria-label="Makes index" className="flex flex-col gap-6">
      <SectionHead
        eyebrow={`Index · ${indexLabel(params.range, latestMonth)}`}
        title="All makes by registrations"
      />
      <MakeCards
        cards={cards}
        detail={
          selected ? (
            <MakeDetail
              latestMonth={latestMonth}
              makesCount={rows.length}
              params={params}
              row={selected}
              total={total}
            />
          ) : null
        }
        selectedSlug={selected?.slug ?? null}
        switches={
          <>
            <div className="flex min-w-0 max-w-full flex-col gap-1">
              <span className="font-medium text-muted text-sm">Powertrain</span>
              <PowertrainTabs params={params} />
            </div>
            <div className="flex min-w-0 max-w-full flex-col gap-1">
              <span className="font-medium text-muted text-sm">Period</span>
              <RangeTabs latestMonth={latestMonth} params={params} />
            </div>
            <div className="flex min-w-0 max-w-full flex-col gap-1">
              <span className="font-medium text-muted text-sm">Sort</span>
              <SortTabs params={params} />
            </div>
          </>
        }
      />
      <SourceNote>
        Source: LTA via DataMall · {periodLabel(latestMonth, params.range)},
        share of {total.toLocaleString("en-SG")} new
        {params.fuel ? ` ${params.fuel.toLowerCase()}` : ""} cars. Change is
        withheld when the year-earlier base was under {MIN_BASE} cars.
      </SourceNote>
    </section>
  );
}
