import { db } from "@motormetrics/database/client";
import { evConnectorStatus } from "@motormetrics/database/schema";
import { EV_CHARGING_LIVE_CACHE_TAG } from "@web/lib/cache-tags";
import type { ConnectorRecord, ConnectorStatus } from "@web/lib/ev-charging";
import { sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

export interface EvChargingSnapshot {
  /** ISO timestamp the feed reports for itself; `null` when unavailable. */
  observedAt: string | null;
  records: ConnectorRecord[];
}

const EMPTY: EvChargingSnapshot = { observedAt: null, records: [] };

/**
 * The current state of every public connector, as the `ev-charging-live`
 * workflow last stored it.
 *
 * Read from Postgres rather than from LTA DataMall: the workflow already
 * downloads the batch file each hour, in a step that retries, and stores every
 * connector. Fetching the file again here put DataMall on the page's render
 * path, so a DataMall 500 failed the page. The workflow never deletes a
 * connector that drops out of the feed, so only rows from its latest batch
 * count.
 *
 * The built-in `max` profile puts the timer far enough out to be a backstop:
 * the workflow busts the tag after each ingest, and that is what refreshes
 * these figures in practice. Mind that the shortest cache life on a route
 * sets how often Vercel regenerates the whole page — which is why an earlier
 * one-minute profile burned the Hobby ISR-write and CPU quotas. Until the
 * workflow has stored a batch the snapshot is empty and the pages show their
 * empty state.
 *
 * It stays on plain in-memory `"use cache"`: serialised it is about 5 MB, over
 * the Vercel Runtime Cache 2 MB item limit, so it cannot be cached remotely.
 * The small request-time queries built on it use `"use cache: remote"`
 * instead, so a hit on those skips this read entirely.
 */
export async function getEvChargingSnapshot(): Promise<EvChargingSnapshot> {
  "use cache";
  cacheLife("max");
  cacheTag(EV_CHARGING_LIVE_CACHE_TAG);

  const rows = await db
    .select({
      evCpId: evConnectorStatus.evCpId,
      locationId: evConnectorStatus.locationId,
      chargerId: evConnectorStatus.chargerId,
      stationName: evConnectorStatus.stationName,
      address: evConnectorStatus.address,
      postalCode: evConnectorStatus.postalCode,
      longitude: evConnectorStatus.longitude,
      latitude: evConnectorStatus.latitude,
      operator: evConnectorStatus.operator,
      operationHours: evConnectorStatus.operationHours,
      position: evConnectorStatus.position,
      plugType: evConnectorStatus.plugType,
      powerRating: evConnectorStatus.powerRating,
      chargingSpeedKw: evConnectorStatus.chargingSpeedKw,
      price: evConnectorStatus.price,
      priceType: evConnectorStatus.priceType,
      status: evConnectorStatus.status,
      observedAt: evConnectorStatus.observedAt,
    })
    .from(evConnectorStatus)
    .where(
      sql`${evConnectorStatus.observedAt} = (select max(${evConnectorStatus.observedAt}) from ${evConnectorStatus})`,
    );

  if (rows.length === 0) {
    return EMPTY;
  }

  return {
    observedAt: rows[0].observedAt.toISOString(),
    // The workflow stores `ConnectorStatus` values, already mapped from the
    // feed's codes.
    records: rows.map(({ observedAt: _observedAt, ...record }) => ({
      ...record,
      status: record.status as ConnectorStatus,
    })),
  };
}
