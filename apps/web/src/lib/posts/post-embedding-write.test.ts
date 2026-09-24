import { generateDocumentEmbedding } from "@motormetrics/ai/embedding";
import { db } from "@motormetrics/database/client";
import { createPost } from "@web/lib/posts/create-post";
import { updatePost } from "@web/lib/posts/update-post";
import { revalidateTag } from "next/cache";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@motormetrics/ai/embedding", () => ({
  generateDocumentEmbedding: vi.fn(),
}));

vi.mock("@motormetrics/database/client", () => ({
  db: {
    insert: vi.fn(),
    query: { posts: { findFirst: vi.fn() } },
    update: vi.fn(),
  },
}));

vi.mock("@motormetrics/database/schema", () => ({
  posts: {
    dataType: "dataType",
    id: "id",
    month: "month",
  },
}));

vi.mock("drizzle-orm", async (importOriginal) => ({
  ...(await importOriginal<typeof import("drizzle-orm")>()),
  eq: vi.fn(() => "predicate"),
}));

vi.mock("@motormetrics/utils/slugify", () => ({
  slugify: vi.fn((value: string) => value.toLowerCase().replaceAll(" ", "-")),
}));

vi.mock("next/cache", () => ({ revalidateTag: vi.fn() }));

function createWriteChain(returnedRows: unknown[]) {
  const chain = {
    onConflictDoUpdate: vi.fn(),
    returning: vi.fn().mockResolvedValue(returnedRows),
    set: vi.fn(),
    values: vi.fn(),
    where: vi.fn(),
  };

  chain.onConflictDoUpdate.mockReturnValue(chain);
  chain.set.mockReturnValue(chain);
  chain.values.mockReturnValue(chain);
  chain.where.mockReturnValue(chain);
  return chain;
}

const post = {
  id: "8a67ac39-4361-4e7e-99ca-f4b6d76a20f6",
  slug: "updated-title",
  status: "published",
};

describe("post embedding writes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(generateDocumentEmbedding).mockResolvedValue([0.1, 0.2]);
  });

  it("should store a V2 document embedding after creating a post", async () => {
    const insertChain = createWriteChain([post]);
    const embeddingChain = createWriteChain([]);
    vi.mocked(db.insert).mockReturnValue(insertChain as never);
    vi.mocked(db.update).mockReturnValue(embeddingChain as never);

    const result = await createPost({
      title: "Updated Title",
      content: "Post body",
      excerpt: "Post summary",
      month: "2026-07",
      dataType: "cars",
      status: "published",
    });

    expect(result).toBe(post);
    expect(generateDocumentEmbedding).toHaveBeenCalledWith({
      title: "Updated Title",
      content: "Post body",
      excerpt: "Post summary",
    });
    expect(embeddingChain.set).toHaveBeenCalledWith({
      embedding: [0.1, 0.2],
    });
    expect(revalidateTag).toHaveBeenCalledWith("posts:list", "max");
    expect(revalidateTag).toHaveBeenCalledWith(
      "posts:slug:updated-title",
      "max",
    );
  });

  it("should store a V2 document embedding after updating a post", async () => {
    const contentChain = createWriteChain([post]);
    const embeddingChain = createWriteChain([]);
    vi.mocked(db.query.posts.findFirst).mockResolvedValue({
      ...post,
      slug: "old-title",
      publishedAt: new Date("2026-07-01T00:00:00Z"),
      status: "draft",
    } as never);
    vi.mocked(db.update)
      .mockReturnValueOnce(contentChain as never)
      .mockReturnValueOnce(embeddingChain as never);

    const result = await updatePost({
      id: post.id,
      title: "Updated Title",
      content: "Revised body",
      excerpt: "Revised summary",
      status: "published",
    });

    expect(result).toBe(post);
    expect(generateDocumentEmbedding).toHaveBeenCalledWith({
      title: "Updated Title",
      content: "Revised body",
      excerpt: "Revised summary",
    });
    expect(embeddingChain.set).toHaveBeenCalledWith({
      embedding: [0.1, 0.2],
    });
    expect(revalidateTag).toHaveBeenCalledWith("posts:slug:old-title", "max");
    // The slug is frozen after creation, so retitling must not invalidate a
    // tag for a slug derived from the new title — that tag would only exist
    // if the URL had moved, which is the bug this guards. The tag strings come
    // from the real getPostPublishRevalidationTags, so this fails if the tag
    // format drifts rather than asserting against a mock's own invention.
    expect(revalidateTag).not.toHaveBeenCalledWith(
      "posts:slug:updated-title",
      "max",
    );
  });

  it("should keep post creation available when embedding generation fails", async () => {
    const insertChain = createWriteChain([post]);
    vi.mocked(db.insert).mockReturnValue(insertChain as never);
    vi.mocked(generateDocumentEmbedding).mockRejectedValue(
      new Error("Gateway unavailable"),
    );
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await expect(
      createPost({
        title: "Updated Title",
        content: "Post body",
        status: "draft",
      }),
    ).resolves.toBe(post);

    expect(db.update).not.toHaveBeenCalled();
    expect(consoleError).toHaveBeenCalledWith(
      "[ADMIN] Failed to generate embedding:",
      "Gateway unavailable",
    );
    consoleError.mockRestore();
  });
});
