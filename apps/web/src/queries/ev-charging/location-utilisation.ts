import {
  and,
  asc,
  db,
  desc,
  eq,
  evLocationHourly,
  gte,
  sql,
  sum,
} from "@motormetrics/database";
import { cacheLife } from "next/cache";
import type { EvChargingLocation } from "./locations";
import {
  districtPredicate,
  storedLocationColumns,
  storedLocationsSubquery,
  toStoredLocation,
} from "./stored-locations";

const daysAgo = (days: number) =>
  new Date(Date.now() - days * 24 * 60 * 60 * 1000);

export type UtilisationOrder = "busiest" | "quietest";

export interface LocationUtilisationOptions {
  order: UtilisationOrder;
  district?: string;
  limit?: number;
  /** Look-back window in days. */
  days?: number;
}

export interface EvChargingLocationUtilisation extends EvChargingLocation {
  /** Share of connector-samples that were occupied over the window, 0–100. */
  utilisationPercent: number;
  samples: number;
}

/**
 * A location needs about a day of five-minute samples before its average
 * says anything; below that a single busy evening dominates.
 */
const MIN_SAMPLES = 24 * 12;

/**
 * Locations ranked by average occupancy over the past `days`.
 *
 * Unavailable connectors are left out of the denominator so a site with a
 * broken charger is not reported as quiet.
 */
export async function getEvChargingLocationUtilisation({
  order,
  district,
  limit = 10,
  days = 7,
}: LocationUtilisationOptions): Promise<EvChargingLocationUtilisation[]> {
  "use cache";
  cacheLife("hours");

  const locations = storedLocationsSubquery();
  const columns = storedLocationColumns(locations);
  const samples = sum(evLocationHourly.samples).mapWith(Number);
  const usable = sql`sum(${evLocationHourly.connectorSamples} - ${evLocationHourly.unavailableSamples})`;
  const utilisation =
    sql`coalesce(100.0 * ${sum(evLocationHourly.occupiedSamples)} / nullif(${usable}, 0), 0)`.mapWith(
      Number,
    );

  const rows = await db
    .select({ ...columns, utilisationPercent: utilisation, samples })
    .from(evLocationHourly)
    .innerJoin(locations, eq(locations.locationId, evLocationHourly.locationId))
    .where(
      and(
        gte(evLocationHourly.hour, daysAgo(days)),
        districtPredicate(locations.postalCode, district),
      ),
    )
    .groupBy(...Object.values(columns))
    .having(gte(samples, MIN_SAMPLES))
    .orderBy(
      order === "busiest" ? desc(utilisation) : asc(utilisation),
      desc(locations.connectors),
    )
    .limit(limit);

  return rows.map((row) => ({
    ...toStoredLocation(row),
    utilisationPercent: row.utilisationPercent,
    samples: row.samples ?? 0,
  }));
}
