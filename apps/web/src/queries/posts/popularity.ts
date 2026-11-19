import { db } from "@motormetrics/database/client";
import { posts } from "@motormetrics/database/schema";
import { redis } from "@motormetrics/utils/redis";
import { getPostsByIds } from "@web/queries/posts";
import { and, cosineDistance, desc, eq, gt, isNotNull, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

export async function getPostViewCount(postId: string): Promise<number> {
  "use cache";
  cacheLife("max");
  cacheTag(`posts:views:${postId}`);

  try {
    const score = await redis.zscore("blog:popular", postId);
    return score ?? 0;
  } catch (error) {
    console.error("Error getting post view count:", error);
    return 0;
  }
}

export async function getRelatedPosts(postId: string, limit: number = 3) {
  "use cache";
  cacheLife("max");
  cacheTag(`posts:related:${postId}`);

  try {
    const [currentPost] = await db
      .select({ embedding: posts.embedding })
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1);

    if (!currentPost?.embedding) {
      return [];
    }

    const similarity = sql<number>`1 - (${cosineDistance(posts.embedding, currentPost.embedding)})`;

    const results = await db
      .select({ id: posts.id })
      .from(posts)
      .where(
        and(
          gt(similarity, 0.3),
          isNotNull(posts.embedding),
          isNotNull(posts.publishedAt),
          sql`${posts.id} != ${postId}`,
        ),
      )
      .orderBy(desc(similarity))
      .limit(limit);

    const relatedPostIds = results.map((r) => r.id);

    if (relatedPostIds.length === 0) {
      return [];
    }

    return getPostsByIds(relatedPostIds);
  } catch (error) {
    console.error("Error getting related posts:", error);
    return [];
  }
}
