import { db } from "@motormetrics/database/client";
import { vehiclePopulation } from "@motormetrics/database/schema";
import { desc, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

interface YearFuelTypeTotal {
  year: string;
  fuelType: string;
  total: number;
}

export async function getVehiclePopulationByYearAndFuelType(): Promise<
  YearFuelTypeTotal[]
> {
  "use cache";
  cacheLife("max");
  cacheTag("vehicle-population:totals");

  return db
    .select({
      year: vehiclePopulation.year,
      fuelType: vehiclePopulation.fuelType,
      total:
        sql<number>`cast(sum(${vehiclePopulation.number}) as integer)`.mapWith(
          Number,
        ),
    })
    .from(vehiclePopulation)
    .groupBy(vehiclePopulation.year, vehiclePopulation.fuelType)
    .orderBy(desc(vehiclePopulation.year));
}
