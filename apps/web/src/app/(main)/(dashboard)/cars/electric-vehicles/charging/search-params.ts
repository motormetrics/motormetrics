import { createLoader, parseAsString, parseAsStringLiteral } from "nuqs/server";

/** Which power rating the price rankings list. */
export const POWER_RATINGS = ["AC", "DC"] as const;

export const chargingSearchParams = {
  /** Postal district slug from `config/postal-districts`; empty means all. */
  district: parseAsString.withDefault(""),
  power: parseAsStringLiteral(POWER_RATINGS).withDefault("DC"),
};

export const loadSearchParams = createLoader(chargingSearchParams);
