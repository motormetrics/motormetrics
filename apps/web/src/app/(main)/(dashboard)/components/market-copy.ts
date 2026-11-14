import { formatCurrency } from "@motormetrics/utils/format-currency";
import type { MonthTotal } from "@web/app/(main)/(dashboard)/components/overview-series";
import { changeRatio } from "@web/utils/change-ratio";
import {
  formatMonthLabel,
  formatMonthName,
} from "@web/utils/dates/format-month";

/**
 * The homepage's computed copy: the lead under the title and each figure's
 * caption. Pure functions of plain numbers and `YYYY-MM` strings, so they can
 * be tested without a database and never read the clock.
 */

const formatCount = (value: number) => value.toLocaleString("en-SG");

/** "+5.3%", "−0.4%": a true minus, never colour, carries the direction. */
export function signed(value: number, unit = "%", digits = 1): string {
  const sign = value < 0 ? "−" : "+";
  return `${sign}${Math.abs(value).toFixed(digits)}${unit}`;
}

/** Where the latest value sits in its window, for the range bar's middle label. */
export function rangeWhere(
  latest: number,
  low: number,
  high: number,
  count: number,
): string {
  if (latest >= high) {
    return `Highest in ${count} exercises`;
  }
  if (latest <= low) {
    return `Lowest in ${count} exercises`;
  }
  return `${(((high - latest) / high) * 100).toFixed(1)}% below the high`;
}

/** Fewer months back and "the fewest since" is noise. */
const MIN_SINCE_MONTHS = 3;

/**
 * The lead, e.g. "October's 4,202 new cars were 3.2% fewer than September's,
 * the fewest since February 2026, and battery-electric cars were 59.6% of
 * them." `series` is oldest first and ends at the month described.
 */
export function leadSentence(
  series: MonthTotal[],
  evShare?: number,
): string | null {
  const latest = series.at(-1);
  if (!latest) {
    return null;
  }

  const parts = [
    `${formatMonthName(latest.month)}'s ${formatCount(latest.total)} new cars`,
  ];
  const earlier = series.slice(0, -1);
  const previous = earlier.at(-1);

  if (previous && previous.total > 0 && previous.total !== latest.total) {
    const rose = latest.total > previous.total;
    const ratio = Math.abs(changeRatio(latest.total, previous.total) * 100);
    parts[0] += ` were ${ratio.toFixed(1)}% ${rose ? "more" : "fewer"} than ${formatMonthName(previous.month)}'s`;

    const sinceIndex = earlier.findLastIndex((row) =>
      rose ? row.total >= latest.total : row.total <= latest.total,
    );
    if (sinceIndex >= 0 && earlier.length - sinceIndex >= MIN_SINCE_MONTHS) {
      parts.push(
        `the ${rose ? "most" : "fewest"} since ${formatMonthLabel(earlier[sinceIndex].month)}`,
      );
    }
  } else {
    parts[0] += " were registered";
  }

  if (evShare !== undefined) {
    parts.push(`and battery-electric cars were ${evShare.toFixed(1)}% of them`);
  }

  return `${parts.join(", ")}.`;
}

export interface CategoryMove {
  /** "A" to "E". */
  key: string;
  /** Percentage change on the previous exercise. */
  change: number;
  premium: number;
  /** Whether the latest premium is the window's high or low. */
  isHigh: boolean;
  isLow: boolean;
}

/** Below this, a category's move reads as flat in the caption. */
const SMALL_MOVE = 1;

/**
 * Figure 1's caption, e.g. "Category A rose 5.3% to $139,001, the highest of
 * the 24 exercises shown; Categories B to E each moved by less than 1%."
 */
export function coeCaption(
  moves: CategoryMove[],
  count: number,
): string | null {
  const [lead, ...rest] = moves;
  if (!lead) {
    return null;
  }

  const verb = lead.change < 0 ? "fell" : "rose";
  const extreme = lead.isHigh ? "highest" : lead.isLow ? "lowest" : null;
  let sentence = `Category ${lead.key} ${verb} ${Math.abs(lead.change).toFixed(1)}% to ${formatCurrency(lead.premium)}${extreme ? `, the ${extreme} of the ${count} exercises shown` : ""}`;

  const first = rest[0];
  const last = rest.at(-1);
  if (first && last) {
    const mover = rest.reduce((top, move) =>
      Math.abs(move.change) > Math.abs(top.change) ? move : top,
    );
    sentence +=
      Math.abs(mover.change) < SMALL_MOVE
        ? `; Categories ${first.key} to ${last.key} each moved by less than ${SMALL_MOVE}%`
        : `; of the others, Category ${mover.key} moved most, ${signed(mover.change)}`;
  }

  return `${sentence}.`;
}

