import { formatDateToMonthYear } from "@motormetrics/utils/format-date-to-month-year";
import type { TrendPoint } from "@web/app/(main)/(dashboard)/cars/registrations/components/registrations-trend-chart";
import { formatChartMonth } from "@web/utils/dates/format-month";

/**
 * The monthly series as chart points, with the selected month in the darker
 * series and the axis thinned as the comp does: every month for a year, only
 * Januaries (and the first month) for three years, and only the January year
 * marks beyond that.
 */
export function trendPoints(
  series: { month: string; total: number }[],
  selectedMonth: string,
): TrendPoint[] {
  const count = series.length;

  return series.map(({ month, total }, index) => {
    const isJanuary = month.endsWith("-01");
    const isMarked = index === 0 || isJanuary;
    const isSelected = month === selectedMonth;

    let label = "";
    let year = "";
    if (count <= 12) {
      label = formatChartMonth(month);
      year = isMarked ? month.slice(0, 4) : "";
    } else if (count <= 36) {
      label = isMarked ? formatChartMonth(month) : "";
      year = isMarked ? month.slice(0, 4) : "";
    } else {
      year = isJanuary ? month.slice(0, 4) : "";
    }

    return {
      label,
      other: isSelected ? 0 : total,
      selected: isSelected ? total : 0,
      title: formatDateToMonthYear(month),
      total,
      year,
    };
  });
}
