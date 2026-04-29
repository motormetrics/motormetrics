import {
  generateBlogContent,
  getCarsAggregatedByMonth,
} from "@motormetrics/ai";
import { redis, tokeniser } from "@motormetrics/utils";
import { getCarsMonthlyRevalidationTags } from "@web/lib/cache-tags";
import { populateMakesSortedSet } from "@web/lib/redis/makes";
import type { UpdaterResult } from "@web/lib/updater";
import { getCarsLatestMonth } from "@web/queries/cars/latest-month";
import { getExistingPostByMonth } from "@web/queries/posts";
import { updateCars } from "@web/workflows/cars/steps/process-data";
import {
  emitEvent,
  generatePostHero,
  handleAIError,
  revalidatePostsCache,
} from "@web/workflows/shared";
import { revalidateTag } from "next/cache";
import { fetch } from "workflow";

interface CarsWorkflowPayload {
  month?: string;
}

interface CarsWorkflowResult {
  message: string;
  postId?: string;
}

/**
 * Cars data workflow using Vercel WDK.
 * Processes car registration data and generates blog posts.
 */
export async function carsWorkflow(
  payload: CarsWorkflowPayload,
): Promise<CarsWorkflowResult> {
  "use workflow";

  // Enable WDK's durable fetch for AI SDK
  globalThis.fetch = fetch;

  await emitEvent({ type: "step:start", step: "processCarsData" });
  const result = await processCarsData();
  await emitEvent({
    type: "data:processed",
    step: "processCarsData",
    data: { recordsProcessed: result.recordsProcessed },
  });

  if (result.recordsProcessed === 0) {
    return {
      message: "No car records processed. Skipped publishing to social media.",
    };
  }

  await emitEvent({ type: "step:start", step: "syncMakesSortedSet" });
  await syncMakesSortedSet();
  await emitEvent({ type: "step:complete", step: "syncMakesSortedSet" });

  const month = payload.month ?? (await getLatestMonth());
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

  const existingPost = await checkExistingCarsPost(month);
  if (existingPost) {
    return {
      message:
        "[CARS] Data processed. Post already exists, skipping social media.",
    };
  }

  await emitEvent({ type: "step:start", step: "generateCarsPost" });
  const carsData = await fetchCarsData(month);
  const post = await generateCarsPost(carsData, month);
  await emitEvent({
    type: "post:generated",
    step: "generateCarsPost",
    data: { postId: post.postId },
  });

  await emitEvent({ type: "step:start", step: "generateCarsHero" });
  try {
    await generatePostHero({
      postId: post.postId,
      title: post.title,
      excerpt: post.excerpt,
      dataType: post.dataType,
    });
    await emitEvent({
      type: "step:complete",
      step: "generateCarsHero",
      data: { postId: post.postId },
    });
  } catch (error) {
    console.error("[CARS] Hero image generation failed after retries:", error);
    await emitEvent({
      type: "step:complete",
      step: "generateCarsHero",
      data: { postId: post.postId, heroGenerated: false },
    });
  }

  await revalidatePostsCache();

  return {
    message: "[CARS] Data processed and cache revalidated successfully",
    postId: post.postId,
  };
}

async function processCarsData(): Promise<UpdaterResult> {
  "use step";

  const result = await updateCars();

  if (result.recordsProcessed > 0) {
    await redis.set("last_updated:cars", Date.now());
  }

  return result;
}

async function syncMakesSortedSet(): Promise<void> {
  "use step";
  await populateMakesSortedSet();
}

async function getLatestMonth(): Promise<string | null> {
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

async function checkExistingCarsPost(
  month: string,
): Promise<{ id: string } | null> {
  "use step";

  const [existingPost] = await getExistingPostByMonth(month, "cars");
  return existingPost ?? null;
}

async function fetchCarsData(month: string) {
  "use step";
  return getCarsAggregatedByMonth(month);
}

async function generateCarsPost(
  carsData: Awaited<ReturnType<typeof getCarsAggregatedByMonth>>,
  month: string,
) {
  "use step";

  const data = tokeniser(carsData);

  try {
    return await generateBlogContent({ data, month, dataType: "cars" });
  } catch (error) {
    handleAIError(error);
  }
}
