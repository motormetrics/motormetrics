import { carPopulation, db, desc, sql } from "@motormetrics/database";
import { cacheLife, cacheTag } from "next/cache";

export interface CarPopulationBreakdown {
  year: string;
  make: string;
  /** LTA DataMall fuel label, verbatim. Null in the years LTA published the
   * make counts without a fuel split. */
  fuelType: string | null;
  total: number;
}

/**
 * Every year of the car population broken down by make *and* fuel type — the
 * make-side counterpart to `getVehiclePopulationByCategoryAndFuelType`.
 */
export async function getCarPopulationByMakeAndFuelType(): Promise<
  CarPopulationBreakdown[]
> {
  "use cache";
  cacheLife("max");
  cacheTag("cars:population:totals");

  return db
    .select({
      year: carPopulation.year,
      make: carPopulation.make,
      fuelType: carPopulation.fuelType,
      total: sql<number>`cast(sum(${carPopulation.number}) as integer)`.mapWith(
        Number,
      ),
    })
    .from(carPopulation)
    .groupBy(carPopulation.year, carPopulation.make, carPopulation.fuelType)
    .orderBy(desc(carPopulation.year));
}
