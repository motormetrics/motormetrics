import { db, desc, vehiclePopulation } from "@motormetrics/database";
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
