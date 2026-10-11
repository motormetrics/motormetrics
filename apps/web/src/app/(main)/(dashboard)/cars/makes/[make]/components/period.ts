import type { Range } from "@web/app/(main)/(dashboard)/cars/makes/[make]/search-params";
import {
  formatMonthLabel,
  formatMonthName,
} from "@web/utils/dates/format-month";
import { shiftMonth } from "@web/utils/dates/month-arithmetic";

/** The `YYYY-MM` window a period covers, anchored on the selected month. */
export function periodWindow(
  month: string,
  range: Range,
): { end: string; start: string } {
  if (range === "month") {
    return { end: month, start: month };
  }

  if (range === "12m") {
    return { end: month, start: shiftMonth(month, -11) };
  }

  return { end: month, start: `${month.slice(0, 4)}-01` };
}

/**
 * The period in words: "August 2026", "January to August 2026" or
 * "September 2025 to August 2026". The start drops its year when it shares
 * the end's. Same wording as the Makes overview's head.
 */
export function periodLabel(month: string, range: Range): string {
  const { end, start } = periodWindow(month, range);
  if (start === end) {
    return formatMonthLabel(end);
  }

  const from =
    start.slice(0, 4) === end.slice(0, 4)
      ? formatMonthName(start)
      : formatMonthLabel(start);
  return `${from} to ${formatMonthLabel(end)}`;
}
