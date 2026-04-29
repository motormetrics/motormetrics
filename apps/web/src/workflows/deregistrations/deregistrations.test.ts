import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@motormetrics/ai", () => ({
  generateBlogContent: vi.fn(),
  generateHeroImage: vi.fn(),
  getDeregistrationsForMonth: vi.fn(),
  updatePostHeroImage: vi.fn(),
}));

vi.mock("@motormetrics/utils", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@motormetrics/utils")>()),
  redis: {
    set: vi.fn(),
  },
}));

vi.mock("workflow", () => ({
  fetch: vi.fn(),
  getStepMetadata: vi.fn(() => ({ attempt: 1 })),
  getWritable: vi.fn(() => ({
    getWriter: () => ({
      write: vi.fn().mockResolvedValue(undefined),
      releaseLock: vi.fn(),
    }),
  })),
  FatalError: class FatalError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "FatalError";
    }
  },
  RetryableError: class RetryableError extends Error {
    constructor(
      message: string,
      public options?: { retryAfter?: number | string },
    ) {
      super(message);
      this.name = "RetryableError";
    }
  },
}));

vi.mock("@web/workflows/deregistrations/steps/process-data", () => ({
  updateDeregistration: vi.fn(),
}));

vi.mock("@web/queries/deregistrations/latest-month", () => ({
  getDeregistrationsLatestMonth: vi.fn(),
}));

vi.mock("@web/queries/posts", () => ({
  getExistingPostByMonth: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(),
}));

vi.mock("@web/workflows/shared", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@web/workflows/shared")>()),
  revalidatePostsCache: vi.fn(),
}));

import {
  generateBlogContent,
  generateHeroImage,
  getDeregistrationsForMonth,
  updatePostHeroImage,
} from "@motormetrics/ai";
import { redis } from "@motormetrics/utils";
import { getDeregistrationsLatestMonth } from "@web/queries/deregistrations/latest-month";
import { getExistingPostByMonth } from "@web/queries/posts";
import { deregistrationsWorkflow } from "@web/workflows/deregistrations";
import { updateDeregistration } from "@web/workflows/deregistrations/steps/process-data";
import { revalidatePostsCache } from "@web/workflows/shared";
import { revalidateTag } from "next/cache";

