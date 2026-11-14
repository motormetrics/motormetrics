import { Typography } from "@heroui/react";
import { KeyNumberList } from "@web/app/(main)/(dashboard)/cars/components/keys-aside";
import {
  changeLabel,
  RangeHero,
  rangeSummary,
} from "@web/app/(main)/(dashboard)/cars/components/range-hero";
import { FuelTypeTabs } from "@web/app/(main)/(dashboard)/cars/registrations/components/filters";
import {
  loadSearchParams,
  RANGE_MONTHS,
} from "@web/app/(main)/(dashboard)/cars/registrations/search-params";
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
import {
  formatChartMonth,
  formatMonthLabel,
  formatMonthName,
} from "@web/utils/dates/format-month";
import { getMonthOrLatest } from "@web/utils/dates/months";
import type { SearchParams } from "nuqs/server";
import { cache } from "react";

/** Months the hero's range spans, ending at the selected month. */
const HERO_MONTHS = 24;

export const formatCount = (value: number) => value.toLocaleString("en-SG");

/** A named count from one of the comparison's breakdowns, or zero. */
export function lookup(
  rows: { count: number; label: string }[],
  name: string,
): number {
  return rows.find((row) => row.label === name)?.count ?? 0;
}

export interface ReportProps {
  searchParams: Promise<SearchParams>;
}

/**
 * Everything the page draws for the selected month, fuel type and range.
 * Every query is cached; `cache` keys on the search params promise so the
 * sections that stream separately share one pass over them per request.
 */
export const loadRegistrationsReport = cache(
  async (searchParams: Promise<SearchParams>) => {
    const {
      fuelType,
      month: parsedMonth,
      range,
    } = await loadSearchParams(searchParams);
    const [{ month }, yearlyTotals, history] = await Promise.all([
      getMonthOrLatest(parsedMonth, "cars"),
      getYearlyRegistrations(),
      fuelType
        ? getMonthlyRegistrationTotalsByFuelType(fuelType, RANGE_MONTHS.All)
        : getMonthlyRegistrationTotals(RANGE_MONTHS.All),
    ]);
    const year = Number(month.slice(0, 4));

    const [registrations, comparison, yearToDate, topMakes] = await Promise.all(
      [
        getCarsData(month),
        getCarsComparison(month),
        getYearToDateByFuelType(year),
        getTopMakesByYear(year, 10),
      ],
    );

    const series = history.slice(-RANGE_MONTHS[range]);
    const latestMonth = history.at(-1)?.month ?? month;

    // The headline follows the filter: the fuel type's own count when one is
    // selected, the month's full total otherwise.
    const value = fuelType
      ? (registrations.fuelType.find(({ name }) => name === fuelType)?.count ??
        0)
      : registrations.total;
    const previousValue = fuelType
      ? lookup(comparison.previousMonth.fuelType, fuelType)
      : comparison.previousMonth.total;

    const selectedIndex = history.findIndex((row) => row.month === month);
    const heroWindow = history
      .slice(Math.max(0, selectedIndex + 1 - HERO_MONTHS), selectedIndex + 1)
      .map(({ total }) => total);

    const lastTwelve = history.slice(-12).map(({ total }) => total);
    const yearMonths = history.filter((row) =>
      row.month.startsWith(`${year}-`),
    );

    return {
      comparison,
      fuelType,
      history,
      latestMonth,
      month,
      previousValue,
      range,
      registrations,
      series,
      topMakes,
      value,
      year,
      yearMonths,
      yearToDate,
      yearTotal: yearlyTotals.find((entry) => entry.year === year)?.total ?? 0,
      heroRange: rangeSummary(heroWindow, value, `${HERO_MONTHS} months`),
      monthlyAverage: lastTwelve.length
        ? Math.round(
            lastTwelve.reduce((sum, total) => sum + total, 0) /
              lastTwelve.length,
          )
        : 0,
      bestMonth: lastTwelve.length ? Math.max(...lastTwelve) : 0,
    };
  },
);

/** "August 2026". */
export async function ReportMonth({ searchParams }: ReportProps) {
  const { month } = await loadRegistrationsReport(searchParams);
  return formatMonthLabel(month);
}

/** "all fuel types", or the selected fuel type. */
export async function ReportFuel({ searchParams }: ReportProps) {
  const { fuelType } = await loadRegistrationsReport(searchParams);
  return fuelType ?? "all fuel types";
}

/** The fuel type filter, with the values LTA records passed in. */
export async function ReportFuelTabs() {
  const fuelTypes = await getDistinctFuelTypes();
  return <FuelTypeTabs fuelTypes={fuelTypes.map(({ fuelType }) => fuelType)} />;
}

export async function ReportHero({ searchParams }: ReportProps) {
  const { comparison, fuelType, heroRange, month, previousValue, value } =
    await loadRegistrationsReport(searchParams);

  if (!heroRange) {
    return null;
  }

  return (
    <RangeHero
      change={changeLabel(
        value,
        previousValue,
        formatChartMonth(comparison.previousMonth.period),
      )}
      label={
        fuelType ? `${fuelType} cars registered` : "All new car registrations"
      }
      period={formatMonthLabel(month)}
      range={heroRange}
      span={`${HERO_MONTHS}-month`}
    />
  );
}

/**
 * "4,549 new cars were registered in August 2026, 8.2% fewer than in July;
 * 36,646 so far in 2026."
 */
export async function ReportLead({ searchParams }: ReportProps) {
  const {
    comparison,
    fuelType,
    month,
    previousValue,
    registrations,
    value,
    year,
    yearMonths,
  } = await loadRegistrationsReport(searchParams);
  const noun = fuelType ? `${fuelType} cars` : "new cars";
  const change =
    previousValue > 0
      ? `, ${Math.abs(((value - previousValue) / previousValue) * 100).toFixed(1)}% ${value < previousValue ? "fewer" : "more"} than in ${formatMonthName(comparison.previousMonth.period)}`
      : "";
  const close = fuelType
    ? `, ${((value / (registrations.total || 1)) * 100).toFixed(1)}% of the month's ${formatCount(registrations.total)}`
    : `; ${formatCount(yearMonths.reduce((sum, row) => sum + row.total, 0))} so far in ${year}`;

  return (
    <Typography.Paragraph className="max-w-prose tabular-nums">
      {formatCount(value)} {noun} were registered in {formatMonthLabel(month)}
      {change}
      {close}.
    </Typography.Paragraph>
  );
}

export async function ReportKeyNumbers({ searchParams }: ReportProps) {
  const {
    bestMonth,
    comparison,
    monthlyAverage,
    previousValue,
    year,
    yearMonths,
  } = await loadRegistrationsReport(searchParams);

  return (
    <KeyNumberList
      items={[
        {
          label: "Previous month",
          note: formatMonthLabel(comparison.previousMonth.period),
          value: formatCount(previousValue),
        },
        {
          label: `${year} year to date`,
          note: `${yearMonths.length} months`,
          value: formatCount(
            yearMonths.reduce((sum, row) => sum + row.total, 0),
          ),
        },
        {
          label: "Monthly average",
          note: "Last 12 months",
          value: formatCount(monthlyAverage),
        },
        {
          label: "Best month",
          note: "Last 12 months",
          value: formatCount(bestMonth),
        },
      ]}
    />
  );
}
