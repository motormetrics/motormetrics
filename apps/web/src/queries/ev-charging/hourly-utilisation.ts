import { db, evLocationHourly, gte, sql, sum } from "@motormetrics/database";
import { cacheLife } from "next/cache";

const daysAgo = (days: number) =>
  new Date(Date.now() - days * 24 * 60 * 60 * 1000);

export interface EvChargingHourlyUtilisation {
  /** Hour of day in Singapore time, 0–23. */
  hour: number;
  /** Share of usable connectors occupied, 0–100. */
  utilisationPercent: number;
}

/**
 * Island-wide occupancy by hour of day over the past `days`, in Singapore
 * time. Hours without samples yet are returned at zero so charts always get
 * 24 points.
 */
export async function getEvChargingUtilisationByHour(
  days = 7,
): Promise<EvChargingHourlyUtilisation[]> {
  "use cache";
  cacheLife("hours");

  const hourOfDay =
    sql`extract(hour from ${evLocationHourly.hour} at time zone 'Asia/Singapore')`.mapWith(
      Number,
    );
  const usable = sql`sum(${evLocationHourly.connectorSamples} - ${evLocationHourly.unavailableSamples})`;
  const utilisation =
    sql`coalesce(100.0 * ${sum(evLocationHourly.occupiedSamples)} / nullif(${usable}, 0), 0)`.mapWith(
      Number,
    );

  const rows = await db
    .select({ hour: hourOfDay, utilisationPercent: utilisation })
    .from(evLocationHourly)
    .where(gte(evLocationHourly.hour, daysAgo(days)))
    .groupBy(hourOfDay)
    .orderBy(hourOfDay);

  const byHour = new Map(rows.map((row) => [row.hour, row.utilisationPercent]));

  return Array.from({ length: 24 }, (_, hour) => ({
    hour,
    utilisationPercent: byHour.get(hour) ?? 0,
  }));
}
