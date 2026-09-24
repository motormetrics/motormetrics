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

/**
 * Configuration for type-based queries
 * Allows parameterization of queries across different type columns
 */
export interface TypeConfig {
  column: (typeof TYPE_DIMENSION_COLUMNS)[TypeDimension];
  fieldName: TypeDimension;
}

/**
 * Predefined configuration for fuel type queries
 */
export const FUEL_TYPE: TypeConfig = {
  column: TYPE_DIMENSION_COLUMNS.fuelType,
  fieldName: "fuelType",
};

/**
 * Predefined configuration for vehicle type queries
 */
export const VEHICLE_TYPE: TypeConfig = {
  column: TYPE_DIMENSION_COLUMNS.vehicleType,
  fieldName: "vehicleType",
};
