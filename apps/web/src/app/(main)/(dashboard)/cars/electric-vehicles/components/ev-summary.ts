import type { RegistrationSegment } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/ev-series";
import {
  formatMonthLabel,
  formatMonthName,
} from "@web/utils/dates/format-month";

/**
 * Pure helpers for the electric vehicles page's computed copy: the range bar
 * under the headline share, the lead and the figure captions.
 */

const formatCount = (value: number) => value.toLocaleString("en-SG");

/** "+1.2 pts" or "−0.4 pts", with a true minus. */
export function formatPoints(value: number) {
  return `${value < 0 ? "−" : "+"}${Math.abs(value).toFixed(1)} pts`;
}

/**
 * Where the share at `index` sits against the low and high of the `window`
 * months ending there.
 */
export function shareRange(
  shares: readonly number[],
  index: number,
  window: number,
) {
  const latest = shares[index];
  if (latest === undefined || index < 1) {
    return null;
  }

  const span = shares.slice(Math.max(0, index - window + 1), index + 1);
  const low = Math.min(...span);
  const high = Math.max(...span);
  const where =
    latest === high
      ? `Highest in ${span.length} months`
      : latest === low
        ? `Lowest in ${span.length} months`
        : `${(high - latest).toFixed(1)} pts below the high`;

  return { count: span.length, high, latest, low, where };
}

/**
 * "2,880 electric cars were registered in August 2026, 63.3% of 4,549 new
 * cars; electric, petrol-electric and diesel-electric cars together were
 * 94.6%."
 */
export function evLeadSentence({
  batteryElectric,
  electrifiedShare,
  month,
  share,
  total,
}: {
  batteryElectric: number;
  electrifiedShare: number;
  month: string;
  share: number;
  total: number;
}) {
  return `${formatCount(batteryElectric)} electric cars were registered in ${formatMonthLabel(month)}, ${share.toFixed(1)}% of ${formatCount(total)} new cars; electric, petrol-electric and diesel-electric cars together were ${electrifiedShare.toFixed(1)}%.`;
}

/**
 * "Electric cars were 63.3% of August's 4,549 new cars, petrol-electric and
 * diesel-electric cars 24.9% and their plug-in versions 6.3%; petrol and
 * diesel cars made up the other 5.5%." `split` is electric, the plug-in
 * group, the petrol-electric and diesel-electric group, then combustion.
 */
export function mixCaption(
  split: readonly RegistrationSegment[],
  month: string,
  total: number,
) {
  const [electric, plugIn, hybrid, combustion] = split;
  if (!electric || !plugIn || !hybrid || !combustion || total <= 0) {
    return null;
  }

  return `Electric cars were ${electric.share.toFixed(1)}% of ${formatMonthName(month)}'s ${formatCount(total)} new cars, petrol-electric and diesel-electric cars ${hybrid.share.toFixed(1)}% and their plug-in versions ${plugIn.share.toFixed(1)}%; petrol and diesel cars made up the other ${combustion.share.toFixed(1)}%.`;
}

/**
 * "Electric car registrations went from 3,927 in September 2025 to 4,302 in
 * August 2026, with a high of 5,556 in March 2026."
 */
export function trendCaption(
  points: readonly { month: string; value: number }[],
  subject: string,
) {
  const first = points.at(0);
  const last = points.at(-1);
  if (!first || !last || points.length < 2) {
    return null;
  }

  const peak = points.reduce((best, point) =>
    point.value > best.value ? point : best,
  );
  const tail =
    peak.value === last.value
      ? ", the highest in the range"
      : `, with a high of ${formatCount(peak.value)} in ${formatMonthLabel(peak.month)}`;

  return `${subject} registrations went from ${formatCount(first.value)} in ${formatMonthLabel(first.month)} to ${formatCount(last.value)} in ${formatMonthLabel(last.month)}${tail}.`;
}

/**
 * "BYD registered 8,318 electric cars in 2026 to August, 2.2 times Tesla's
 * 3,723; the electric share ranged from 55.2% to 70.1% in the 8 months to
 * August." Either half stands alone when the other has no data.
 */
export function makesCaption(
  makes: readonly { count: number; make: string }[],
  month: string,
  shares: readonly number[],
) {
  const [leader, runnerUp] = makes;
  const parts: string[] = [];

  if (leader) {
    const versus =
      runnerUp && runnerUp.count > 0
        ? `, ${(leader.count / runnerUp.count).toFixed(1)} times ${runnerUp.make}'s ${formatCount(runnerUp.count)}`
        : "";
    parts.push(
      `${leader.make} registered ${formatCount(leader.count)} electric cars in ${month.slice(0, 4)} to ${formatMonthName(month)}${versus}`,
    );
  }
  if (shares.length > 1) {
    parts.push(
      `the electric share ranged from ${Math.min(...shares).toFixed(1)}% to ${Math.max(...shares).toFixed(1)}% in the ${shares.length} months to ${formatMonthName(month)}`,
    );
  }

  if (parts.length === 0) {
    return null;
  }

  const sentence = `${parts.join("; ")}.`;
  return `${sentence.charAt(0).toUpperCase()}${sentence.slice(1)}`;
}

/**
 * "There were 11,353 public charging points, 18.9% of the 60,000 targeted for
 * 2030; the VES bands most electric cars qualify for carry rebates of up to $25,000."
 */
export function chargingCaption(
  connectors: number,
  target: number,
  topRebate: string,
) {
  const network =
    connectors > 0
      ? `There were ${formatCount(connectors)} public charging points, ${((connectors / target) * 100).toFixed(1)}% of the ${formatCount(target)} targeted for 2030; the`
      : "The";

  return `${network} VES bands most electric cars qualify for carry rebates of up to ${topRebate}.`;
}
