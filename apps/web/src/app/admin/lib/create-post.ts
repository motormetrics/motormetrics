import { generatePostEmbedding } from "@motormetrics/ai";
import { db, eq, posts } from "@motormetrics/database";
import { slugify } from "@motormetrics/utils";
import { getPostPublishRevalidationTags } from "@web/lib/cache-tags/posts";
import { revalidateTag } from "next/cache";
import { z } from "zod";

export const createPostSchema = z.object({
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

export type CreatePostInput = z.infer<typeof createPostSchema>;

export async function createPost(input: CreatePostInput) {
  const slug = slugify(input.title);
  const publishedAt = input.status === "published" ? new Date() : undefined;

  const values = {
    title: input.title,
    slug,
    content: input.content,
    excerpt: input.excerpt,
    tags: input.tags,
    highlights: input.highlights,
    status: input.status,
    month: input.month,
    dataType: input.dataType,
    publishedAt,
  };

  const hasConflictTarget = input.month && input.dataType;

  const [post] = hasConflictTarget
    ? await db
        .insert(posts)
        .values(values)
        .onConflictDoUpdate({
          target: [posts.month, posts.dataType],
          set: {
            title: input.title,
            slug,
            content: input.content,
            excerpt: input.excerpt,
            tags: input.tags,
            highlights: input.highlights,
            status: input.status,
            modifiedAt: new Date(),
            publishedAt,
          },
        })
        .returning()
    : await db.insert(posts).values(values).returning();

  try {
    const embedding = await generatePostEmbedding({
      title: input.title,
      excerpt: input.excerpt,
      content: input.content,
    });
    await db.update(posts).set({ embedding }).where(eq(posts.id, post.id));
  } catch (error) {
    console.error(
      "[ADMIN] Failed to generate embedding:",
      error instanceof Error ? error.message : String(error),
    );
  }

  // Revalidate cache directly (same Next.js process)
  for (const tag of getPostPublishRevalidationTags(slug)) {
    revalidateTag(tag, "max");
  }

  return post;
}
