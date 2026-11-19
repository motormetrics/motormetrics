import { buttonVariants } from "@heroui/styles";
import { EmptyState } from "@heroui-pro/react";
import { formatDateToMonthYear } from "@motormetrics/utils/format-date-to-month-year";
import { GoBackButton } from "@web/app/(main)/(dashboard)/cars/makes/[make]/components/go-back-button";
import { MakeBreakdown } from "@web/app/(main)/(dashboard)/cars/makes/[make]/components/make-breakdown";
import {
  MakeFuelMix,
  MakeVehicleMix,
} from "@web/app/(main)/(dashboard)/cars/makes/[make]/components/make-fuel-mix";
import { MakeMonthlyTable } from "@web/app/(main)/(dashboard)/cars/makes/[make]/components/make-monthly-table";
import { MakePeers } from "@web/app/(main)/(dashboard)/cars/makes/[make]/components/make-peers";
import { MakeTrend } from "@web/app/(main)/(dashboard)/cars/makes/[make]/components/make-trend";
import { periodWindow } from "@web/app/(main)/(dashboard)/cars/makes/[make]/components/period";
import { summariseMake } from "@web/app/(main)/(dashboard)/cars/makes/[make]/components/summary";
import {
  loadSearchParams,
  type Range,
} from "@web/app/(main)/(dashboard)/cars/makes/[make]/search-params";
import { Hairline } from "@web/components/shared/overview";
import {
  getMakeCrossTab,
  getMakeTotalsInRange,
  getMarketMonthlyTotals,
} from "@web/queries/cars/makes/period-totals";
import { getCarLogoMap } from "@web/queries/logos";
import { shiftMonth } from "@web/utils/dates/month-arithmetic";
import { getMonthOrLatest } from "@web/utils/dates/months";
import { formatVehicleType } from "@web/utils/formatting/format-vehicle-type";
import { FileQuestion, Home } from "lucide-react";
import Link from "next/link";
import type { SearchParams } from "nuqs/server";
import { cache } from "react";

/** How many makes the peer list shows, the current one always among them. */
const PEER_COUNT = 8;

function monthsBetween(start: string, end: string): string[] {
  const months: string[] = [];
  for (let month = start; month <= end; month = shiftMonth(month, 1)) {
    months.push(month);
  }

  return months;
}

function sumBy<T>(rows: T[], value: (row: T) => number): number {
  return rows.reduce((total, row) => total + value(row), 0);
}

