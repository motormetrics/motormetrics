import { formatDateToMonthYear } from "@motormetrics/utils/format-date-to-month-year";
import { formatChartMonth } from "@web/utils/dates/format-month";

/**
 * One month of the stacked chart. Each category's count sits under
 * `selected<n>` for the selected month and under `other<n>` for every other,
 * the other key zero — Pro does not re-export Recharts' `Cell`, so the dimmed
 * columns are a second set of stacked series rather than a per-bar style.
 */
export interface StackedPoint {
  [key: string]: number | string;
  /** "Aug". */
  label: string;
  /** "Aug 2026", the tooltip header. */
  title: string;
  total: number;
  /** "2026" under the first month and every January; empty elsewhere. */
  year: string;
}

export function stackedPoints(
  series: { counts: number[]; month: string; total: number }[],
  selectedMonth: string,
): StackedPoint[] {
  return series.map(({ counts, month, total }, index) => {
    const isSelected = month === selectedMonth;
    const point: StackedPoint = {
      label: formatChartMonth(month),
      title: formatDateToMonthYear(month),
      total,
      year: index === 0 || month.endsWith("-01") ? month.slice(0, 4) : "",
    };

    counts.forEach((count, categoryIndex) => {
      point[`selected${categoryIndex}`] = isSelected ? count : 0;
      point[`other${categoryIndex}`] = isSelected ? 0 : count;
    });

    return point;
  });
}
