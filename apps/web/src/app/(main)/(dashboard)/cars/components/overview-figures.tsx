import {
  YearOnYearChart,
  type YearOnYearPoint,
} from "@web/app/(main)/(dashboard)/cars/components/year-on-year-chart";
import { resolveCarsMonth } from "@web/app/(main)/(dashboard)/cars/search-params";
import { axisTicks } from "@web/app/(main)/(dashboard)/components/overview-series";
import { FigureCard } from "@web/components/shared/figure-card";
import { getMonthlyRegistrationTotals } from "@web/queries/cars";
import {
  formatChartMonth,
  formatMonthLabel,
} from "@web/utils/dates/format-month";
import { getLatestMonth } from "@web/utils/dates/months";
import type { SearchParams } from "nuqs/server";

/**
 * Deep enough to reach the oldest month the picker offers, so selecting an
 * early month still yields a full run-up rather than an empty series.
 */
const HISTORY_LIMIT = 360;

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
