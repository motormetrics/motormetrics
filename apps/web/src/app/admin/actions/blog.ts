"use server";

import { auth } from "@web/app/admin/lib/auth";
import {
  type CreatePostInput,
  createPost,
  createPostSchema,
} from "@web/lib/posts/create-post";
import { deletePost } from "@web/lib/posts/delete-post";
import { type UpdatePostInput, updatePost } from "@web/lib/posts/update-post";
import { regeneratePostWorkflow } from "@web/workflows/regenerate-post";
import { headers } from "next/headers";
import { start } from "workflow/api";

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

  // Server action arguments are untrusted client input
  const result = createPostSchema.safeParse(input);
  if (!result.success) {
    return {
      success: false,
      error: "Validation failed",
    };
  }

  try {
    const post = await createPost(result.data);

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
