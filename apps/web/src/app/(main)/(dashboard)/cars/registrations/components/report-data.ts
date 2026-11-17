import {
  loadSearchParams,
  RANGE_MONTHS,
} from "@web/app/(main)/(dashboard)/cars/registrations/search-params";
import {
  getCarsComparison,
  getCarsData,
  getMonthlyRegistrationTotals,
  getMonthlyRegistrationTotalsByFuelType,
  getYearToDateByFuelType,
} from "@web/queries/cars/monthly-registrations";
import { getMonthOrLatest } from "@web/utils/dates/months";
import type { SearchParams } from "nuqs/server";
import { cache } from "react";

/** Months the KPI sparkline, average and best month look back over. */
export const KPI_MONTHS = 12;

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
    const [{ month }, history] = await Promise.all([
      getMonthOrLatest(parsedMonth, "cars"),
      fuelType
        ? getMonthlyRegistrationTotalsByFuelType(fuelType, RANGE_MONTHS.All)
        : getMonthlyRegistrationTotals(RANGE_MONTHS.All),
    ]);
    const year = Number(month.slice(0, 4));

    const [registrations, comparison, yearToDate] = await Promise.all([
      getCarsData(month),
      getCarsComparison(month),
      getYearToDateByFuelType(year),
    ]);

    // History runs to the latest month; the KPIs stop at the selected one.
    const selectedIndex = history.findIndex((row) => row.month === month);
    const toMonth =
      selectedIndex < 0 ? [] : history.slice(0, selectedIndex + 1);
    const monthOfYear = month.slice(5);
    const sumYear = (target: number) =>
      toMonth
        .filter(
          (row) =>
            row.month.startsWith(`${target}-`) &&
            row.month.slice(5) <= monthOfYear,
        )
        .reduce((sum, row) => sum + row.total, 0);

    // The headline follows the filter: the fuel type's own count when one is
    // selected, the month's full total otherwise.
    const value = fuelType
      ? (registrations.fuelType.find(({ name }) => name === fuelType)?.count ??
        0)
      : registrations.total;
    const previousValue = fuelType
      ? lookup(comparison.previousMonth.fuelType, fuelType)
      : comparison.previousMonth.total;

    return {
      comparison,
      fuelType,
      kpiWindow: toMonth.slice(-KPI_MONTHS),
      latestMonth: history.at(-1)?.month ?? month,
      month,
      previousValue,
      range,
      registrations,
      series: history.slice(-RANGE_MONTHS[range]),
      value,
      year,
      yearToDate,
      yearToDateTotal: sumYear(year),
      yearToDatePrior: sumYear(year - 1),
    };
  },
);
