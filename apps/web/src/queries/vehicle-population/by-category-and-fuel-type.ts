import { db, desc, sql, vehiclePopulation } from "@motormetrics/database";
import { cacheLife, cacheTag } from "next/cache";

export interface VehiclePopulationBreakdown {
  year: string;
  /** LTA's vehicle type, e.g. "Cars", "Motorcycles". */
  category: string;
  /** LTA DataMall fuel label, verbatim. */
  fuelType: string;
  total: number;
}

/**
 * Every year of the population broken down by vehicle type *and* fuel type —
 * the full grid behind the annual page, which pivots the same rows into a
 * yearly series, a fuel mix and a per-type table without going back to the
 * database.
 */
export async function getVehiclePopulationByCategoryAndFuelType(): Promise<
  VehiclePopulationBreakdown[]
> {
  "use cache";
  cacheLife("max");
  cacheTag("vehicle-population:totals");

  return db
    .select({
      year: vehiclePopulation.year,
      category: vehiclePopulation.category,
      fuelType: vehiclePopulation.fuelType,
      total:
        sql<number>`cast(sum(${vehiclePopulation.number}) as integer)`.mapWith(
          Number,
        ),
    })
    .from(vehiclePopulation)
    .groupBy(
      vehiclePopulation.year,
      vehiclePopulation.category,
      vehiclePopulation.fuelType,
    )
    .orderBy(desc(vehiclePopulation.year));
}
