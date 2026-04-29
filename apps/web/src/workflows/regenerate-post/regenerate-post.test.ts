import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@motormetrics/ai", () => ({
  generateHeroImage: vi.fn(),
  getCarsAggregatedByMonth: vi.fn(),
  getCoeForMonth: vi.fn(),
  regenerateBlogContent: vi.fn(),
  updatePostHeroImage: vi.fn(),
}));

vi.mock("workflow", () => ({
  fetch: vi.fn(),
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
  generateHeroImage,
  getCarsAggregatedByMonth,
  getCoeForMonth,
  regenerateBlogContent,
  updatePostHeroImage,
} from "@motormetrics/ai";
import { regeneratePostWorkflow } from "@web/workflows/regenerate-post";
import { revalidatePostsCache } from "@web/workflows/shared";

describe("regeneratePostWorkflow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("should regenerate cars post successfully", async () => {
    vi.mocked(getCarsAggregatedByMonth).mockResolvedValueOnce([
      {
        month: "2024-01",
        make: "Toyota",
        fuelType: "Petrol",
        vehicleType: "Saloon",
        number: 100,
      },
    ]);
    vi.mocked(regenerateBlogContent).mockResolvedValueOnce({
      month: "2024-01",
      postId: "regenerated-post-id",
      title: "Updated January 2024 Car Registrations",
      slug: "january-2024-car-registrations",
      excerpt: "Updated summary.",
      dataType: "cars",
    });
    vi.mocked(generateHeroImage).mockResolvedValueOnce({
      pathname: "regen.png",
      url: "https://blob.example/regen.png",
    });
    vi.mocked(updatePostHeroImage).mockResolvedValueOnce(undefined);

    const result = await regeneratePostWorkflow({
      month: "2024-01",
      dataType: "cars",
    });

    expect(getCarsAggregatedByMonth).toHaveBeenCalledWith("2024-01");
    expect(regenerateBlogContent).toHaveBeenCalledWith({
      data: expect.any(String),
      month: "2024-01",
      dataType: "cars",
    });
    expect(generateHeroImage).toHaveBeenCalledWith({
      title: "Updated January 2024 Car Registrations",
      excerpt: "Updated summary.",
      dataType: "cars",
      slug: expect.any(String),
    });
    expect(updatePostHeroImage).toHaveBeenCalledWith(
      "regenerated-post-id",
      "https://blob.example/regen.png",
    );
    expect(revalidatePostsCache).toHaveBeenCalled();
    expect(result.message).toBe(
      "[REGENERATE] Successfully regenerated cars post for 2024-01",
    );
    expect(result.postId).toBe("regenerated-post-id");
    expect(result.title).toBe("Updated January 2024 Car Registrations");
    expect(result.slug).toBe("january-2024-car-registrations");
  });

  it("should still complete when hero image generation fails", async () => {
    vi.mocked(getCarsAggregatedByMonth).mockResolvedValueOnce([]);
    vi.mocked(regenerateBlogContent).mockResolvedValueOnce({
      month: "2024-01",
      postId: "regenerated-post-id",
      title: "Updated January 2024 Car Registrations",
      slug: "january-2024-car-registrations",
      excerpt: "Updated summary.",
      dataType: "cars",
    });
    vi.mocked(generateHeroImage).mockRejectedValueOnce(
      new Error("hero gen boom"),
    );

    const result = await regeneratePostWorkflow({
      month: "2024-01",
      dataType: "cars",
    });

    expect(updatePostHeroImage).not.toHaveBeenCalled();
    expect(revalidatePostsCache).toHaveBeenCalled();
    expect(result.postId).toBe("regenerated-post-id");
    expect(result.message).toBe(
      "[REGENERATE] Successfully regenerated cars post for 2024-01",
    );
  });

  it("should regenerate coe post successfully", async () => {
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
    vi.mocked(regenerateBlogContent).mockResolvedValueOnce({
      month: "2024-01",
      postId: "regenerated-coe-post-id",
      title: "Updated January 2024 COE Results",
      slug: "january-2024-coe-results",
      excerpt: "Updated COE summary.",
      dataType: "coe",
    });

    const result = await regeneratePostWorkflow({
      month: "2024-01",
      dataType: "coe",
    });

    expect(getCoeForMonth).toHaveBeenCalledWith("2024-01");
    expect(regenerateBlogContent).toHaveBeenCalledWith({
      data: expect.any(String),
      month: "2024-01",
      dataType: "coe",
    });
    expect(revalidatePostsCache).toHaveBeenCalled();
    expect(result.message).toBe(
      "[REGENERATE] Successfully regenerated coe post for 2024-01",
    );
    expect(result.postId).toBe("regenerated-coe-post-id");
  });

  it("should use cars data fetcher for cars dataType", async () => {
    vi.mocked(getCarsAggregatedByMonth).mockResolvedValueOnce([]);
    vi.mocked(regenerateBlogContent).mockResolvedValueOnce({
      month: "2024-02",
      postId: "id",
      title: "Title",
      slug: "slug",
      excerpt: "Excerpt.",
      dataType: "cars",
    });

    await regeneratePostWorkflow({
      month: "2024-02",
      dataType: "cars",
    });

    expect(getCarsAggregatedByMonth).toHaveBeenCalledWith("2024-02");
    expect(getCoeForMonth).not.toHaveBeenCalled();
  });

  it("should use coe data fetcher for coe dataType", async () => {
    vi.mocked(getCoeForMonth).mockResolvedValueOnce([]);
    vi.mocked(regenerateBlogContent).mockResolvedValueOnce({
      month: "2024-02",
      postId: "id",
      title: "Title",
      slug: "slug",
      excerpt: "Excerpt.",
      dataType: "coe",
    });

    await regeneratePostWorkflow({
      month: "2024-02",
      dataType: "coe",
    });

    expect(getCoeForMonth).toHaveBeenCalledWith("2024-02");
    expect(getCarsAggregatedByMonth).not.toHaveBeenCalled();
  });

  it("should throw RetryableError when AI rate limited (429)", async () => {
    vi.mocked(getCarsAggregatedByMonth).mockResolvedValueOnce([]);
    vi.mocked(regenerateBlogContent).mockRejectedValueOnce(
      new Error("Request failed with status 429"),
    );

    await expect(
      regeneratePostWorkflow({
        month: "2024-01",
        dataType: "cars",
      }),
    ).rejects.toThrow("AI rate limited");
  });

  it("should throw FatalError when AI authentication fails (401)", async () => {
    vi.mocked(getCarsAggregatedByMonth).mockResolvedValueOnce([]);
    vi.mocked(regenerateBlogContent).mockRejectedValueOnce(
      new Error("Request failed with status 401"),
    );

    await expect(
      regeneratePostWorkflow({
        month: "2024-01",
        dataType: "cars",
      }),
    ).rejects.toThrow("AI authentication failed");
  });

  it("should throw FatalError when AI authentication fails (403)", async () => {
    vi.mocked(getCoeForMonth).mockResolvedValueOnce([]);
    vi.mocked(regenerateBlogContent).mockRejectedValueOnce(
      new Error("Request failed with status 403"),
    );

    await expect(
      regeneratePostWorkflow({
        month: "2024-01",
        dataType: "coe",
      }),
    ).rejects.toThrow("AI authentication failed");
  });

  it("should rethrow unknown errors from AI generation", async () => {
    vi.mocked(getCarsAggregatedByMonth).mockResolvedValueOnce([]);
    vi.mocked(regenerateBlogContent).mockRejectedValueOnce(
      new Error("Unknown AI error"),
    );

    await expect(
      regeneratePostWorkflow({
        month: "2024-01",
        dataType: "cars",
      }),
    ).rejects.toThrow("Unknown AI error");
  });
});
