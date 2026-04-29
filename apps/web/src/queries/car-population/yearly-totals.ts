import { carPopulation, db, desc, sql } from "@motormetrics/database";
import { cacheLife, cacheTag } from "next/cache";

interface YearlyTotal {
  year: string;
  total: number;
}

export async function getCarPopulationYearlyTotals(): Promise<YearlyTotal[]> {
  "use cache";
  cacheLife("max");
  cacheTag("cars:population:totals");

  return db
    .select({
      year: carPopulation.year,
      total: sql<number>`cast(sum(${carPopulation.number}) as integer)`.mapWith(
        Number,
      ),
    })
    .from(carPopulation)
    .groupBy(carPopulation.year)
    .orderBy(desc(carPopulation.year));
}
