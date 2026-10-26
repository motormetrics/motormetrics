import type { MakeCrossTabRow } from "@web/queries/cars/makes/period-totals";
import { percentageChange } from "@web/utils/change-ratio";
import { shiftMonth, trailingMonths } from "@web/utils/dates/month-arithmetic";

/** How many months the trend chart and the monthly table cover. */
export const SERIES_LENGTH = 24;

/** One make's figures for the comparison, all from its cross-tab rows. */
export interface MakeFigures {
  /** Change on the same months a year earlier, in %; `null` without a baseline. */
  change: number | null;
  /** Battery-electric registrations, year to date. */
  electric: number;
  /** Year-to-date registrations by LTA fuel type. */
  fuelCounts: Map<string, number>;
  /** Registrations over the same months of the previous year. */
  previous: number;
  /** Registrations per month over the trailing 24 months, oldest first. */
  series: number[];
  /** Year-to-date registrations by LTA vehicle type. */
  vehicleCounts: Map<string, number>;
  /** Registrations from January to the latest month. */
  ytd: number;
}

const sumCounts = (rows: MakeCrossTabRow[]): number =>
  rows.reduce((total, row) => total + row.count, 0);

const tallyBy = (
  rows: MakeCrossTabRow[],
  key: "fuelType" | "vehicleType",
): Map<string, number> => {
  const counts = new Map<string, number>();
  for (const row of rows) {
    counts.set(row[key], (counts.get(row[key]) ?? 0) + row.count);
  }
  return counts;
};

const inWindow = (rows: MakeCrossTabRow[], start: string, end: string) =>
  rows.filter((row) => row.month >= start && row.month <= end);

/**
 * Reduce one make's cross-tab to the comparison's figures: year to date
 * (January to `month`) against the same months of the year before, the fuel
 * and vehicle mix over the year to date, and a zero-filled 24-month series —
 * the cross-tab drops zero-count cells, so a missing month means none.
 */
export function buildMakeFigures(
  rows: MakeCrossTabRow[],
  month: string,
): MakeFigures {
  const start = `${month.slice(0, 4)}-01`;
  const yearToDate = inWindow(rows, start, month);
  const ytd = sumCounts(yearToDate);
  const previous = sumCounts(
    inWindow(rows, shiftMonth(start, -12), shiftMonth(month, -12)),
  );
  const fuelCounts = tallyBy(yearToDate, "fuelType");

  const months = trailingMonths(month, SERIES_LENGTH);
  const byMonth = new Map<string, number>();
  for (const row of inWindow(rows, months[0], month)) {
    byMonth.set(row.month, (byMonth.get(row.month) ?? 0) + row.count);
  }

  return {
    change: previous === 0 ? null : percentageChange(ytd, previous),
    electric: fuelCounts.get("Electric") ?? 0,
    fuelCounts,
    previous,
    series: months.map((seriesMonth) => byMonth.get(seriesMonth) ?? 0),
    vehicleCounts: tallyBy(yearToDate, "vehicleType"),
    ytd,
  };
}
