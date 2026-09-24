import { redis } from "@motormetrics/utils/redis";
import { getDeregistrationsMonthlyRevalidationTags } from "@web/lib/cache-tags";
import type { UpdaterResult } from "@web/lib/updater";
import { getDeregistrationsLatestMonth } from "@web/queries/deregistrations/latest-month";
import { updateDeregistration } from "@web/workflows/deregistrations/steps/process-data";
import { emitEvent } from "@web/workflows/shared";
import { revalidateTag } from "next/cache";

interface DeregistrationsWorkflowPayload {
  month?: string;
}

interface DeregistrationsWorkflowResult {
  message: string;
}

/**
 * Deregistrations data workflow using Vercel WDK.
 * Processes vehicle deregistration data and revalidates cache.
 */
export async function deregistrationsWorkflow(
  payload?: DeregistrationsWorkflowPayload,
): Promise<DeregistrationsWorkflowResult> {
  "use workflow";

  await emitEvent({ type: "step:start", step: "processDeregistrationsData" });
  const result = await processDeregistrationsData();
  await emitEvent({
    type: "data:processed",
    step: "processDeregistrationsData",
    data: { recordsProcessed: result.recordsProcessed },
  });

  if (result.recordsProcessed === 0) {
    return { message: "No deregistration records processed." };
  }

  const latestMonth = payload?.month ?? (await getLatestDeregistrationMonth());
  if (!latestMonth) {
    return { message: "No deregistration data found." };
  }

  await emitEvent({
    type: "step:start",
    step: "revalidateDeregistrationsCache",
  });
  await revalidateDeregistrationsCache(latestMonth);
  await emitEvent({
    type: "cache:revalidated",
    step: "revalidateDeregistrationsCache",
    data: { month: latestMonth },
  });

  return {
    message:
      "[DEREGISTRATIONS] Data processed and cache revalidated successfully",
  };
}

async function processDeregistrationsData(): Promise<UpdaterResult> {
  "use step";

  const result = await updateDeregistration();

  if (result.recordsProcessed > 0) {
    await redis.set("last_updated:deregistrations", Date.now());
  }

  return result;
}
async function getLatestDeregistrationMonth(): Promise<string | null> {
  "use step";

  const { month } = await getDeregistrationsLatestMonth();
  return month ?? null;
}

async function revalidateDeregistrationsCache(month: string): Promise<void> {
  "use step";

  const tags = getDeregistrationsMonthlyRevalidationTags(month);
  for (const tag of tags) {
    revalidateTag(tag, "max");
  }
}
