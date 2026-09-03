import { db, evConnectorStatus, sql } from "@motormetrics/database";
import { getPostalDistrict } from "@web/config/postal-districts";

/**
 * One row per charging location, rolled up from the live connector table.
 *
 * Station attributes repeat on every connector, so `min()` is only a way to
 * pick one; the counts are what vary.
 */
export const locationsSubquery = () =>
  db
    .select({
      locationId: evConnectorStatus.locationId,
      stationName: sql<string | null>`min(${evConnectorStatus.stationName})`.as(
        "station_name",
      ),
      address: sql<string | null>`min(${evConnectorStatus.address})`.as(
        "address",
      ),
      postalCode: sql<string | null>`min(${evConnectorStatus.postalCode})`.as(
        "postal_code",
      ),
      operator: sql<string | null>`min(${evConnectorStatus.operator})`.as(
        "operator",
      ),
      connectors: sql<number>`count(*)::int`.as("connectors"),
      dcConnectors:
        sql<number>`count(*) filter (where ${evConnectorStatus.powerRating} = 'DC')::int`.as(
          "dc_connectors",
        ),
      maxSpeedKw: sql<
        number | null
      >`max(${evConnectorStatus.chargingSpeedKw})`.as("max_speed_kw"),
      minPricePerKwh: sql<
        number | null
      >`min(${evConnectorStatus.price}) filter (where ${evConnectorStatus.priceType} = '$/kWh')`.as(
        "min_price_per_kwh",
      ),
    })
    .from(evConnectorStatus)
    .groupBy(evConnectorStatus.locationId)
    .as("locations");

/**
 * SQL predicate restricting a postal code column to a district's sectors, or
 * `undefined` when the slug is unknown so callers can fall through to all of
 * Singapore.
 */
export const districtPredicate = (
  postalCodeColumn: unknown,
  districtSlug: string | undefined,
) => {
  if (!districtSlug) {
    return undefined;
  }
  const district = getPostalDistrict(districtSlug);
  if (!district) {
    return undefined;
  }
  return sql`left(${postalCodeColumn}, 2) in (${sql.join(
    district.sectors.map((sector) => sql`${sector}`),
    sql`, `,
  )})`;
};

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

export const toLocation = (row: {
  locationId: string;
  stationName: string | null;
  address: string | null;
  postalCode: string | null;
  operator: string | null;
  connectors: number | string;
  dcConnectors: number | string;
  maxSpeedKw: number | string | null;
  minPricePerKwh: number | string | null;
}): EvChargingLocation => ({
  locationId: row.locationId,
  stationName: row.stationName,
  address: row.address,
  postalCode: row.postalCode,
  operator: row.operator,
  connectors: Number(row.connectors),
  dcConnectors: Number(row.dcConnectors),
  maxSpeedKw: row.maxSpeedKw == null ? null : Number(row.maxSpeedKw),
  minPricePerKwh:
    row.minPricePerKwh == null ? null : Number(row.minPricePerKwh),
});
