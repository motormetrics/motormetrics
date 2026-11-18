import { formatDateToMonthYear } from "@motormetrics/utils/format-date-to-month-year";
import { FuelTypeTable } from "@web/app/(main)/(dashboard)/cars/components/fuel-type-table";
import { VehicleTypeTable } from "@web/app/(main)/(dashboard)/cars/components/makes-and-types";
import type { Range } from "@web/app/(main)/(dashboard)/cars/components/ranges";
import { RegistrationsTrendChart } from "@web/app/(main)/(dashboard)/cars/components/registrations-trend-chart";
import {
  formatCount,
  loadRegistrationsReport,
  lookup,
  type ReportProps,
} from "@web/app/(main)/(dashboard)/cars/components/report-head";
import { trendPoints } from "@web/app/(main)/(dashboard)/cars/components/trend-points";
import { axisTicks } from "@web/app/(main)/(dashboard)/components/overview-series";
import { percentageChange } from "@web/utils/change-ratio";
import {
  formatChartMonth,
  formatMonthLabel,
  formatMonthName,
} from "@web/utils/dates/format-month";
import { formatVehicleType } from "@web/utils/formatting/format-vehicle-type";

/**
 * The figures under the head: the trend, the fuel type table and the vehicle
 * types. Each piece reads the shared report and streams on its
 * own, so the figure headings stay in the static shell.
 */

/** What each range covers, for the chart's eyebrow. */
const RANGE_CAPTIONS: Record<Range, string> = {
  "1Y": "Last 12 months",
  "3Y": "Last 3 years",
  All: "Every month on record",
};

/** "Last 12 months to August 2026". */
export async function TrendPeriod({ searchParams }: ReportProps) {
  const { latestMonth, range } = await loadRegistrationsReport(searchParams);
  return `${RANGE_CAPTIONS[range]} to ${formatDateToMonthYear(latestMonth)}`;
}

export async function TrendTitle({ searchParams }: ReportProps) {
  const { fuelType } = await loadRegistrationsReport(searchParams);
  return fuelType ? `${fuelType} cars by month` : "New cars by month";
}

/** "Registrations peaked at 6,390 in December 2025 over this window; …" */
export async function TrendCaption({ searchParams }: ReportProps) {
  const { fuelType, month, series, value } =
    await loadRegistrationsReport(searchParams);
  const peak = series.reduce<(typeof series)[number] | undefined>(
    (best, row) => (!best || row.total > best.total ? row : best),
    undefined,
  );
  if (!peak) {
    return null;
  }

  return `${fuelType ? `${fuelType} registrations` : "Registrations"} peaked at ${formatCount(peak.total)} in ${formatMonthLabel(peak.month)} over this window; ${formatMonthLabel(month)}, highlighted, had ${formatCount(value)}.`;
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

/** "New car registrations, all makes and fuel types. … August 2026 is highlighted." */
export async function TrendNote({ searchParams }: ReportProps) {
  const { fuelType, month } = await loadRegistrationsReport(searchParams);

  return `${fuelType ? `New ${fuelType} car registrations, all makes.` : "New car registrations, all makes and fuel types."} The chart always runs to the latest month; ${formatDateToMonthYear(month)} is highlighted.`;
}

function fuelRows(report: Awaited<ReturnType<typeof loadRegistrationsReport>>) {
  const { comparison, registrations, yearToDate } = report;

  return registrations.fuelType.map(({ count, name }) => ({
    change: percentageChange(
      count,
      lookup(comparison.previousMonth.fuelType, name),
    ),
    count,
    name,
    share: (count / (registrations.total || 1)) * 100,
    yearToDate: yearToDate.find((entry) => entry.name === name)?.count ?? 0,
  }));
}

/**
 * "Electric cars were 63.3% of the 4,549 registered in August 2026;
 * Petrol-Electric (Plug-In) rose most on July, +87.0%."
 */
export async function FuelCaption({ searchParams }: ReportProps) {
  const report = await loadRegistrationsReport(searchParams);
  const rows = fuelRows(report);
  const [top] = rows;
  const riser = [...rows].sort((a, b) => b.change - a.change)[0];
  if (!top || !riser) {
    return null;
  }

  const sign = riser.change < 0 ? "−" : "+";
  const movement = `${sign}${Math.abs(riser.change).toFixed(1)}%`;
  const previous = formatMonthName(report.comparison.previousMonth.period);

  return `${top.name} cars were ${top.share.toFixed(1)}% of the ${formatCount(report.registrations.total)} registered in ${formatMonthLabel(report.month)}; ${riser.name} ${riser.change > 0 ? `rose most on ${previous}, ${movement}` : `fell least, ${movement}`}.`;
}

export async function FuelTable({ searchParams }: ReportProps) {
  const report = await loadRegistrationsReport(searchParams);

  return (
    <FuelTypeTable
      previousMonthName={formatChartMonth(
        report.comparison.previousMonth.period,
      )}
      rows={fuelRows(report)}
      year={report.year}
    />
  );
}

export async function FuelNote({ searchParams }: ReportProps) {
  const { latestMonth, month, registrations, year } =
    await loadRegistrationsReport(searchParams);

  return `Share is of ${formatCount(registrations.total)} new cars in ${formatMonthLabel(month)}. Change is against the previous month; colour is not used for direction. Year to date covers ${latestMonth.startsWith(`${year}-`) ? `January to ${formatMonthLabel(latestMonth)}` : `the whole of ${year}`}. Select a row to filter the headline and chart.`;
}

function vehicleTypeRows(
  report: Awaited<ReturnType<typeof loadRegistrationsReport>>,
) {
  return report.registrations.vehicleType.map(({ count, name }) => ({
    change: percentageChange(
      count,
      lookup(report.comparison.previousYear.vehicleType, name),
    ),
    count,
    name: formatVehicleType(name),
  }));
}

/** "August 2026 · against August 2025". */
export async function VehicleTypePeriod({ searchParams }: ReportProps) {
  const { comparison, month } = await loadRegistrationsReport(searchParams);
  return `${formatMonthLabel(month)} · against ${formatMonthLabel(comparison.previousYear.period)}`;
}

export async function VehicleTypes({ searchParams }: ReportProps) {
  const report = await loadRegistrationsReport(searchParams);

  return (
    <VehicleTypeTable
      previousYear={report.year - 1}
      rows={vehicleTypeRows(report)}
      total={report.registrations.total}
    />
  );
}
