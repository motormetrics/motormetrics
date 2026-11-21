import { redis } from "@motormetrics/utils/redis";
import { getCoeRevalidationMonthlyRevalidationTags } from "@web/lib/cache-tags/coe-revalidation";
import type { UpdaterResult } from "@web/lib/updater";
import { getCoeRevalidationLatestMonth } from "@web/queries/coe-revalidation/latest-month";
import { updateCoeRevalidation } from "@web/workflows/coe-revalidation/steps/process-data";
import { emitEvent } from "@web/workflows/shared";
import { revalidateTag } from "next/cache";

interface CoeRevalidationWorkflowPayload {
  month?: string;
}

interface CoeRevalidationWorkflowResult {
  message: string;
}

/**
 * COE revalidation data workflow using Vercel WDK.
 * Processes monthly COE renewal counts and revalidates cache.
 */
export async function coeRevalidationWorkflow(
  payload?: CoeRevalidationWorkflowPayload,
): Promise<CoeRevalidationWorkflowResult> {
  "use workflow";

  await emitEvent({ type: "step:start", step: "processCoeRevalidationData" });
  const result = await processCoeRevalidationData();
  await emitEvent({
    type: "data:processed",
    step: "processCoeRevalidationData",
    data: { recordsProcessed: result.recordsProcessed },
  });

  if (result.recordsProcessed === 0) {
    return { message: "No COE revalidation records processed." };
  }

  const latestMonth = payload?.month ?? (await getLatestCoeRevalidationMonth());
  if (!latestMonth) {
    return { message: "No COE revalidation data found." };
  }

  await emitEvent({
    type: "step:start",
    step: "revalidateCoeRevalidationCache",
  });
  await revalidateCoeRevalidationCache(latestMonth);
  await emitEvent({
    type: "cache:revalidated",
    step: "revalidateCoeRevalidationCache",
    data: { month: latestMonth },
  });

  return {
    message:
      "[COE REVALIDATION] Data processed and cache revalidated successfully",
  };
}

async function processCoeRevalidationData(): Promise<UpdaterResult> {
  "use step";

  const result = await updateCoeRevalidation();

  if (result.recordsProcessed > 0) {
    await redis.set("last_updated:coe:revalidation", Date.now());
  }

  return result;
}

async function getLatestCoeRevalidationMonth(): Promise<string | null> {
  "use step";

  const { month } = await getCoeRevalidationLatestMonth();
  return month ?? null;
}

async function revalidateCoeRevalidationCache(month: string): Promise<void> {
  "use step";

  const tags = getCoeRevalidationMonthlyRevalidationTags(month);
  for (const tag of tags) {
    revalidateTag(tag, "max");
  }
}
