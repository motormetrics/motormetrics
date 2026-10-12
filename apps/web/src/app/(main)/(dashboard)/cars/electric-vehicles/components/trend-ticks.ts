import { formatChartMonth } from "@web/utils/dates/format-month";

export interface TrendTick {
  /** "Aug". */
  label: string;
  /** "2026" under the first tick of each year; empty elsewhere. */
  year: string;
}

/**
 * The month ticks the trend chart draws: every `every`th month, counted back
 * from the newest so the last month is always labelled, with the year under
 * the first tick of each year. Months without a tick map to `null`.
 */
export function trendTicks(
  months: string[],
  every: number,
): (TrendTick | null)[] {
  const step = Math.max(1, every);
  let shownYear: string | null = null;

  return months.map((month, index) => {
    if ((months.length - 1 - index) % step !== 0) {
      return null;
    }
    const year = month.slice(0, 4);
    const tick = {
      label: formatChartMonth(month),
      year: year === shownYear ? "" : year,
    };
    shownYear = year;
    return tick;
  });
}
