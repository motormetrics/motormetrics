import { formatDateToMonthYear } from "@motormetrics/utils/format-date-to-month-year";
import { FuelTypeMenu } from "@web/app/(main)/(dashboard)/cars/registrations/components/filters";
import { FuelTypeTable } from "@web/app/(main)/(dashboard)/cars/registrations/components/fuel-type-table";
import { RegistrationsTrendChart } from "@web/app/(main)/(dashboard)/cars/registrations/components/registrations-trend-chart";
import {
  loadRegistrationsReport,
  lookup,
  type ReportProps,
} from "@web/app/(main)/(dashboard)/cars/registrations/components/report-data";
import { trendPoints } from "@web/app/(main)/(dashboard)/cars/registrations/components/trend-points";
import type { Range } from "@web/app/(main)/(dashboard)/cars/registrations/search-params";
import { axisTicks } from "@web/app/(main)/(dashboard)/components/overview-series";
import { type KpiTile, KpiTiles } from "@web/components/shared/kpi-tiles";
import { getDistinctFuelTypes } from "@web/queries/cars";
import { changeRatio, percentageChange } from "@web/utils/change-ratio";
import {
  formatChartMonth,
  formatMonthLabel,
  formatMonthName,
} from "@web/utils/dates/format-month";
import { getLatestMonth } from "@web/utils/dates/months";

/** What each range covers, for the chart's description. */
const RANGE_CAPTIONS: Record<Range, string> = {
  "1Y": "Last 12 months",
  "3Y": "Last 3 years",
  All: "Every month on record",
};

/** "LTA data to October 2026"; reads only cached data. */
export async function RegistrationsAsOf() {
  return <>LTA data to {formatMonthLabel(await getLatestMonth("cars"))}</>;
}

/** The fuel type filter, with the values LTA records passed in. */
export async function ReportFuelMenu() {
  const fuelTypes = await getDistinctFuelTypes();
  return <FuelTypeMenu fuelTypes={fuelTypes.map(({ fuelType }) => fuelType)} />;
}

/**
 * The selected month against the month before, the year to date against the
 * same months a year earlier, and the twelve-month average and best month.
 * All four follow the fuel filter.
 */
export async function RegistrationsKpis({ searchParams }: ReportProps) {
  const {
    comparison,
    fuelType,
    kpiWindow,
    month,
    previousValue,
    value,
    year,
    yearToDatePrior,
    yearToDateTotal,
  } = await loadRegistrationsReport(searchParams);
  const noun = fuelType ? `${fuelType} cars` : "New cars";
  const totals = kpiWindow.map((row) => row.total);

  const tiles: KpiTile[] = [
    {
      change:
        previousValue > 0
          ? {
              label: `vs ${formatMonthName(comparison.previousMonth.period)}`,
              value: changeRatio(value, previousValue) * 100,
            }
          : undefined,
      format: "count",
      note: formatMonthLabel(month),
      title: noun,
      trend: totals,
      value,
    },
    {
      change:
        yearToDatePrior > 0
          ? {
              label: `vs ${year - 1}`,
              value: changeRatio(yearToDateTotal, yearToDatePrior) * 100,
            }
          : undefined,
      format: "count",
      note: `January to ${formatMonthName(month)} ${year}`,
      title: "Year to date",
      value: yearToDateTotal,
    },
  ];

  return <KpiTiles tiles={tiles} />;
}

/** "Electric registrations by month", or the unfiltered title. */
export async function TrendTitle({ searchParams }: ReportProps) {
  const { fuelType } = await loadRegistrationsReport(searchParams);
  return fuelType
    ? `${fuelType} registrations by month`
    : "Registrations by month";
}

/** "Last 12 months to October 2026 · August 2026 highlighted". */
export async function TrendPeriod({ searchParams }: ReportProps) {
  const { latestMonth, month, range } =
    await loadRegistrationsReport(searchParams);
  const highlight =
    month === latestMonth ? "" : ` · ${formatMonthLabel(month)} highlighted`;
  return `${RANGE_CAPTIONS[range]} to ${formatDateToMonthYear(latestMonth)}${highlight}`;
}

export async function TrendChart({ searchParams }: ReportProps) {
  const { fuelType, month, series } =
    await loadRegistrationsReport(searchParams);

  return (
    <RegistrationsTrendChart
      data={trendPoints(series, month)}
      seriesName={fuelType ? `${fuelType} cars` : "New cars"}
      ticks={axisTicks(
        series.map(({ total }) => total),
        { zero: true },
      )}
    />
  );
}

/** "October 2026 · change on September". */
export async function FuelPeriod({ searchParams }: ReportProps) {
  const { comparison, month } = await loadRegistrationsReport(searchParams);
  return `${formatMonthLabel(month)} · change on ${formatMonthName(comparison.previousMonth.period)}; select a fuel type to filter the page`;
}

export async function FuelTable({ searchParams }: ReportProps) {
  const { comparison, registrations, year, yearToDate } =
    await loadRegistrationsReport(searchParams);

  return (
    <FuelTypeTable
      previousMonthName={formatChartMonth(comparison.previousMonth.period)}
      rows={registrations.fuelType.map(({ count, name }) => ({
        change: percentageChange(
          count,
          lookup(comparison.previousMonth.fuelType, name),
        ),
        count,
        name,
        share: (count / (registrations.total || 1)) * 100,
        yearToDate: yearToDate.find((entry) => entry.name === name)?.count ?? 0,
      }))}
      year={year}
    />
  );
}
