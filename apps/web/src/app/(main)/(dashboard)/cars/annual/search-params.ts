import {
  createLoader,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs/server";

const currentYear = new Date().getFullYear();

export const VIEWS = ["fuel-type", "make"] as const;
export type View = (typeof VIEWS)[number];

export const searchParams = {
  year: parseAsInteger.withDefault(currentYear),
  view: parseAsStringLiteral(VIEWS).withDefault("fuel-type"),
  /**
   * The vehicle type or make the page is focused on. Null is every entity
   * summed, which is what the page opens on.
   *
   * Read on the client only: the whole grid is already in the payload, so
   * selecting a row re-renders it without a round trip.
   */
  focus: parseAsString,
};

export const loadSearchParams = createLoader(searchParams);
