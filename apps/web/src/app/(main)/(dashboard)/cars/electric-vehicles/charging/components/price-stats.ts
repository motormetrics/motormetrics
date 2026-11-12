import { EV_CHARGING_LIVE_CACHE_TAG } from "@web/lib/cache-tags";
import type { ConnectorRecord } from "@web/lib/ev-charging";
import {
  getEvChargingSnapshot,
  groupLocations,
  PER_KWH,
} from "@web/queries/ev-charging";
import { cacheLife, cacheTag } from "next/cache";

export interface ChargingStats {
  connectors: number;
  locations: number;
  dcLocations: number;
  operators: number;
  /** Lowest advertised $/kWh among AC connectors, or `null`. */
  cheapestAc: number | null;
  /** Lowest advertised $/kWh among DC connectors, or `null`. */
  cheapestDc: number | null;
  /** Median of each location's lowest $/kWh, or `null`. */
  medianPerKwh: number | null;
}

const lowest = (records: ConnectorRecord[], powerRating: string) =>
  records.reduce<number | null>((best, record) => {
    if (
      record.powerRating !== powerRating ||
      record.priceType !== PER_KWH ||
      record.price == null
    ) {
      return best;
    }
    return best == null ? record.price : Math.min(best, record.price);
  }, null);

const median = (values: number[]): number | null => {
  if (values.length === 0) {
    return null;
  }
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
};

/** The figures the intro and FAQ quote, derived from one snapshot. */
export const deriveChargingStats = (
  records: ConnectorRecord[],
): ChargingStats => {
  const locations = groupLocations(records);
  return {
    connectors: records.length,
    locations: locations.length,
    dcLocations: locations.filter((location) => location.dcConnectors > 0)
      .length,
    operators: new Set(records.map((record) => record.operator).filter(Boolean))
      .size,
    cheapestAc: lowest(records, "AC"),
    cheapestDc: lowest(records, "DC"),
    medianPerKwh: median(
      locations
        .map((location) => location.minPricePerKwh)
        .filter((price): price is number => price != null),
    ),
  };
};

export interface ChargingStatsSnapshot {
  /** ISO timestamp the feed reports for itself; `null` when unavailable. */
  observedAt: string | null;
  /** `null` while the live feed has no connectors stored. */
  stats: ChargingStats | null;
}

/**
 * The page's headline figures, cached on their own so the page never reads
 * the snapshot directly.
 *
 * A cache entry read while prerendering is stored with the page so the
 * request-time render can reuse it. Read directly, the ~5 MB snapshot rode
 * along in every hourly regeneration as ~830 KB of compressed state, which
 * was most of the project's ISR writes. This entry is a few hundred bytes.
 */
export async function getChargingStats(): Promise<ChargingStatsSnapshot> {
  "use cache";
  cacheLife("max");
  cacheTag(EV_CHARGING_LIVE_CACHE_TAG);

  const { observedAt, records } = await getEvChargingSnapshot();
  return {
    observedAt,
    stats: records.length === 0 ? null : deriveChargingStats(records),
  };
}

/**
 * Shown wherever a $0.00/kWh rate appears. The rate is LTA DataMall's, shown
 * as published: the feed marks free charging separately (`free`), so a zero
 * per-kWh rate may be free charging or a price the operator has not listed.
 */
export const ZERO_RATE_DISCLAIMER =
  "$0.00/kWh is the rate as published on LTA DataMall. It may mean free charging or a price the operator has not listed, so check with the operator before you charge.";

export const formatPerKwh = (price: number | null): string =>
  price == null ? "not advertised" : `$${price.toFixed(2)}/kWh`;
