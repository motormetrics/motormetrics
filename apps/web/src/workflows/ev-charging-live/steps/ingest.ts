import {
  db,
  evChargingEvents,
  evConnectorStatus,
  evLocationHourly,
  type InsertEvConnectorStatus,
  max,
  sql,
} from "@motormetrics/database";
import {
  type ConnectorStatus,
  extractLastUpdated,
  fetchBatch,
  parseBatch,
} from "@web/lib/ev-charging";
import {
  diffSnapshot,
  type PreviousConnectorState,
} from "@web/workflows/ev-charging-live/steps/diff-snapshot";

// Neon's HTTP endpoint caps a statement at 32,767 bound parameters. The status
// upsert binds 19 columns a row, so 1,500 rows stays well under it.
const BATCH_SIZE = 1500;

export interface IngestResult {
  skipped: boolean;
  connectors: number;
  locations: number;
  events: number;
  observedAt: string;
}

const chunk = <T>(items: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
};

const skipped = (observedAt: Date): IngestResult => ({
  skipped: true,
  connectors: 0,
  locations: 0,
  events: 0,
  observedAt: observedAt.toISOString(),
});

export const ingestLiveSnapshot = async (): Promise<IngestResult> => {
  const accountKey = process.env.LTA_DATAMALL_ACCOUNT_KEY;
  if (!accountKey) {
    return skipped(new Date());
  }

  const payload = await fetchBatch(accountKey);
  // Stamp rows with the feed's own time so hourly buckets follow the data,
  // not the cron.
  const observedAt = extractLastUpdated(payload) ?? new Date();
  const records = parseBatch(payload);
  if (records.length === 0) {
    throw new Error("EVCBatch file parsed to zero connectors");
  }

  // The file is regenerated every five minutes but the cron may land on the
  // same one twice; counting it again would inflate the hourly samples.
  const [latest] = await db
    .select({ observedAt: max(evConnectorStatus.observedAt) })
    .from(evConnectorStatus);
  if (
    latest?.observedAt &&
    new Date(latest.observedAt).getTime() >= observedAt.getTime()
  ) {
    return skipped(observedAt);
  }

  const previousRows = await db
    .select({
      evCpId: evConnectorStatus.evCpId,
      status: evConnectorStatus.status,
      statusChangedAt: evConnectorStatus.statusChangedAt,
      price: evConnectorStatus.price,
      priceType: evConnectorStatus.priceType,
    })
    .from(evConnectorStatus);
  const previous = new Map<string, PreviousConnectorState>(
    previousRows.map((row) => [
      row.evCpId,
      { ...row, status: row.status as ConnectorStatus },
    ]),
  );

  const diff = diffSnapshot(records, previous, observedAt);

  const statusRows: InsertEvConnectorStatus[] = records.map((record) => ({
    ...record,
    statusChangedAt: diff.statusChangedAt.get(record.evCpId) ?? observedAt,
    observedAt,
  }));

  for (const rows of chunk(statusRows, BATCH_SIZE)) {
    await db
      .insert(evConnectorStatus)
      .values(rows)
      .onConflictDoUpdate({
        target: evConnectorStatus.evCpId,
        set: {
          locationId: sql`excluded.location_id`,
          chargerId: sql`excluded.charger_id`,
          stationName: sql`excluded.station_name`,
          address: sql`excluded.address`,
          postalCode: sql`excluded.postal_code`,
          longitude: sql`excluded.longitude`,
          latitude: sql`excluded.latitude`,
          operator: sql`excluded.operator`,
          operationHours: sql`excluded.operation_hours`,
          position: sql`excluded.position`,
          plugType: sql`excluded.plug_type`,
          powerRating: sql`excluded.power_rating`,
          chargingSpeedKw: sql`excluded.charging_speed_kw`,
          price: sql`excluded.price`,
          priceType: sql`excluded.price_type`,
          status: sql`excluded.status`,
          statusChangedAt: sql`excluded.status_changed_at`,
          observedAt: sql`excluded.observed_at`,
        },
      });
  }

  for (const rows of chunk(diff.events, BATCH_SIZE)) {
    await db.insert(evChargingEvents).values(rows);
  }

  for (const rows of chunk(diff.hourly, BATCH_SIZE)) {
    await db
      .insert(evLocationHourly)
      .values(rows)
      .onConflictDoUpdate({
        target: [evLocationHourly.locationId, evLocationHourly.hour],
        set: {
          samples: sql`${evLocationHourly.samples} + excluded.samples`,
          connectorSamples: sql`${evLocationHourly.connectorSamples} + excluded.connector_samples`,
          occupiedSamples: sql`${evLocationHourly.occupiedSamples} + excluded.occupied_samples`,
          unavailableSamples: sql`${evLocationHourly.unavailableSamples} + excluded.unavailable_samples`,
        },
      });
  }

  return {
    skipped: false,
    connectors: records.length,
    locations: diff.hourly.length,
    events: diff.events.length,
    observedAt: observedAt.toISOString(),
  };
};
