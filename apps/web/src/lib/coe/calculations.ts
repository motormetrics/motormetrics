import type { Period } from "@web/app/(main)/(dashboard)/coe/search-params";
import { format, subMonths, subYears } from "date-fns";

/**
 * Format a date to YYYY-MM format for the current month
 */
const formatCurrentMonth = (date: Date): string =>
  date.toISOString().slice(0, 7);

/**
 * Get date range for a given year (defaults to current year)
 */
export const getDateRangeForYear = (
  year?: number,
): { startMonth: string; endMonth: string } => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const targetYear = year ?? currentYear;

  const startMonth = `${targetYear}-01`;
  const endMonth =
    targetYear < currentYear
      ? `${targetYear}-12`
      : formatCurrentMonth(currentDate);

  return { startMonth, endMonth };
};

/**
 * Get date range for the last 24 months from current date
 */
export const getDateRange24Months = (): {
  startMonth: string;
  endMonth: string;
} => {
  const currentDate = new Date();
  const startDate = subMonths(currentDate, 24);

  return {
    startMonth: startDate.toISOString().slice(0, 7),
    endMonth: currentDate.toISOString().slice(0, 7),
  };
};

/**
 * Convert a period string to a date range
 */
export const getDateRangeFromPeriod = (
  period: Period,
  latestMonth: string,
  earliestMonth: string,
): { start: string; end: string } => {
  const latest = new Date(`${latestMonth}-01`);

  switch (period) {
    case "12m":
      return {
        start: format(subMonths(latest, 12), "yyyy-MM"),
        end: latestMonth,
      };
    case "5y":
      return {
        start: format(subYears(latest, 5), "yyyy-MM"),
        end: latestMonth,
      };
    case "10y":
      return {
        start: format(subYears(latest, 10), "yyyy-MM"),
        end: latestMonth,
      };
    case "ytd":
      return { start: `${new Date().getFullYear()}-01`, end: latestMonth };
    case "all":
      return { start: earliestMonth, end: latestMonth };
  }
};
