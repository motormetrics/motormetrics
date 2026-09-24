import { EV_CHARGING_LIVE_CACHE_TAG } from "@web/lib/cache-tags";
import {
  type EvChargingLocation,
  groupLocations,
  inDistrict,
  PER_KWH,
} from "@web/queries/ev-charging/locations";
import { getEvChargingSnapshot } from "@web/queries/ev-charging/snapshot";
import { cacheLife, cacheTag } from "next/cache";

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
 * Only connectors of the requested rating count, so a site's AC price does
 * not stand in for its DC one. Ties break alphabetically by station name.
 *
 * It takes the district and power rating, so it runs at request time and is
 * cached remotely: an in-memory entry would miss on every fresh instance.
 */
export async function getEvChargingPriceRankings({
  powerRating,
  order,
  district,
  limit = 10,
}: PriceRankingOptions): Promise<EvChargingPricedLocation[]> {
  "use cache: remote";
  cacheLife("max");
  cacheTag(EV_CHARGING_LIVE_CACHE_TAG);

  const { records } = await getEvChargingSnapshot();
  const matching = records.filter(
    (record) =>
      record.powerRating === powerRating &&
      record.priceType === PER_KWH &&
      record.price != null &&
      inDistrict(record.postalCode, district),
  );

  const pick = order === "cheapest" ? Math.min : Math.max;
  const priceByLocation = new Map<string, number>();
  const speedByLocation = new Map<string, number>();
  for (const record of matching) {
    const price = record.price as number;
    priceByLocation.set(
      record.locationId,
      pick(priceByLocation.get(record.locationId) ?? price, price),
    );
    if (record.chargingSpeedKw != null) {
      speedByLocation.set(
        record.locationId,
        Math.max(
          speedByLocation.get(record.locationId) ?? 0,
          record.chargingSpeedKw,
        ),
      );
    }
  }

  return groupLocations(matching)
    .map((location) => ({
      ...location,
      pricePerKwh: priceByLocation.get(location.locationId) as number,
      speedKw: speedByLocation.get(location.locationId) ?? null,
    }))
    .sort(
      (left, right) =>
        (order === "cheapest"
          ? left.pricePerKwh - right.pricePerKwh
          : right.pricePerKwh - left.pricePerKwh) ||
        (left.stationName ?? "").localeCompare(right.stationName ?? ""),
    )
    .slice(0, limit);
}
