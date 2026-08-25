import type { CarDimension } from "@web/queries/cars";

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
  { column: string; searchLabel: string; tab: string; title: string }
> = {
  make: {
    column: "Make",
    searchLabel: "Search makes",
    tab: "Makes",
    title: "Top makes",
  },
  vehicleType: {
    column: "Vehicle type",
    searchLabel: "Search vehicle types",
    tab: "Vehicle types",
    title: "Vehicle types",
  },
  fuelType: {
    column: "Fuel type",
    searchLabel: "Search fuel types",
    tab: "Fuel types",
    title: "Fuel types",
  },
};
