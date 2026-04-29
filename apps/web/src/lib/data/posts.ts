import {
  and,
  cosineDistance,
  db,
  desc,
  eq,
  gt,
  isNotNull,
  posts,
  sql,
} from "@motormetrics/database";
import { redis } from "@motormetrics/utils";
import { getPostsByIds } from "@web/queries/posts";
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

export async function getPopularPosts(
  limit: number = 10,
): Promise<Array<{ postId: string; viewCount: number }>> {
  "use cache";
  cacheLife("max");
  cacheTag("posts:popular");

  try {
    const results = await redis.zrange("blog:popular", 0, limit - 1, {
      rev: true,
      withScores: true,
    });

    const popularPosts: Array<{ postId: string; viewCount: number }> = [];
    for (let i = 0; i < results.length; i += 2) {
      popularPosts.push({
        postId: String(results[i]),
        viewCount: Number(results[i + 1]),
      });
    }

    return popularPosts;
  } catch (error) {
    console.error("Error getting popular posts:", error);
    return [];
  }
}

export async function getPopularPostsWithData(limit = 5) {
  "use cache";
  cacheLife("max");
  cacheTag("posts:popular");

  const popular = await getPopularPosts(limit);
  if (popular.length === 0) return [];

  const postIds = popular.map((entry) => entry.postId);
  const posts = await getPostsByIds(postIds);

  return popular.flatMap(({ postId, viewCount }) => {
    const post = posts.find((item) => item.id === postId);
    return post ? [{ ...post, viewCount }] : [];
  });
}
