import {
  getCarsAggregatedByMonth,
  getCoeForMonth,
  regenerateBlogContent,
} from "@motormetrics/ai";
import { tokeniser } from "@motormetrics/utils";
import {
  emitEvent,
  generatePostHero,
  handleAIError,
  revalidatePostsCache,
} from "@web/workflows/shared";
import { fetch } from "workflow";

interface RegeneratePostPayload {
  month: string;
  dataType: "cars" | "coe";
}

interface RegeneratePostResult {
  message: string;
  postId?: string;
  title?: string;
  slug?: string;
}

/**
 * Regenerate post workflow using Vercel WDK.
 * Forces regeneration of a blog post for a specific month and data type.
 * Does not publish to social media (regeneration is for content updates only).
 */
export async function regeneratePostWorkflow(
  payload: RegeneratePostPayload,
): Promise<RegeneratePostResult> {
  "use workflow";

  // Enable WDK's durable fetch for AI SDK
  globalThis.fetch = fetch;

  const { month, dataType } = payload;

  await emitEvent({
    type: "step:start",
    step: "fetchData",
    data: { month, dataType },
  });
  const data = await fetchData(month, dataType);
  await emitEvent({ type: "step:complete", step: "fetchData" });

  await emitEvent({ type: "step:start", step: "generatePost" });
  const post = await generatePost(data, month, dataType);
  await emitEvent({
    type: "post:generated",
    step: "generatePost",
    data: { postId: post.postId },
  });

  await emitEvent({ type: "step:start", step: "regeneratePostHero" });
  try {
    await generatePostHero({
      postId: post.postId,
      title: post.title,
      excerpt: post.excerpt,
      dataType: post.dataType,
    });
    await emitEvent({
      type: "step:complete",
      step: "regeneratePostHero",
      data: { postId: post.postId },
    });
  } catch (error) {
    console.error(
      "[REGENERATE] Hero image generation failed after retries:",
      error,
    );
    await emitEvent({
      type: "step:complete",
      step: "regeneratePostHero",
      data: { postId: post.postId, heroGenerated: false },
    });
  }

  await revalidatePostsCache();

  return {
    message: `[REGENERATE] Successfully regenerated ${dataType} post for ${month}`,
    postId: post.postId,
    title: post.title,
    slug: post.slug,
  };
}

async function fetchData(
  month: string,
  dataType: "cars" | "coe",
): Promise<string> {
  "use step";
  console.log(`Fetching ${dataType} data for ${month}`);

  if (dataType === "cars") {
    const cars = await getCarsAggregatedByMonth(month);
    return tokeniser(cars);
  }

  const coe = await getCoeForMonth(month);
  return tokeniser(coe);
}

async function generatePost(
  data: string,
  month: string,
  dataType: "cars" | "coe",
) {
  "use step";
  console.log(`Generating ${dataType} blog content for ${month}`);

  try {
    return await regenerateBlogContent({
      data,
      month,
      dataType,
    });
  } catch (error) {
    handleAIError(error);
  }
}
