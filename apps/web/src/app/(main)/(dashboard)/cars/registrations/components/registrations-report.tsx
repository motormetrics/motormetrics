import { Typography } from "@heroui/react";
import { formatDateToMonthYear } from "@motormetrics/utils";
import {
  FuelTypeTabs,
  RangeTabs,
} from "@web/app/(main)/(dashboard)/cars/registrations/components/filters";
import { RegistrationsChart } from "@web/app/(main)/(dashboard)/cars/registrations/components/registrations-chart";
import {
  loadSearchParams,
  RANGE_MONTHS,
} from "@web/app/(main)/(dashboard)/cars/registrations/search-params";
import { DeltaChip } from "@web/components/shared/delta-chip";
import {
  ReportFilterBar,
  ReportHeadline,
  ReportNote,
  ReportSection,
  ReportStat,
} from "@web/components/shared/report";
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
import { getMonthOrLatest } from "@web/utils/dates/months";
import { formatVehicleType } from "@web/utils/formatting/format-vehicle-type";
import Link from "next/link";
import type { SearchParams } from "nuqs/server";

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** Percentage change, guarding the division so an absent base reads as flat. */
function percentageChange(current: number, previous: number): number {
  if (!previous) {
    return 0;
  }

  return ((current - previous) / previous) * 100;
}

/** `2025-10` → `Oct`, or `Oct '24` once the window spans more than a year. */
function chartLabel(month: string, showYear: boolean): string {
  const [year, monthNumber] = month.split("-");
  const label = MONTH_LABELS[Number(monthNumber) - 1] ?? month;

  return showYear ? `${label} '${year.slice(2)}` : label;
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
  const { month } = await getMonthOrLatest(parsedMonth, "cars");
  const year = Number(month.slice(0, 4));

  const [
    registrations,
    comparison,
    fuelTypes,
    yearToDate,
    topMakes,
    yearlyTotals,
    series,
  ] = await Promise.all([
    getCarsData(month),
    getCarsComparison(month),
    getDistinctFuelTypes(),
    getYearToDateByFuelType(year),
    getTopMakesByYear(year, 10),
    getYearlyRegistrations(),
    fuelType
      ? getMonthlyRegistrationTotalsByFuelType(fuelType, RANGE_MONTHS[range])
      : getMonthlyRegistrationTotals(RANGE_MONTHS[range]),
  ]);

  const formattedMonth = formatDateToMonthYear(month);
  const showYear = range !== "1Y";
  const chartData = series.map(({ month: seriesMonth, total }) => ({
    label: chartLabel(seriesMonth, showYear),
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
      <ReportFilterBar
        label="Fuel type"
        trailing={<RangeTabs />}
        trailingLabel="Range"
      >
        <FuelTypeTabs fuelTypes={fuelTypes.map(({ fuelType: name }) => name)} />
      </ReportFilterBar>

      <ReportHeadline
        delta={
          <DeltaChip value={percentageChange(headlineValue, previousValue)} />
        }
        label={
          fuelType ? `${fuelType} cars registered` : "All new car registrations"
        }
        stats={
          <>
            <ReportStat
              label="Previous month"
              note={formatDateToMonthYear(comparison.previousMonth.period)}
              value={<Count value={previousValue} />}
            />
            <ReportStat
              label={`${year} year to date`}
              note={`${series.filter(({ month: m }) => m.startsWith(`${year}-`)).length} months`}
              value={<Count value={yearToDateTotal} />}
            />
            <ReportStat
              label="Monthly average"
              note="last 12 months"
              value={<Count value={monthlyAverage} />}
            />
            <ReportStat
              label="Best month"
              note="last 12 months"
              value={<Count value={bestMonth} />}
            />
          </>
        }
        sub={`${formattedMonth} · ${fuelType ? `${((headlineValue / (registrations.total || 1)) * 100).toFixed(1)}% of the month` : "every fuel type"}`}
        value={<Count value={headlineValue} />}
      />

      <RegistrationsChart data={chartData} />

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
