import { generateHeroImage, updatePostHeroImage } from "@motormetrics/ai";
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
 * Handle AI generation errors with appropriate WDK error types.
 * - 429 (rate limit) → RetryableError with 1 minute delay
 * - 401/403 (auth) → FatalError (cannot recover)
 * - Other errors → rethrown as-is
 */
export function handleAIError(error: unknown): never {
  const message = error instanceof Error ? error.message : String(error);

  if (message.includes("429")) {
    console.log("[WORKFLOW] AI rate limited, scheduling retry in 1m");
    throw new RetryableError("AI rate limited", { retryAfter: "1m" });
  }

  if (message.includes("401") || message.includes("403")) {
    console.log("[WORKFLOW] AI authentication failed");
    throw new FatalError("AI authentication failed");
  }

  throw error;
}
