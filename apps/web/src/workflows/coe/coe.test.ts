import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@motormetrics/ai", () => ({
  generateBlogContent: vi.fn(),
  generateHeroImage: vi.fn(),
  getCoeForMonth: vi.fn(),
  updatePostHeroImage: vi.fn(),
}));

vi.mock("@motormetrics/utils", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@motormetrics/utils")>()),
  redis: {
    set: vi.fn(),
  },
}));

vi.mock("@web/workflows/coe/steps/process-data", () => ({
  updateCoe: vi.fn(),
}));

vi.mock("@web/queries/coe/latest-month", () => ({
  getCOELatestRecord: vi.fn(),
}));

vi.mock("@web/queries/posts", () => ({
  getExistingPostByMonth: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(),
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

vi.mock("@web/workflows/shared", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@web/workflows/shared")>()),
  revalidatePostsCache: vi.fn(),
}));

import {
  generateBlogContent,
  generateHeroImage,
  getCoeForMonth,
  updatePostHeroImage,
} from "@motormetrics/ai";
import { redis } from "@motormetrics/utils";
import { getCOELatestRecord } from "@web/queries/coe/latest-month";
import { getExistingPostByMonth } from "@web/queries/posts";
import { coeWorkflow } from "@web/workflows/coe";
import { updateCoe } from "@web/workflows/coe/steps/process-data";
import { revalidatePostsCache } from "@web/workflows/shared";
import { revalidateTag } from "next/cache";

describe("coeWorkflow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("should return early when no records are processed", async () => {
    vi.mocked(updateCoe).mockResolvedValueOnce({
      recordsProcessed: 0,
      table: "coe",
      message: "",
      timestamp: "",
    });

    const result = await coeWorkflow({});

    expect(result.message).toBe(
      "No COE records processed. Skipped publishing to social media.",
    );
    expect(getCOELatestRecord).not.toHaveBeenCalled();
  });

  it("should return message when no COE records found", async () => {
    vi.mocked(updateCoe).mockResolvedValueOnce({
      recordsProcessed: 5,
      table: "coe",
      message: "",
      timestamp: "",
    });
    vi.mocked(getCOELatestRecord).mockResolvedValueOnce(undefined);

    const result = await coeWorkflow({});

    expect(result.message).toBe("[COE] No COE records found");
  });

  it("should wait for second bidding exercise before generating post", async () => {
    vi.mocked(updateCoe).mockResolvedValueOnce({
      recordsProcessed: 10,
      table: "coe",
      message: "",
      timestamp: "",
    });
    vi.mocked(getCOELatestRecord).mockResolvedValueOnce({
      id: "test-id",
      month: "2024-01",
      biddingNo: 1,
      vehicleClass: "A",
      quota: 100,
      bidsSuccess: 100,
      bidsReceived: 200,
      premium: 100000,
    });

    const result = await coeWorkflow({});

    expect(result.message).toBe(
      "[COE] Data processed. Waiting for second bidding exercise to generate post.",
    );
    expect(generateBlogContent).not.toHaveBeenCalled();
  });

  it("should skip blog generation when post already exists", async () => {
    vi.mocked(updateCoe).mockResolvedValueOnce({
      recordsProcessed: 10,
      table: "coe",
      message: "",
      timestamp: "",
    });
    vi.mocked(getCOELatestRecord).mockResolvedValueOnce({
      id: "test-id",
      month: "2024-01",
      biddingNo: 2,
      vehicleClass: "A",
      quota: 100,
      bidsSuccess: 100,
      bidsReceived: 200,
      premium: 100000,
    });
    vi.mocked(getExistingPostByMonth).mockResolvedValueOnce([
      { id: "existing-post-id", title: "Existing Post", slug: "existing-post" },
    ]);

    const result = await coeWorkflow({});

    expect(result.message).toBe(
      "[COE] Data processed. Post already exists, skipping social media.",
    );
    expect(generateBlogContent).not.toHaveBeenCalled();
  });

  it("should generate blog post when second bidding complete", async () => {
    vi.mocked(updateCoe).mockResolvedValueOnce({
      recordsProcessed: 10,
      table: "coe",
      message: "",
      timestamp: "",
    });
    vi.mocked(getCOELatestRecord).mockResolvedValueOnce({
      id: "test-id",
      month: "2024-01",
      biddingNo: 2,
      vehicleClass: "A",
      quota: 100,
      bidsSuccess: 100,
      bidsReceived: 200,
      premium: 100000,
    });
    vi.mocked(getExistingPostByMonth).mockResolvedValueOnce([]);
    vi.mocked(getCoeForMonth).mockResolvedValueOnce([
      {
        month: "2024-01",
        biddingNo: 2,
        vehicleClass: "A",
        quota: 100,
        bidsSuccess: 100,
        bidsReceived: 200,
        premium: 100000,
      },
    ]);
    vi.mocked(generateBlogContent).mockResolvedValueOnce({
      month: "2024-01",
      postId: "new-post-id",
      title: "January 2024 COE Results",
      slug: "january-2024-coe-results",
      excerpt: "Summary of January 2024 COE results.",
      dataType: "coe",
    });
    vi.mocked(generateHeroImage).mockResolvedValueOnce({
      pathname: "coe.png",
      url: "https://blob.example/coe.png",
    });
    vi.mocked(updatePostHeroImage).mockResolvedValueOnce(undefined);

    const result = await coeWorkflow({});

    expect(generateHeroImage).toHaveBeenCalledWith({
      title: "January 2024 COE Results",
      excerpt: "Summary of January 2024 COE results.",
      dataType: "coe",
      slug: expect.any(String),
    });
    expect(updatePostHeroImage).toHaveBeenCalledWith(
      "new-post-id",
      "https://blob.example/coe.png",
    );
    expect(revalidateTag).toHaveBeenCalledWith("coe:latest", "max");
    expect(revalidateTag).toHaveBeenCalledWith("coe:previous", "max");
    expect(revalidateTag).toHaveBeenCalledWith("coe:months", "max");
    expect(revalidateTag).toHaveBeenCalledWith("coe:results", "max");
    expect(revalidateTag).toHaveBeenCalledWith("coe:trends", "max");
    expect(revalidateTag).toHaveBeenCalledWith("coe:bidding-rounds", "max");
    expect(revalidateTag).toHaveBeenCalledWith("coe:month:2024-01", "max");
    expect(revalidateTag).toHaveBeenCalledWith("coe:year:2024", "max");
    expect(generateBlogContent).toHaveBeenCalled();
    expect(revalidatePostsCache).toHaveBeenCalled();
    expect(result.message).toBe(
      "[COE] Data processed and cache revalidated successfully",
    );
    expect(result.postId).toBe("new-post-id");
  });

  it("should still complete when hero image generation fails", async () => {
    vi.mocked(updateCoe).mockResolvedValueOnce({
      recordsProcessed: 10,
      table: "coe",
      message: "",
      timestamp: "",
    });
    vi.mocked(getCOELatestRecord).mockResolvedValueOnce({
      id: "test-id",
      month: "2024-01",
      biddingNo: 2,
      vehicleClass: "A",
      quota: 100,
      bidsSuccess: 100,
      bidsReceived: 200,
      premium: 100000,
    });
    vi.mocked(getExistingPostByMonth).mockResolvedValueOnce([]);
    vi.mocked(getCoeForMonth).mockResolvedValueOnce([
      {
        month: "2024-01",
        biddingNo: 2,
        vehicleClass: "A",
        quota: 100,
        bidsSuccess: 100,
        bidsReceived: 200,
        premium: 100000,
      },
    ]);
    vi.mocked(generateBlogContent).mockResolvedValueOnce({
      month: "2024-01",
      postId: "new-post-id",
      title: "January 2024 COE Results",
      slug: "january-2024-coe-results",
      excerpt: "Summary of January 2024 COE results.",
      dataType: "coe",
    });
    vi.mocked(generateHeroImage).mockRejectedValueOnce(
      new Error("hero gen boom"),
    );

    const result = await coeWorkflow({});

    expect(updatePostHeroImage).not.toHaveBeenCalled();
    expect(revalidatePostsCache).toHaveBeenCalled();
    expect(result.message).toBe(
      "[COE] Data processed and cache revalidated successfully",
    );
    expect(result.postId).toBe("new-post-id");
  });

  it("should update redis timestamp when records are processed", async () => {
    vi.mocked(updateCoe).mockResolvedValueOnce({
      recordsProcessed: 5,
      table: "coe",
      message: "",
      timestamp: "",
    });
    vi.mocked(getCOELatestRecord).mockResolvedValueOnce({
      id: "test-id",
      month: "2024-02",
      biddingNo: 1,
      vehicleClass: "A",
      quota: 100,
      bidsSuccess: 100,
      bidsReceived: 200,
      premium: 100000,
    });

    await coeWorkflow({});

    expect(redis.set).toHaveBeenCalledWith(
      "last_updated:coe",
      expect.any(Number),
    );
  });

  it("should throw RetryableError when AI is rate limited (429)", async () => {
    vi.mocked(updateCoe).mockResolvedValueOnce({
      recordsProcessed: 10,
      table: "coe",
      message: "",
      timestamp: "",
    });
    vi.mocked(getCOELatestRecord).mockResolvedValueOnce({
      id: "test-id",
      month: "2024-01",
      biddingNo: 2,
      vehicleClass: "A",
      quota: 100,
      bidsSuccess: 100,
      bidsReceived: 200,
      premium: 100000,
    });
    vi.mocked(getExistingPostByMonth).mockResolvedValueOnce([]);
    vi.mocked(getCoeForMonth).mockResolvedValueOnce([
      {
        month: "2024-01",
        biddingNo: 2,
        vehicleClass: "A",
        quota: 100,
        bidsSuccess: 100,
        bidsReceived: 200,
        premium: 100000,
      },
    ]);
    vi.mocked(generateBlogContent).mockRejectedValueOnce(
      new Error("API error: 429 Too Many Requests"),
    );

    await expect(coeWorkflow({})).rejects.toThrow("AI rate limited");
  });

  it("should throw FatalError when AI authentication fails (401)", async () => {
    vi.mocked(updateCoe).mockResolvedValueOnce({
      recordsProcessed: 10,
      table: "coe",
      message: "",
      timestamp: "",
    });
    vi.mocked(getCOELatestRecord).mockResolvedValueOnce({
      id: "test-id",
      month: "2024-01",
      biddingNo: 2,
      vehicleClass: "A",
      quota: 100,
      bidsSuccess: 100,
      bidsReceived: 200,
      premium: 100000,
    });
    vi.mocked(getExistingPostByMonth).mockResolvedValueOnce([]);
    vi.mocked(getCoeForMonth).mockResolvedValueOnce([
      {
        month: "2024-01",
        biddingNo: 2,
        vehicleClass: "A",
        quota: 100,
        bidsSuccess: 100,
        bidsReceived: 200,
        premium: 100000,
      },
    ]);
    vi.mocked(generateBlogContent).mockRejectedValueOnce(
      new Error("API error: 401 Unauthorized"),
    );

    await expect(coeWorkflow({})).rejects.toThrow("AI authentication failed");
  });

  it("should throw FatalError when AI access is forbidden (403)", async () => {
    vi.mocked(updateCoe).mockResolvedValueOnce({
      recordsProcessed: 10,
      table: "coe",
      message: "",
      timestamp: "",
    });
    vi.mocked(getCOELatestRecord).mockResolvedValueOnce({
      id: "test-id",
      month: "2024-01",
      biddingNo: 2,
      vehicleClass: "A",
      quota: 100,
      bidsSuccess: 100,
      bidsReceived: 200,
      premium: 100000,
    });
    vi.mocked(getExistingPostByMonth).mockResolvedValueOnce([]);
    vi.mocked(getCoeForMonth).mockResolvedValueOnce([
      {
        month: "2024-01",
        biddingNo: 2,
        vehicleClass: "A",
        quota: 100,
        bidsSuccess: 100,
        bidsReceived: 200,
        premium: 100000,
      },
    ]);
    vi.mocked(generateBlogContent).mockRejectedValueOnce(
      new Error("API error: 403 Forbidden"),
    );

    await expect(coeWorkflow({})).rejects.toThrow("AI authentication failed");
  });

  it("should rethrow unknown errors from AI generation", async () => {
    vi.mocked(updateCoe).mockResolvedValueOnce({
      recordsProcessed: 10,
      table: "coe",
      message: "",
      timestamp: "",
    });
    vi.mocked(getCOELatestRecord).mockResolvedValueOnce({
      id: "test-id",
      month: "2024-01",
      biddingNo: 2,
      vehicleClass: "A",
      quota: 100,
      bidsSuccess: 100,
      bidsReceived: 200,
      premium: 100000,
    });
    vi.mocked(getExistingPostByMonth).mockResolvedValueOnce([]);
    vi.mocked(getCoeForMonth).mockResolvedValueOnce([
      {
        month: "2024-01",
        biddingNo: 2,
        vehicleClass: "A",
        quota: 100,
        bidsSuccess: 100,
        bidsReceived: 200,
        premium: 100000,
      },
    ]);
    vi.mocked(generateBlogContent).mockRejectedValueOnce(
      new Error("Unknown AI error"),
    );

    await expect(coeWorkflow({})).rejects.toThrow("Unknown AI error");
  });

  it("should use payload.month and skip biddingNo check", async () => {
    vi.mocked(updateCoe).mockResolvedValueOnce({
      recordsProcessed: 10,
      table: "coe",
      message: "",
      timestamp: "",
    });
    vi.mocked(getExistingPostByMonth).mockResolvedValueOnce([
      { id: "existing-post-id", title: "Existing Post", slug: "existing-post" },
    ]);

    const result = await coeWorkflow({ month: "2023-06" });

    expect(getCOELatestRecord).not.toHaveBeenCalled();
    expect(revalidateTag).toHaveBeenCalledWith("coe:month:2023-06", "max");
    expect(result.message).toBe(
      "[COE] Data processed. Post already exists, skipping social media.",
    );
  });

  it("should fall back to DB query when month not provided", async () => {
    vi.mocked(updateCoe).mockResolvedValueOnce({
      recordsProcessed: 10,
      table: "coe",
      message: "",
      timestamp: "",
    });
    vi.mocked(getCOELatestRecord).mockResolvedValueOnce({
      id: "test-id",
      month: "2024-01",
      biddingNo: 2,
      vehicleClass: "A",
      quota: 100,
      bidsSuccess: 100,
      bidsReceived: 200,
      premium: 100000,
    });
    vi.mocked(getExistingPostByMonth).mockResolvedValueOnce([
      { id: "existing-post-id", title: "Existing Post", slug: "existing-post" },
    ]);

    const result = await coeWorkflow({});

    expect(getCOELatestRecord).toHaveBeenCalled();
    expect(result.message).toBe(
      "[COE] Data processed. Post already exists, skipping social media.",
    );
  });

  it("should handle non-Error objects thrown from AI generation", async () => {
    vi.mocked(updateCoe).mockResolvedValueOnce({
      recordsProcessed: 10,
      table: "coe",
      message: "",
      timestamp: "",
    });
    vi.mocked(getCOELatestRecord).mockResolvedValueOnce({
      id: "test-id",
      month: "2024-01",
      biddingNo: 2,
      vehicleClass: "A",
      quota: 100,
      bidsSuccess: 100,
      bidsReceived: 200,
      premium: 100000,
    });
    vi.mocked(getExistingPostByMonth).mockResolvedValueOnce([]);
    vi.mocked(getCoeForMonth).mockResolvedValueOnce([
      {
        month: "2024-01",
        biddingNo: 2,
        vehicleClass: "A",
        quota: 100,
        bidsSuccess: 100,
        bidsReceived: 200,
        premium: 100000,
      },
    ]);
    vi.mocked(generateBlogContent).mockRejectedValueOnce("string error");

    await expect(coeWorkflow({})).rejects.toBe("string error");
  });
});
