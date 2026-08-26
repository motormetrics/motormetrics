import type { CarDimension } from "@web/queries/cars";
import type { Route } from "next";

/**
 * The three tabs the Cars overview table pivots between.
 *
 * The runtime list lives here rather than beside the query so the client-side
 * table can import it: `queries/cars/dimension-stats.ts` reaches the database
 * client, which must never end up in a browser bundle.
 */
export const CAR_DIMENSIONS = [
  "make",
  "vehicleType",
  "fuelType",
] as const satisfies readonly CarDimension[];

export const DIMENSION_LABELS: Record<
  CarDimension,
  {
    column: string;
    /** Dedicated page for this dimension, where the full list lives. */
    href: Route;
    searchLabel: string;
    tab: string;
    title: string;
  }
> = {
  make: {
    column: "Make",
    href: "/cars/makes",
    searchLabel: "Search makes",
    tab: "Makes",
    title: "Top makes",
  },
  vehicleType: {
    column: "Vehicle type",
    href: "/cars/vehicle-types",
    searchLabel: "Search vehicle types",
    tab: "Vehicle types",
    title: "Vehicle types",
  },
  fuelType: {
    column: "Fuel type",
    href: "/cars/fuel-types",
    searchLabel: "Search fuel types",
    tab: "Fuel types",
    title: "Fuel types",
  },
};
