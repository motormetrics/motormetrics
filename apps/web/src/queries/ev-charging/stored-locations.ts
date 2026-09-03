import {
  count,
  db,
  evConnectorStatus,
  like,
  max,
  min,
  or,
  sql,
} from "@motormetrics/database";
import { getPostalDistrict } from "@web/config/postal-districts";
import type { EvChargingLocation } from "./locations";

/**
 * One row per charging location, rolled up from the stored connector table.
 *
 * Station attributes repeat on every connector, so `min()` is only a way to
 * pick one; the counts are what vary. Filtered aggregates have no Drizzle
 * helper, so those two stay as `sql` with an explicit number mapping.
 */
export const storedLocationsSubquery = () =>
  db
    .select({
      locationId: evConnectorStatus.locationId,
      stationName: min(evConnectorStatus.stationName).as("station_name"),
      address: min(evConnectorStatus.address).as("address"),
      postalCode: min(evConnectorStatus.postalCode).as("postal_code"),
      operator: min(evConnectorStatus.operator).as("operator"),
      connectors: count().as("connectors"),
      dcConnectors:
        sql`count(*) filter (where ${evConnectorStatus.powerRating} = 'DC')`
          .mapWith(Number)
          .as("dc_connectors"),
      maxSpeedKw: max(evConnectorStatus.chargingSpeedKw).as("max_speed_kw"),
      minPricePerKwh:
        sql`min(${evConnectorStatus.price}) filter (where ${evConnectorStatus.priceType} = '$/kWh')`
          .mapWith(Number)
          .as("min_price_per_kwh"),
    })
    .from(evConnectorStatus)
    .groupBy(evConnectorStatus.locationId)
    .as("locations");

export type StoredLocations = ReturnType<typeof storedLocationsSubquery>;

/** Every column of the subquery, for `select` and `groupBy` alike. */
export const storedLocationColumns = (locations: StoredLocations) => ({
  locationId: locations.locationId,
  stationName: locations.stationName,
  address: locations.address,
  postalCode: locations.postalCode,
  operator: locations.operator,
  connectors: locations.connectors,
  dcConnectors: locations.dcConnectors,
  maxSpeedKw: locations.maxSpeedKw,
  minPricePerKwh: locations.minPricePerKwh,
});

/**
 * Predicate restricting a postal code column to a district's sectors, or
 * `undefined` when the slug is unknown so callers fall through to all of
 * Singapore.
 */
export const districtPredicate = (
  postalCodeColumn: Parameters<typeof like>[0],
  districtSlug: string | undefined,
) => {
  const district = districtSlug ? getPostalDistrict(districtSlug) : undefined;
  if (!district) {
    return undefined;
  }
  return or(
    ...district.sectors.map((sector) => like(postalCodeColumn, `${sector}%`)),
  );
};

export const toStoredLocation = (row: {
  locationId: string;
  stationName: string | null;
  address: string | null;
  postalCode: string | null;
  operator: string | null;
  connectors: number;
  dcConnectors: number;
  maxSpeedKw: number | null;
  minPricePerKwh: number | null;
}): EvChargingLocation => ({
  locationId: row.locationId,
  stationName: row.stationName,
  address: row.address,
  postalCode: row.postalCode,
  operator: row.operator,
  connectors: row.connectors,
  dcConnectors: row.dcConnectors,
  maxSpeedKw: row.maxSpeedKw,
  minPricePerKwh: row.minPricePerKwh,
});
