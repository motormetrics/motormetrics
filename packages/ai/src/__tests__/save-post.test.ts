import { posts } from "@motormetrics/database/schema";
import { PgDialect } from "drizzle-orm/pg-core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { type PostParams, savePost, updatePostHeroImage } from "../save-post";

const {
  insert,
  values,
  onConflictDoUpdate,
  returning,
  update,
  set,
  where,
  generateDocumentEmbedding,
} = vi.hoisted(() => ({
  insert: vi.fn(),
  values: vi.fn(),
  onConflictDoUpdate: vi.fn(),
  returning: vi.fn(),
  update: vi.fn(),
  set: vi.fn(),
  where: vi.fn(),
  generateDocumentEmbedding: vi.fn(),
}));
vi.mock("@motormetrics/database/client", () => ({ db: { insert, update } }));
vi.mock("../embedding", () => ({ generateDocumentEmbedding }));

const fetchMock = vi.fn<typeof fetch>();
const timestamp = new Date("2026-10-04T00:00:00.000Z");
const params: PostParams = {
  title: "July registrations rose",
  content: "More cars arrived.",
  excerpt: "Market summary.",
  heroImage: null,
  tags: ["Cars"],
  highlights: [],
  month: "2026-07",
  dataType: "cars",
  responseMetadata: {
    responseId: "response-1",
    modelId: "model-1",
    timestamp,
    totalCost: 0.0042,
    sections: [],
    categories: ["cars"],
  },
};
const savedPost = {
  id: "post-1",
  slug: "original-july-slug",
  title: params.title,
};

