/**
 * Column configuration for fuel types and vehicle types
 * Lets queries work with either the fuelType or vehicleType column
 */

import { cars } from "@motormetrics/database/schema";

/**
 * Configuration for type-based queries
 * Allows parameterization of queries across different type columns
 */
export interface TypeConfig {
  column: typeof cars.fuelType | typeof cars.vehicleType;
  fieldName: "fuelType" | "vehicleType";
}

/**
 * Predefined configuration for fuel type queries
 */
export const FUEL_TYPE: TypeConfig = {
  column: cars.fuelType,
  fieldName: "fuelType",
};

/**
 * Predefined configuration for vehicle type queries
 */
export const VEHICLE_TYPE: TypeConfig = {
  column: cars.vehicleType,
  fieldName: "vehicleType",
};
