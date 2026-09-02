import type { EvChargingMonthlyRegistrations } from "@web/queries/ev-charging";

export interface ChargingNetworkGrowth {
  /** Latest month with a registration, `yyyy-MM`. */
  asOf: string;
  /** Connectors registered in the twelve months ending at `asOf`. */
  addedLastYear: number;
  /** Percentage growth of the cumulative network over those twelve months. */
  growthPercent: number | null;
}

const shiftMonth = (month: string, offset: number): string => {
  const [year, monthPart] = month.split("-").map(Number);
  const date = new Date(Date.UTC(year, monthPart - 1 + offset, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
};

/**
 * Twelve-month growth of the cumulative network, anchored on the data rather
 * than on today because the source is a quarterly file.
 *
 * Growth is measured against the network size a year earlier, which folds the
 * Feb 2024 registration backlog into the base instead of reading it as a
 * spike. When there is no base yet — the series is shorter than a year — the
 * percentage is null and callers should drop the chip.
 */
export function deriveChargingNetworkGrowth(
  monthly: EvChargingMonthlyRegistrations[],
): ChargingNetworkGrowth | null {
  const latest = monthly.at(-1);
  if (!latest) {
    return null;
  }

  const cutoff = shiftMonth(latest.month, -12);
  let base = 0;
  let addedLastYear = 0;
  for (const point of monthly) {
    if (point.month <= cutoff) {
      base += point.count;
    } else {
      addedLastYear += point.count;
    }
  }

  return {
    asOf: latest.month,
    addedLastYear,
    growthPercent: base > 0 ? (addedLastYear / base) * 100 : null,
  };
}
