import { db } from "@motormetrics/database/client";
import { posts } from "@motormetrics/database/schema";
import { getPostPublishRevalidationTags } from "@web/lib/cache-tags/posts";
import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";

export async function deletePost(id: string) {
  const existing = await db.query.posts.findFirst({
    where: { id },
  });

  if (!existing) {
    throw new Error("Post not found");
  }

  await db.delete(posts).where(eq(posts.id, id));

  // Revalidate cache
  for (const tag of getPostPublishRevalidationTags(existing.slug)) {
    revalidateTag(tag, "max");
  }
}
