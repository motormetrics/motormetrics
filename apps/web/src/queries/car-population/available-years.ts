import { db } from "@motormetrics/database/client";
import { carPopulation } from "@motormetrics/database/schema";
import { desc } from "drizzle-orm";
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
