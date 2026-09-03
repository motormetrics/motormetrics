import {
  and,
  asc,
  db,
  desc,
  eq,
  evLocationHourly,
  gte,
  sql,
} from "@motormetrics/database";
import { cacheLife } from "next/cache";
import {
  districtPredicate,
  type EvChargingLocation,
  locationsSubquery,
  toLocation,
} from "./locations";

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

  const locations = locationsSubquery();
  const usable = sql`sum(${evLocationHourly.connectorSamples} - ${evLocationHourly.unavailableSamples})`;
  const utilisation = sql<number>`coalesce(100.0 * sum(${evLocationHourly.occupiedSamples}) / nullif(${usable}, 0), 0)`;

  const rows = await db
    .select({
      locationId: locations.locationId,
      stationName: locations.stationName,
      address: locations.address,
      postalCode: locations.postalCode,
      operator: locations.operator,
      connectors: locations.connectors,
      dcConnectors: locations.dcConnectors,
      maxSpeedKw: locations.maxSpeedKw,
      minPricePerKwh: locations.minPricePerKwh,
      utilisationPercent: utilisation,
      samples: sql<number>`sum(${evLocationHourly.samples})::int`,
    })
    .from(evLocationHourly)
    .innerJoin(locations, eq(locations.locationId, evLocationHourly.locationId))
    .where(
      and(
        gte(evLocationHourly.hour, sql`now() - make_interval(days => ${days})`),
        districtPredicate(locations.postalCode, district),
      ),
    )
    .groupBy(
      locations.locationId,
      locations.stationName,
      locations.address,
      locations.postalCode,
      locations.operator,
      locations.connectors,
      locations.dcConnectors,
      locations.maxSpeedKw,
      locations.minPricePerKwh,
    )
    .having(sql`sum(${evLocationHourly.samples}) >= ${MIN_SAMPLES}`)
    .orderBy(
      order === "busiest" ? desc(utilisation) : asc(utilisation),
      desc(locations.connectors),
    )
    .limit(limit);

  return rows.map((row) => ({
    ...toLocation(row),
    utilisationPercent: Number(row.utilisationPercent),
    samples: Number(row.samples),
  }));
}
