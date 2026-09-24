import { db } from "@motormetrics/database/client";
import type { SelectPost } from "@motormetrics/database/schema";
import { auth } from "@web/lib/auth";
import type { LanguageModelUsage } from "ai";
import { headers } from "next/headers";

export interface PostMetadata {
  generationId?: string;
  modelId?: string;
  totalCost?: number;
  usage?: LanguageModelUsage;
}

export type AdminPost = Pick<
  SelectPost,
  "id" | "title" | "slug" | "month" | "dataType" | "status" | "createdAt"
> & { metadata: PostMetadata | null };

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const requireSession = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorised");
  }
};

/**
 * All posts for the admin table, with content for the server-rendered
 * previews. The embedding vector is never selected.
 */
export async function getAllPosts(): Promise<
  (AdminPost & Pick<SelectPost, "content">)[]
> {
  await requireSession();

  const allPosts = await db.query.posts.findMany({
    columns: {
      id: true,
      title: true,
      slug: true,
      content: true,
      month: true,
      dataType: true,
      status: true,
      metadata: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // metadata is an untyped jsonb column; its shape is written by the blog workflow
  return allPosts.map((post) => ({
    ...post,
    metadata: post.metadata as PostMetadata | null,
  }));
}

export async function getPostById(id: string): Promise<SelectPost | null> {
  await requireSession();

  if (!UUID_REGEX.test(id)) {
    return null;
  }

  const post = await db.query.posts.findFirst({
    where: { id },
  });

  return post ?? null;
}
