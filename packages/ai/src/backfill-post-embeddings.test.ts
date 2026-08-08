import { db } from "@motormetrics/database";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  backfillPostEmbeddings,
  resetPostEmbeddings,
} from "./backfill-post-embeddings";
import { generateDocumentEmbedding } from "./embedding";

vi.mock("./embedding", () => ({
  generateDocumentEmbedding: vi.fn(),
}));

vi.mock("@motormetrics/database", () => ({
  and: vi.fn((...conditions: unknown[]) => conditions),
  asc: vi.fn((column: unknown) => column),
  count: vi.fn(() => "count"),
  db: {
    select: vi.fn(),
    update: vi.fn(),
  },
  eq: vi.fn((...values: unknown[]) => values),
  gt: vi.fn((...values: unknown[]) => values),
  isNotNull: vi.fn((column: unknown) => column),
  isNull: vi.fn((column: unknown) => column),
  posts: {
    content: "content",
    embedding: "embedding",
    excerpt: "excerpt",
    id: "id",
    title: "title",
  },
}));

function createBatchSelect(batches: unknown[][]) {
  const limit = vi.fn();
  for (const batch of batches) {
    limit.mockResolvedValueOnce(batch);
  }

  const chain = {
    from: vi.fn(),
    limit,
    orderBy: vi.fn(),
    where: vi.fn(),
  };
  chain.from.mockReturnValue(chain);
  chain.orderBy.mockReturnValue(chain);
  chain.where.mockReturnValue(chain);
  return chain;
}

function createCountSelect(remaining: number) {
  const chain = {
    from: vi.fn(),
    where: vi.fn().mockResolvedValue([{ value: remaining }]),
  };
  chain.from.mockReturnValue(chain);
  return chain;
}

function createUpdateChain() {
  const chain = {
    returning: vi.fn(),
    set: vi.fn(),
    where: vi.fn(),
  };
  chain.returning.mockResolvedValue([]);
  chain.set.mockReturnValue(chain);
  chain.where.mockReturnValue(chain);
  return chain;
}

describe("backfillPostEmbeddings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("processes batches and reports failed rows for a safe resume", async () => {
    const posts = [
      { id: "post-a", title: "A", excerpt: null, content: "Body A" },
      { id: "post-b", title: "B", excerpt: "Summary", content: "Body B" },
    ];
    const batchSelect = createBatchSelect([posts, []]);
    const countSelect = createCountSelect(1);
    vi.mocked(db.select)
      .mockReturnValueOnce(batchSelect as never)
      .mockReturnValueOnce(batchSelect as never)
      .mockReturnValueOnce(countSelect as never);
    const updateChain = createUpdateChain();
    vi.mocked(db.update).mockReturnValue(updateChain as never);
    vi.mocked(generateDocumentEmbedding)
      .mockResolvedValueOnce([0.1])
      .mockRejectedValueOnce(new Error("temporary failure"));
    const onProgress = vi.fn();

    const result = await backfillPostEmbeddings({
      batchSize: 2,
      onProgress,
    });

    expect(result).toEqual({
      failed: 1,
      processed: 2,
      remaining: 1,
      succeeded: 1,
    });
    expect(generateDocumentEmbedding).toHaveBeenNthCalledWith(1, posts[0]);
    expect(generateDocumentEmbedding).toHaveBeenNthCalledWith(2, posts[1]);
    expect(updateChain.set).toHaveBeenCalledTimes(1);
    expect(onProgress).toHaveBeenCalledWith(
      expect.stringContaining("Failed post post-b: temporary failure"),
    );
  });

  it("does no writes when every post already has a Gemini 2 embedding", async () => {
    const batchSelect = createBatchSelect([[]]);
    const countSelect = createCountSelect(0);
    vi.mocked(db.select)
      .mockReturnValueOnce(batchSelect as never)
      .mockReturnValueOnce(countSelect as never);

    await expect(backfillPostEmbeddings()).resolves.toEqual({
      failed: 0,
      processed: 0,
      remaining: 0,
      succeeded: 0,
    });
    expect(generateDocumentEmbedding).not.toHaveBeenCalled();
    expect(db.update).not.toHaveBeenCalled();
  });

  it("rejects invalid batch sizes", async () => {
    await expect(backfillPostEmbeddings({ batchSize: 0 })).rejects.toThrow(
      "must be a positive integer",
    );
  });

  it("clears legacy embeddings only when reset is called explicitly", async () => {
    const updateChain = createUpdateChain();
    updateChain.returning.mockResolvedValueOnce([
      { id: "post-a" },
      { id: "post-b" },
    ]);
    vi.mocked(db.update).mockReturnValue(updateChain as never);

    await expect(resetPostEmbeddings()).resolves.toBe(2);
    expect(updateChain.set).toHaveBeenCalledWith({ embedding: null });
  });
});
