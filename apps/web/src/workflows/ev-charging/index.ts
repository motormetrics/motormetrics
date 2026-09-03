import { redis } from "@motormetrics/utils";
import { EV_CHARGING_CACHE_TAG } from "@web/lib/cache-tags";
import type { UpdaterResult } from "@web/lib/updater";
import { updateEvChargingPoints } from "@web/workflows/ev-charging/steps/process-data";
import { emitEvent } from "@web/workflows/shared";
import { revalidateTag } from "next/cache";

export const LAST_UPDATED_EV_CHARGING_KEY = "last_updated:ev-charging";

/**
 * EV charging points workflow using Vercel WDK.
 *
 * Ingests LTA DataMall's quarterly public charging point registry. The source
 * is quarterly, so most runs are no-ops short-circuited by the updater's
 * checksum cache.
 */
export async function evChargingWorkflow(): Promise<{ message: string }> {
  "use workflow";

  await emitEvent({ type: "step:start", step: "processEvChargingData" });
  const result = await processEvChargingData();
  await emitEvent({
    type: "data:processed",
    step: "processEvChargingData",
    data: { recordsProcessed: result.recordsProcessed },
  });

  if (result.recordsProcessed === 0) {
    return { message: "No EV charging point records processed." };
  }

  await emitEvent({ type: "step:start", step: "revalidateEvChargingCache" });
  await revalidateEvChargingCache();
  await emitEvent({
    type: "cache:revalidated",
    step: "revalidateEvChargingCache",
  });

  return {
    message: "[EV CHARGING] Data processed and cache revalidated successfully",
  };
}

async function processEvChargingData(): Promise<UpdaterResult> {
  "use step";
  const result = await updateEvChargingPoints();
  if (result.recordsProcessed > 0) {
    await redis.set(LAST_UPDATED_EV_CHARGING_KEY, Date.now());
  }
  return result;
}

async function revalidateEvChargingCache(): Promise<void> {
  "use step";
  revalidateTag(EV_CHARGING_CACHE_TAG, "max");
}
