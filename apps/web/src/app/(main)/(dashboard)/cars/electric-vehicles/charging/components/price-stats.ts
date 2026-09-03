import type { ConnectorRecord } from "@web/lib/ev-charging";
import { groupLocations, PER_KWH } from "@web/queries/ev-charging";

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

export const formatPerKwh = (price: number | null): string =>
  price == null ? "not advertised" : `$${price.toFixed(2)}/kWh`;
