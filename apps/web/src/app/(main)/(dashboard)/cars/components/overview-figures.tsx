import { slugify } from "@motormetrics/utils/slugify";
import {
  YearOnYearChart,
  type YearOnYearPoint,
} from "@web/app/(main)/(dashboard)/cars/components/year-on-year-chart";
import { resolveCarsMonth } from "@web/app/(main)/(dashboard)/cars/search-params";
import { axisTicks } from "@web/app/(main)/(dashboard)/components/overview-series";
import { FigureCard } from "@web/components/shared/figure-card";
import { type KpiTile, KpiTiles } from "@web/components/shared/kpi-tiles";
import {
  getDimensionStats,
  getMonthlyRegistrationTotals,
} from "@web/queries/cars";
import { changeRatio } from "@web/utils/change-ratio";
import {
  formatChartMonth,
  formatMonthLabel,
  formatMonthName,
} from "@web/utils/dates/format-month";
import { getLatestMonth } from "@web/utils/dates/months";
import { formatVehicleType } from "@web/utils/formatting/format-vehicle-type";
import type { SearchParams } from "nuqs/server";

/**
 * Deep enough to reach the oldest month the picker offers, so selecting an
 * early month still yields a full run-up rather than an empty series.
 */
const HISTORY_LIMIT = 360;

/** Months the new-cars tile's sparkline spans. */
const TREND_MONTHS = 12;

interface MonthProps {
  searchParams: Promise<SearchParams>;
}

/** The selected month, the months to it and the year before, oldest first. */
async function loadHistory(searchParams: Promise<SearchParams>) {
  const month = await resolveCarsMonth(searchParams);
  const monthlyTotals = await getMonthlyRegistrationTotals(HISTORY_LIMIT);
  const selectedIndex = monthlyTotals.findIndex((row) => row.month === month);
  const history =
    selectedIndex < 0 ? [] : monthlyTotals.slice(0, selectedIndex + 1);
  const year = Number(month.slice(0, 4));
  const monthOfYear = month.slice(5);

  const sumYear = (target: number) =>
    history
      .filter(
        (row) =>
          row.month.startsWith(`${target}-`) &&
          row.month.slice(5) <= monthOfYear,
      )
      .reduce((total, row) => total + row.total, 0);

  return {
    history,
    month,
    year,
    yearToDate: sumYear(year),
    yearToDatePrior: sumYear(year - 1),
  };
}

/** "LTA data to October 2026"; reads only cached data. */
export async function CarsAsOf() {
  return <>LTA data to {formatMonthLabel(await getLatestMonth("cars"))}</>;
}

/**
 * The selected month's headline numbers: the month's new cars, the year to
 * date, and the make and vehicle type leading that year.
 */
export async function CarsKpis({ searchParams }: MonthProps) {
  const { history, month, year, yearToDate, yearToDatePrior } =
    await loadHistory(searchParams);
  const [makes, vehicleTypes] = await Promise.all([
    getDimensionStats("make", month),
    getDimensionStats("vehicleType", month),
  ]);

  const tiles: KpiTile[] = [];
  const [current, previous] = [history.at(-1), history.at(-2)];

  if (current) {
    tiles.push({
      change: previous
        ? {
            label: `vs ${formatMonthName(previous.month)}`,
            value: changeRatio(current.total, previous.total) * 100,
          }
        : undefined,
      format: "count",
      href: "/cars/registrations",
      note: formatMonthLabel(current.month),
      title: "New cars",
      trend: history.slice(-TREND_MONTHS).map((row) => row.total),
      value: current.total,
    });
  }

  if (yearToDate > 0) {
    tiles.push({
      change:
        yearToDatePrior > 0
          ? {
              label: `vs ${year - 1}`,
              value: changeRatio(yearToDate, yearToDatePrior) * 100,
            }
          : undefined,
      format: "count",
      note: `January to ${formatMonthName(month)} ${year}`,
      title: "Year to date",
      value: yearToDate,
    });
  }

  const [leadingMake] = makes;
  if (leadingMake) {
    tiles.push({
      format: "percent",
      href: `/cars/makes/${slugify(leadingMake.name)}`,
      note: `of new cars, ${year} to date`,
      title: `Top make · ${leadingMake.name}`,
      trend: leadingMake.trend.map(({ value }) => value),
      value: leadingMake.share,
    });
  }

  const [leadingType] = vehicleTypes;
  if (leadingType) {
    tiles.push({
      format: "percent",
      note: `of new cars, ${year} to date`,
      title: `Top vehicle type · ${formatVehicleType(leadingType.name)}`,
      trend: leadingType.trend.map(({ value }) => value),
      value: leadingType.share,
    });
  }

  return <KpiTiles tiles={tiles} />;
}

/**
 * The selected year month by month against the year before it, so the trend
 * reads without a twelve-month bar run that the registrations page already
 * draws in full.
 */
export async function CarsYearOnYearCard({ searchParams }: MonthProps) {
  const { history, month, year } = await loadHistory(searchParams);
  const totals = new Map(history.map((row) => [row.month, row.total]));

  const data: YearOnYearPoint[] = Array.from({ length: 12 }, (_, index) => {
    const monthOfYear = String(index + 1).padStart(2, "0");
    const point: YearOnYearPoint = {
      label: formatChartMonth(`${year}-${monthOfYear}`),
    };
    const current = totals.get(`${year}-${monthOfYear}`);
    const prior = totals.get(`${year - 1}-${monthOfYear}`);
    if (current !== undefined) {
      point.current = current;
    }
    if (prior !== undefined) {
      point.prior = prior;
    }
    return point;
  });

  const values = data.flatMap((point) =>
    [point.current, point.prior].filter(
      (value): value is number => typeof value === "number",
    ),
  );
  if (values.length === 0) {
    return null;
  }

  return (
    <FigureCard
      description={
        <>January to {formatMonthLabel(month)}, against the year before</>
      }
      link={{ href: "/cars/registrations", label: "Full history" }}
      title="New cars by month"
    >
      <YearOnYearChart
        currentLabel={String(year)}
        data={data}
        priorLabel={String(year - 1)}
        ticks={axisTicks(values, { zero: true })}
      />
    </FigureCard>
  );
}
