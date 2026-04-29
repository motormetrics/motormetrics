import { generatePostEmbedding } from "@motormetrics/ai";
import { db, eq, posts } from "@motormetrics/database";
import { slugify } from "@motormetrics/utils";
import { getPostPublishRevalidationTags } from "@web/lib/cache-tags/posts";
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
  const newSlug = slugify(validated.title);

  // Fetch existing post for old slug (cache invalidation)
  const existing = await db.query.posts.findFirst({
    where: eq(posts.id, validated.id),
  });

  if (!existing) {
    throw new Error("Post not found");
  }

  // Set publishedAt when transitioning to "published"
  const publishedAt =
    validated.status === "published" && existing.status !== "published"
      ? new Date()
      : existing.publishedAt;

  const [post] = await db
    .update(posts)
    .set({
      title: validated.title,
      slug: newSlug,
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
    const embedding = await generatePostEmbedding({
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

  // Revalidate cache for both old and new slugs
  const slugsToInvalidate = new Set([existing.slug, newSlug]);
  for (const slug of slugsToInvalidate) {
    for (const tag of getPostPublishRevalidationTags(slug)) {
      revalidateTag(tag, "max");
    }
  }

  return post;
}
