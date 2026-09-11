import { db } from "@motormetrics/database/client";
import { carPopulation } from "@motormetrics/database/schema";
import { desc, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

interface YearMakeTotal {
  year: string;
  make: string;
  total: number;
}

export async function getCarPopulationByYearAndMake(): Promise<
  YearMakeTotal[]
> {
  "use cache";
  cacheLife("max");
  cacheTag("cars:population:totals");

  return db
    .select({
      year: carPopulation.year,
      make: carPopulation.make,
      total: sql<number>`cast(sum(${carPopulation.number}) as integer)`.mapWith(
        Number,
      ),
    })
    .from(carPopulation)
    .groupBy(carPopulation.year, carPopulation.make)
    .orderBy(desc(carPopulation.year));
}
