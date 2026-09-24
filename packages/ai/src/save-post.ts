import { db } from "@motormetrics/database/client";
import { posts } from "@motormetrics/database/schema";
import { slugify } from "@motormetrics/utils/slugify";
import type { LanguageModelUsage } from "ai";
import { eq } from "drizzle-orm";
import { generateDocumentEmbedding } from "./embedding";
import type { Highlight } from "./schemas";

const getPostPublishRevalidationTags = (slug: string): string[] => {
  return ["posts:list", "posts:recent", `posts:slug:${slug}`];
};

interface BasePostParams {
  title: string;
  content: string;
  excerpt: string;
  heroImage: string | null;
  tags: string[];
  highlights: Highlight[];
  dataType:
    | "cars"
    | "coe"
    | "deregistrations"
    | "electric-vehicles"
    | "pqp"
    | "monthly-update";
  responseMetadata: {
    generationId?: string;
    responseId: string;
    modelId: string;
    timestamp: Date;
    totalCost?: number;
    usage?: LanguageModelUsage;
    /**
     * The structured sections the markdown was rendered from, and the data
     * types they drew on. `content` is the serialised form the blog renders;
     * this is the form it came from, kept so the post can later be grouped,
     * filtered or re-rendered without re-parsing markdown.
     */
    sections?: unknown;
    categories?: string[];
  };
}

interface MonthlyPostParams extends BasePostParams {
  kind?: "monthly";
  month: string;
  /** Defaults to slugify(title), as monthly posts have always done. */
  slug?: string;
}

interface EvergreenPostParams extends BasePostParams {
  kind: "evergreen";
  month?: never;
  /**
   * Required and stable — it comes from the topic registry, never from the
   * title, so a refreshed evergreen post never moves its URL. It is also the
   * upsert conflict target.
   */
  slug: string;
}

export type PostParams = MonthlyPostParams | EvergreenPostParams;

export const savePost = async (data: PostParams) => {
  const kind = data.kind ?? "monthly";
  const month = kind === "evergreen" ? null : data.month;
  const slug = data.slug ?? slugify(data.title);

  const values = {
    title: data.title,
    slug,
    content: data.content,
    excerpt: data.excerpt,
    heroImage: data.heroImage,
    tags: data.tags,
    highlights: data.highlights,
    status: "published",
    metadata: data.responseMetadata,
    month,
    dataType: data.dataType,
    kind,
    publishedAt: new Date(),
  };

  // slug is deliberately absent: on update the existing URL must survive a
  // regeneration, even though the model may produce a different title. A
  // changed slug 404s the old URL — there is no redirect layer.
  const set = {
    title: data.title,
    content: data.content,
    excerpt: data.excerpt,
    heroImage: data.heroImage,
    tags: data.tags,
    highlights: data.highlights,
    metadata: data.responseMetadata,
    modifiedAt: new Date(),
  };

  // Evergreen posts have a null month, and posts_month_data_type_unique is
  // declared without NULLS NOT DISTINCT — a null month never matches that
  // conflict target, so every save would insert a new row. They upsert on the
  // caller-supplied stable slug instead, which posts_slug_unique enforces.
  const target =
    kind === "evergreen" ? [posts.slug] : [posts.month, posts.dataType];

  // A monthly slug is derived from the model's title, so it can still collide
  // with a different month's post. Postgres rejects that on posts_slug_unique
  // and the step fails, which is the correct outcome: the error already names
  // the constraint and the duplicate value.
  const [post] = await db
    .insert(posts)
    .values(values)
    .onConflictDoUpdate({ target, set })
    .returning();

  console.log(
    `[BLOG_SAVE] Post saved successfully - id: ${post.id}, slug: ${post.slug}, kind: ${kind}, month: ${month}, category: ${data.dataType}`,
  );

  try {
    const embedding = await generateDocumentEmbedding({
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
    });
    await db.update(posts).set({ embedding }).where(eq(posts.id, post.id));
    console.log(`[BLOG_SAVE] Gemini 2 embedding generated for post ${post.id}`);
  } catch (error) {
    console.error(
      "[BLOG_SAVE] Failed to generate embedding:",
      error instanceof Error ? error.message : String(error),
    );
  }

  // Invalidate cache for the blog post
  await revalidateWebCache(post.slug);

  return post;
};

/**
 * Updates the heroImage column for an existing post. Used by the workflow
 * hero-image step after the post has been saved, so hero generation retries
 * independently of content generation.
 */
export async function updatePostHeroImage(
  postId: string,
  heroImage: string,
): Promise<void> {
  await db
    .update(posts)
    .set({ heroImage, modifiedAt: new Date() })
    .where(eq(posts.id, postId));
}

/**
 * Revalidates web app cache for blog posts
 */
async function revalidateWebCache(slug: string): Promise<void> {
  try {
    const webUrl = process.env.NEXT_PUBLIC_SITE_URL;

    const revalidateToken = process.env.REVALIDATE_TOKEN;

    if (!revalidateToken) {
      console.warn(
        "[BLOG_SAVE] REVALIDATE_TOKEN not set, skipping cache invalidation",
      );
      return;
    }

    const response = await fetch(`${webUrl}/api/revalidate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-revalidate-token": revalidateToken,
      },
      body: JSON.stringify({
        tags: getPostPublishRevalidationTags(slug),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(
        `[BLOG_SAVE] Cache invalidation failed: ${response.status} ${error}`,
      );
    } else {
      const result = await response.json();
      console.log(
        `[BLOG_SAVE] Cache invalidated successfully for blog post: ${slug}`,
        result,
      );
    }
  } catch (error) {
    console.error(
      "[BLOG_SAVE] Error invalidating cache:",
      error instanceof Error ? error.message : String(error),
    );
  }
}
