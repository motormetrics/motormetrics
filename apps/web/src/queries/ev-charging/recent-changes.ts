import {
  and,
  db,
  desc,
  eq,
  evChargingEvents,
  gte,
  isNull,
  sql,
} from "@motormetrics/database";
import { cacheLife } from "next/cache";
import {
  type EvChargingLocation,
  locationsSubquery,
  toLocation,
} from "./locations";

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

  const locations = locationsSubquery();
  const since = sql`now() - make_interval(days => ${days})`;
  const backfillCutoff = sql`(select min(${evChargingEvents.observedAt}) + interval '1 hour' from ${evChargingEvents})`;

  const locationColumns = {
    locationId: locations.locationId,
    stationName: locations.stationName,
    address: locations.address,
    postalCode: locations.postalCode,
    operator: locations.operator,
    connectors: locations.connectors,
    dcConnectors: locations.dcConnectors,
    maxSpeedKw: locations.maxSpeedKw,
    minPricePerKwh: locations.minPricePerKwh,
  };
  const locationGroup = Object.values(locationColumns);

  const [newRows, priceRows] = await Promise.all([
    db
      .select({
        ...locationColumns,
        spottedAt: sql<string>`min(${evChargingEvents.observedAt})`,
        newConnectors: sql<number>`count(*)::int`,
      })
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
          sql`${evChargingEvents.observedAt} > ${backfillCutoff}`,
        ),
      )
      .groupBy(...locationGroup)
      .orderBy(desc(sql`min(${evChargingEvents.observedAt})`)),
    db
      .select({
        ...locationColumns,
        observedAt: sql<string>`max(${evChargingEvents.observedAt})`,
        previousValue: evChargingEvents.previousValue,
        value: evChargingEvents.value,
        connectorsChanged: sql<number>`count(*)::int`,
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
        ...locationGroup,
        evChargingEvents.previousValue,
        evChargingEvents.value,
      )
      .orderBy(desc(sql`max(${evChargingEvents.observedAt})`)),
  ]);

  return {
    newLocations: newRows.map((row) => ({
      ...toLocation(row),
      spottedAt: new Date(row.spottedAt).toISOString(),
      newConnectors: Number(row.newConnectors),
    })),
    priceChanges: priceRows.map((row) => ({
      ...toLocation(row),
      observedAt: new Date(row.observedAt).toISOString(),
      previousValue: row.previousValue,
      value: row.value,
      connectorsChanged: Number(row.connectorsChanged),
    })),
  };
}
