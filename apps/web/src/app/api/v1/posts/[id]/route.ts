import { db } from "@motormetrics/database/client";
import { validateApiToken } from "@web/app/api/v1/lib/auth";
import { deletePost } from "@web/lib/posts/delete-post";
import { updatePost, updatePostSchema } from "@web/lib/posts/update-post";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteContext) {
  const authError = validateApiToken(request);
  if (authError) return authError;

  const { id } = await params;

  const post = await db.query.posts.findFirst({
    where: { id },
  });

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json(post);
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const authError = validateApiToken(request);
  if (authError) return authError;

  const { id } = await params;
  const body = await request.json();
  const result = updatePostSchema.safeParse({ ...body, id });

  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: result.error.issues },
      { status: 400 },
    );
  }

  try {
    const post = await updatePost(result.data);
    return NextResponse.json(post);
  } catch (error) {
    console.error("[API] Failed to update post:", error);
    const message =
      error instanceof Error ? error.message : "Failed to update post";
    const status = message === "Post not found" ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const authError = validateApiToken(request);
  if (authError) return authError;

  const { id } = await params;

  try {
    await deletePost(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] Failed to delete post:", error);
    const message =
      error instanceof Error ? error.message : "Failed to delete post";
    const status = message === "Post not found" ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