/** Total by key, highest first — the shape every breakdown on this page wants. */
function tally<T>(
  rows: T[],
  key: (row: T) => string,
  value: (row: T) => number,
): { count: number; name: string }[] {
  const totals = new Map<string, number>();
  for (const row of rows) {
    const name = key(row);
    totals.set(name, (totals.get(name) ?? 0) + value(row));
  }

  return [...totals]
    .map(([name, count]) => ({ count, name }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Every figure the report draws for the selected period, month and fuel type.
 * `MakeReport` hands the promise to each section, which awaits it behind its
 * own boundary; the queries are `'use cache'`. Wrapped in React's `cache` so
 * the filters and the key numbers, which sit outside the report, share the one
 * computation per request.
 */
export const loadMakeReport = cache(async function loadMakeReport(
  make: string,
  searchParams: Promise<SearchParams>,
) {
  const {
    fuelType,
    month: parsedMonth,
    range,
  } = await loadSearchParams(searchParams);
  const [{ month }, crossTab, logoUrlBySlug] = await Promise.all([
    getMonthOrLatest(parsedMonth, "cars"),
    getMakeCrossTab(make),
    getCarLogoMap(),
  ]);

  const { end, start } = periodWindow(month, range);
  const previousStart = shiftMonth(start, -12);
  const previousEnd = shiftMonth(end, -12);

  // A single-month period still draws its trailing year: one column and one
  // table row say nothing about direction, which is what both are there for.
  const seriesStart = start === end ? shiftMonth(end, -11) : start;
  const seriesMonths = monthsBetween(seriesStart, end);

  const [makeTotals, marketMonthly] = await Promise.all([
    getMakeTotalsInRange(start, end),
    getMarketMonthlyTotals(seriesStart, end),
  ]);

  const matchesFuel = (row: { fuelType: string }) =>
    !fuelType || row.fuelType === fuelType;
  const inWindow = (row: { month: string }) =>
    row.month >= start && row.month <= end;

  /** The window, every fuel type — what the mix cells and share cells divide by. */
  const windowRows = crossTab.filter(inWindow);
  const selectedRows = windowRows.filter(matchesFuel);
  const previousRows = crossTab.filter(
    (row) =>
      row.month >= previousStart &&
      row.month <= previousEnd &&
      matchesFuel(row),
  );

  const total = sumBy(selectedRows, (row) => row.count);
  const previousTotal = sumBy(previousRows, (row) => row.count);
  const makeTotal = sumBy(windowRows, (row) => row.count);

  const fuelTotals = tally(
    windowRows,
    (row) => row.fuelType,
    (row) => row.count,
  );
  const vehicleTotals = tally(
    windowRows,
    (row) => row.vehicleType,
    (row) => row.count,
  );

  // Only the fuel types this make actually registers in the period are offered,
  // plus whichever one is selected, so a filter can always be undone.
  const fuelTypeOptions = fuelTotals.map(({ name }) => name);
  if (fuelType && !fuelTypeOptions.includes(fuelType)) {
    fuelTypeOptions.push(fuelType);
  }

  // The mix table: one row per fuel type × vehicle type cell, read against the
  // same window a year earlier.
  const previousByCell = new Map<string, number>();
  for (const row of previousRows) {
    const key = `${row.fuelType}|${row.vehicleType}`;
    previousByCell.set(key, (previousByCell.get(key) ?? 0) + row.count);
  }
  const mixRows = tally(
    selectedRows,
    (row) => `${row.fuelType}|${row.vehicleType}`,
    (row) => row.count,
  ).map(({ count, name }, index) => {
    const [rowFuelType, vehicleType] = name.split("|");
    return {
      count,
      fuelType: rowFuelType,
      previous: previousByCell.get(name) ?? 0,
      rank: index + 1,
      vehicleType,
    };
  });

  const makeByMonth = new Map<string, number>();
  for (const row of crossTab) {
    if (matchesFuel(row)) {
      makeByMonth.set(row.month, (makeByMonth.get(row.month) ?? 0) + row.count);
    }
  }
  const marketByMonth = new Map(
    marketMonthly.map(({ month: seriesMonth, total: marketTotal }) => [
      seriesMonth,
      marketTotal,
    ]),
  );
  const series = seriesMonths.map((seriesMonth) => {
    const count = makeByMonth.get(seriesMonth) ?? 0;
    const market = marketByMonth.get(seriesMonth) ?? 0;
    return {
      count,
      market,
      month: seriesMonth,
      share: (count / (market || 1)) * 100,
    };
  });

  const marketTotal = sumBy(
    monthsBetween(start, end),
    (windowMonth) => marketByMonth.get(windowMonth) ?? 0,
  );

  const rank = makeTotals.findIndex((entry) => entry.make === make) + 1;
  const peers = makeTotals.slice(0, PEER_COUNT);
  if (rank > PEER_COUNT) {
    peers.splice(PEER_COUNT - 1, 1, makeTotals[rank - 1]);
  }

  // The summary line reads the selected month across every fuel type, whatever
  // the switch is set to; the rank is the year to date's, so only on that range.
  const countWhere = (match: (row: { month: string }) => boolean) =>
    sumBy(crossTab.filter(match), (row) => row.count);
  const summary = summariseMake({
    count: countWhere((row) => row.month === month),
    make,
    marketCount: marketByMonth.get(month) ?? 0,
    month,
    previousCount: countWhere((row) => row.month === shiftMonth(month, -1)),
    rank: range === "ytd" && rank > 0 ? rank : undefined,
    yearToDate: countWhere(
      (row) => row.month >= `${month.slice(0, 4)}-01` && row.month <= month,
    ),
  });

  const periodCaption =
    range === "month"
      ? formatDateToMonthYear(month)
      : `${formatDateToMonthYear(start)} – ${formatDateToMonthYear(end)}`;

  // Every fuel type the make registered in the period, whatever the switch
  // is set to, each with the two vehicle types that carry its volume.
  const fuelMix = fuelTotals.map(({ count, name }) => {
    const leading = tally(
      windowRows.filter((row) => row.fuelType === name),
      (row) => row.vehicleType,
      (row) => row.count,
    )
      .slice(0, 2)
      .map(({ name: vehicleType }) => formatVehicleType(vehicleType));

    return {
      count,
      name,
      note:
        leading.length > 1
          ? `${leading.join(" and ")} carry the volume`
          : `All of it ${leading[0]}`,
    };
  });

  // Every vehicle type the make registered in the period, as the fuel types
  // above: whatever the fuel type filter is set to.
  const vehicleMix = vehicleTotals.map(({ count, name }) => ({
    count,
    name: formatVehicleType(name),
  }));

  // The chart runs over the year to date, or the trailing year when the
  // period is a single month.
  const seriesRange: Range = range === "ytd" && start !== end ? "ytd" : "12m";

  return {
    fuelMix,
    fuelType,
    fuelTypeOptions,
    logoUrlBySlug,
    makesCount: makeTotals.length,
    makeTotal,
    marketTotal,
    mixRows,
    month,
    monthCount: makeByMonth.get(month) ?? 0,
    peers,
    periodCaption,
    previousMonthCount: makeByMonth.get(shiftMonth(month, -1)) ?? 0,
    previousTotal,
    range,
    rank,
    series,
    seriesRange,
    summary,
    total,
    vehicleMix,
  };
});

export type MakeReportData = Awaited<ReturnType<typeof loadMakeReport>>;

/** What every section of the report takes. */
export interface MakeSectionProps {
  make: string;
  /** Not awaited by the section itself, only by the parts of it that wait. */
  report: Promise<MakeReportData>;
}

/**
 * The make's report. It awaits only what depends on the make, so for a
 * pre-built make every heading and label is in the static shell; the figures
 * follow the search params and wait inside each section.
 */
export async function MakeReport({
  make,
  part,
  searchParams,
}: {
  make: string;
  /**
   * `lead` is the sections the artboard draws, beside the right sidebar;
   * `more` is the rest, below the two columns so that on a narrow screen the
   * key figures come before them. Both read the one `loadMakeReport` result.
   */
  part: "lead" | "more";
  searchParams: Promise<SearchParams>;
}) {
  const crossTab = await getMakeCrossTab(make);

  if (crossTab.length === 0) {
    // The lead part says there is nothing; the rest has nothing to add.
    if (part === "more") {
      return null;
    }

    return (
      <EmptyState size="lg">
        <EmptyState.Header>
          <EmptyState.Media variant="icon">
            <FileQuestion />
          </EmptyState.Media>
          <EmptyState.Title>No Data Available</EmptyState.Title>
          <EmptyState.Description className="max-w-sm">
            The requested data could not be found. Please try a different
            selection.
          </EmptyState.Description>
        </EmptyState.Header>
        <EmptyState.Content className="flex-row gap-4">
          <Link className={buttonVariants({ variant: "outline" })} href="/">
            <Home className="size-4" />
            Go Home
          </Link>
          <GoBackButton />
        </EmptyState.Content>
      </EmptyState>
    );
  }

  const report = loadMakeReport(make, searchParams);

  if (part === "more") {
    return (
      <>
        <Hairline />

        <MakeBreakdown make={make} report={report} />

        <Hairline />

        <MakeMonthlyTable make={make} report={report} />
      </>
    );
  }

  return (
    <>
      <MakeTrend make={make} report={report} />

      <Hairline />

      <MakeFuelMix make={make} report={report} />

      <Hairline />

      <MakeVehicleMix make={make} report={report} />

      <Hairline />

      <MakePeers make={make} report={report} />
    </>
  );
}
