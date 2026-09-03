import { count, db, evChargingPoints } from "@motormetrics/database";
import { EV_CHARGING_CACHE_TAG } from "@web/lib/cache-tags";
import { cacheLife, cacheTag } from "next/cache";

export interface EvChargingNetworkSummary {
  /** Registered public connectors. */
  connectors: number;
  /** Distinct charging locations, keyed on coordinates. */
  sites: number;
}

export async function getEvChargingNetworkSummary(): Promise<EvChargingNetworkSummary> {
  "use cache";
  cacheLife("max");
  cacheTag(EV_CHARGING_CACHE_TAG);

  const sites = db
    .selectDistinct({
      longitude: evChargingPoints.longitude,
      latitude: evChargingPoints.latitude,
    })
    .from(evChargingPoints)
    .as("sites");

  const [[connectorsRow], [sitesRow]] = await Promise.all([
    db.select({ value: count() }).from(evChargingPoints),
    db.select({ value: count() }).from(sites),
  ]);

  return {
    connectors: connectorsRow?.value ?? 0,
    sites: sitesRow?.value ?? 0,
  };
}
