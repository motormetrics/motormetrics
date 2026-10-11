import { Typography } from "@heroui/react";
import { formatDateToMonthYear } from "@motormetrics/utils/format-date-to-month-year";
import { MonthlyChart } from "@web/app/(main)/(dashboard)/cars/components/monthly-chart";
import {
  FuelTypeTabs,
  RangeTabs,
} from "@web/app/(main)/(dashboard)/cars/registrations/components/filters";
import { RegistrationsHeadline } from "@web/app/(main)/(dashboard)/cars/registrations/components/registrations-headline";
import {
  loadSearchParams,
  RANGE_MONTHS,
} from "@web/app/(main)/(dashboard)/cars/registrations/search-params";
import { ReportNote, ReportSection } from "@web/components/shared/report";
import {
  Count,
  DeltaText,
  ReportCell,
  ReportRow,
  ReportTable,
  ShareBar,
} from "@web/components/shared/report-table";
import { getDistinctFuelTypes } from "@web/queries/cars";
import {
  getCarsComparison,
  getCarsData,
  getMonthlyRegistrationTotals,
  getMonthlyRegistrationTotalsByFuelType,
  getYearToDateByFuelType,
} from "@web/queries/cars/monthly-registrations";
import {
  getTopMakesByYear,
  getYearlyRegistrations,
} from "@web/queries/cars/yearly-statistics";
import { percentageChange } from "@web/utils/change-ratio";
import {
  formatChartMonth,
  formatMonthLabel,
} from "@web/utils/dates/format-month";
import { getMonthOrLatest } from "@web/utils/dates/months";
import { formatVehicleType } from "@web/utils/formatting/format-vehicle-type";
import Link from "next/link";
import type { SearchParams } from "nuqs/server";

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
  const [{ month }, fuelTypes, yearlyTotals, series] = await Promise.all([
    getMonthOrLatest(parsedMonth, "cars"),
    getDistinctFuelTypes(),
    getYearlyRegistrations(),
    fuelType
      ? getMonthlyRegistrationTotalsByFuelType(fuelType, RANGE_MONTHS[range])
      : getMonthlyRegistrationTotals(RANGE_MONTHS[range]),
  ]);
  const year = Number(month.slice(0, 4));

  const [registrations, comparison, yearToDate, topMakes] = await Promise.all([
    getCarsData(month),
    getCarsComparison(month),
    getYearToDateByFuelType(year),
    getTopMakesByYear(year, 10),
  ]);

  const formattedMonth = formatDateToMonthYear(month);
  const showYear = range !== "1Y";
  const chartData = series.map(({ month: seriesMonth, total }) => ({
    label: formatChartMonth(seriesMonth, showYear),
    total,
  }));

  // The headline follows the filter: the fuel type's own count when one is
  // selected, the month's full total otherwise.
  const headlineValue = fuelType
    ? (registrations.fuelType.find(({ name }) => name === fuelType)?.count ?? 0)
    : registrations.total;
  const previousValue = fuelType
    ? lookup(comparison.previousMonth.fuelType, fuelType)
    : comparison.previousMonth.total;

  const lastTwelve = series.slice(-12).map(({ total }) => total);
  const monthlyAverage = lastTwelve.length
    ? Math.round(
        lastTwelve.reduce((sum, total) => sum + total, 0) / lastTwelve.length,
      )
    : 0;
  const bestMonth = lastTwelve.length ? Math.max(...lastTwelve) : 0;
  const yearToDateTotal = series
    .filter(({ month: seriesMonth }) => seriesMonth.startsWith(`${year}-`))
    .reduce((sum, { total }) => sum + total, 0);

  const yearTotal =
    yearlyTotals.find((entry) => entry.year === year)?.total ?? 0;
  const makeLeader = topMakes[0]?.value ?? 0;

  return (
    <>
      {/* Fuel type narrows the headline and the chart; range sets the chart
          window. Each label sits over its own control, as in the comp. */}
      <div className="flex flex-wrap items-end gap-6 border-border border-y py-4 max-md:flex-col max-md:items-stretch max-md:gap-4">
        <div className="flex min-w-0 max-w-full flex-col gap-2">
          <span className="font-semibold text-muted text-xs">Fuel type</span>
          <FuelTypeTabs
            fuelTypes={fuelTypes.map(({ fuelType: name }) => name)}
          />
        </div>
        <div className="flex flex-col gap-2 md:ml-auto">
          <span className="font-semibold text-muted text-xs">Range</span>
          <RangeTabs />
        </div>
      </div>

      <RegistrationsHeadline
        label={
          fuelType ? `${fuelType} cars registered` : "All new car registrations"
        }
        previousMonth={comparison.previousMonth.period}
        previousValue={previousValue}
        stats={[
          {
            label: "Previous month",
            note: formatMonthLabel(comparison.previousMonth.period),
            value: previousValue,
          },
          {
            label: `${year} year to date`,
            note: `${series.filter(({ month: m }) => m.startsWith(`${year}-`)).length} months`,
            value: yearToDateTotal,
          },
          {
            label: "Monthly average",
            note: "last 12 months",
            value: monthlyAverage,
          },
          { label: "Best month", note: "last 12 months", value: bestMonth },
        ]}
        sub={`${formatMonthLabel(month)} · ${fuelType ? `${((headlineValue / (registrations.total || 1)) * 100).toFixed(1)}% of the month` : "every fuel type"}`}
        value={headlineValue}
      />

      <MonthlyChart data={chartData} />

      <ReportSection
        caption={`${formattedMonth} · all makes`}
        title="By fuel type"
      >
        <ReportTable
          columns={[
            { label: "Fuel type" },
            { align: "end", label: "Registrations" },
            { align: "end", label: "Share" },
            { label: "", width: "260px" },
            { align: "end", label: "Year to date" },
            { align: "end", label: "Vs previous", width: "120px" },
          ]}
        >
          {registrations.fuelType.map(({ count, name }) => (
            <ReportRow isActive={name === fuelType} key={name}>
              <ReportCell className="font-bold text-base">{name}</ReportCell>
              <ReportCell align="end" className="font-extrabold text-lg">
                <Count value={count} />
              </ReportCell>
              <ReportCell align="end" className="font-semibold text-muted">
                {((count / (registrations.total || 1)) * 100).toFixed(1)}%
              </ReportCell>
              <ReportCell>
                <ShareBar
                  share={(count / (registrations.total || 1)) * 100}
                  isLeader={name === registrations.fuelType[0]?.name}
                />
              </ReportCell>
              <ReportCell align="end" className="font-semibold text-muted">
                <Count
                  value={
                    yearToDate.find((entry) => entry.name === name)?.count ?? 0
                  }
                />
              </ReportCell>
              <ReportCell align="end">
                <DeltaText
                  value={percentageChange(
                    count,
                    lookup(comparison.previousMonth.fuelType, name),
                  )}
                />
              </ReportCell>
            </ReportRow>
          ))}
        </ReportTable>
      </ReportSection>

      <ReportSection caption={`${year} year to date`} title="Top makes">
        <ReportTable
          columns={[
            { label: "#", width: "60px" },
            { label: "Make" },
            { align: "end", label: "Registrations" },
            { align: "end", label: "Share" },
            { label: "", width: "300px" },
          ]}
        >
          {topMakes.map(({ make, value }, index) => (
            <ReportRow key={make}>
              <ReportCell className="font-bold text-muted text-sm">
                {String(index + 1).padStart(2, "0")}
              </ReportCell>
              <ReportCell className="font-bold text-base">{make}</ReportCell>
              <ReportCell align="end" className="font-extrabold text-lg">
                <Count value={value} />
              </ReportCell>
              <ReportCell align="end" className="font-semibold text-muted">
                {((value / (yearTotal || 1)) * 100).toFixed(1)}%
              </ReportCell>
              <ReportCell>
                <ShareBar
                  isLeader={index === 0}
                  share={(value / (makeLeader || 1)) * 100}
                />
              </ReportCell>
            </ReportRow>
          ))}
        </ReportTable>
      </ReportSection>

      <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1fr_380px]">
        <ReportSection title="By vehicle type">
          <ReportTable
            columns={[
              { label: "Type" },
              { align: "end", label: "Registrations" },
              { align: "end", label: "Share" },
              { align: "end", label: `Vs ${year - 1}`, width: "110px" },
            ]}
          >
            {registrations.vehicleType.map(({ count, name }) => (
              <ReportRow key={name}>
                <ReportCell className="font-semibold">
                  {formatVehicleType(name)}
                </ReportCell>
                <ReportCell align="end" className="font-extrabold">
                  <Count value={count} />
                </ReportCell>
                <ReportCell align="end" className="font-semibold text-muted">
                  {((count / (registrations.total || 1)) * 100).toFixed(1)}%
                </ReportCell>
                <ReportCell align="end">
                  <DeltaText
                    value={percentageChange(
                      count,
                      lookup(comparison.previousYear.vehicleType, name),
                    )}
                  />
                </ReportCell>
              </ReportRow>
            ))}
          </ReportTable>
        </ReportSection>

        <ReportNote title="How this is counted">
          <Typography.Paragraph>
            A car counts in the month it is registered, which can lag the
            bidding exercise that won its COE by several weeks.
          </Typography.Paragraph>
          <Typography.Paragraph>
            Figures cover cars only. Other vehicle classes are counted
            separately under their own categories.
          </Typography.Paragraph>
          <Link
            className="font-bold text-accent-strong text-base"
            href="/cars/makes"
          >
            All makes →
          </Link>
          <Link
            className="font-bold text-accent-strong text-base"
            href="/cars/fuel-types"
          >
            Fuel types in full →
          </Link>
          <Link
            className="font-bold text-accent-strong text-base"
            href="/cars/vehicle-types"
          >
            Vehicle types in full →
          </Link>
        </ReportNote>
      </div>
    </>
  );
}
