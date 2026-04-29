/**
 * Generic type queries for fuel types and vehicle types
 * This module provides reusable query functions that work with both fuelType and vehicleType columns
 */

import { and, cars, db, desc, eq, sql } from "@motormetrics/database";

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

/**
 * Result type for type distribution queries
 */
export interface TypeDistribution {
  name: string | null;
  count: number;
}

/**
 * Get distribution of registrations by type for a specific month
 * @param config - Type configuration (FUEL_TYPE or VEHICLE_TYPE)
 * @param month - Month in format "YYYY-MM"
 * @returns Array of type distributions ordered by count descending
 * @example
 * const fuelTypes = await getTypeDistribution(FUEL_TYPE, "2024-01");
 * const vehicleTypes = await getTypeDistribution(VEHICLE_TYPE, "2024-01");
 */
export async function getTypeDistribution(
  config: TypeConfig,
  month: string,
): Promise<TypeDistribution[]> {
  return db
    .select({
      name: config.column,
      count: sql<number>`sum(${cars.number})`.mapWith(Number),
    })
    .from(cars)
    .where(eq(cars.month, month))
    .groupBy(config.column)
    .orderBy(desc(sql<number>`sum(${cars.number})`));
}

/**
 * Result type for top type queries
 */
export interface TopTypeResult {
  name: string | null;
  total: number;
}

/**
 * Get top N types by registration count for a specific month
 * @param config - Type configuration (FUEL_TYPE or VEHICLE_TYPE)
 * @param month - Month in format "YYYY-MM"
 * @param limit - Number of top types to return (default: 1)
 * @returns Array of top types ordered by total descending
 * @example
 * const topFuelType = await getTopType(FUEL_TYPE, "2024-01", 1);
 * const top3VehicleTypes = await getTopType(VEHICLE_TYPE, "2024-01", 3);
 */
export async function getTopType(
  config: TypeConfig,
  month: string,
  limit = 1,
): Promise<TopTypeResult[]> {
  return db
    .select({
      name: config.column,
      total: sql<number>`sum(${cars.number})`.mapWith(Number),
    })
    .from(cars)
    .where(eq(cars.month, month))
    .groupBy(config.column)
    .orderBy(desc(sql<number>`sum(${cars.number})`))
    .limit(limit);
}

/**
 * Get all distinct values for a type, optionally filtered by month
 * @param config - Type configuration (FUEL_TYPE or VEHICLE_TYPE)
 * @param month - Optional month filter in format "YYYY-MM"
 * @returns Array of distinct type values (raw database results)
 * @example
 * const allFuelTypes = await getDistinctTypes(FUEL_TYPE);
 * const januaryVehicleTypes = await getDistinctTypes(VEHICLE_TYPE, "2024-01");
 */
export async function getDistinctTypes(
  config: TypeConfig,
  month?: string,
): Promise<Array<{ value: string | null }>> {
  const whereConditions = [];

  if (month) {
    whereConditions.push(eq(cars.month, month));
  }

  return db
    .selectDistinct({ value: config.column })
    .from(cars)
    .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
    .orderBy(config.column);
}

/**
 * Get total registration count for a specific type value
 * @param config - Type configuration (FUEL_TYPE or VEHICLE_TYPE)
 * @param typeValue - The type value to filter by (e.g., "Petrol", "Passenger Car")
 * @param month - Optional month filter in format "YYYY-MM"
 * @returns Raw total result
 */
export async function getTypeTotal(
  config: TypeConfig,
  typeValue: string,
  month?: string,
) {
  const pattern = typeValue.replaceAll("-", "%");
  const whereConditions = [sql`${config.column} ILIKE ${pattern}`];

  if (month) {
    whereConditions.push(eq(cars.month, month));
  }

  return db
    .select({
      total: sql<number>`sum(${cars.number})`.mapWith(Number),
    })
    .from(cars)
    .where(and(...whereConditions));
}

/**
 * Get detailed registration breakdown for a specific type value
 * @param config - Type configuration (FUEL_TYPE or VEHICLE_TYPE)
 * @param typeValue - The type value to filter by (e.g., "Petrol", "Passenger Car")
 * @param month - Optional month filter in format "YYYY-MM"
 * @returns Raw breakdown data by month/make/type
 */
export async function getTypeBreakdown(
  config: TypeConfig,
  typeValue: string,
  month?: string,
) {
  const pattern = typeValue.replaceAll("-", "%");
  const whereConditions = [sql`${config.column} ILIKE ${pattern}`];

  if (month) {
    whereConditions.push(eq(cars.month, month));
  }

  return db
    .select({
      month: cars.month,
      make: cars.make,
      type: config.column,
      count: sql<number>`sum(${cars.number})`.mapWith(Number),
    })
    .from(cars)
    .where(and(...whereConditions))
    .groupBy(cars.month, cars.make, config.column)
    .orderBy(desc(sql<number>`sum(${cars.number})`));
}
