import { db } from "@motormetrics/database/client";
import { vehiclePopulation } from "@motormetrics/database/schema";
import { desc } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

export async function getVehiclePopulationYears(): Promise<{ year: string }[]> {
  "use cache";
  cacheLife("max");
  cacheTag("vehicle-population:years");

  return db
    .selectDistinct({ year: vehiclePopulation.year })
    .from(vehiclePopulation)
    .orderBy(desc(vehiclePopulation.year));
}
