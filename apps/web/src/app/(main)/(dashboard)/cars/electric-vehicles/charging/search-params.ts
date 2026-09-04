import { createLoader, parseAsString, parseAsStringLiteral } from "nuqs/server";

/** Which power rating the price rankings list. */
export const POWER_RATINGS = ["AC", "DC"] as const;

/** Site a list row picked out for the map; client-only, never read on the server. */
export const siteParam = parseAsString.withDefault("");

/** DOM id the map card carries so a list row can scroll it into view. */
export const MAP_ANCHOR_ID = "charging-map";

export const chargingSearchParams = {
  /** Postal district slug from `config/postal-districts`; empty means all. */
  district: parseAsString.withDefault(""),
  power: parseAsStringLiteral(POWER_RATINGS).withDefault("DC"),
};

export const loadSearchParams = createLoader(chargingSearchParams);
