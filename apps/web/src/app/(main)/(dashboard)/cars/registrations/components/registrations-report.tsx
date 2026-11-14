import { formatDateToMonthYear } from "@motormetrics/utils/format-date-to-month-year";
import { slugify } from "@motormetrics/utils/slugify";
import { FuelTypeTable } from "@web/app/(main)/(dashboard)/cars/registrations/components/fuel-type-table";
import {
  TopMakesTable,
  VehicleTypeTable,
} from "@web/app/(main)/(dashboard)/cars/registrations/components/makes-and-types";
import { RegistrationsTrendChart } from "@web/app/(main)/(dashboard)/cars/registrations/components/registrations-trend-chart";
import {
  formatCount,
  loadRegistrationsReport,
  type ReportProps,
} from "@web/app/(main)/(dashboard)/cars/registrations/components/report-head";
import { trendPoints } from "@web/app/(main)/(dashboard)/cars/registrations/components/trend-points";
import {
  loadSearchParams,
  RANGE_MONTHS,
  type Range,
} from "@web/app/(main)/(dashboard)/cars/registrations/search-params";
import { axisTicks } from "@web/app/(main)/(dashboard)/components/overview-series";
import { SectionHead, SourceNote } from "@web/components/shared/overview";
import {
  getCarsComparison,
  getCarsData,
  getMonthlyRegistrationTotals,
  getMonthlyRegistrationTotalsByFuelType,
} from "@web/queries/cars/monthly-registrations";
import {
  getTopMakesByYear,
  getYearlyRegistrations,
} from "@web/queries/cars/yearly-statistics";
import { getCarLogoMap } from "@web/queries/logos";
import { percentageChange } from "@web/utils/change-ratio";
import {
  formatChartMonth,
  formatMonthLabel,
  formatMonthName,
} from "@web/utils/dates/format-month";
import { getMonthOrLatest } from "@web/utils/dates/months";
import { formatVehicleType } from "@web/utils/formatting/format-vehicle-type";
import type { SearchParams } from "nuqs/server";

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
  return fuelType
    ? `${fuelType} registrations by month`
    : "Registrations by month";
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

function lookup(
  rows: { count: number; label: string }[],
  name: string,
): number {
  return rows.find((row) => row.label === name)?.count ?? 0;
}

export async function RegistrationsReport({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const {
    fuelType,
    month: parsedMonth,
    range,
  } = await loadSearchParams(searchParams);
  const [{ month }, yearlyTotals, series] = await Promise.all([
    getMonthOrLatest(parsedMonth, "cars"),
    getYearlyRegistrations(),
    fuelType
      ? getMonthlyRegistrationTotalsByFuelType(fuelType, RANGE_MONTHS[range])
      : getMonthlyRegistrationTotals(RANGE_MONTHS[range]),
  ]);
  const year = Number(month.slice(0, 4));

  const [registrations, comparison, topMakes, logoUrlBySlug] =
    await Promise.all([
      getCarsData(month),
      getCarsComparison(month),
      getTopMakesByYear(year, 10),
      getCarLogoMap(),
    ]);

  const latestMonth = series.at(-1)?.month ?? month;
  const yearTotal =
    yearlyTotals.find((entry) => entry.year === year)?.total ?? 0;

  return (
    <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-14">
      <section className="flex min-w-0 flex-col gap-4">
        <SectionHead
          caption={`${year} year to date · all fuel types`}
          eyebrow="Registrations"
          link={{ href: "/cars/makes", label: "All makes" }}
          title="Top makes"
        />
        <TopMakesTable
          makes={topMakes.map(({ make, value }) => ({
            logoUrl: logoUrlBySlug[slugify(make)] ?? null,
            make,
            value,
          }))}
          total={yearTotal}
        />
        <SourceNote>
          New car registrations by make,{" "}
          {latestMonth.startsWith(`${year}-`)
            ? `January to ${formatMonthLabel(latestMonth)}`
            : `the whole of ${year}`}
          . Not affected by the month or fuel filters.
        </SourceNote>
      </section>

      <section className="flex min-w-0 flex-col gap-4">
        <SectionHead
          caption={`${formatMonthLabel(month)} · against ${formatMonthLabel(comparison.previousYear.period)}`}
          eyebrow="Registrations"
          link={{
            href: "/cars/vehicle-types",
            label: "Vehicle types in full",
          }}
          title="By vehicle type"
        />
        <VehicleTypeTable
          previousYear={year - 1}
          rows={registrations.vehicleType.map(({ count, name }) => ({
            change: percentageChange(
              count,
              lookup(comparison.previousYear.vehicleType, name),
            ),
            count,
            name: formatVehicleType(name),
          }))}
          total={registrations.total}
        />
        <SourceNote>
          A car counts in the month it is registered, which can lag the bidding
          exercise that won its COE by several weeks. Figures cover cars only;
          other vehicle classes are counted separately under their own
          categories.
        </SourceNote>
      </section>
    </div>
  );
}
