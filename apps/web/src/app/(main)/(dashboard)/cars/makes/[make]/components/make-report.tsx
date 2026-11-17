import { Skeleton } from "@heroui/react";
import { buttonVariants } from "@heroui/styles";
import { EmptyState } from "@heroui-pro/react";
import { formatDateToMonthYear } from "@motormetrics/utils/format-date-to-month-year";
import { slugify } from "@motormetrics/utils/slugify";
import { TwoShadeTrendChart } from "@web/app/(main)/(dashboard)/cars/components/two-shade-trend-chart";
import { PeriodTabs } from "@web/app/(main)/(dashboard)/cars/makes/[make]/components/filters";
import { FuelTypeMenu } from "@web/app/(main)/(dashboard)/cars/makes/[make]/components/fuel-type-menu";
import { GoBackButton } from "@web/app/(main)/(dashboard)/cars/makes/[make]/components/go-back-button";
import { MixTable } from "@web/app/(main)/(dashboard)/cars/makes/[make]/components/mix-table";
import { percentage } from "@web/app/(main)/(dashboard)/cars/makes/[make]/components/percentage";
import {
  periodLabel,
  periodWindow,
} from "@web/app/(main)/(dashboard)/cars/makes/[make]/components/period";
import {
  loadSearchParams,
  type Range,
} from "@web/app/(main)/(dashboard)/cars/makes/[make]/search-params";
import { axisTicks } from "@web/app/(main)/(dashboard)/components/overview-series";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import { FigureCard } from "@web/components/shared/figure-card";
import { type KpiTile, KpiTiles } from "@web/components/shared/kpi-tiles";
import { MonthMenu } from "@web/components/shared/month-menu";
import {
  getMakeCrossTab,
  getMakeTotalsInRange,
  getMarketMonthlyTotals,
} from "@web/queries/cars/makes/period-totals";
import { percentageChange } from "@web/utils/change-ratio";
import {
  formatChartMonth,
  formatMonthLabel,
} from "@web/utils/dates/format-month";
import { shiftMonth } from "@web/utils/dates/month-arithmetic";
import { fetchMonthsForCars, getMonthOrLatest } from "@web/utils/dates/months";
import { formatVehicleType } from "@web/utils/formatting/format-vehicle-type";
import { FileQuestion, Home } from "lucide-react";
import Link from "next/link";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";

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

/** Total by key, highest first. */
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
 * Every figure the page draws for the selected period, month and fuel type.
 * Each section awaits it behind its own boundary; the queries are
 * `'use cache'`, so the repeated calls are reads.
 */
async function loadMakeReport(
  make: string,
  searchParams: Promise<SearchParams>,
) {
  const params = await loadSearchParams(searchParams);
  const { fuelType, month: parsedMonth, range } = params;
  const [{ month }, crossTab] = await Promise.all([
    getMonthOrLatest(parsedMonth, "cars"),
    getMakeCrossTab(make),
  ]);

  const { end, start } = periodWindow(month, range);
  const previousStart = shiftMonth(start, -12);
  const previousEnd = shiftMonth(end, -12);

  // A single-month period still draws its trailing year: one column says
  // nothing about direction.
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

  /** The window, every fuel type. */
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

  // Only the fuel types this make registers in the period are offered, plus
  // whichever one is selected, so a filter can always be undone.
  const fuelTypeOptions = fuelTotals.map(({ name }) => name);
  if (fuelType && !fuelTypeOptions.includes(fuelType)) {
    fuelTypeOptions.push(fuelType);
  }

  // One row per fuel type × vehicle type cell, against the same window a
  // year earlier.
  const previousByCell = new Map<string, number>();
  for (const row of previousRows) {
    const key = `${row.fuelType}|${row.vehicleType}`;
    previousByCell.set(key, (previousByCell.get(key) ?? 0) + row.count);
  }
  const mixRows = tally(
    selectedRows,
    (row) => `${row.fuelType}|${row.vehicleType}`,
    (row) => row.count,
  ).map(({ count, name }) => {
    const [rowFuelType, vehicleType] = name.split("|");
    const previous = previousByCell.get(name) ?? 0;
    return {
      change: previous > 0 ? percentageChange(count, previous) : null,
      count,
      fuelType: rowFuelType,
      share: (count / (total || 1)) * 100,
      vehicleType: formatVehicleType(vehicleType),
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
      month: seriesMonth,
      share: (count / (market || 1)) * 100,
    };
  });

  const marketTotal = sumBy(
    monthsBetween(start, end),
    (windowMonth) => marketByMonth.get(windowMonth) ?? 0,
  );
  const rank = makeTotals.findIndex((entry) => entry.make === make) + 1;

  const periodCaption =
    range === "month"
      ? formatDateToMonthYear(month)
      : `${formatDateToMonthYear(start)} – ${formatDateToMonthYear(end)}`;

  const fuelMix = fuelTotals.map(({ count, name }, index) => ({
    color: `var(--chart-${(index % 5) + 1})`,
    count,
    name,
  }));

  // The chart runs over the year to date, or the trailing year when the
  // period is a single month.
  const seriesRange: Range = range === "ytd" && start !== end ? "ytd" : "12m";

  return {
    fuelMix,
    fuelType,
    fuelTypeOptions,
    makeCount: makeTotals.length,
    makeTotal,
    marketTotal,
    mixRows,
    month,
    params,
    path: `/cars/makes/${slugify(make)}`,
    periodCaption,
    previousTotal,
    rank,
    series,
    seriesRange,
    topFuel: fuelTotals[0],
    total,
  };
}

