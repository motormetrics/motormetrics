import { Skeleton } from "@heroui/react";
import { MakeDetail } from "@web/app/(main)/(dashboard)/cars/makes/components/make-detail";
import {
  MakeList,
  type MakeListRow,
  MakeSearchField,
} from "@web/app/(main)/(dashboard)/cars/makes/components/make-list";
import {
  loadMakeRows,
  type MakeRow,
  MIN_BASE,
  periodLabel,
} from "@web/app/(main)/(dashboard)/cars/makes/components/make-rows";
import {
  loadSearchParams,
  type Range,
} from "@web/app/(main)/(dashboard)/cars/makes/search-params";
import { SectionHead, SourceNote } from "@web/components/shared/overview";
import { getCarsLatestMonth } from "@web/queries/cars";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";

/** Rows the fallback draws while the makes load. */
const SKELETON_ROWS = 12;

interface IndexProps {
  searchParams: Promise<SearchParams>;
}

/** What a change is measured against: "2025", or "a year earlier". */
function changeBase(range: Range, latestMonth: string): string {
  return range === "ytd"
    ? String(Number(latestMonth.slice(0, 4)) - 1)
    : "a year earlier";
}

/** "+12.3% on 2025", or why there is no change to show. */
export function changeLabel(
  row: Pick<MakeRow, "count" | "yoyChange">,
  range: Range,
  latestMonth: string,
): string {
  const against = changeBase(range, latestMonth);

  if (row.yoyChange === null) {
    return range === "ytd" ? `no ${against} base` : "no base a year earlier";
  }
  if (row.count / (1 + row.yoyChange / 100) < MIN_BASE) {
    return `base under ${MIN_BASE}`;
  }

  const sign = row.yoyChange < 0 ? "−" : "+";
  return `${sign}${Math.abs(row.yoyChange).toFixed(1)}% on ${against}`;
}

/** The change column's head: "On 2025", or "On a year earlier". */
export function changeHeading(range: Range, latestMonth: string): string {
  return `On ${changeBase(range, latestMonth)}`;
}

/**
 * The change column's cell: "+12.3%", or a dash where `changeLabel` would
 * give a reason instead of a figure.
 */
export function changeFigure(row: Pick<MakeRow, "count" | "yoyChange">) {
  if (
    row.yoyChange === null ||
    row.count / (1 + row.yoyChange / 100) < MIN_BASE
  ) {
    return "–";
  }

  const sign = row.yoyChange < 0 ? "−" : "+";
  return `${sign}${Math.abs(row.yoyChange).toFixed(1)}%`;
}

/** "with the change on the same months of 2025", after the list's title. */
async function IndexCaption({ searchParams }: IndexProps) {
  const [{ fuel, range }, latestMonth] = await Promise.all([
    loadSearchParams(searchParams),
    getCarsLatestMonth(),
  ]);
  if (!latestMonth) {
    return null;
  }

  const against =
    range === "ytd"
      ? `the same months of ${changeBase(range, latestMonth)}`
      : range === "month"
        ? "the same month a year earlier"
        : "the 12 months before";

  return `${periodLabel(latestMonth, range)}${fuel ? `, ${fuel} cars` : ""}, with the change on ${against}`;
}

/** What the shares are a share of, in the source line. */
async function IndexBasis({ searchParams }: IndexProps) {
  const { fuel, range } = await loadSearchParams(searchParams);
  const { latestMonth, total } = await loadMakeRows(range, fuel);

  return latestMonth
    ? ` · ${periodLabel(latestMonth, range)}, ${total.toLocaleString("en-SG")} new${fuel ? ` ${fuel}` : ""} cars`
    : null;
}

/**
 * The makes for the selected period, fuel type and sort as a ranked list. A
 * make selected by `?make=` shows its detail above the list.
 */
async function MakeResults({ searchParams }: IndexProps) {
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
  // it falls back to the plain list.
  const selectedIndex = rows.findIndex((row) => row.slug === params.make);
  const selected = rows[selectedIndex];

  // While picking a make to compare with, every other make leads straight
  // into the comparison with the selected one.
  const comparingWith = selected && params.compare ? selected.slug : undefined;

  // The makes ranked either side of the selected one, as quick picks.
  const peers = selected
    ? [
        ...rows.slice(Math.max(selectedIndex - 1, 0), selectedIndex),
        ...rows.slice(selectedIndex + 1, selectedIndex + 3),
      ]
    : [];

  const listRows: MakeListRow[] = ordered.map((row) => ({
    change: changeFigure(row),
    count: row.count,
    compareWith: row.slug === comparingWith ? undefined : comparingWith,
    // The only link in the HTML is the make's own page, one cached page per
    // make, so no filter variant of this page is ever a link for a crawler.
    href: `/cars/makes/${row.slug}`,
    logoUrl: row.logoUrl,
    make: row.make,
    slug: row.slug,
  }));

  return (
    <>
      {selected ? (
        <MakeDetail
          latestMonth={latestMonth}
          makesCount={rows.length}
          params={params}
          peers={peers}
          row={selected}
          total={total}
        />
      ) : null}
      <MakeList
        changeHeading={changeHeading(params.range, latestMonth)}
        rows={listRows}
      />
    </>
  );
}

/**
 * The ranked list of every make with registrations in the selected period:
 * its search and sort sit in the list's own toolbar, and each make's name
 * links to that make's page.
 *
 * The heading and the source line are in the static shell. Each part that
 * reads the search params waits behind its own boundary.
 */
export function MakesIndex({ searchParams }: IndexProps) {
  return (
    <section
      aria-label="New cars by make"
      className="flex flex-col gap-4"
      id="makes-list"
    >
      <SectionHead
        caption={
          // A non-breaking space holds the caption's line until it arrives.
          <Suspense fallback={"\u00a0"}>
            <IndexCaption searchParams={searchParams} />
          </Suspense>
        }
        title="New cars by make"
      />
      <div className="@container flex flex-col gap-6">
        <Suspense
          fallback={
            <div className="flex flex-col gap-4">
              {/* The search reads `?q=` in the browser, so until it does the
                  field shows empty and read-only. */}
              <MakeSearchField isReadOnly />
              <div className="flex flex-col gap-2">
                {Array.from({ length: SKELETON_ROWS }, (_, index) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: identical placeholders
                  <Skeleton className="h-8 w-full" key={index} />
                ))}
              </div>
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