describe("deregistrationsWorkflow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("should return early when no records are processed", async () => {
    vi.mocked(updateDeregistration).mockResolvedValueOnce({
      recordsProcessed: 0,
      table: "deregistrations",
      message: "",
      timestamp: "",
    });

    const result = await deregistrationsWorkflow({});

    expect(result.message).toBe("No deregistration records processed.");
    expect(getDeregistrationsLatestMonth).not.toHaveBeenCalled();
  });

  it("should return message when no deregistration data found", async () => {
    vi.mocked(updateDeregistration).mockResolvedValueOnce({
      recordsProcessed: 5,
      table: "deregistrations",
      message: "",
      timestamp: "",
    });
    vi.mocked(getDeregistrationsLatestMonth).mockResolvedValueOnce({
      month: null as unknown as string,
    });

    const result = await deregistrationsWorkflow({});

    expect(result.message).toBe("No deregistration data found.");
  });

  it("should skip blog generation when post already exists", async () => {
    vi.mocked(updateDeregistration).mockResolvedValueOnce({
      recordsProcessed: 10,
      table: "deregistrations",
      message: "",
      timestamp: "",
    });
    vi.mocked(getDeregistrationsLatestMonth).mockResolvedValueOnce({
      month: "2024-01",
    });
    vi.mocked(getExistingPostByMonth).mockResolvedValueOnce([
      {
        id: "existing-post-id",
        title: "Existing Post",
        slug: "existing-post",
      },
    ]);

    const result = await deregistrationsWorkflow({});

    expect(result.message).toBe(
      "[DEREGISTRATIONS] Data processed. Post already exists, skipping.",
    );
    expect(generateBlogContent).not.toHaveBeenCalled();
  });

  it("should generate blog post when new data arrives", async () => {
    vi.mocked(updateDeregistration).mockResolvedValueOnce({
      recordsProcessed: 10,
      table: "deregistrations",
      message: "",
      timestamp: "",
    });
    vi.mocked(getDeregistrationsLatestMonth).mockResolvedValueOnce({
      month: "2024-01",
    });
    vi.mocked(getExistingPostByMonth).mockResolvedValueOnce([]);
    vi.mocked(getDeregistrationsForMonth).mockResolvedValueOnce([
      {
        month: "2024-01",
        category: "Saloon",
        number: 50,
      },
    ]);
    vi.mocked(generateBlogContent).mockResolvedValueOnce({
      month: "2024-01",
      postId: "new-post-id",
      title: "January 2024 Deregistrations",
      slug: "january-2024-deregistrations",
      excerpt: "Summary of January 2024 deregistrations.",
      dataType: "deregistrations",
    });
    vi.mocked(generateHeroImage).mockResolvedValueOnce({
      pathname: "dereg.png",
      url: "https://blob.example/dereg.png",
    });
    vi.mocked(updatePostHeroImage).mockResolvedValueOnce(undefined);

    const result = await deregistrationsWorkflow({});

    expect(generateHeroImage).toHaveBeenCalledWith({
      title: "January 2024 Deregistrations",
      excerpt: "Summary of January 2024 deregistrations.",
      dataType: "deregistrations",
      slug: expect.any(String),
    });
    expect(updatePostHeroImage).toHaveBeenCalledWith(
      "new-post-id",
      "https://blob.example/dereg.png",
    );
    expect(revalidateTag).toHaveBeenCalledWith(
      "deregistrations:month:2024-01",
      "max",
    );
    expect(revalidateTag).toHaveBeenCalledWith("deregistrations:months", "max");
    expect(revalidateTag).toHaveBeenCalledWith(
      "deregistrations:year:2024",
      "max",
    );
    expect(generateBlogContent).toHaveBeenCalled();
    expect(revalidatePostsCache).toHaveBeenCalled();
    expect(result.message).toBe(
      "[DEREGISTRATIONS] Data processed and cache revalidated successfully",
    );
    expect(result.postId).toBe("new-post-id");
  });

  it("should use payload.month when provided and skip DB query", async () => {
    vi.mocked(updateDeregistration).mockResolvedValueOnce({
      recordsProcessed: 10,
      table: "deregistrations",
      message: "",
      timestamp: "",
    });
    vi.mocked(getExistingPostByMonth).mockResolvedValueOnce([
      {
        id: "existing-post-id",
        title: "Existing Post",
        slug: "existing-post",
      },
    ]);

    const result = await deregistrationsWorkflow({ month: "2023-06" });

    expect(getDeregistrationsLatestMonth).not.toHaveBeenCalled();
    expect(revalidateTag).toHaveBeenCalledWith(
      "deregistrations:month:2023-06",
      "max",
    );
    expect(result.message).toBe(
      "[DEREGISTRATIONS] Data processed. Post already exists, skipping.",
    );
  });

  it("should still complete when hero image generation fails", async () => {
    vi.mocked(updateDeregistration).mockResolvedValueOnce({
      recordsProcessed: 10,
      table: "deregistrations",
      message: "",
      timestamp: "",
    });
    vi.mocked(getDeregistrationsLatestMonth).mockResolvedValueOnce({
      month: "2024-01",
    });
    vi.mocked(getExistingPostByMonth).mockResolvedValueOnce([]);
    vi.mocked(getDeregistrationsForMonth).mockResolvedValueOnce([
      {
        month: "2024-01",
        category: "Saloon",
        number: 50,
      },
    ]);
    vi.mocked(generateBlogContent).mockResolvedValueOnce({
      month: "2024-01",
      postId: "new-post-id",
      title: "January 2024 Deregistrations",
      slug: "january-2024-deregistrations",
      excerpt: "Summary of January 2024 deregistrations.",
      dataType: "deregistrations",
    });
    vi.mocked(generateHeroImage).mockRejectedValueOnce(
      new Error("hero gen boom"),
    );

    const result = await deregistrationsWorkflow({});

    expect(updatePostHeroImage).not.toHaveBeenCalled();
    expect(revalidatePostsCache).toHaveBeenCalled();
    expect(result.message).toBe(
      "[DEREGISTRATIONS] Data processed and cache revalidated successfully",
    );
    expect(result.postId).toBe("new-post-id");
  });

  it("should update redis timestamp when records are processed", async () => {
    vi.mocked(updateDeregistration).mockResolvedValueOnce({
      recordsProcessed: 5,
      table: "deregistrations",
      message: "",
      timestamp: "",
    });
    vi.mocked(getDeregistrationsLatestMonth).mockResolvedValueOnce({
      month: "2024-02",
    });
    vi.mocked(getExistingPostByMonth).mockResolvedValueOnce([
      { id: "existing", title: "Existing Post", slug: "existing-post" },
    ]);

    await deregistrationsWorkflow({});

    expect(redis.set).toHaveBeenCalledWith(
      "last_updated:deregistrations",
      expect.any(Number),
    );
  });

  it("should throw RetryableError when AI is rate limited (429)", async () => {
    vi.mocked(updateDeregistration).mockResolvedValueOnce({
      recordsProcessed: 10,
      table: "deregistrations",
      message: "",
      timestamp: "",
    });
    vi.mocked(getDeregistrationsLatestMonth).mockResolvedValueOnce({
      month: "2024-01",
    });
    vi.mocked(getExistingPostByMonth).mockResolvedValueOnce([]);
    vi.mocked(getDeregistrationsForMonth).mockResolvedValueOnce([
      {
        month: "2024-01",
        category: "Saloon",
        number: 50,
      },
    ]);
    vi.mocked(generateBlogContent).mockRejectedValueOnce(
      new Error("API error: 429 Too Many Requests"),
    );

    await expect(deregistrationsWorkflow({})).rejects.toThrow(
      "AI rate limited",
    );
  });

  it("should throw FatalError when AI authentication fails (401)", async () => {
    vi.mocked(updateDeregistration).mockResolvedValueOnce({
      recordsProcessed: 10,
      table: "deregistrations",
      message: "",
      timestamp: "",
    });
    vi.mocked(getDeregistrationsLatestMonth).mockResolvedValueOnce({
      month: "2024-01",
    });
    vi.mocked(getExistingPostByMonth).mockResolvedValueOnce([]);
    vi.mocked(getDeregistrationsForMonth).mockResolvedValueOnce([
      {
        month: "2024-01",
        category: "Saloon",
        number: 50,
      },
    ]);
    vi.mocked(generateBlogContent).mockRejectedValueOnce(
      new Error("API error: 401 Unauthorized"),
    );

    await expect(deregistrationsWorkflow({})).rejects.toThrow(
      "AI authentication failed",
    );
  });

  it("should rethrow unknown errors from AI generation", async () => {
    vi.mocked(updateDeregistration).mockResolvedValueOnce({
      recordsProcessed: 10,
      table: "deregistrations",
      message: "",
      timestamp: "",
    });
    vi.mocked(getDeregistrationsLatestMonth).mockResolvedValueOnce({
      month: "2024-01",
    });
    vi.mocked(getExistingPostByMonth).mockResolvedValueOnce([]);
    vi.mocked(getDeregistrationsForMonth).mockResolvedValueOnce([
      {
        month: "2024-01",
        category: "Saloon",
        number: 50,
      },
    ]);
    vi.mocked(generateBlogContent).mockRejectedValueOnce(
      new Error("Unknown AI error"),
    );

    await expect(deregistrationsWorkflow({})).rejects.toThrow(
      "Unknown AI error",
    );
  });
});
