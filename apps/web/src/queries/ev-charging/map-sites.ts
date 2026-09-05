import { getEvChargingLocationUtilisation } from "./location-utilisation";
import { type EvChargingLocation, groupLocations } from "./locations";
import { getEvChargingSnapshot } from "./snapshot";

export interface EvChargingMapSite extends EvChargingLocation {
  latitude: number;
  longitude: number;
  available: number;
  occupied: number;
  unavailable: number;
  /** Average occupancy over the past week, or null without enough samples. */
  utilisationPercent: number | null;
}

interface SiteExtras {
  latitude: number | null;
  longitude: number | null;
  available: number;
  occupied: number;
  unavailable: number;
}

/**
 * Every location in the live snapshot that can be placed on a map, with the
 * connector status counts a pin needs to show its colour and popup.
 *
 * Locations without coordinates are dropped rather than guessed at.
 */
export async function getEvChargingMapSites(): Promise<EvChargingMapSite[]> {
  const [{ records }, utilisation] = await Promise.all([
    getEvChargingSnapshot(),
    getEvChargingLocationUtilisation({ order: "busiest", limit: 10_000 }),
  ]);
  const utilisationByLocation = new Map(
    utilisation.map((row) => [row.locationId, row.utilisationPercent]),
  );

  const extrasByLocation = new Map<string, SiteExtras>();
  for (const record of records) {
    const extras = extrasByLocation.get(record.locationId) ?? {
      latitude: null,
      longitude: null,
      available: 0,
      occupied: 0,
      unavailable: 0,
    };
    if (
      extras.latitude == null &&
      record.latitude != null &&
      record.longitude != null
    ) {
      extras.latitude = record.latitude;
      extras.longitude = record.longitude;
    }
    extras[record.status] += 1;
    extrasByLocation.set(record.locationId, extras);
  }

  const sites: EvChargingMapSite[] = [];
  for (const location of groupLocations(records)) {
    const extras = extrasByLocation.get(location.locationId);
    if (!extras || extras.latitude == null || extras.longitude == null) {
      continue;
    }
    sites.push({
      ...location,
      latitude: extras.latitude,
      longitude: extras.longitude,
      available: extras.available,
      occupied: extras.occupied,
      unavailable: extras.unavailable,
      utilisationPercent:
        utilisationByLocation.get(location.locationId) ?? null,
    });
  }
  return sites;
}
