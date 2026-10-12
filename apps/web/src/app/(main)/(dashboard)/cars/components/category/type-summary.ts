import { formatPercentage } from "@motormetrics/utils/format-percentage";

/** How many types the mix sentence names before it stops. */
const MIX_LIMIT = 3;

/**
 * The summary line under a fuel or vehicle type table, e.g. "September 2026:
 * Petrol-Electric took 48.2% of new cars, Electric 31.0% and Petrol 19.1%."
 * Plain text gives search engines the mix as a sentence, not only as cells.
 */
export function summariseMix(
  periodLabel: string,
  rows: { label: string; share: number }[],
): string | undefined {
  const [first, ...rest] = [...rows]
    .sort((a, b) => b.share - a.share)
    .slice(0, MIX_LIMIT);
  if (!first) {
    return undefined;
  }

  const lead = `${periodLabel}: ${first.label} took ${formatPercentage(first.share)} of new cars`;
  const others = rest.map(
    ({ label, share }) => `${label} ${formatPercentage(share)}`,
  );
  const last = others.pop();
  if (last === undefined) {
    return `${lead}.`;
  }
  return `${[lead, ...others].join(", ")} and ${last}.`;
}

/**
 * The summary line under a single type's headline, e.g. "2026 year to date:
 * 12,340 Electric registrations, 31.0% of new cars, up from 24.0% a year
 * earlier." The comparison drops out when the year before has no registrations.
 */
export function summariseType({
  count,
  label,
  periodLabel,
  previousShare,
  share,
}: {
  count: number;
  label: string;
  periodLabel: string;
  /** Share of the same period a year earlier; `undefined` when there is none. */
  previousShare?: number;
  share: number;
}): string {
  const lead = `${periodLabel}: ${count.toLocaleString("en-SG")} ${label} registrations, ${formatPercentage(share)} of new cars`;
  if (previousShare === undefined) {
    return `${lead}.`;
  }

  // Compare at the precision the sentence prints, so "up from 31.0%" never
  // follows "31.0%".
  const current = formatPercentage(share);
  const previous = formatPercentage(previousShare);
  if (current === previous) {
    return `${lead}, unchanged from a year earlier.`;
  }
  return `${lead}, ${share > previousShare ? "up" : "down"} from ${previous} a year earlier.`;
}
