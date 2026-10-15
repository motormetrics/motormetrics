import { buttonVariants } from "@heroui/styles";
import { EmptyState } from "@heroui-pro/react";
import { formatDateToMonthYear } from "@motormetrics/utils/format-date-to-month-year";
import {
  FuelTypeTabs,
  PeriodTabs,
} from "@web/app/(main)/(dashboard)/cars/makes/[make]/components/filters";
import { GoBackButton } from "@web/app/(main)/(dashboard)/cars/makes/[make]/components/go-back-button";
import { MakeBreakdown } from "@web/app/(main)/(dashboard)/cars/makes/[make]/components/make-breakdown";
import { MakeFuelMix } from "@web/app/(main)/(dashboard)/cars/makes/[make]/components/make-fuel-mix";
import { MakeHeadline } from "@web/app/(main)/(dashboard)/cars/makes/[make]/components/make-headline";
import { MakeMonthlyTable } from "@web/app/(main)/(dashboard)/cars/makes/[make]/components/make-monthly-table";
import { MakePeers } from "@web/app/(main)/(dashboard)/cars/makes/[make]/components/make-peers";
import { MakeTrend } from "@web/app/(main)/(dashboard)/cars/makes/[make]/components/make-trend";
import { percentage } from "@web/app/(main)/(dashboard)/cars/makes/[make]/components/percentage";
import { periodWindow } from "@web/app/(main)/(dashboard)/cars/makes/[make]/components/period";
import { summariseMake } from "@web/app/(main)/(dashboard)/cars/makes/[make]/components/summary";
import {
  loadSearchParams,
  RANGE_LABELS,
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

/** How many makes the peer list shows, the current one always among them. */
const PEER_COUNT = 5;

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

export async function MakeReport({
  make,
  searchParams,
}: {
  make: string;
  searchParams: Promise<SearchParams>;
}) {
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

  if (crossTab.length === 0) {
    return (
      <EmptyState className="rounded-3xl bg-default/50" size="lg">
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
  const topFuel = fuelTotals[0];
  const topVehicle = vehicleTotals[0];

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

  const rangeLabel = RANGE_LABELS[range];
  const periodCaption =
    range === "month"
      ? formatDateToMonthYear(month)
      : `${formatDateToMonthYear(start)} – ${formatDateToMonthYear(end)}`;

  // Every fuel type the make registered in the period, whatever the switch
  // is set to, each with the two vehicle types that carry its volume.
  const fuelMix = fuelTotals.map(({ count, name }, index) => {
    const leading = tally(
      windowRows.filter((row) => row.fuelType === name),
      (row) => row.vehicleType,
      (row) => row.count,
    )
      .slice(0, 2)
      .map(({ name: vehicleType }) => formatVehicleType(vehicleType));

    return {
      color: `var(--chart-${(index % 6) + 1})`,
      count,
      name,
      note:
        leading.length > 1
          ? `${leading.join(" and ")} carry the volume`
          : `All of it ${leading[0]}`,
    };
  });

  // The comp's two-by-two grid beside the headline; the mix cells drop out
  // when the make registered nothing in the period.
  const stats = [
    {
      label: "Share of market",
      note: periodCaption,
      value: percentage(total, marketTotal),
    },
    {
      label: "Rank",
      note: fuelType
        ? "overall, all fuel types"
        : `of ${makeTotals.length} makes`,
      value: rank > 0 ? `#${rank}` : "—",
    },
    ...(topFuel
      ? [
          {
            label: `${topFuel.name} share`,
            note: `of ${make} registrations`,
            value: percentage(topFuel.count, makeTotal),
          },
        ]
      : []),
    ...(topVehicle
      ? [
          {
            label: `${formatVehicleType(topVehicle.name)} share`,
            note: "most common vehicle type",
            value: percentage(topVehicle.count, makeTotal),
          },
        ]
      : []),
  ];
  // The chart runs over the year to date, or the trailing year when the
  // period is a single month.
  const seriesRange = range === "ytd" && start !== end ? "ytd" : "12m";

  return (
    <>
      {/* The comp rules the switches off from the head, each under its own
          label; on phones they stack. */}
      <div className="flex flex-col gap-3.5 border-border border-y py-3.5 md:flex-row md:flex-wrap md:items-end md:gap-6">
        <div className="flex min-w-0 flex-col gap-1.5">
          <span className="font-semibold text-muted text-xs">Period</span>
          <PeriodTabs />
        </div>
        <div className="flex min-w-0 flex-col gap-1.5">
          <span className="font-semibold text-muted text-xs">Fuel type</span>
          <FuelTypeTabs fuelTypes={fuelTypeOptions} />
        </div>
      </div>

      <MakeHeadline
        fuelType={fuelType}
        make={make}
        makeTotal={makeTotal}
        marketTotal={marketTotal}
        previousTotal={previousTotal}
        rangeLabel={rangeLabel}
        stats={stats}
        total={total}
      />

      <MakeTrend
        fuelType={fuelType}
        make={make}
        month={month}
        series={series}
        seriesRange={seriesRange}
        summary={summary}
      />

      <Hairline />

      <MakeBreakdown
        fuelType={fuelType}
        make={make}
        mixRows={mixRows}
        periodCaption={periodCaption}
        total={total}
      />

      <Hairline />

      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-11 lg:gap-14">
        <MakeMonthlyTable
          fuelType={fuelType}
          make={make}
          month={month}
          series={series}
          seriesRange={seriesRange}
        />

        <div className="flex min-w-0 flex-col gap-10 lg:col-span-5">
          <MakePeers
            logoUrlBySlug={logoUrlBySlug}
            make={make}
            peers={peers}
            periodCaption={periodCaption}
          />

          <MakeFuelMix
            fuelMix={fuelMix}
            make={make}
            makeTotal={makeTotal}
            periodCaption={periodCaption}
          />
        </div>
      </div>
    </>
  );
}
