import {
  and,
  asc,
  db,
  desc,
  evConnectorStatus,
  sql,
} from "@motormetrics/database";
import { cacheLife } from "next/cache";
import {
  districtPredicate,
  type EvChargingLocation,
  toLocation,
} from "./locations";

export type PowerRating = "AC" | "DC";
export type PriceOrder = "cheapest" | "priciest";

export interface PriceRankingOptions {
  powerRating: PowerRating;
  order: PriceOrder;
  district?: string;
  limit?: number;
}

export interface EvChargingPricedLocation extends EvChargingLocation {
  /** Advertised $/kWh for the requested power rating at this location. */
  pricePerKwh: number;
  /** Highest connector speed of that rating at this location. */
  speedKw: number | null;
}

/**
 * Locations ranked by advertised per-kWh price for one power rating.
 *
 * Per-hour tariffs are excluded rather than converted, since the two are not
 * comparable without knowing the car. Prices move rarely, so the `hours`
 * profile is enough.
 */
export async function getEvChargingPriceRankings({
  powerRating,
  order,
  district,
  limit = 10,
}: PriceRankingOptions): Promise<EvChargingPricedLocation[]> {
  "use cache";
  cacheLife("hours");

  const price = sql<number>`${order === "cheapest" ? sql`min` : sql`max`}(${evConnectorStatus.price})`;

  const rows = await db
    .select({
      locationId: evConnectorStatus.locationId,
      stationName: sql<string | null>`min(${evConnectorStatus.stationName})`,
      address: sql<string | null>`min(${evConnectorStatus.address})`,
      postalCode: sql<string | null>`min(${evConnectorStatus.postalCode})`,
      operator: sql<string | null>`min(${evConnectorStatus.operator})`,
      connectors: sql<number>`count(*)::int`,
      dcConnectors: sql<number>`count(*) filter (where ${evConnectorStatus.powerRating} = 'DC')::int`,
      maxSpeedKw: sql<number | null>`max(${evConnectorStatus.chargingSpeedKw})`,
      pricePerKwh: price,
    })
    .from(evConnectorStatus)
    .where(
      and(
        sql`${evConnectorStatus.powerRating} = ${powerRating}`,
        sql`${evConnectorStatus.priceType} = '$/kWh'`,
        sql`${evConnectorStatus.price} is not null`,
        districtPredicate(evConnectorStatus.postalCode, district),
      ),
    )
    .groupBy(evConnectorStatus.locationId)
    .orderBy(
      order === "cheapest" ? asc(price) : desc(price),
      sql`min(${evConnectorStatus.stationName})`,
    )
    .limit(limit);

  return rows.map((row) => ({
    ...toLocation({ ...row, minPricePerKwh: row.pricePerKwh }),
    pricePerKwh: Number(row.pricePerKwh),
    speedKw: row.maxSpeedKw == null ? null : Number(row.maxSpeedKw),
  }));
}
