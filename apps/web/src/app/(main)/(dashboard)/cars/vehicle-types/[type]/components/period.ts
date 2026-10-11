import {
  formatMonthLabel,
  formatMonthName,
} from "@web/utils/dates/format-month";
import { shiftMonth } from "@web/utils/dates/month-arithmetic";

/**
 * The window every aggregate on the page is measured over, anchored on the
 * month the header's month menu picks.
 */
export const PERIODS = ["month", "ytd", "12m"] as const;
export type Period = (typeof PERIODS)[number];

export const PERIOD_LABELS: Record<Period, string> = {
  "12m": "Last 12 months",
  month: "This month",
  ytd: "Year to date",
};

export const DEFAULT_PERIOD: Period = "ytd";

/** How many months the chart and the month-by-month table frame. */
export const SERIES_MONTHS = 12;

/** Inclusive `YYYY-MM` bounds for a period, anchored on `month`. */
export function periodWindow(
  period: Period,
  month: string,
): { from: string; to: string } {
  if (period === "month") {
    return { from: month, to: month };
  }

  if (period === "ytd") {
    return { from: `${month.slice(0, 4)}-01`, to: month };
  }

  return { from: shiftMonth(month, -(SERIES_MONTHS - 1)), to: month };
}

/**
 * The months a window spans, as the comp words them: "August 2026",
 * "January to August 2026" or "September 2025 to August 2026".
 */
export function periodRange(period: Period, month: string): string {
  const { from, to } = periodWindow(period, month);
  if (from === to) {
    return formatMonthLabel(to);
  }

  const start =
    from.slice(0, 4) === to.slice(0, 4)
      ? formatMonthName(from)
      : formatMonthLabel(from);
  return `${start} to ${formatMonthLabel(to)}`;
}
