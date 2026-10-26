import { periodLabel } from "@web/app/(main)/(dashboard)/cars/makes/[make]/components/period";
import type { MakeFigures } from "@web/app/(main)/(dashboard)/cars/makes/compare/[pair]/components/figures";
import {
  formatMonthLabel,
  formatMonthShortLabel,
} from "@web/utils/dates/format-month";
import { shiftMonth } from "@web/utils/dates/month-arithmetic";

/** Which of the two makes has the higher figure; `null` when level. */
export type Leader = "a" | "b" | null;

/** True minus sign (U+2212), not a hyphen, for signed figures. */
const MINUS = "−";

export const formatCount = (value: number): string =>
  value.toLocaleString("en-SG");

/** "+4.2%", "−3.1%" or "0.0%", to one decimal place. */
export function formatSignedPercent(value: number): string {
  const rounded = Number(value.toFixed(1));
  if (rounded === 0) {
    return "0.0%";
  }
  return `${rounded > 0 ? "+" : MINUS}${Math.abs(rounded).toFixed(1)}%`;
}

/** A gap between two percentages, as a bare figure: "12.2 pts". */
export function formatPoints(difference: number): string {
  return `${Math.abs(difference).toFixed(1)} pts`;
}

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

export interface SummaryRow {
  a: string;
  b: string;
  /** The gap between the two as a bare figure, or "Level". */
  gap: string;
  id: string;
  label: string;
  leader: Leader;
  /** What the measure means, under its label. */
  note?: string;
}

const percentCell = (value: number): string => `${value.toFixed(1)}%`;

/**
 * The gap between two percentages as the cells show them, so it always equals
 * the difference between the two rounded figures beside it.
 */
const displayedGap = (a: number, b: number): string =>
  formatPoints(Number(a.toFixed(1)) - Number(b.toFixed(1)));

/**
 * What the year to date is compared against: "the same months of 2025", or
 * "January 2025" when the year to date is a single month.
 */
export function baselinePhrase(month: string): string {
  const previous = shiftMonth(month, -12);
  return month.endsWith("-01")
    ? formatMonthLabel(previous)
    : `the same months of ${previous.slice(0, 4)}`;
}

function percentRow(
  id: string,
  label: string,
  a: number,
  b: number,
  note?: string,
): SummaryRow {
  const leader = leaderOf(a, b, 1);
  return {
    a: percentCell(a),
    b: percentCell(b),
    gap: leader ? displayedGap(a, b) : "Level",
    id,
    label,
    leader,
    note,
  };
}

/**
 * The four rows of the summary table: registrations, change on a year
 * earlier, share of all new cars and the fully electric share, each with the
 * gap between the two makes.
 */
export function buildSummaryRows({
  a,
  b,
  marketTotal,
  month,
}: {
  a: MakeFigures;
  b: MakeFigures;
  /** Every make's registrations over the same year to date. */
  marketTotal: number;
  month: string;
}): SummaryRow[] {
  const registrationsLeader = leaderOf(a.ytd, b.ytd);
  const changeNote = `vs ${baselinePhrase(month)}`;

  let changeRow: SummaryRow;
  if (a.change === null || b.change === null) {
    changeRow = {
      a: a.change === null ? "—" : formatSignedPercent(a.change),
      b: b.change === null ? "—" : formatSignedPercent(b.change),
      gap: "—",
      id: "change",
      label: "Change",
      leader: null,
      note: changeNote,
    };
  } else {
    const leader = leaderOf(a.change, b.change, 1);
    changeRow = {
      a: formatSignedPercent(a.change),
      b: formatSignedPercent(b.change),
      gap: leader ? displayedGap(a.change, b.change) : "Level",
      id: "change",
      label: "Change",
      leader,
      note: changeNote,
    };
  }

  return [
    {
      a: formatCount(a.ytd),
      b: formatCount(b.ytd),
      gap: registrationsLeader ? formatCount(Math.abs(a.ytd - b.ytd)) : "Level",
      id: "registrations",
      label: "Registrations",
      leader: registrationsLeader,
    },
    changeRow,
    percentRow(
      "share",
      "Share of new cars",
      shareOf(a.ytd, marketTotal),
      shareOf(b.ytd, marketTotal),
    ),
    percentRow(
      "electric",
      "Fully electric",
      shareOf(a.electric, a.ytd),
      shareOf(b.electric, b.ytd),
      "Share of the make’s registrations",
    ),
  ];
}

/**
 * "from January to September 2026", or "in January 2026" when the year to date
 * is a single month.
 */
export function periodPhrase(month: string): string {
  return month.endsWith("-01")
    ? `in ${formatMonthLabel(month)}`
    : `from ${periodLabel(month, "ytd")}`;
}

const cars = (count: number) => (count === 1 ? "car" : "cars");

/**
 * The page's answer in one sentence, front-loaded so it quotes on its own:
 * "BMW registered 323 more new cars than AUDI in Singapore from January to
 * September 2026."
 */
export function leadSentence({
  a,
  b,
  month,
  nameA,
  nameB,
}: {
  a: MakeFigures;
  b: MakeFigures;
  month: string;
  nameA: string;
  nameB: string;
}): string {
  const period = periodPhrase(month);
  if (a.ytd === b.ytd) {
    return `${nameA} and ${nameB} each registered ${formatCount(a.ytd)} new ${cars(a.ytd)} in Singapore ${period}.`;
  }

  const [leaderName, otherName] =
    a.ytd > b.ytd ? [nameA, nameB] : [nameB, nameA];
  const difference = Math.abs(a.ytd - b.ytd);
  return `${leaderName} registered ${formatCount(difference)} more new ${cars(difference)} than ${otherName} in Singapore ${period}.`;
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

export interface MonthlyRow {
  a: string;
  /** "BMW +45" or "Level". */
  aheadBy: string;
  b: string;
  leader: Leader;
  /** "Sep 2026". */
  month: string;
  /** "2026-09", the row key. */
  key: string;
}

/** The chart's figures as table rows, newest first. */
export function monthlyRows({
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
}): MonthlyRow[] {
  return months
    .map((month, index) => {
      const countA = seriesA[index] ?? 0;
      const countB = seriesB[index] ?? 0;
      const leader = leaderOf(countA, countB);
      return {
        a: formatCount(countA),
        aheadBy: leader
          ? `${leader === "a" ? nameA : nameB} +${formatCount(Math.abs(countA - countB))}`
          : "Level",
        b: formatCount(countB),
        key: month,
        leader,
        month: formatMonthShortLabel(month),
      };
    })
    .reverse();
}
