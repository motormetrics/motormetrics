import { count, db, evChargingPoints, isNotNull } from "@motormetrics/database";
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

  // Grouped by day in the database, rolled up to months here: a few hundred
  // rows at most, and it keeps the query on Drizzle's own API.
  const daily = await db
    .select({ date: evChargingPoints.registrationDate, count: count() })
    .from(evChargingPoints)
    .where(isNotNull(evChargingPoints.registrationDate))
    .groupBy(evChargingPoints.registrationDate)
    .orderBy(evChargingPoints.registrationDate);

  const monthly = new Map<string, number>();
  for (const row of daily) {
    if (!row.date) {
      continue;
    }
    const month = row.date.slice(0, 7);
    monthly.set(month, (monthly.get(month) ?? 0) + row.count);
  }

  return [...monthly].map(([month, total]) => ({ month, count: total }));
}
