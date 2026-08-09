import { queueSelect, resetDbMocks } from "@web/queries/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getPostsByIdsMock } = vi.hoisted(() => ({
  getPostsByIdsMock: vi.fn(),
}));

vi.mock("@web/queries/posts", () => ({
  getPostsByIds: getPostsByIdsMock,
}));

import { getRelatedPosts } from "./posts";

describe("getRelatedPosts", () => {
  beforeEach(() => {
    resetDbMocks();
    getPostsByIdsMock.mockReset();
  });

  it("ranks related posts from Gemini 2 document embeddings", async () => {
    queueSelect([{ embedding: [0.1, 0.2, 0.3] }], [{ id: "related-post" }]);
    getPostsByIdsMock.mockResolvedValue([
      { id: "related-post", title: "Related analysis" },
    ]);

    await expect(getRelatedPosts("current-post", 3)).resolves.toEqual([
      { id: "related-post", title: "Related analysis" },
    ]);
    expect(getPostsByIdsMock).toHaveBeenCalledWith(["related-post"]);
  });

  it("returns no recommendations until the current post is backfilled", async () => {
    queueSelect([{ embedding: null }]);

    await expect(getRelatedPosts("legacy-post", 3)).resolves.toEqual([]);
    expect(getPostsByIdsMock).not.toHaveBeenCalled();
  });
});
