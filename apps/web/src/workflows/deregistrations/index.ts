import {
  generateBlogContent,
  getDeregistrationsForMonth,
} from "@motormetrics/ai";
import { redis, tokeniser } from "@motormetrics/utils";
import { getDeregistrationsMonthlyRevalidationTags } from "@web/lib/cache-tags";
import type { UpdaterResult } from "@web/lib/updater";
import { getDeregistrationsLatestMonth } from "@web/queries/deregistrations/latest-month";
import { getExistingPostByMonth } from "@web/queries/posts";
import { updateDeregistration } from "@web/workflows/deregistrations/steps/process-data";
import {
  emitEvent,
  generatePostHero,
  handleAIError,
  revalidatePostsCache,
} from "@web/workflows/shared";
import { revalidateTag } from "next/cache";
import { fetch } from "workflow";

interface DeregistrationsWorkflowPayload {
  month?: string;
}

interface DeregistrationsWorkflowResult {
  message: string;
  postId?: string;
}

/**
 * Deregistrations data workflow using Vercel WDK.
 * Processes vehicle deregistration data, generates blog posts, and revalidates cache.
 */
export async function deregistrationsWorkflow(
  payload: DeregistrationsWorkflowPayload,
): Promise<DeregistrationsWorkflowResult> {
  "use workflow";

  globalThis.fetch = fetch;

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

  const latestMonth = payload.month ?? (await getLatestMonth());
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

  const existingPost = await checkExistingDeregistrationsPost(latestMonth);
  if (existingPost) {
    return {
      message:
        "[DEREGISTRATIONS] Data processed. Post already exists, skipping.",
    };
  }

  await emitEvent({ type: "step:start", step: "generateDeregistrationsPost" });
  const deregistrationsData = await fetchDeregistrationsData(latestMonth);
  const post = await generateDeregistrationsPost(
    deregistrationsData,
    latestMonth,
  );
  await emitEvent({
    type: "post:generated",
    step: "generateDeregistrationsPost",
    data: { postId: post.postId },
  });

  await emitEvent({ type: "step:start", step: "generateDeregistrationsHero" });
  try {
    await generatePostHero({
      postId: post.postId,
      title: post.title,
      excerpt: post.excerpt,
      dataType: post.dataType,
    });
    await emitEvent({
      type: "step:complete",
      step: "generateDeregistrationsHero",
      data: { postId: post.postId },
    });
  } catch (error) {
    console.error(
      "[DEREGISTRATIONS] Hero image generation failed after retries:",
      error,
    );
    await emitEvent({
      type: "step:complete",
      step: "generateDeregistrationsHero",
      data: { postId: post.postId, heroGenerated: false },
    });
  }

  await revalidatePostsCache();

  return {
    message:
      "[DEREGISTRATIONS] Data processed and cache revalidated successfully",
    postId: post.postId,
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
async function getLatestMonth(): Promise<string | null> {
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

async function checkExistingDeregistrationsPost(
  month: string,
): Promise<{ id: string } | null> {
  "use step";

  const [existingPost] = await getExistingPostByMonth(month, "deregistrations");
  return existingPost ?? null;
}

async function fetchDeregistrationsData(month: string) {
  "use step";
  return getDeregistrationsForMonth(month);
}

async function generateDeregistrationsPost(
  deregistrationsData: Awaited<ReturnType<typeof getDeregistrationsForMonth>>,
  month: string,
) {
  "use step";

  const data = tokeniser(deregistrationsData);

  try {
    return await generateBlogContent({
      data,
      month,
      dataType: "deregistrations",
    });
  } catch (error) {
    handleAIError(error);
  }
}
