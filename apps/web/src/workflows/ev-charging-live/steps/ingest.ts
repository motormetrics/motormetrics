import {
  db,
  evChargingEvents,
  evConnectorStatus,
  evLocationHourly,
  type InsertEvConnectorStatus,
  sql,
} from "@motormetrics/database";
import {
  diffSnapshot,
  type PreviousConnectorState,
} from "@web/workflows/ev-charging-live/steps/diff-snapshot";
import {
  type ConnectorStatus,
  parseBatch,
} from "@web/workflows/ev-charging-live/steps/parse-batch";

export const EV_BATCH_URL =
  "https://datamall2.mytransport.sg/ltaodataservice/EVCBatch";

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

/**
 * The batch endpoint returns a presigned S3 link that expires after fifteen
 * minutes, so both requests happen back to back in one step.
 */
export const fetchBatch = async (accountKey: string): Promise<unknown> => {
  const linkResponse = await fetch(EV_BATCH_URL, {
    headers: { AccountKey: accountKey, accept: "application/json" },
  });
  if (!linkResponse.ok) {
    throw new Error(
      `EVCBatch link request failed: ${linkResponse.status} ${linkResponse.statusText}`,
    );
  }

  const link = extractDownloadLink(await linkResponse.json());
  if (!link) {
    throw new Error("EVCBatch response carried no download link");
  }

  const fileResponse = await fetch(link);
  if (!fileResponse.ok) {
    throw new Error(
      `EVCBatch download failed: ${fileResponse.status} ${fileResponse.statusText}`,
    );
  }
  return fileResponse.json();
};

/**
 * DataMall's other file-link APIs return `{ value: [{ Link }] }`; the guide
 * names the batch attribute `Link` too, so check the common placements.
 */
export const extractDownloadLink = (payload: unknown): string | null => {
  const candidates: unknown[] = [];
  if (typeof payload === "object" && payload !== null) {
    const record = payload as Record<string, unknown>;
    candidates.push(record.Link, record.link);
    if (Array.isArray(record.value)) {
      for (const item of record.value) {
        if (typeof item === "object" && item !== null) {
          const entry = item as Record<string, unknown>;
          candidates.push(entry.Link, entry.link);
        }
      }
    }
  }
  const link = candidates.find(
    (value): value is string =>
      typeof value === "string" && value.startsWith("http"),
  );
  return link ?? null;
};

export const ingestLiveSnapshot = async (): Promise<IngestResult> => {
  const accountKey = process.env.LTA_DATAMALL_ACCOUNT_KEY;
  const observedAt = new Date();
  if (!accountKey) {
    return {
      skipped: true,
      connectors: 0,
      locations: 0,
      events: 0,
      observedAt: observedAt.toISOString(),
    };
  }

  const records = parseBatch(await fetchBatch(accountKey));
  if (records.length === 0) {
    throw new Error("EVCBatch file parsed to zero connectors");
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
