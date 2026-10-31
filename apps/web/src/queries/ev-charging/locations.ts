import { getPostalDistrict } from "@web/config/postal-districts";
import type { ConnectorRecord } from "@web/lib/ev-charging";

export interface EvChargingLocation {
  locationId: string;
  stationName: string | null;
  address: string | null;
  postalCode: string | null;
  operator: string | null;
  connectors: number;
  dcConnectors: number;
  maxSpeedKw: number | null;
  minPricePerKwh: number | null;
}

/** Only per-kWh tariffs are comparable; hourly and "free" ones are skipped. */
export const PER_KWH = "$/kWh";

/** Whether a postal code falls in the district, or in all of Singapore. */
export const inDistrict = (
  postalCode: string | null,
  districtSlug: string | undefined,
): boolean => {
  if (!districtSlug) {
    return true;
  }
  const district = getPostalDistrict(districtSlug);
  if (!district) {
    return true;
  }
  return (
    postalCode != null && district.sectors.includes(postalCode.slice(0, 2))
  );
};

/** Rolls connectors up to one entry per location, in feed order. */
export const groupLocations = (
  records: ConnectorRecord[],
): EvChargingLocation[] => {
  const byLocation = new Map<string, EvChargingLocation>();

  for (const record of records) {
    const location = byLocation.get(record.locationId) ?? {
      locationId: record.locationId,
      stationName: record.stationName,
      address: record.address,
      postalCode: record.postalCode,
      operator: record.operator,
      connectors: 0,
      dcConnectors: 0,
      maxSpeedKw: null,
      minPricePerKwh: null,
    };

    location.connectors += 1;
    if (record.powerRating === "DC") {
      location.dcConnectors += 1;
    }
    if (record.chargingSpeedKw != null) {
      location.maxSpeedKw = Math.max(
        location.maxSpeedKw ?? 0,
        record.chargingSpeedKw,
      );
    }
    if (record.priceType === PER_KWH && record.price != null) {
      location.minPricePerKwh = Math.min(
        location.minPricePerKwh ?? Number.POSITIVE_INFINITY,
        record.price,
      );
    }

    byLocation.set(record.locationId, location);
  }

  return [...byLocation.values()];
};
