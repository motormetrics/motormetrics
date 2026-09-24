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
  getCarsAggregatedByMonth: vi.fn(),
}));

vi.mock("@motormetrics/ai/save-post", () => ({
  updatePostHeroImage: vi.fn(),
}));

vi.mock("@motormetrics/utils/redis", () => ({
  redis: {
    set: vi.fn(),
  },
}));

vi.mock("@web/workflows/cars/steps/process-data", () => ({
  updateCars: vi.fn(),
}));

vi.mock("@web/queries/cars/latest-month", () => ({
  getCarsLatestMonth: vi.fn(),
}));

vi.mock("@web/queries/posts", () => ({
  getExistingPostByMonth: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(),
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
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

import { generateHeroImage } from "@motormetrics/ai/generate-hero-image";
import { generateBlogContent } from "@motormetrics/ai/generate-post";
import { getCarsAggregatedByMonth } from "@motormetrics/ai/queries";
import { updatePostHeroImage } from "@motormetrics/ai/save-post";
import { redis } from "@motormetrics/utils/redis";
import { getCarsLatestMonth } from "@web/queries/cars/latest-month";
import { getExistingPostByMonth } from "@web/queries/posts";
import { carsWorkflow } from "@web/workflows/cars";
import { updateCars } from "@web/workflows/cars/steps/process-data";
import { revalidatePostsCache } from "@web/workflows/shared";
import { revalidateTag } from "next/cache";

describe("carsWorkflow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("should return early when no records are processed", async () => {
    vi.mocked(updateCars).mockResolvedValueOnce({
      recordsProcessed: 0,
      table: "cars",
      message: "",
      timestamp: "",
    });

    const result = await carsWorkflow({});

    expect(result.message).toBe(
      "No car records processed. Skipped publishing to social media.",
    );
    expect(getCarsLatestMonth).not.toHaveBeenCalled();
  });

  it("should return message when no car records found", async () => {
    vi.mocked(updateCars).mockResolvedValueOnce({
      recordsProcessed: 5,
      table: "cars",
      message: "",
      timestamp: "",
    });
    vi.mocked(getCarsLatestMonth).mockResolvedValueOnce(null);

    const result = await carsWorkflow({});

    expect(result.message).toBe("[CARS] No car records found");
  });

  it("should update redis timestamp when records are processed", async () => {
    vi.mocked(updateCars).mockResolvedValueOnce({
      recordsProcessed: 5,
      table: "cars",
      message: "",
      timestamp: "",
    });
    vi.mocked(getCarsLatestMonth).mockResolvedValueOnce("2024-02");
    vi.mocked(getExistingPostByMonth).mockResolvedValueOnce([
      { id: "existing", title: "Existing Post", slug: "existing-post" },
    ]);

    await carsWorkflow({});

    expect(redis.set).toHaveBeenCalledWith(
      "last_updated:cars",
      expect.any(Number),
    );
  });
});