export interface PqpMove {
  key: string;
  /** Percentage change on the previous month, if LTA published one. */
  change: number | null;
  rate: number;
}

/**
 * The PQP caption, e.g. "Renewing a Category A COE for 10 years costs
 * $129,883 in November, 0.9% more than in October; Category D moved most,
 * +4.5%. LTA publishes no PQP for Category E."
 */
export function pqpCaption(
  moves: PqpMove[],
  month: string,
  previousMonth: string | null,
): string | null {
  const lead = moves[0];
  if (!lead) {
    return null;
  }

  let sentence = `Renewing a Category ${lead.key} COE for 10 years costs ${formatCurrency(lead.rate)} in ${formatMonthName(month)}`;
  if (lead.change !== null && previousMonth) {
    sentence +=
      lead.change === 0
        ? `, unchanged from ${formatMonthName(previousMonth)}`
        : `, ${Math.abs(lead.change).toFixed(1)}% ${lead.change > 0 ? "more" : "less"} than in ${formatMonthName(previousMonth)}`;
  }

  const changed = moves.filter(
    (move): move is PqpMove & { change: number } => move.change !== null,
  );
  const mover = changed.reduce<(PqpMove & { change: number }) | null>(
    (top, move) =>
      !top || Math.abs(move.change) > Math.abs(top.change) ? move : top,
    null,
  );
  if (mover && mover.key !== lead.key && mover.change !== 0) {
    sentence += `; Category ${mover.key} moved most, ${signed(mover.change)}`;
  }

  return `${sentence}. LTA publishes no PQP for Category E.`;
}

/**
 * Figure 2's caption, e.g. "Electric cars were 59.6% of October's 4,202
 * registrations, down from 65.1% in September; petrol-only cars were 5.3%."
 */
export function fuelCaption({
  electric,
  month,
  petrol,
  previous,
  total,
}: {
  /** Electric share of `month`, in percent. */
  electric: number;
  month: string;
  /** Petrol-only share of `month`, in percent. */
  petrol: number;
  previous?: { electric: number; month: string };
  total: number;
}): string {
  let sentence = `Electric cars were ${electric.toFixed(1)}% of ${formatMonthName(month)}'s ${formatCount(total)} registrations`;
  if (previous && previous.electric.toFixed(1) !== electric.toFixed(1)) {
    sentence += `, ${electric > previous.electric ? "up" : "down"} from ${previous.electric.toFixed(1)}% in ${formatMonthName(previous.month)}`;
  }
  return `${sentence}; petrol-only cars were ${petrol.toFixed(1)}%.`;
}

/**
 * Figure 3's caption, e.g. "BYD registered 11,247 cars from January to
 * October 2026, 24.9% of the market and more than twice Toyota's 5,278."
 */
export function makesCaption(
  rows: { count: number; make: string; share: number }[],
  period: string,
): string | null {
  const [first, second] = rows;
  if (!first) {
    return null;
  }

  const sentence = `${first.make} registered ${formatCount(first.count)} cars from ${period}, ${first.share.toFixed(1)}% of the market`;
  if (!second) {
    return `${sentence}.`;
  }

  const lead = first.count > second.count * 2 ? "more than twice" : "ahead of";
  return `${sentence} and ${lead} ${second.make}'s ${formatCount(second.count)}.`;
}

/**
 * Figure 4's caption, e.g. "Category A cars made up 44.5% of the 7,155
 * vehicles deregistered in October 2026 and Category B a further 35.6%.
 * Petrol-only vehicles were 65.0% of those on the road at the end of 2025."
 */
export function roadCaption({
  deregistered,
  month,
  population,
}: {
  /** Largest first. */
  deregistered: { count: number; label: string }[];
  month: string;
  population?: { label: string; share: number; year: string };
}): string | null {
  const [first, second] = deregistered;
  const total = deregistered.reduce((sum, row) => sum + row.count, 0);
  if (!first || total === 0) {
    return null;
  }

  const share = (count: number) => ((count / total) * 100).toFixed(1);
  let sentence = `${first.label} made up ${share(first.count)}% of the ${formatCount(total)} vehicles deregistered in ${formatMonthLabel(month)}`;
  if (second) {
    sentence += ` and ${second.label} a further ${share(second.count)}%`;
  }
  sentence += ".";

  if (population) {
    sentence += ` ${population.label} vehicles were ${population.share.toFixed(1)}% of those on the road at the end of ${population.year}.`;
  }
  return sentence;
}
