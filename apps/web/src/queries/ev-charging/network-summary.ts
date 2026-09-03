import {
  count,
  countDistinct,
  db,
  evChargingPoints,
  sql,
} from "@motormetrics/database";
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

  const [row] = await db
    .select({
      connectors: count(),
      // A site is a coordinate pair; Postgres counts distinct row values.
      sites: countDistinct(
        sql`(${evChargingPoints.longitude}, ${evChargingPoints.latitude})`,
      ),
    })
    .from(evChargingPoints);

  return { connectors: row?.connectors ?? 0, sites: row?.sites ?? 0 };
}
