import { formatMonthLabel } from "@web/utils/dates/format-month";

/**
 * Pure helpers for the deregistrations page's computed copy: the range bar
 * beside the headline figure, the lead and the figure captions. They take
 * plain rows so they can be tested without a database.
 */

export interface MonthlyRow {
  /** One count per category, in the page's category order. */
  counts: number[];
  month: string;
  total: number;
}

export interface CategoryCount {
  count: number;
  /** The short label the page uses, e.g. "Exempt from VQS". */
  label: string;
}

const formatCount = (value: number) => value.toLocaleString("en-SG");

/** "up 8.9%", "down 2.1%" or "unchanged"; null without a year-ago figure. */
export function yearOnYear(total: number, yearAgoTotal: number) {
  if (yearAgoTotal <= 0) {
    return null;
  }
  const change = ((total - yearAgoTotal) / yearAgoTotal) * 100;
  if (change === 0) {
    return "unchanged";
  }

  return `${change > 0 ? "up" : "down"} ${Math.abs(change).toFixed(1)}%`;
}

/**
 * Where the selected month sits against the low and high of the window. Months
 * before the feed begins total zero; they are gaps, not lows.
 */
export function rangeStats(rows: readonly MonthlyRow[], month: string) {
  const months = rows.filter((row) => row.total > 0);
  const latest = months.find((row) => row.month === month);
  if (!latest || months.length < 2) {
    return null;
  }

  const totals = months.map((row) => row.total);
  const low = Math.min(...totals);
  const high = Math.max(...totals);
  const where =
    latest.total === high
      ? `Highest in ${months.length} months`
      : latest.total === low
        ? `Lowest in ${months.length} months`
        : `${(((high - latest.total) / high) * 100).toFixed(1)}% below the high`;

  return { count: months.length, high, latest: latest.total, low, where };
}

/**
 * "Category A made up 42.6% of the 7,260 vehicles scrapped or exported in
 * August 2026, returning their COEs to the quota; the total was up 8.9% on a
 * year earlier."
 */
export function leadSentence(
  categories: readonly CategoryCount[],
  total: number,
  month: string,
  change: string | null,
) {
  const [first] = categories;
  if (!first || total <= 0) {
    return null;
  }

  const share = ((first.count / total) * 100).toFixed(1);
  const tail = change ? `; the total was ${change} on a year earlier` : "";

  return `${first.label} made up ${share}% of the ${formatCount(total)} vehicles scrapped or exported in ${formatMonthLabel(month)}, returning their COEs to the quota${tail}.`;
}

/**
 * "Deregistrations peaked at 7,738 in May 2026 over the 12 months to August
 * 2026, and Category A was the largest category in every month."
 */
export function trendCaption(
  rows: readonly MonthlyRow[],
  month: string,
  labels: readonly string[],
) {
  const months = rows.filter((row) => row.total > 0);
  if (months.length === 0) {
    return null;
  }

  const peak = months.reduce((best, row) =>
    row.total > best.total ? row : best,
  );
  const leaderOf = (row: MonthlyRow) =>
    row.counts.indexOf(Math.max(...row.counts));
  const leader = leaderOf(months[0]);
  const sameLeader = months.every((row) => leaderOf(row) === leader);
  const tail =
    sameLeader && months.length > 1 && labels[leader]
      ? `, and ${labels[leader]} was the largest category in every month`
      : "";

  return `Deregistrations peaked at ${formatCount(peak.total)} in ${formatMonthLabel(peak.month)} over the ${months.length} months to ${formatMonthLabel(month)}${tail}.`;
}

/**
 * "Category A (3,091) and Category B (2,449) made up 73.6% of August 2026's
 * deregistrations." Categories arrive largest first.
 */
export function categoryCaption(
  categories: readonly CategoryCount[],
  total: number,
  month: string,
) {
  const [first, second] = categories;
  if (!first || total <= 0) {
    return null;
  }

  const counted = first.count + (second?.count ?? 0);
  const named = second
    ? `${first.label} (${formatCount(first.count)}) and ${second.label} (${formatCount(second.count)})`
    : `${first.label} (${formatCount(first.count)})`;

  return `${named} made up ${((counted / total) * 100).toFixed(1)}% of ${formatMonthLabel(month)}'s deregistrations.`;
}

/**
 * "Category A deregistrations ranged from 2,191 in July 2025 to 3,588 in May
 * 2026." Reads the first category column.
 */
export function monthsCaption(rows: readonly MonthlyRow[], label: string) {
  const months = rows.filter((row) => row.total > 0);
  if (months.length < 2) {
    return null;
  }

  const lowest = months.reduce((best, row) =>
    (row.counts[0] ?? 0) < (best.counts[0] ?? 0) ? row : best,
  );
  const highest = months.reduce((best, row) =>
    (row.counts[0] ?? 0) > (best.counts[0] ?? 0) ? row : best,
  );

  return `${label} deregistrations ranged from ${formatCount(lowest.counts[0] ?? 0)} in ${formatMonthLabel(lowest.month)} to ${formatCount(highest.counts[0] ?? 0)} in ${formatMonthLabel(highest.month)}.`;
}
