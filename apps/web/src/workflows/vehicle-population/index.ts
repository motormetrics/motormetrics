import { redis } from "@motormetrics/utils";
import type { UpdaterResult } from "@web/lib/updater";
import { getVehiclePopulationYears } from "@web/queries/vehicle-population";
import { emitEvent } from "@web/workflows/shared";
import { updateVehiclePopulation } from "@web/workflows/vehicle-population/steps/process-data";
import { revalidateTag } from "next/cache";

export async function vehiclePopulationWorkflow(): Promise<{
  message: string;
}> {
  "use workflow";

  await emitEvent({ type: "step:start", step: "processVehiclePopulationData" });
  const result = await processVehiclePopulationData();
  await emitEvent({
    type: "data:processed",
    step: "processVehiclePopulationData",
    data: { recordsProcessed: result.recordsProcessed },
  });

  if (result.recordsProcessed === 0) {
    return { message: "No vehicle population records processed." };
  }

  const latestYear = await getLatestYear();
  if (!latestYear) {
    return { message: "No vehicle population data found." };
  }

  await emitEvent({
    type: "step:start",
    step: "revalidateVehiclePopulationCache",
  });
  await revalidateVehiclePopulationCache(latestYear);
  await emitEvent({
    type: "cache:revalidated",
    step: "revalidateVehiclePopulationCache",
    data: { year: latestYear },
  });

  return {
    message:
      "[VEHICLE POPULATION] Data processed and cache revalidated successfully",
  };
}

async function processVehiclePopulationData(): Promise<UpdaterResult> {
  "use step";
  const result = await updateVehiclePopulation();
  if (result.recordsProcessed > 0) {
    await redis.set("last_updated:vehicle-population", Date.now());
  }
  return result;
}
async function getLatestYear(): Promise<string | null> {
  "use step";
  const years = await getVehiclePopulationYears();
  return years[0]?.year ?? null;
}

async function revalidateVehiclePopulationCache(year: string): Promise<void> {
  "use step";
  const tags = [
    `vehicle-population:year:${year}`,
    "vehicle-population:years",
    "vehicle-population:totals",
  ];
  for (const tag of tags) {
    revalidateTag(tag, "max");
  }
}
