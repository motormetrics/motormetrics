import { db, desc, eq, posts } from "@motormetrics/database";
import { createPost, createPostSchema } from "@web/app/admin/lib/create-post";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { validateApiToken } from "../lib/auth";

export async function GET(request: NextRequest) {
  const authError = validateApiToken(request);
  if (authError) return authError;

  const status = request.nextUrl.searchParams.get("status");
  const limit = Number(request.nextUrl.searchParams.get("limit")) || 50;

  const conditions = status
    ? eq(posts.status, status as "draft" | "published")
    : undefined;

  const results = await db.query.posts.findMany({
    where: conditions,
    orderBy: desc(posts.createdAt),
    limit,
  });

  return NextResponse.json(results);
}

export async function POST(request: Request) {
  const authError = validateApiToken(request);
  if (authError) return authError;

  const body = await request.json();
  const result = createPostSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: result.error.issues },
      { status: 400 },
    );
  }

  try {
    const post = await createPost(result.data);
    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("[API] Failed to create post:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create post",
      },
      { status: 500 },
    );
  }
}
