import type {
  InsertEvChargingEvent,
  InsertEvLocationHourly,
} from "@motormetrics/database";
import type { ConnectorRecord, ConnectorStatus } from "@web/lib/ev-charging";

/** The subset of the stored row a diff needs: what was last seen. */
export interface PreviousConnectorState {
  evCpId: string;
  status: ConnectorStatus;
  statusChangedAt: Date;
  price: number | null;
  priceType: string | null;
}

export interface SnapshotDiff {
  events: InsertEvChargingEvent[];
  /** `statusChangedAt` carried forward for connectors whose status held. */
  statusChangedAt: Map<string, Date>;
  hourly: InsertEvLocationHourly[];
}

export const formatPrice = (
  price: number | null,
  priceType: string | null,
): string | null => {
  if (price == null) {
    return null;
  }
  return priceType ? `${price} ${priceType}` : String(price);
};

export const truncateToHour = (date: Date): Date => {
  const hour = new Date(date);
  hour.setUTCMinutes(0, 0, 0);
  return hour;
};

/**
 * Compares a fresh batch against the last stored state and produces the
 * events, carried-forward timestamps and hourly counters to write.
 *
 * A connector's first appearance records a status event with no previous
 * value, so the log also captures when chargers come online. Prices are
 * compared as formatted text so a change of unit counts as a change.
 */
export const diffSnapshot = (
  records: ConnectorRecord[],
  previous: Map<string, PreviousConnectorState>,
  observedAt: Date,
): SnapshotDiff => {
  const events: InsertEvChargingEvent[] = [];
  const statusChangedAt = new Map<string, Date>();
  const hourlyByLocation = new Map<string, InsertEvLocationHourly>();
  const hour = truncateToHour(observedAt);

  for (const record of records) {
    const last = previous.get(record.evCpId);

    if (!last || last.status !== record.status) {
      events.push({
        evCpId: record.evCpId,
        locationId: record.locationId,
        kind: "status",
        previousValue: last?.status ?? null,
        value: record.status,
        observedAt,
      });
      statusChangedAt.set(record.evCpId, observedAt);
    } else {
      statusChangedAt.set(record.evCpId, last.statusChangedAt);
    }

    const price = formatPrice(record.price, record.priceType);
    const lastPrice = last ? formatPrice(last.price, last.priceType) : null;
    if (last && price !== lastPrice && price !== null) {
      events.push({
        evCpId: record.evCpId,
        locationId: record.locationId,
        kind: "price",
        previousValue: lastPrice,
        value: price,
        observedAt,
      });
    }

    const bucket = hourlyByLocation.get(record.locationId) ?? {
      locationId: record.locationId,
      hour,
      samples: 1,
      connectorSamples: 0,
      occupiedSamples: 0,
      unavailableSamples: 0,
    };
    bucket.connectorSamples = (bucket.connectorSamples ?? 0) + 1;
    if (record.status === "occupied") {
      bucket.occupiedSamples = (bucket.occupiedSamples ?? 0) + 1;
    } else if (record.status === "unavailable") {
      bucket.unavailableSamples = (bucket.unavailableSamples ?? 0) + 1;
    }
    hourlyByLocation.set(record.locationId, bucket);
  }

  return { events, statusChangedAt, hourly: [...hourlyByLocation.values()] };
};
