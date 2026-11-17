import { formatMonthLabel } from "@web/utils/dates/format-month";

/** Which of the two makes has the higher figure; `null` when level. */
export type Leader = "a" | "b" | null;

export const formatCount = (value: number): string =>
  value.toLocaleString("en-SG");

/** `part` as a percentage of `whole`, 0 when there is no whole. */
export const shareOf = (part: number, whole: number): number =>
  whole > 0 ? (part / whole) * 100 : 0;

/**
 * The higher of two figures, compared at the precision they are shown at so a
 * row never bolds one of two cells that read the same.
 */
export function leaderOf(a: number, b: number, decimals = 0): Leader {
  const roundedA = Number(a.toFixed(decimals));
  const roundedB = Number(b.toFixed(decimals));
  if (roundedA === roundedB) {
    return null;
  }
  return roundedA > roundedB ? "a" : "b";
}

/**
 * The trend chart in words for screen readers: "Monthly registrations from
 * October 2024 to September 2026. BMW 447 to 187; AUDI 364 to 242."
 */
export function trendSummary({
  months,
  nameA,
  nameB,
  seriesA,
  seriesB,
}: {
  months: string[];
  nameA: string;
  nameB: string;
  seriesA: number[];
  seriesB: number[];
}): string {
  const first = months[0];
  const last = months.at(-1);
  if (!first || !last) {
    return "Monthly registrations.";
  }

  const range = (series: number[]) =>
    `${formatCount(series[0] ?? 0)} to ${formatCount(series.at(-1) ?? 0)}`;
  return `Monthly registrations from ${formatMonthLabel(first)} to ${formatMonthLabel(last)}. ${nameA} ${range(seriesA)}; ${nameB} ${range(seriesB)}.`;
}
