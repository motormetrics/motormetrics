import { generateDocumentEmbedding } from "@motormetrics/ai/embedding";
import { db } from "@motormetrics/database/client";
import { posts } from "@motormetrics/database/schema";
import { getPostPublishRevalidationTags } from "@web/lib/cache-tags/posts";
import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { z } from "zod";

export const updatePostSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  content: z.string().min(1),
  excerpt: z.string().optional(),
  tags: z.array(z.string()).optional(),
  highlights: z
    .array(
      z.object({
        value: z.string(),
        label: z.string(),
        detail: z.string(),
      }),
    )
    .optional(),
  month: z.string().optional(),
  dataType: z.string().optional(),
  status: z.enum(["draft", "published"]).default("draft"),
});

export type UpdatePostInput = z.infer<typeof updatePostSchema>;

export async function updatePost(input: UpdatePostInput) {
  const validated = updatePostSchema.parse(input);

  // Fetch existing post for its slug (URLs are immutable) and publish state
  const existing = await db.query.posts.findFirst({
    where: { id: validated.id },
  });

  if (!existing) {
    throw new Error("Post not found");
  }

  // Keep status and publishedAt consistent: drafts are never published, and a
  // published post keeps its original publish timestamp across saves
  const publishedAt =
    validated.status === "published"
      ? (existing.publishedAt ?? new Date())
      : null;

  const [post] = await db
    .update(posts)
    .set({
      title: validated.title,
      content: validated.content,
      excerpt: validated.excerpt,
      tags: validated.tags,
      highlights: validated.highlights,
      status: validated.status,
      month: validated.month,
      dataType: validated.dataType,
      modifiedAt: new Date(),
      publishedAt,
    })
    .where(eq(posts.id, validated.id))
    .returning();

  try {
    const embedding = await generateDocumentEmbedding({
      title: validated.title,
      excerpt: validated.excerpt,
      content: validated.content,
    });
    await db.update(posts).set({ embedding }).where(eq(posts.id, post.id));
  } catch (error) {
    console.error(
      "[ADMIN] Failed to generate embedding:",
      error instanceof Error ? error.message : String(error),
    );
  }

  for (const tag of getPostPublishRevalidationTags(existing.slug)) {
    revalidateTag(tag, "max");
  }

  return post;
}