beforeEach(() => {
  vi.resetAllMocks();
  vi.useFakeTimers();
  vi.setSystemTime(timestamp);
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://motormetrics.app");
  vi.stubEnv("REVALIDATE_TOKEN", "test-token");
  vi.stubGlobal("fetch", fetchMock);
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
  insert.mockReturnValue({ values });
  values.mockReturnValue({ onConflictDoUpdate });
  onConflictDoUpdate.mockReturnValue({ returning });
  returning.mockResolvedValue([savedPost]);
  update.mockReturnValue({ set });
  set.mockReturnValue({ where });
  where.mockResolvedValue(undefined);
  generateDocumentEmbedding.mockResolvedValue([0.1, 0.2]);
  fetchMock.mockResolvedValue(
    new Response(JSON.stringify({ revalidated: true }), {
      headers: { "content-type": "application/json" },
    }),
  );
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("savePost", () => {
  it("upserts monthly posts without changing the existing URL or publish date", async () => {
    await expect(savePost(params)).resolves.toEqual(savedPost);
    expect(insert).toHaveBeenCalledExactlyOnceWith(posts);
    expect(values).toHaveBeenCalledExactlyOnceWith({
      title: params.title,
      slug: "july-registrations-rose",
      content: params.content,
      excerpt: params.excerpt,
      heroImage: null,
      tags: params.tags,
      highlights: [],
      status: "published",
      metadata: params.responseMetadata,
      month: params.month,
      dataType: "cars",
      kind: "monthly",
      publishedAt: timestamp,
    });
    expect(onConflictDoUpdate).toHaveBeenCalledExactlyOnceWith({
      target: [posts.month, posts.dataType],
      set: {
        title: params.title,
        content: params.content,
        excerpt: params.excerpt,
        heroImage: null,
        tags: params.tags,
        highlights: [],
        metadata: params.responseMetadata,
        modifiedAt: timestamp,
      },
    });
    expect(generateDocumentEmbedding).toHaveBeenCalledExactlyOnceWith({
      title: params.title,
      excerpt: params.excerpt,
      content: params.content,
    });
    expect(set).toHaveBeenCalledExactlyOnceWith({ embedding: [0.1, 0.2] });
    expect(new PgDialect().sqlToQuery(where.mock.calls[0][0]).params).toEqual([
      savedPost.id,
    ]);
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
      "https://motormetrics.app/api/revalidate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-revalidate-token": "test-token",
        },
        body: JSON.stringify({
          tags: ["posts:list", "posts:recent", `posts:slug:${savedPost.slug}`],
        }),
      },
    );
  });

  it("honours an explicit monthly slug on insert", async () => {
    await savePost({ ...params, slug: "stable-monthly-slug" });
    expect(values).toHaveBeenCalledWith(
      expect.objectContaining({ slug: "stable-monthly-slug" }),
    );
    expect(onConflictDoUpdate.mock.calls[0][0].set).not.toHaveProperty("slug");
  });

  it("upserts evergreen posts by stable slug with a null month", async () => {
    const { month: _month, ...base } = params;
    await savePost({ ...base, kind: "evergreen", slug: "coe-renewal-guide" });
    expect(values).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: "evergreen",
        month: null,
        slug: "coe-renewal-guide",
      }),
    );
    expect(onConflictDoUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ target: [posts.slug] }),
    );
    expect(onConflictDoUpdate.mock.calls[0][0].set).not.toHaveProperty("slug");
  });

  it("propagates insert failures without embedding or revalidation", async () => {
    const error = new Error("Unique constraint violation");
    returning.mockRejectedValue(error);
    await expect(savePost(params)).rejects.toBe(error);
    expect(generateDocumentEmbedding).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([
    new Error("Embedding failed"),
    "Embedding failed",
  ])("still revalidates and returns the saved post after embedding failure", async (error) => {
    generateDocumentEmbedding.mockRejectedValue(error);
    await expect(savePost(params)).resolves.toEqual(savedPost);
    expect(update).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith(
      "[BLOG_SAVE] Failed to generate embedding:",
      "Embedding failed",
    );
  });

  it("still revalidates after the embedding update fails", async () => {
    where.mockRejectedValue(new Error("Update failed"));
    await expect(savePost(params)).resolves.toEqual(savedPost);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("skips cache invalidation when no token is configured", async () => {
    vi.stubEnv("REVALIDATE_TOKEN", undefined);
    await expect(savePost(params)).resolves.toEqual(savedPost);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalledWith(
      "[BLOG_SAVE] REVALIDATE_TOKEN not set, skipping cache invalidation",
    );
  });

  it("reports an HTTP revalidation failure without failing the save", async () => {
    fetchMock.mockResolvedValue(new Response("Unavailable", { status: 503 }));
    await expect(savePost(params)).resolves.toEqual(savedPost);
    expect(console.error).toHaveBeenCalledWith(
      "[BLOG_SAVE] Cache invalidation failed: 503 Unavailable",
    );
  });

  it.each([
    new Error("Network failed"),
    "Network failed",
  ])("handles revalidation request failures", async (error) => {
    fetchMock.mockRejectedValue(error);
    await expect(savePost(params)).resolves.toEqual(savedPost);
    expect(console.error).toHaveBeenCalledWith(
      "[BLOG_SAVE] Error invalidating cache:",
      "Network failed",
    );
  });

  it("handles invalid revalidation response JSON", async () => {
    fetchMock.mockResolvedValue(new Response("invalid JSON"));
    await expect(savePost(params)).resolves.toEqual(savedPost);
    expect(console.error).toHaveBeenCalledWith(
      "[BLOG_SAVE] Error invalidating cache:",
      expect.any(String),
    );
  });
});

describe("updatePostHeroImage", () => {
  it("updates only the hero image and modification time for the requested post", async () => {
    await updatePostHeroImage("post-2", "https://blob/hero.png");
    expect(update).toHaveBeenCalledExactlyOnceWith(posts);
    expect(set).toHaveBeenCalledExactlyOnceWith({
      heroImage: "https://blob/hero.png",
      modifiedAt: timestamp,
    });
    expect(new PgDialect().sqlToQuery(where.mock.calls[0][0]).params).toEqual([
      "post-2",
    ]);
    expect(generateDocumentEmbedding).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("propagates update failures so the workflow can retry", async () => {
    const error = new Error("Update failed");
    where.mockRejectedValue(error);
    await expect(
      updatePostHeroImage("post-2", "https://blob/hero.png"),
    ).rejects.toBe(error);
  });
});
