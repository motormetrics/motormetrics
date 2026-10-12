import { formatOrdinal } from "@motormetrics/utils/format-ordinal";
import { formatPercentage } from "@motormetrics/utils/format-percentage";
import { percentageChange } from "@web/utils/change-ratio";
import {
  formatMonthLabel,
  formatMonthName,
} from "@web/utils/dates/format-month";
import { shiftMonth } from "@web/utils/dates/month-arithmetic";

export interface MakeMonthFigures {
  /** The make's registrations in `month`, every fuel type. */
  count: number;
  make: string;
  /** Every make's registrations in `month`. */
  marketCount: number;
  month: string;
  /** The make's registrations in the month before. */
  previousCount: number;
  /** Position among all makes for the year to date, when known. */
  rank?: number;
  /** The make's registrations from January up to and including `month`. */
  yearToDate: number;
}

const formatNumber = (value: number): string => value.toLocaleString("en-SG");

/**
 * The summary line under the make's trend chart, e.g. "BMW registered 612 new
 * cars in September 2026, up 8.0% on August — 14.5% of the market. 7,340 so
 * far in 2026, the 2nd-most of any make." Plain text gives search engines the
 * make's figures as a sentence, not only as chart bars. `undefined` when the
 * make registered nothing in the month.
 */
export function summariseMake({
  count,
  make,
  marketCount,
  month,
  previousCount,
  rank,
  yearToDate,
}: MakeMonthFigures): string | undefined {
  if (count <= 0) {
    return undefined;
  }

  let sentence = `${make} registered ${formatNumber(count)} new ${count === 1 ? "car" : "cars"} in ${formatMonthLabel(month)}`;

  if (previousCount > 0) {
    const previousMonth = shiftMonth(month, -1);
    // Name the year only when the comparison crosses into the previous one.
    const previousName =
      previousMonth.slice(0, 4) === month.slice(0, 4)
        ? formatMonthName(previousMonth)
        : formatMonthLabel(previousMonth);
    const change = percentageChange(count, previousCount);
    sentence +=
      change === 0
        ? `, level with ${previousName}`
        : `, ${change > 0 ? "up" : "down"} ${formatPercentage(Math.abs(change))} on ${previousName}`;
  }

  if (marketCount > 0) {
    sentence += ` — ${formatPercentage((count / marketCount) * 100)} of the market`;
  }

  // January's year to date is the month itself, so it adds nothing.
  if (month.endsWith("-01")) {
    return `${sentence}.`;
  }

  const position =
    rank === undefined
      ? ""
      : `, the ${rank === 1 ? "most" : `${formatOrdinal(rank)}-most`} of any make`;
  return `${sentence}. ${formatNumber(yearToDate)} so far in ${month.slice(0, 4)}${position}.`;
}
