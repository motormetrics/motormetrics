import { db } from "@motormetrics/database/client";
import { vehiclePopulation } from "@motormetrics/database/schema";
import { desc, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

interface YearlyTotal {
  year: string;
  total: number;
}

export async function getVehiclePopulationYearlyTotals(): Promise<
  YearlyTotal[]
> {
  "use cache";
  cacheLife("max");
  cacheTag("vehicle-population:totals");

  return db
    .select({
      year: vehiclePopulation.year,
      total:
        sql<number>`cast(sum(${vehiclePopulation.number}) as integer)`.mapWith(
          Number,
        ),
    })
    .from(vehiclePopulation)
    .groupBy(vehiclePopulation.year)
    .orderBy(desc(vehiclePopulation.year));
}