type MakeReportData = Awaited<ReturnType<typeof loadMakeReport>>;

interface SectionProps {
  make: string;
  /** Not awaited by the section itself, only by the parts of it that wait. */
  report: Promise<MakeReportData>;
}

async function ReportPeriodTabs({ report }: Pick<SectionProps, "report">) {
  const { params, path } = await report;

  return <PeriodTabs params={params} path={path} />;
}

async function ReportFuelTypeMenu({ report }: Pick<SectionProps, "report">) {
  const { fuelTypeOptions } = await report;

  return <FuelTypeMenu fuelTypes={fuelTypeOptions} />;
}

async function ReportMonthMenu({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { month: parsedMonth } = await loadSearchParams(searchParams);
  const [months, { wasAdjusted }] = await Promise.all([
    fetchMonthsForCars(),
    getMonthOrLatest(parsedMonth, "cars"),
  ]);

  return (
    <MonthMenu
      latestMonth={months[0]}
      months={months}
      wasAdjusted={wasAdjusted}
    />
  );
}

/**
 * The toolbar's period, fuel type and month switches. Each waits on the
 * search params behind its own boundary.
 */
export function MakeControls({
  make,
  searchParams,
}: {
  make: string;
  searchParams: Promise<SearchParams>;
}) {
  const report = loadMakeReport(make, searchParams);

  return (
    <>
      {/* Tabs do not wrap, so on a phone they scroll sideways inside their
          own box rather than widening the page. */}
      <div className="max-w-full overflow-x-auto">
        <Suspense fallback={<Skeleton className="h-10 w-80 max-w-full" />}>
          <ReportPeriodTabs report={report} />
        </Suspense>
      </div>
      <Suspense fallback={<Skeleton className="h-10 w-32" />}>
        <ReportFuelTypeMenu report={report} />
      </Suspense>
      <Suspense fallback={<Skeleton className="h-10 w-32" />}>
        <ReportMonthMenu searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function MakeKpis({ make, report }: SectionProps) {
  const {
    fuelType,
    makeCount,
    makeTotal,
    marketTotal,
    periodCaption,
    previousTotal,
    rank,
    series,
    topFuel,
    total,
  } = await report;

  const tiles: KpiTile[] = [
    {
      change:
        previousTotal > 0
          ? {
              label: "vs a year earlier",
              value: percentageChange(total, previousTotal),
            }
          : undefined,
      format: "count",
      note: periodCaption,
      title: fuelType ? `${fuelType} registrations` : "Registrations",
      trend: series.map(({ count }) => count),
      value: total,
    },
    {
      format: "percent",
      note: periodCaption,
      title: "Share of new cars",
      trend: series.map(({ share }) => share),
      value: (total / (marketTotal || 1)) * 100,
    },
  ];

  if (rank > 0) {
    tiles.push({
      format: "count",
      href: "/cars/makes",
      note: `of ${makeCount} makes${fuelType ? ", all fuel types" : ""}`,
      title: "Rank",
      value: rank,
    });
  }
  if (topFuel) {
    tiles.push({
      format: "percent",
      note: `of ${make} registrations`,
      title: `${topFuel.name} share`,
      value: (topFuel.count / (makeTotal || 1)) * 100,
    });
  }

  return <KpiTiles tiles={tiles} />;
}

async function TrendFigure({ report }: Pick<SectionProps, "report">) {
  const { month, series } = await report;

  return (
    <TwoShadeTrendChart
      data={series.map(({ count, month: seriesMonth }, index) => {
        const isSelected = seriesMonth === month;
        return {
          count,
          earlier: isSelected ? 0 : count,
          label: formatChartMonth(seriesMonth),
          latest: isSelected ? count : 0,
          title: formatMonthLabel(seriesMonth),
          year:
            index === 0 || seriesMonth.endsWith("-01")
              ? seriesMonth.slice(0, 4)
              : "",
        };
      })}
      height={240}
      maxBarSize={40}
      thinTicks
      ticks={axisTicks(
        series.map(({ count }) => count),
        { zero: true },
      )}
      tooltipLabel="Registrations"
    />
  );
}

async function TrendDescription({ report }: Pick<SectionProps, "report">) {
  const { fuelType, month, seriesRange } = await report;

  return `${periodLabel(month, seriesRange)}${fuelType ? `, ${fuelType} only` : ""}`;
}

async function FuelMixFigure({ make, report }: SectionProps) {
  const { fuelMix, makeTotal } = await report;

  return (
    <>
      <div
        aria-label={`Share of ${make} registrations by fuel type`}
        className="flex h-4 gap-0.5 overflow-hidden rounded-xs"
        role="img"
      >
        {fuelMix.map(({ color, count, name }) => (
          <span
            className="block h-full"
            key={name}
            // A width from the data has no utility class.
            style={{
              background: color,
              width: `${((count / (makeTotal || 1)) * 100).toFixed(2)}%`,
            }}
          />
        ))}
      </div>
      <ul className="flex flex-col">
        {fuelMix.map(({ color, count, name }) => (
          <li
            className="flex items-center gap-2 border-separator border-t py-2 text-sm first:border-t-0"
            key={name}
          >
            <span
              aria-hidden
              className="size-2.5 shrink-0 rounded-xs"
              style={{ background: color }}
            />
            <span className="min-w-0 flex-1 truncate">{name}</span>
            <span className="text-muted tabular-nums">
              {count.toLocaleString("en-SG")}
            </span>
            <span className="w-14 text-right font-semibold tabular-nums">
              {percentage(count, makeTotal)}
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}

async function PeriodDescription({ report }: Pick<SectionProps, "report">) {
  const { periodCaption } = await report;

  return periodCaption;
}

async function MixTableFigure({ make, report }: SectionProps) {
  const { fuelType, mixRows, periodCaption } = await report;

  return (
    <MixTable
      label={`${fuelType ? `${fuelType} ` : ""}${make} registrations by vehicle and fuel type, ${periodCaption}`}
      rows={mixRows}
    />
  );
}

/**
 * The make's KPI tiles, its chart pair and its breakdown table. Every figure
 * follows the search params, so each waits behind its own boundary while the
 * card titles stay in the static shell.
 */
export async function MakeReport({
  make,
  searchParams,
}: {
  make: string;
  searchParams: Promise<SearchParams>;
}) {
  const crossTab = await getMakeCrossTab(make);

  if (crossTab.length === 0) {
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

  return (
    <>
      <SectionErrorBoundary title="Key numbers unavailable">
        <Suspense fallback={<Skeleton className="h-36 w-full" />}>
          <MakeKpis make={make} report={report} />
        </Suspense>
      </SectionErrorBoundary>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <SectionErrorBoundary title="Monthly registrations unavailable">
          <FigureCard
            description={
              <Suspense fallback={" "}>
                <TrendDescription report={report} />
              </Suspense>
            }
            title="Registrations by month"
          >
            <Suspense fallback={<Skeleton className="h-60 w-full" />}>
              <TrendFigure report={report} />
            </Suspense>
          </FigureCard>
        </SectionErrorBoundary>
        <SectionErrorBoundary title="Fuel type mix unavailable">
          <FigureCard
            description={
              <Suspense fallback={" "}>
                <PeriodDescription report={report} />
              </Suspense>
            }
            title="Fuel type mix"
          >
            <Suspense fallback={<Skeleton className="h-60 w-full" />}>
              <FuelMixFigure make={make} report={report} />
            </Suspense>
          </FigureCard>
        </SectionErrorBoundary>
      </div>

      <SectionErrorBoundary title="Breakdown unavailable">
        <FigureCard
          description={
            <Suspense fallback={" "}>
              <PeriodDescription report={report} />
            </Suspense>
          }
          link={{ href: "/cars/makes", label: "All makes" }}
          title="Vehicle and fuel type"
        >
          <Suspense fallback={<Skeleton className="h-80 w-full" />}>
            <MixTableFigure make={make} report={report} />
          </Suspense>
        </FigureCard>
      </SectionErrorBoundary>
    </>
  );
}
