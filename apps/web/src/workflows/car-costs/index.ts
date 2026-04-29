import { redis } from "@motormetrics/utils";
import { LAST_UPDATED_CAR_COSTS_KEY } from "@web/config";
import type { UpdaterResult } from "@web/lib/updater";
import { updateCarCosts } from "@web/workflows/car-costs/steps/process-data";
import { emitEvent } from "@web/workflows/shared";
import { revalidateTag } from "next/cache";

interface CarCostsWorkflowResult {
  message: string;
}

/**
 * Car costs data workflow using Vercel WDK.
 * Fetches and processes the LTA Car Cost Update XLSX.
 */
export async function carCostsWorkflow(): Promise<CarCostsWorkflowResult> {
  "use workflow";

  await emitEvent({ type: "step:start", step: "processCarCostsData" });
  const result = await processCarCostsData();
  await emitEvent({
    type: "data:processed",
    step: "processCarCostsData",
    data: { recordsProcessed: result.recordsProcessed },
  });

  if (result.recordsProcessed === 0) {
    return { message: "No car cost records processed." };
  }

  await emitEvent({ type: "step:start", step: "revalidateCarCostsCache" });
  await revalidateCarCostsCache();
  await emitEvent({
    type: "cache:revalidated",
    step: "revalidateCarCostsCache",
  });

  return {
    message: "[CAR COSTS] Data processed and cache revalidated successfully",
  };
}

async function processCarCostsData(): Promise<UpdaterResult> {
  "use step";

  const result = await updateCarCosts();

  if (result.recordsProcessed > 0) {
    await redis.set(LAST_UPDATED_CAR_COSTS_KEY, Date.now());
  }

  return result;
}
async function revalidateCarCostsCache(): Promise<void> {
  "use step";

  revalidateTag("cars:costs:latest", "max");
}
revalidateCarCostsCache.maxRetries = 1;
