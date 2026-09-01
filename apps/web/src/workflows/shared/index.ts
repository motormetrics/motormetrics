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
 * HTTP status carried by AI SDK and AI Gateway errors. Both put it on
 * `statusCode`; the message often does not mention the code at all, so
 * classifying on the message alone misses them.
 */
function getStatusCode(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null) return undefined;

  const { statusCode } = error as { statusCode?: unknown };
  return typeof statusCode === "number" ? statusCode : undefined;
}

/**
 * Handle AI generation errors with appropriate WDK error types.
 * - 429 (rate limit) → RetryableError with 1 minute delay
 * - 401/403 (auth, incl. gateway tier restrictions) → FatalError (cannot recover)
 * - Other errors → logged and rethrown as-is
 *
 * The status code is checked before the message: a Gateway 403 reads
 * "Free tier users do not have access to this model" with no code in the
 * text, so a message-only check retried it three times and surfaced
 * nothing but `USER_ERROR`.
 */
export function handleAIError(error: unknown): never {
  const message = error instanceof Error ? error.message : String(error);
  const statusCode = getStatusCode(error);

  if (statusCode === 429 || message.includes("429")) {
    console.log("[WORKFLOW] AI rate limited, scheduling retry in 1m");
    throw new RetryableError("AI rate limited", { retryAfter: "1m" });
  }

  if (
    statusCode === 401 ||
    statusCode === 403 ||
    message.includes("401") ||
    message.includes("403")
  ) {
    console.error(`[WORKFLOW] AI authentication failed — ${message}`);
    throw new FatalError("AI authentication failed");
  }

  console.error(`[WORKFLOW] AI generation failed — ${message}`);
  throw error;
}
