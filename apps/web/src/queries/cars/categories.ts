/**
 * Column configuration for fuel types and vehicle types
 * Lets queries work with either the fuelType or vehicleType column
 */

import { cars } from "@motormetrics/database/schema";

/** The two columns the fuel-type and vehicle-type pages pivot on. */
export type TypeDimension = "fuelType" | "vehicleType";

/** The `cars` column each type dimension resolves to. */
export const TYPE_DIMENSION_COLUMNS = {
  fuelType: cars.fuelType,
  vehicleType: cars.vehicleType,
} as const;
