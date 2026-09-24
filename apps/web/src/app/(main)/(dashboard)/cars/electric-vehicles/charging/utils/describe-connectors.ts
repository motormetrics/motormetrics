import type { EvChargingLocation } from "@web/queries/ev-charging";

/** "2× DC 120 kW" style summary of what a location offers. */
export const describeConnectors = (location: EvChargingLocation): string => {
  const rating = location.dcConnectors > 0 ? "DC" : "AC";
  const speed = location.maxSpeedKw != null ? ` ${location.maxSpeedKw} kW` : "";
  return `${location.connectors}× ${rating}${speed}`;
};

/** The name a site is listed under: its station name, else its address, else its ID. */
export const siteTitle = (site: {
  address: string | null;
  locationId: string;
  stationName: string | null;
}): string => site.stationName ?? site.address ?? site.locationId;
