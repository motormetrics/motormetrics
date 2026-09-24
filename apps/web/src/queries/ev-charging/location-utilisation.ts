import { db } from "@motormetrics/database/client";
import { evLocationHourly } from "@motormetrics/database/schema";
import { EV_CHARGING_LIVE_CACHE_TAG } from "@web/lib/cache-tags";
import {
  daysAgo,
  utilisationPercent,
} from "@web/queries/ev-charging/utilisation";
import { and, asc, desc, eq, gte, sum } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import type { EvChargingLocation } from "./locations";
import {
  districtPredicate,
  storedLocationColumns,
  storedLocationsSubquery,
  toStoredLocation,
} from "./stored-locations";

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
 * A location needs about a day of samples before its average says anything;
 * below that a single busy evening dominates. The `ev-charging-live` ingest
 * adds one sample per location per run and runs hourly, so a day is 24 —
 * change this with the schedule, or the threshold can outgrow the window.
 */
const MIN_SAMPLES = 24;

/**
 * Locations ranked by average occupancy over the past `days`.
 *
 * Unavailable connectors are left out of the denominator so a site with a
 * broken charger is not reported as quiet.
 *
 * It takes the district, so it runs at request time and is cached remotely: an
 * in-memory entry would miss on every fresh instance.
 */
export async function getEvChargingLocationUtilisation({
  order,
  district,
  limit = 10,
  days = 7,
}: LocationUtilisationOptions): Promise<EvChargingLocationUtilisation[]> {
  "use cache: remote";
  cacheLife("max");
  cacheTag(EV_CHARGING_LIVE_CACHE_TAG);

  const locations = storedLocationsSubquery();
  const columns = storedLocationColumns(locations);
  const samples = sum(evLocationHourly.samples).mapWith(Number);
  const utilisation = utilisationPercent();

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
