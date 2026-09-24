import { redis } from "@motormetrics/utils/redis";
import { LAST_UPDATED_CARS_KEY } from "@web/config/workflow";
import { getCarsMonthlyRevalidationTags } from "@web/lib/cache-tags";
import type { UpdaterResult } from "@web/lib/updater";
import { getCarsLatestMonth } from "@web/queries/cars/latest-month";
import { updateCars } from "@web/workflows/cars/steps/process-data";
import { emitEvent } from "@web/workflows/shared";
import { revalidateTag } from "next/cache";

interface CarsWorkflowPayload {
  month?: string;
}

interface CarsWorkflowResult {
  message: string;
}

/**
 * Cars data workflow using Vercel WDK.
 * Processes car registration data and revalidates cache.
 */
export async function carsWorkflow(
  payload?: CarsWorkflowPayload,
): Promise<CarsWorkflowResult> {
  "use workflow";

  await emitEvent({ type: "step:start", step: "processCarsData" });
  const result = await processCarsData();
  await emitEvent({
    type: "data:processed",
    step: "processCarsData",
    data: { recordsProcessed: result.recordsProcessed },
  });

  if (result.recordsProcessed === 0) {
    return { message: "No car records processed." };
  }

  const month = payload?.month ?? (await getCarsLatestRegistrationMonth());
  if (!month) {
    return { message: "[CARS] No car records found" };
  }

  await emitEvent({ type: "step:start", step: "revalidateCarsCache" });
  await revalidateCarsCache(month);
  await emitEvent({
    type: "cache:revalidated",
    step: "revalidateCarsCache",
    data: { month },
  });

  return {
    message: "[CARS] Data processed and cache revalidated successfully",
  };
}

async function processCarsData(): Promise<UpdaterResult> {
  "use step";

  const result = await updateCars();

  if (result.recordsProcessed > 0) {
    await redis.set(LAST_UPDATED_CARS_KEY, Date.now());
  }

  return result;
}

async function getCarsLatestRegistrationMonth(): Promise<string | null> {
  "use step";
  return getCarsLatestMonth();
}

async function revalidateCarsCache(month: string): Promise<void> {
  "use step";

  const tags = getCarsMonthlyRevalidationTags(month);
  for (const tag of tags) {
    revalidateTag(tag, "max");
  }
}
