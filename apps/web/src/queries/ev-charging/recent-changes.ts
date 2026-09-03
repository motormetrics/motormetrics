import {
  and,
  count,
  db,
  desc,
  eq,
  evChargingEvents,
  gt,
  gte,
  isNull,
  max,
  min,
} from "@motormetrics/database";
import { cacheLife } from "next/cache";
import type { EvChargingLocation } from "./locations";
import {
  storedLocationColumns,
  storedLocationsSubquery,
  toStoredLocation,
} from "./stored-locations";

export interface EvChargingNewLocation extends EvChargingLocation {
  /** ISO timestamp of the first batch that carried the location. */
  spottedAt: string;
  newConnectors: number;
}

export interface EvChargingPriceChange extends EvChargingLocation {
  observedAt: string;
  previousValue: string | null;
  value: string;
  connectorsChanged: number;
}

export interface EvChargingRecentChanges {
  newLocations: EvChargingNewLocation[];
  priceChanges: EvChargingPriceChange[];
}

/**
 * Locations and prices that changed in the past `days`.
 *
 * The very first ingest logs every connector as new, so anything observed
 * within an hour of the earliest event is treated as the backfill and
 * skipped.
 */
export async function getEvChargingRecentChanges(
  days = 7,
): Promise<EvChargingRecentChanges> {
  "use cache";
  cacheLife("hours");

  const locations = storedLocationsSubquery();
  const columns = storedLocationColumns(locations);
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const [earliest] = await db
    .select({ observedAt: min(evChargingEvents.observedAt) })
    .from(evChargingEvents);
  if (!earliest?.observedAt) {
    return { newLocations: [], priceChanges: [] };
  }
  const backfillCutoff = new Date(
    new Date(earliest.observedAt).getTime() + 60 * 60 * 1000,
  );
  const firstSeen = min(evChargingEvents.observedAt);
  const lastSeen = max(evChargingEvents.observedAt);

  const [newRows, priceRows] = await Promise.all([
    db
      .select({ ...columns, spottedAt: firstSeen, newConnectors: count() })
      .from(evChargingEvents)
      .innerJoin(
        locations,
        eq(locations.locationId, evChargingEvents.locationId),
      )
      .where(
        and(
          eq(evChargingEvents.kind, "status"),
          isNull(evChargingEvents.previousValue),
          gte(evChargingEvents.observedAt, since),
          gt(evChargingEvents.observedAt, backfillCutoff),
        ),
      )
      .groupBy(...Object.values(columns))
      .orderBy(desc(firstSeen)),
    db
      .select({
        ...columns,
        observedAt: lastSeen,
        previousValue: evChargingEvents.previousValue,
        value: evChargingEvents.value,
        connectorsChanged: count(),
      })
      .from(evChargingEvents)
      .innerJoin(
        locations,
        eq(locations.locationId, evChargingEvents.locationId),
      )
      .where(
        and(
          eq(evChargingEvents.kind, "price"),
          gte(evChargingEvents.observedAt, since),
        ),
      )
      .groupBy(
        ...Object.values(columns),
        evChargingEvents.previousValue,
        evChargingEvents.value,
      )
      .orderBy(desc(lastSeen)),
  ]);

  return {
    newLocations: newRows.map((row) => ({
      ...toStoredLocation(row),
      spottedAt: new Date(row.spottedAt as Date).toISOString(),
      newConnectors: row.newConnectors,
    })),
    priceChanges: priceRows.map((row) => ({
      ...toStoredLocation(row),
      observedAt: new Date(row.observedAt as Date).toISOString(),
      previousValue: row.previousValue,
      value: row.value,
      connectorsChanged: row.connectorsChanged,
    })),
  };
}
