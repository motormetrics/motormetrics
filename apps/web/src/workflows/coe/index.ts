import { generateBlogContent } from "@motormetrics/ai/generate-post";
import {
  getCoeForMonth,
  getPriorMonthsCoeSummary,
} from "@motormetrics/ai/queries";
import { redis } from "@motormetrics/utils/redis";
import { tokeniser } from "@motormetrics/utils/tokeniser";
import { getCoeMonthlyRevalidationTags } from "@web/lib/cache-tags";
import type { UpdaterResult } from "@web/lib/updater";
import { getCOELatestRecord } from "@web/queries/coe/latest-month";
import { getExistingPostByMonth } from "@web/queries/posts";
import { updateCoe } from "@web/workflows/coe/steps/process-data";
import {
  emitEvent,
  generatePostHero,
  handleAIError,
  revalidatePostsCache,
} from "@web/workflows/shared";
import { revalidateTag } from "next/cache";
import { fetch } from "workflow";

interface CoeWorkflowPayload {
  month?: string;
}

interface CoeWorkflowResult {
  message: string;
  postId?: string;
}

/**
 * COE data workflow using Vercel WDK.
 * Processes COE bidding data and generates blog posts.
 */
export async function coeWorkflow(
  payload?: CoeWorkflowPayload,
): Promise<CoeWorkflowResult> {
  "use workflow";

  globalThis.fetch = fetch;

  await emitEvent({ type: "step:start", step: "processCoeData" });
  const result = await processCoeData();
  await emitEvent({
    type: "data:processed",
    step: "processCoeData",
    data: { recordsProcessed: result.recordsProcessed },
  });

  if (result.recordsProcessed === 0) {
    return {
      message: "No COE records processed. Skipped publishing to social media.",
    };
  }

  let month: string;

  if (payload?.month) {
    // When month is explicitly provided, use it directly and skip biddingNo guard
    month = payload?.month;
  } else {
    const record = await getLatestRecord();
    if (!record) {
      return { message: "[COE] No COE records found" };
    }

    month = record.month;

    // Only generate blog post when both bidding exercises are complete
    if (record.biddingNo !== 2) {
      const year = month.split("-")[0];
      await revalidateCoeCache(month, year);
      return {
        message:
          "[COE] Data processed. Waiting for second bidding exercise to generate post.",
      };
    }
  }

  const year = month.split("-")[0];
  await emitEvent({ type: "step:start", step: "revalidateCoeCache" });
  await revalidateCoeCache(month, year);
  await emitEvent({
    type: "cache:revalidated",
    step: "revalidateCoeCache",
    data: { month, year },
  });

  return {
    message: "[COE] Data processed and cache revalidated successfully",
  };
}

async function processCoeData(): Promise<UpdaterResult> {
  "use step";

  const result = await updateCoe();

  if (result.recordsProcessed > 0) {
    await redis.set("last_updated:coe", Date.now());
  }

  return result;
}
async function getLatestRecord(): Promise<{
  month: string;
  biddingNo: number;
} | null> {
  "use step";

  const record = await getCOELatestRecord();
  return record ?? null;
}

async function revalidateCoeCache(month: string, year: string): Promise<void> {
  "use step";

  const tags = getCoeMonthlyRevalidationTags(month, year);
  for (const tag of tags) {
    revalidateTag(tag, "max");
  }
}
