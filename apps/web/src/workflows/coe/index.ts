import { generateBlogContent, getCoeForMonth } from "@motormetrics/ai";
import { redis, tokeniser } from "@motormetrics/utils";
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
  payload: CoeWorkflowPayload,
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

  if (payload.month) {
    // When month is explicitly provided, use it directly and skip biddingNo guard
    month = payload.month;
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

  const existingPost = await checkExistingCoePost(month);
  if (existingPost) {
    return {
      message:
        "[COE] Data processed. Post already exists, skipping social media.",
    };
  }

  await emitEvent({ type: "step:start", step: "generateCoePost" });
  const coeData = await fetchCoeData(month);
  const post = await generateCoePost(coeData, month);
  await emitEvent({
    type: "post:generated",
    step: "generateCoePost",
    data: { postId: post.postId },
  });

  await emitEvent({ type: "step:start", step: "generateCoeHero" });
  try {
    await generatePostHero({
      postId: post.postId,
      title: post.title,
      excerpt: post.excerpt,
      dataType: post.dataType,
    });
    await emitEvent({
      type: "step:complete",
      step: "generateCoeHero",
      data: { postId: post.postId },
    });
  } catch (error) {
    console.error("[COE] Hero image generation failed after retries:", error);
    await emitEvent({
      type: "step:complete",
      step: "generateCoeHero",
      data: { postId: post.postId, heroGenerated: false },
    });
  }

  await revalidatePostsCache();

  return {
    message: "[COE] Data processed and cache revalidated successfully",
    postId: post.postId,
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

async function checkExistingCoePost(
  month: string,
): Promise<{ id: string } | null> {
  "use step";

  const [existingPost] = await getExistingPostByMonth(month, "coe");
  return existingPost ?? null;
}

async function fetchCoeData(month: string) {
  "use step";
  return getCoeForMonth(month);
}

async function generateCoePost(
  coeData: Awaited<ReturnType<typeof getCoeForMonth>>,
  month: string,
) {
  "use step";

  const data = tokeniser(coeData);

  try {
    return await generateBlogContent({ data, month, dataType: "coe" });
  } catch (error) {
    handleAIError(error);
  }
}
