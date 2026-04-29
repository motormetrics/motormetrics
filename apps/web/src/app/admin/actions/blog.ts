"use server";

import type { LanguageModelUsage } from "@motormetrics/ai";
import type { SelectPost } from "@motormetrics/database";
import { db, desc, eq, posts } from "@motormetrics/database";
import { auth } from "@web/app/admin/lib/auth";
import {
  type CreatePostInput,
  createPost,
} from "@web/app/admin/lib/create-post";
import { deletePost } from "@web/app/admin/lib/delete-post";
import {
  type UpdatePostInput,
  updatePost,
} from "@web/app/admin/lib/update-post";
import { regeneratePostWorkflow } from "@web/workflows/regenerate-post";
import { headers } from "next/headers";
import { start } from "workflow/api";

export interface PostWithMetadata {
  id: string;
  title: string;
  slug: string;
  month: string;
  dataType: string;
  status: string;
  createdAt: Date;
  metadata: {
    modelId?: string;
    usage?: LanguageModelUsage;
  } | null;
}

export async function getAllPosts(): Promise<PostWithMetadata[]> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorised");
  }

  const allPosts = await db.query.posts.findMany({
    orderBy: desc(posts.createdAt),
  });

  return allPosts as PostWithMetadata[];
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getPostById(id: string): Promise<SelectPost | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorised");
  }

  if (!UUID_REGEX.test(id)) {
    return null;
  }

  const post = await db.query.posts.findFirst({
    where: eq(posts.id, id),
  });

  return post ?? null;
}

export async function regeneratePost(params: {
  month: string;
  dataType: "cars" | "coe";
}): Promise<{ success: boolean; error?: string; runId?: string }> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return {
      success: false,
      error: "Unauthorised",
    };
  }

  try {
    const run = await start(regeneratePostWorkflow, [params]);

    return {
      success: true,
      runId: run.runId,
    };
  } catch (error) {
    console.error("Error triggering regeneration workflow:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function createBlogPost(
  input: CreatePostInput,
): Promise<{ success: boolean; error?: string; postId?: string }> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return {
      success: false,
      error: "Unauthorised",
    };
  }

  try {
    const post = await createPost(input);

    return {
      success: true,
      postId: post.id,
    };
  } catch (error) {
    console.error("Error creating blog post:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function updateBlogPost(
  input: UpdatePostInput,
): Promise<{ success: boolean; error?: string; postId?: string }> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return {
      success: false,
      error: "Unauthorised",
    };
  }

  try {
    const post = await updatePost(input);

    return {
      success: true,
      postId: post.id,
    };
  } catch (error) {
    console.error("Error updating blog post:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function deleteBlogPost(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return {
      success: false,
      error: "Unauthorised",
    };
  }

  try {
    await deletePost(id);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting blog post:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
