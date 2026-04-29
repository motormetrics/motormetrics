import { db, eq, posts } from "@motormetrics/database";
import { slugify } from "@motormetrics/utils";
import type { LanguageModelUsage } from "ai";
import { generatePostEmbedding } from "./embedding";
import type { Highlight } from "./schemas";

const getPostPublishRevalidationTags = (slug: string): string[] => {
  return ["posts:list", "posts:recent", `posts:slug:${slug}`];
};

export interface PostParams {
  title: string;
  content: string;
  excerpt: string;
  heroImage: string | null;
  tags: string[];
  highlights: Highlight[];
  month: string;
  dataType: "cars" | "coe" | "deregistrations" | "electric-vehicles";
  responseMetadata: {
    responseId: string;
    modelId: string;
    timestamp: Date;
    usage?: LanguageModelUsage;
  };
}

export const savePost = async (data: PostParams) => {
  const slug = slugify(data.title);

  const [post] = await db
    .insert(posts)
    .values({
      title: data.title,
      slug,
      content: data.content,
      excerpt: data.excerpt,
      heroImage: data.heroImage,
      tags: data.tags,
      highlights: data.highlights,
      status: "published",
      metadata: data.responseMetadata,
      month: data.month,
      dataType: data.dataType,
      publishedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [posts.month, posts.dataType],
      set: {
        title: data.title,
        slug,
        content: data.content,
        excerpt: data.excerpt,
        heroImage: data.heroImage,
        tags: data.tags,
        highlights: data.highlights,
        metadata: data.responseMetadata,
        modifiedAt: new Date(),
      },
    })
    .returning();

  console.log(
    `[BLOG_SAVE] Post saved successfully - id: ${post.id}, slug: ${post.slug}, month: ${data.month}, category: ${data.dataType}`,
  );

  try {
    const embedding = await generatePostEmbedding({
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
    });
    await db.update(posts).set({ embedding }).where(eq(posts.id, post.id));
    console.log(`[BLOG_SAVE] Embedding generated for post ${post.id}`);
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
    const fallbackToken = process.env.NEXT_PUBLIC_REVALIDATE_TOKEN;

    if (!revalidateToken && !fallbackToken) {
      console.warn(
        "[BLOG_SAVE] REVALIDATE_TOKEN not set, skipping cache invalidation",
      );
      return;
    }

    if (!revalidateToken && fallbackToken) {
      console.warn(
        "[BLOG_SAVE] Using NEXT_PUBLIC_REVALIDATE_TOKEN fallback. Set REVALIDATE_TOKEN instead.",
      );
    }

    const response = await fetch(`${webUrl}/api/revalidate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-revalidate-token": revalidateToken ?? fallbackToken ?? "",
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
