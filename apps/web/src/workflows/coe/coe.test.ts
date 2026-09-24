import { beforeEach, describe, expect, it, vi } from "vitest";

// classifyAIError is left unmocked; it is pure, so these keep covering the
// whole path from a provider error to the WDK error type.

vi.mock("@motormetrics/ai/generate-hero-image", () => ({
  generateHeroImage: vi.fn(),
}));

vi.mock("@motormetrics/ai/generate-post", () => ({
  generateBlogContent: vi.fn(),
}));

vi.mock("@motormetrics/ai/queries", () => ({
  getCoeForMonth: vi.fn(),
}));

vi.mock("@motormetrics/ai/save-post", () => ({
  updatePostHeroImage: vi.fn(),
}));

vi.mock("@motormetrics/utils/redis", () => ({
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

import { generateBlogContent } from "@motormetrics/ai/generate-post";
import { redis } from "@motormetrics/utils/redis";
import { getCOELatestRecord } from "@web/queries/coe/latest-month";
import { coeWorkflow } from "@web/workflows/coe";
import { updateCoe } from "@web/workflows/coe/steps/process-data";

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
});
