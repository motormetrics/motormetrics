import { EV_CHARGING_LIVE_CACHE_TAG } from "@web/lib/cache-tags";
import { inDistrict } from "@web/queries/ev-charging/locations";
import { getEvChargingSnapshot } from "@web/queries/ev-charging/snapshot";
import { cacheLife, cacheTag } from "next/cache";

export interface EvChargingLiveSummary {
  connectors: number;
  locations: number;
  available: number;
  occupied: number;
  unavailable: number;
  /** ISO timestamp of the batch the figures come from. */
  observedAt: string | null;
}

/**
 * Connector state at the latest batch, island-wide or for one district.
 *
 * It takes the district, so it runs at request time and is cached remotely: an
 * in-memory entry would miss on every fresh instance.
 */
export async function getEvChargingLiveSummary(
  district?: string,
): Promise<EvChargingLiveSummary> {
  "use cache: remote";
  cacheLife("max");
  cacheTag(EV_CHARGING_LIVE_CACHE_TAG);

  const { observedAt, records } = await getEvChargingSnapshot();
  const summary: EvChargingLiveSummary = {
    connectors: 0,
    locations: 0,
    available: 0,
    occupied: 0,
    unavailable: 0,
    observedAt,
  };
  const locations = new Set<string>();

  for (const record of records) {
    if (!inDistrict(record.postalCode, district)) {
      continue;
    }
    summary.connectors += 1;
    summary[record.status] += 1;
    locations.add(record.locationId);
  }

  summary.locations = locations.size;
  return summary;
}
