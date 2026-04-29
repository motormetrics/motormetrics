import { generateBlogContent, getEvDataForMonth } from "@motormetrics/ai";
import { tokeniser } from "@motormetrics/utils";
import { getCarsLatestMonth } from "@web/queries/cars/latest-month";
import { getExistingPostByMonth } from "@web/queries/posts";
import {
  emitEvent,
  generatePostHero,
  handleAIError,
  revalidatePostsCache,
} from "@web/workflows/shared";
import { fetch } from "workflow";

interface ElectricVehiclesWorkflowPayload {
  month?: string;
}

interface ElectricVehiclesWorkflowResult {
  message: string;
  postId?: string;
}

/**
 * Electric vehicles blog workflow using Vercel WDK.
 * Generates blog posts from EV registration data.
 */
export async function electricVehiclesWorkflow(
  payload: ElectricVehiclesWorkflowPayload,
): Promise<ElectricVehiclesWorkflowResult> {
  "use workflow";

  globalThis.fetch = fetch;

  const month = payload.month ?? (await getLatestMonth());
  if (!month) {
    return { message: "[EV] No car data found." };
  }

  const existingPost = await checkExistingElectricVehiclesPost(month);
  if (existingPost) {
    return { message: "[EV] Post already exists, skipping." };
  }

  await emitEvent({ type: "step:start", step: "fetchElectricVehiclesData" });
  const electricVehiclesData = await fetchElectricVehiclesData(month);
  await emitEvent({
    type: "data:processed",
    step: "fetchElectricVehiclesData",
    data: { recordCount: electricVehiclesData.length },
  });

  if (electricVehiclesData.length === 0) {
    return { message: "[EV] No EV data for this month." };
  }

  await emitEvent({ type: "step:start", step: "generateElectricVehiclesPost" });
  const post = await generateElectricVehiclesPost(electricVehiclesData, month);
  await emitEvent({
    type: "post:generated",
    step: "generateElectricVehiclesPost",
    data: { postId: post.postId },
  });

  await emitEvent({ type: "step:start", step: "generateElectricVehiclesHero" });
  try {
    await generatePostHero({
      postId: post.postId,
      title: post.title,
      excerpt: post.excerpt,
      dataType: post.dataType,
    });
    await emitEvent({
      type: "step:complete",
      step: "generateElectricVehiclesHero",
      data: { postId: post.postId },
    });
  } catch (error) {
    console.error("[EV] Hero image generation failed after retries:", error);
    await emitEvent({
      type: "step:complete",
      step: "generateElectricVehiclesHero",
      data: { postId: post.postId, heroGenerated: false },
    });
  }

  await revalidatePostsCache();

  return {
    message: "[EV] Blog post generated successfully",
    postId: post.postId,
  };
}

async function getLatestMonth(): Promise<string | null> {
  "use step";
  return getCarsLatestMonth();
}

async function checkExistingElectricVehiclesPost(
  month: string,
): Promise<{ id: string } | null> {
  "use step";

  const [existingPost] = await getExistingPostByMonth(
    month,
    "electric-vehicles",
  );
  return existingPost ?? null;
}

async function fetchElectricVehiclesData(month: string) {
  "use step";
  return getEvDataForMonth(month);
}

async function generateElectricVehiclesPost(
  electricVehiclesData: Awaited<ReturnType<typeof getEvDataForMonth>>,
  month: string,
) {
  "use step";

  const data = tokeniser(electricVehiclesData);

  try {
    return await generateBlogContent({
      data,
      month,
      dataType: "electric-vehicles",
    });
  } catch (error) {
    handleAIError(error);
  }
}
