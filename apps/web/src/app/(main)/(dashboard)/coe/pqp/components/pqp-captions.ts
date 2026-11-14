import { formatCurrency } from "@motormetrics/utils/format-currency";
import { formatMonth } from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import { formatSignedPercent } from "@web/app/(main)/(dashboard)/coe/premiums/components/premiums-shared";
import { formatMonthName } from "@web/utils/dates/format-month";

/** A category's published rate in one month, at the selected term. */
export interface PQPMonthRate {
  month: string;
  rate: number;
}

/** A category's latest rate beside its latest closing premium. */
export interface PQPCategoryRate {
  key: string;
  /** The published PQP: the full ten-year renewal cost. */
  rate: number;
  premium: number;
}

/**
 * The lead under the head, e.g. "Renewing a Category A COE for 10 years costs
 * $128,715 in October, 2.0% more than in September."
 */
export function pqpLead(
  category: string,
  term: string,
  rates: PQPMonthRate[],
): string | undefined {
  const latest = rates.at(-1);
  if (!latest) {
    return undefined;
  }

  const cost = `Renewing a ${category} COE for ${term} years costs ${formatCurrency(latest.rate)} in ${formatMonthName(latest.month)}`;
  const previous = rates.at(-2);
  if (!previous || previous.rate <= 0) {
    return `${cost}.`;
  }

  const change = (latest.rate - previous.rate) / previous.rate;
  if (change === 0) {
    return `${cost}, the same as in ${formatMonthName(previous.month)}.`;
  }

  return `${cost}, ${Math.abs(change * 100).toFixed(1)}% ${change > 0 ? "more" : "less"} than in ${formatMonthName(previous.month)}.`;
}

/**
 * The caption over the trend, e.g. "The Category A PQP rose from its 12-month
 * low of $106,541 in March 2026 to $128,715 in October 2026, +20.8%."
 */
export function trendCaption(
  category: string,
  rates: PQPMonthRate[],
): string | undefined {
  const latest = rates.at(-1);
  if (!latest) {
    return undefined;
  }

  const low = rates.reduce((lowest, entry) =>
    entry.rate < lowest.rate ? entry : lowest,
  );
  const span = `${rates.length}-month`;
  if (low === latest || low.rate <= 0) {
    return `The ${category} PQP for ${formatMonth(latest.month)}, ${formatCurrency(latest.rate)}, is its lowest in ${rates.length} months.`;
  }

  return `The ${category} PQP rose from its ${span} low of ${formatCurrency(low.rate)} in ${formatMonth(low.month)} to ${formatCurrency(latest.rate)} in ${formatMonth(latest.month)}, ${formatSignedPercent((latest.rate - low.rate) / low.rate)}.`;
}

/** Premium minus PQP, as a share of the premium. */
const gapRatio = ({ premium, rate }: PQPCategoryRate) =>
  premium > 0 ? (premium - rate) / premium : 0;

/**
 * The caption over the rates table, e.g. "Both PQPs sit below the latest
 * closing premium: Category A by 2.4% and Category B by 1.0%."
 */
export function ratesCaption(rows: PQPCategoryRate[]): string | undefined {
  const priced = rows.filter(({ premium, rate }) => premium > 0 && rate > 0);
  if (priced.length === 0) {
    return undefined;
  }

  if (priced.every((row) => gapRatio(row) > 0)) {
    const gaps = priced.map(
      (row) => `Category ${row.key} by ${(gapRatio(row) * 100).toFixed(1)}%`,
    );
    const subject = priced.length === 2 ? "Both PQPs sit" : "Every PQP sits";
    return `${priced.length === 1 ? "The PQP sits" : subject} below the latest closing premium: ${gaps.join(" and ")}.`;
  }

  return `${priced
    .map(
      (row) =>
        `Category ${row.key}'s PQP is ${formatSignedPercent(-gapRatio(row))} against its latest premium`,
    )
    .join(", and ")}.`;
}

/**
 * The caption over the PQP-against-premium bars, e.g. "Category B costs more
 * to renew than Category A, $131,616 against $128,715, and both renew for
 * less than a new COE would have cost at the latest exercise."
 */
export function compareCaption(rows: PQPCategoryRate[]): string | undefined {
  const [first, second] = [...rows].sort((a, b) => b.rate - a.rate);
  if (!first || !second || first.rate <= 0) {
    return undefined;
  }

  const lead =
    first.rate === second.rate
      ? `Categories ${first.key} and ${second.key} cost the same to renew, ${formatCurrency(first.rate)}`
      : `Category ${first.key} costs more to renew than Category ${second.key}, ${formatCurrency(first.rate)} against ${formatCurrency(second.rate)}`;
  const cheaper = rows.every((row) => row.premium > 0 && gapRatio(row) > 0);

  return cheaper
    ? `${lead}, and ${rows.length === 2 ? "both" : "each"} renew for less than a new COE would have cost at the latest exercise.`
    : `${lead}.`;
}

/**
 * The caption over the month-by-month table: a run of rises or falls of two
 * months or more, or else the latest month's change.
 */
export function monthsCaption(
  category: string,
  rates: PQPMonthRate[],
): string | undefined {
  const latest = rates.at(-1);
  const previous = rates.at(-2);
  if (!latest || !previous || previous.rate <= 0) {
    return undefined;
  }

  const direction = Math.sign(latest.rate - previous.rate);
  let streak = 0;
  for (let index = rates.length - 1; index > 0; index--) {
    if (Math.sign(rates[index].rate - rates[index - 1].rate) !== direction) {
      break;
    }
    streak++;
  }

  if (direction !== 0 && streak >= 2) {
    const since = rates[rates.length - 1 - streak];
    return `The ${category} PQP has ${direction > 0 ? "risen" : "fallen"} for ${streak} months in a row, since ${formatMonth(since.month)}.`;
  }

  return `The ${category} PQP changed ${formatSignedPercent((latest.rate - previous.rate) / previous.rate)} in ${formatMonth(latest.month)}.`;
}
