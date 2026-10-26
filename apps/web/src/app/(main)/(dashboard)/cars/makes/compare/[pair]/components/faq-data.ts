import type { MakeFigures } from "@web/app/(main)/(dashboard)/cars/makes/compare/[pair]/components/figures";
import {
  baselinePhrase,
  formatCount,
  periodPhrase,
  shareOf,
} from "@web/app/(main)/(dashboard)/cars/makes/compare/[pair]/components/summary";
import type { Faq } from "@web/components/shared/page-faq";
import { formatMonthLabel } from "@web/utils/dates/format-month";

interface Comparison {
  a: MakeFigures;
  b: MakeFigures;
  month: string;
  nameA: string;
  nameB: string;
}

const percent = (value: number) => `${value.toFixed(1)}%`;
const cars = (count: number) => (count === 1 ? "car" : "cars");

/** "BMW was down 30.4%", "BMW was level" or "BMW had none to compare with". */
function changeClause(name: string, change: number | null): string {
  if (change === null) {
    return `${name} had no registrations a year earlier`;
  }
  const rounded = Number(change.toFixed(1));
  if (rounded === 0) {
    return `${name} was level`;
  }
  return `${name} was ${rounded > 0 ? "up" : "down"} ${percent(Math.abs(rounded))}`;
}

/** Who registered more over the year to date, with both totals and changes. */
function whichSellsMore({ a, b, month, nameA, nameB }: Comparison): string {
  const period = periodPhrase(month);
  const [leader, leaderName, other, otherName] =
    a.ytd >= b.ytd ? [a, nameA, b, nameB] : [b, nameB, a, nameA];

  const totals =
    a.ytd === b.ytd
      ? `${nameA} and ${nameB} each registered ${formatCount(a.ytd)} new ${cars(a.ytd)} in Singapore ${period}.`
      : `${leaderName} registered ${formatCount(leader.ytd)} new ${cars(leader.ytd)} in Singapore ${period}, ${formatCount(leader.ytd - other.ytd)} more than ${otherName} (${formatCount(other.ytd)}).`;

  return `${totals} Against ${baselinePhrase(month)}, ${changeClause(leaderName, leader.change)} and ${changeClause(otherName, other.change)}.`;
}

/** The make's largest fuel type over the year to date. */
function largestFuel(figures: MakeFigures): [string, number] | undefined {
  return [...figures.fuelCounts].sort(
    ([, first], [, second]) => second - first,
  )[0];
}

/** Who registered more battery-electric cars, as counts and shares. */
function whichSellsMoreElectric({ a, b, nameA, nameB }: Comparison): string {
  const shareA = percent(shareOf(a.electric, a.ytd));
  const shareB = percent(shareOf(b.electric, b.ytd));

  if (a.electric === 0 && b.electric === 0) {
    return `Neither registered a fully electric car: ${nameA} and ${nameB} both registered none over the year to date.`;
  }

  if (a.electric === b.electric) {
    return `Neither: ${nameA} and ${nameB} each registered ${formatCount(a.electric)} fully electric ${cars(a.electric)}, ${shareA} of ${nameA}’s total and ${shareB} of ${nameB}’s.`;
  }

  const [leader, leaderName, leaderShare, other, otherName, otherShare] =
    a.electric > b.electric
      ? [a, nameA, shareA, b, nameB, shareB]
      : [b, nameB, shareB, a, nameA, shareA];

  let sentence = `${leaderName} registered more fully electric cars: ${formatCount(leader.electric)} (${leaderShare} of its total) against ${formatCount(other.electric)} (${otherShare}) for ${otherName}`;

  const largest = largestFuel(other);
  if (largest && largest[0] !== "Electric") {
    sentence += `, whose largest fuel type is ${largest[0]} at ${percent(shareOf(largest[1], other.ytd))}`;
  }

  return `${sentence}.`;
}

/**
 * The comparison's questions, answered from the same figures as the tables
 * above. Shared by the accordion and the FAQPage schema so the two always
 * match; the answers quote figures because each one should stand on its own
 * when an answer engine lifts it.
 */
export function buildCompareFaqs(comparison: Comparison): Faq[] {
  const { month, nameA, nameB } = comparison;

  return [
    {
      question: `Which sells more in Singapore, ${nameA} or ${nameB}?`,
      answer: whichSellsMore(comparison),
    },
    {
      question: "Which sells more electric cars?",
      answer: whichSellsMoreElectric(comparison),
    },
    {
      question: "Can I compare models?",
      answer:
        "No. LTA publishes registrations by make, fuel type and vehicle type, not by model, so every figure on this page covers the whole make.",
    },
    {
      question: "How often is this page updated?",
      answer: `Monthly, once LTA publishes the month’s registrations. These figures run to ${formatMonthLabel(month)}.`,
    },
  ];
}
