import { evLocationHourly } from "@motormetrics/database/schema";
import { sql, sum } from "drizzle-orm";

/** The instant `days` whole days before now. */
export const daysAgo = (days: number) =>
  new Date(Date.now() - days * 24 * 60 * 60 * 1000);

/**
 * Share of usable connector-samples that were occupied, 0–100, as an
 * aggregate over `ev_location_hourly`. Unavailable connectors are left out of
 * the denominator.
 *
 * A fresh expression per call: Drizzle mutates aggregate fragments when they
 * are decorated with `mapWith`.
 */
export function utilisationPercent() {
  const usable = sql`sum(${evLocationHourly.connectorSamples} - ${evLocationHourly.unavailableSamples})`;

  return sql`coalesce(100.0 * ${sum(evLocationHourly.occupiedSamples)} / nullif(${usable}, 0), 0)`.mapWith(
    Number,
  );
}
