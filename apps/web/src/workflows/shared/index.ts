import {
  classifyAIError,
  generateHeroImage,
  updatePostHeroImage,
} from "@motormetrics/ai";
import { slugify } from "@motormetrics/utils";
import { getPostsWorkflowRevalidationTags } from "@web/lib/cache-tags";
import { revalidateTag } from "next/cache";
import { FatalError, getWritable, RetryableError } from "workflow";

import type { WorkflowEvent } from "./types";

export type { WorkflowEvent, WorkflowEventType } from "./types";

/**
 * Emit a streaming event from a workflow step.
 * Uses WDK's getWritable() to write progress events for real-time monitoring.
 */
export async function emitEvent(
  event: Omit<WorkflowEvent, "timestamp">,
): Promise<void> {
  "use step";

  const writer = getWritable<WorkflowEvent>().getWriter();
  try {
    await writer.write({ ...event, timestamp: Date.now() });
  } finally {
    writer.releaseLock();
  }
}

/**
 * Revalidate posts cache after publishing.
 */
export async function revalidatePostsCache(): Promise<void> {
  "use step";

  for (const tag of getPostsWorkflowRevalidationTags()) {
    revalidateTag(tag, "max");
  }
  console.log("[WORKFLOW] Posts cache invalidated");
}

/**
 * Generate a hero image for a saved post and update the posts row.
 * Lives in its own step so retries are independent of content generation —
 * a failure here never re-runs the AI text pipeline. Throws on failure so
 * WDK retries; the workflow body should wrap this in try/catch for graceful
 * degradation (post stays with heroImage = null).
 */
export async function generatePostHero(params: {
  postId: string;
  title: string;
  excerpt: string;
  dataType: "cars" | "coe" | "deregistrations" | "electric-vehicles";
}): Promise<string> {
  "use step";

  const { postId, title, excerpt, dataType } = params;
  console.log(
    `[HERO] Generating hero image — postId=${postId}, dataType=${dataType}`,
  );

  const { url } = await generateHeroImage({
    title,
    excerpt,
    dataType,
    slug: slugify(title),
  });

  await updatePostHeroImage(postId, url);
  console.log(`[HERO] Hero image saved — postId=${postId}, url=${url}`);

  return url;
}

/**
 * Map an AI failure onto the WDK error types.
 *
 * The classification itself lives in `@motormetrics/ai`, next to the code that
 * chooses the provider — which errors are possible follows from that choice.
 * This function only owns the WDK mapping.
 */
export function handleAIError(error: unknown): never {
  const { classification, reason, message } = classifyAIError(error);

  if (reason === "rate-limited") {
    console.log("[WORKFLOW] AI rate limited, scheduling retry in 1m");
    throw new RetryableError("AI rate limited", { retryAfter: "1m" });
  }

  if (reason === "authentication") {
    console.error(`[WORKFLOW] AI authentication failed — ${message}`);
    throw new FatalError("AI authentication failed");
  }

  if (classification === "retryable") {
    console.log(`[WORKFLOW] AI call retryable — ${message}`);
    throw new RetryableError("AI call failed", { retryAfter: "1m" });
  }

  if (classification === "fatal") {
    console.error(`[WORKFLOW] AI call failed fatally — ${message}`);
    throw new FatalError("AI call failed");
  }

  console.error(`[WORKFLOW] AI generation failed — ${message}`);
  throw error;
}
