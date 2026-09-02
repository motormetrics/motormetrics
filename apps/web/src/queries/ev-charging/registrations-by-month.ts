import { db, evChargingPoints, isNotNull, sql } from "@motormetrics/database";
import { EV_CHARGING_CACHE_TAG } from "@web/lib/cache-tags";
import { cacheLife, cacheTag } from "next/cache";

export interface EvChargingMonthlyRegistrations {
  /** `yyyy-MM`. */
  month: string;
  count: number;
}

/**
 * Connectors registered with LTA per month, oldest first.
 *
 * Registration under the charger scheme only began in Feb 2024, so the early
 * months carry the backlog of chargers that already existed rather than new
 * installations. Callers deriving growth should treat them as a base, not as
 * a trend.
 */
export async function getEvChargingRegistrationsByMonth(): Promise<
  EvChargingMonthlyRegistrations[]
> {
  "use cache";
  cacheLife("max");
  cacheTag(EV_CHARGING_CACHE_TAG);

  const month = sql<string>`to_char(${evChargingPoints.registrationDate}, 'YYYY-MM')`;

  return db
    .select({
      month,
      count: sql<number>`cast(count(*) as integer)`.mapWith(Number),
    })
    .from(evChargingPoints)
    .where(isNotNull(evChargingPoints.registrationDate))
    .groupBy(month)
    .orderBy(month);
}
