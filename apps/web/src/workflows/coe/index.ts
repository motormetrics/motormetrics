import { redis } from "@motormetrics/utils/redis";
import { LAST_UPDATED_COE_KEY } from "@web/config/workflow";
import { getCoeMonthlyRevalidationTags } from "@web/lib/cache-tags";
import type { UpdaterResult } from "@web/lib/updater";
import { getCOELatestRecord } from "@web/queries/coe/latest-month";
import { evictInterimResults } from "@web/workflows/coe/steps/evict-interim-results";
import { updateCoe } from "@web/workflows/coe/steps/process-data";
import { emitEvent } from "@web/workflows/shared";
import { revalidateTag } from "next/cache";

interface CoeWorkflowPayload {
  month?: string;
}

interface CoeWorkflowResult {
  message: string;
}

/**
 * COE data workflow using Vercel WDK.
 * Processes COE bidding data and revalidates cache.
 */
export async function coeWorkflow(
  payload?: CoeWorkflowPayload,
): Promise<CoeWorkflowResult> {
  "use workflow";

  await emitEvent({ type: "step:start", step: "processCoeData" });
  const result = await processCoeData();
  await emitEvent({
    type: "data:processed",
    step: "processCoeData",
    data: { recordsProcessed: result.recordsProcessed },
  });

  // Before the early return: a run that adds no CSV rows can still find
  // same-day results whose exercise is now in `coe`, and must revalidate
  // once it deletes them.
  await emitEvent({ type: "step:start", step: "evictInterimResults" });
  const evicted = await evictInterimCoeResults();
  await emitEvent({
    type: "data:processed",
    step: "evictInterimResults",
    data: { recordsEvicted: evicted },
  });

  if (result.recordsProcessed === 0 && evicted === 0) {
    return { message: "No COE records processed." };
  }

  const month = payload?.month ?? (await getLatestCoeMonth());
  if (!month) {
    return { message: "[COE] No COE records found" };
  }

  await emitEvent({ type: "step:start", step: "revalidateCoeCache" });
  await revalidateCoeCache(month);
  await emitEvent({
    type: "cache:revalidated",
    step: "revalidateCoeCache",
    data: { month },
  });

  return {
    message: "[COE] Data processed and cache revalidated successfully",
  };
}

async function processCoeData(): Promise<UpdaterResult> {
  "use step";

  const result = await updateCoe();

  if (result.recordsProcessed > 0) {
    await redis.set(LAST_UPDATED_COE_KEY, Date.now());
  }

  return result;
}
async function evictInterimCoeResults(): Promise<number> {
  "use step";

  return evictInterimResults();
}

async function getLatestCoeMonth(): Promise<string | null> {
  "use step";

  const record = await getCOELatestRecord();
  return record?.month ?? null;
}

async function revalidateCoeCache(month: string): Promise<void> {
  "use step";

  const tags = getCoeMonthlyRevalidationTags(month);
  for (const tag of tags) {
    revalidateTag(tag, "max");
  }
}
