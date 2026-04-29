import { db, eq, posts } from "@motormetrics/database";
import {
  emitEvent,
  generatePostHero,
  handleAIError,
  revalidatePostsCache,
} from "@web/workflows/shared";
import { fetch } from "workflow";

interface RegenerateHeroPayload {
  postId: string;
}

interface RegenerateHeroResult {
  message: string;
  postId: string;
  heroImage?: string;
}

const SUPPORTED_DATA_TYPES = [
  "cars",
  "coe",
  "deregistrations",
  "electric-vehicles",
] as const;

type SupportedDataType = (typeof SUPPORTED_DATA_TYPES)[number];

function isSupportedDataType(value: string): value is SupportedDataType {
  return (SUPPORTED_DATA_TYPES as readonly string[]).includes(value);
}

async function loadPost(postId: string) {
  "use step";

  console.log(`[REGENERATE-HERO] Loading post ${postId}`);
  const post = await db.query.posts.findFirst({
    where: eq(posts.id, postId),
  });
  if (!post) {
    throw new Error(`Post not found: ${postId}`);
  }
  if (!post.dataType || !isSupportedDataType(post.dataType)) {
    throw new Error(
      `Unsupported dataType for hero regeneration: ${post.dataType ?? "null"}`,
    );
  }
  console.log(
    `[REGENERATE-HERO] Loaded post ${postId} (slug=${post.slug}, dataType=${post.dataType})`,
  );
  return {
    id: post.id,
    title: post.title,
    excerpt: post.excerpt ?? "",
    slug: post.slug,
    dataType: post.dataType,
  };
}

/**
 * Regenerate the hero image for an existing post.
 * Used by the admin "Regenerate Hero" action to backfill or replace
 * hero images without re-running the AI text pipeline.
 */
export async function regenerateHeroWorkflow(
  payload: RegenerateHeroPayload,
): Promise<RegenerateHeroResult> {
  "use workflow";

  globalThis.fetch = fetch;

  const { postId } = payload;
  console.log(`[REGENERATE-HERO] Starting workflow for postId=${postId}`);

  await emitEvent({
    type: "step:start",
    step: "loadPost",
    data: { postId },
  });
  const post = await loadPost(postId);
  await emitEvent({ type: "step:complete", step: "loadPost" });

  await emitEvent({
    type: "step:start",
    step: "regeneratePostHero",
    data: { postId },
  });
  let heroImage: string | undefined;
  try {
    heroImage = await generatePostHero({
      postId: post.id,
      title: post.title,
      excerpt: post.excerpt,
      dataType: post.dataType,
    });
    await emitEvent({
      type: "step:complete",
      step: "regeneratePostHero",
      data: { postId: post.id, heroGenerated: true },
    });
  } catch (error) {
    console.error("[REGENERATE-HERO] Hero image generation failed:", error);
    handleAIError(error);
  }

  await revalidatePostsCache();

  return {
    message: `[REGENERATE-HERO] Successfully regenerated hero image for ${post.slug}`,
    postId: post.id,
    heroImage,
  };
}
