import { carPopulation, db, desc } from "@motormetrics/database";
import { cacheLife, cacheTag } from "next/cache";

export async function getCarPopulationYears(): Promise<{ year: string }[]> {
  "use cache";
  cacheLife("max");
  cacheTag("cars:population:years");

  return db
    .selectDistinct({ year: carPopulation.year })
    .from(carPopulation)
    .orderBy(desc(carPopulation.year));
}
