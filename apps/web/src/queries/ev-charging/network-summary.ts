import { db, evChargingPoints, sql } from "@motormetrics/database";
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
      connectors: sql<number>`cast(count(*) as integer)`.mapWith(Number),
      sites:
        sql<number>`cast(count(distinct (${evChargingPoints.longitude}, ${evChargingPoints.latitude})) as integer)`.mapWith(
          Number,
        ),
    })
    .from(evChargingPoints);

  return { connectors: row?.connectors ?? 0, sites: row?.sites ?? 0 };
}
