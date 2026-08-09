import { beforeEach, describe, expect, it, vi } from "vitest";
import { queueSelect, resetDbMocks } from "../test-utils";

const { generateQueryEmbeddingMock } = vi.hoisted(() => ({
  generateQueryEmbeddingMock: vi.fn(),
}));

vi.mock("@motormetrics/ai", () => ({
  generateQueryEmbedding: generateQueryEmbeddingMock,
}));

import { searchPosts } from ".";

describe("searchPosts", () => {
  beforeEach(() => {
    resetDbMocks();
    generateQueryEmbeddingMock.mockReset();
    generateQueryEmbeddingMock.mockResolvedValue([0.1, 0.2, 0.3]);
  });

  it("returns keyword matches without generating an embedding", async () => {
    queueSelect([{ id: "keyword-post", title: "Electric cars" }]);

    await expect(searchPosts("electric")).resolves.toEqual([
      { id: "keyword-post", title: "Electric cars" },
    ]);
    expect(generateQueryEmbeddingMock).not.toHaveBeenCalled();
  });

  it("uses the Gemini 2 query embedding for semantic fallback", async () => {
    queueSelect([], [{ id: "semantic-post", title: "EV market share" }]);

    await expect(searchPosts("battery vehicle trends")).resolves.toEqual([
      { id: "semantic-post", title: "EV market share" },
    ]);
    expect(generateQueryEmbeddingMock).toHaveBeenCalledWith(
      "battery vehicle trends",
    );
  });

  it("degrades gracefully when query embedding generation fails", async () => {
    queueSelect([]);
    generateQueryEmbeddingMock.mockRejectedValue(
      new Error("Gateway unavailable"),
    );
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await expect(searchPosts("battery vehicle trends")).resolves.toEqual([]);
    expect(consoleError).toHaveBeenCalledWith(
      "[POST_SEARCH] Semantic search unavailable:",
      "Gateway unavailable",
    );
    consoleError.mockRestore();
  });
});
