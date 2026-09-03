import { db, evConnectorStatus, sql } from "@motormetrics/database";
import { cacheLife } from "next/cache";

export interface EvChargingLiveSummary {
  connectors: number;
  locations: number;
  available: number;
  occupied: number;
  unavailable: number;
  /** ISO timestamp of the newest batch, or `null` before the first ingest. */
  observedAt: string | null;
}

/**
 * Island-wide state of the public charging network at the last batch.
 *
 * The feed refreshes every five minutes, so this uses the built-in `minutes`
 * profile rather than the site-wide `max` one.
 */
export async function getEvChargingLiveSummary(): Promise<EvChargingLiveSummary> {
  "use cache";
  cacheLife("minutes");

  const [row] = await db
    .select({
      connectors: sql<number>`count(*)::int`,
      locations: sql<number>`count(distinct ${evConnectorStatus.locationId})::int`,
      available: sql<number>`count(*) filter (where ${evConnectorStatus.status} = 'available')::int`,
      occupied: sql<number>`count(*) filter (where ${evConnectorStatus.status} = 'occupied')::int`,
      unavailable: sql<number>`count(*) filter (where ${evConnectorStatus.status} = 'unavailable')::int`,
      observedAt: sql<string | null>`max(${evConnectorStatus.observedAt})`,
    })
    .from(evConnectorStatus);

  return {
    connectors: Number(row?.connectors ?? 0),
    locations: Number(row?.locations ?? 0),
    available: Number(row?.available ?? 0),
    occupied: Number(row?.occupied ?? 0),
    unavailable: Number(row?.unavailable ?? 0),
    observedAt: row?.observedAt ? new Date(row.observedAt).toISOString() : null,
  };
}
