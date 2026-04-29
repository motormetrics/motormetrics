import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@motormetrics/ai", () => ({
  generateBlogContent: vi.fn(),
  generateHeroImage: vi.fn(),
  getEvDataForMonth: vi.fn(),
  updatePostHeroImage: vi.fn(),
}));

vi.mock("@web/queries/cars/latest-month", () => ({
  getCarsLatestMonth: vi.fn(),
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
  getEvDataForMonth,
  updatePostHeroImage,
} from "@motormetrics/ai";
import { getCarsLatestMonth } from "@web/queries/cars/latest-month";
import { getExistingPostByMonth } from "@web/queries/posts";
import { electricVehiclesWorkflow } from "@web/workflows/electric-vehicles";
import { revalidatePostsCache } from "@web/workflows/shared";

const generatedPost = {
  month: "2024-01",
  postId: "ev-post-id",
  title: "January 2024 EV Registrations",
  slug: "january-2024-ev-registrations",
  excerpt: "Summary of January 2024 EV registrations.",
  dataType: "electric-vehicles" as const,
};

describe("electricVehiclesWorkflow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("should return early when no month is found", async () => {
    vi.mocked(getCarsLatestMonth).mockResolvedValueOnce(null);

    const result = await electricVehiclesWorkflow({});

    expect(result.message).toBe("[EV] No car data found.");
    expect(getExistingPostByMonth).not.toHaveBeenCalled();
  });

  it("should skip when post already exists for the month", async () => {
    vi.mocked(getCarsLatestMonth).mockResolvedValueOnce("2024-01");
    vi.mocked(getExistingPostByMonth).mockResolvedValueOnce([
      { id: "existing", title: "Existing", slug: "existing" },
    ]);

    const result = await electricVehiclesWorkflow({});

    expect(result.message).toBe("[EV] Post already exists, skipping.");
    expect(getEvDataForMonth).not.toHaveBeenCalled();
    expect(generateBlogContent).not.toHaveBeenCalled();
  });

  it("should return when EV data for the month is empty", async () => {
    vi.mocked(getCarsLatestMonth).mockResolvedValueOnce("2024-01");
    vi.mocked(getExistingPostByMonth).mockResolvedValueOnce([]);
    vi.mocked(getEvDataForMonth).mockResolvedValueOnce([]);

    const result = await electricVehiclesWorkflow({});

    expect(result.message).toBe("[EV] No EV data for this month.");
    expect(generateBlogContent).not.toHaveBeenCalled();
  });

  it("should generate post and hero image when new EV data arrives", async () => {
    vi.mocked(getCarsLatestMonth).mockResolvedValueOnce("2024-01");
    vi.mocked(getExistingPostByMonth).mockResolvedValueOnce([]);
    vi.mocked(getEvDataForMonth).mockResolvedValueOnce([
      {
        month: "2024-01",
        make: "Tesla",
        fuelType: "Electric",
        vehicleType: "Saloon",
        number: 50,
      },
    ]);
    vi.mocked(generateBlogContent).mockResolvedValueOnce(generatedPost);
    vi.mocked(generateHeroImage).mockResolvedValueOnce({
      pathname: "ev.png",
      url: "https://blob.example/ev.png",
    });
    vi.mocked(updatePostHeroImage).mockResolvedValueOnce(undefined);

    const result = await electricVehiclesWorkflow({});

    expect(generateBlogContent).toHaveBeenCalledWith({
      data: expect.any(String),
      month: "2024-01",
      dataType: "electric-vehicles",
    });
    expect(generateHeroImage).toHaveBeenCalledWith({
      title: generatedPost.title,
      excerpt: generatedPost.excerpt,
      dataType: "electric-vehicles",
      slug: expect.any(String),
    });
    expect(updatePostHeroImage).toHaveBeenCalledWith(
      generatedPost.postId,
      "https://blob.example/ev.png",
    );
    expect(revalidatePostsCache).toHaveBeenCalled();
    expect(result.postId).toBe(generatedPost.postId);
    expect(result.message).toBe("[EV] Blog post generated successfully");
  });

  it("should still complete when hero image generation fails", async () => {
    vi.mocked(getCarsLatestMonth).mockResolvedValueOnce("2024-01");
    vi.mocked(getExistingPostByMonth).mockResolvedValueOnce([]);
    vi.mocked(getEvDataForMonth).mockResolvedValueOnce([
      {
        month: "2024-01",
        make: "Tesla",
        fuelType: "Electric",
        vehicleType: "Saloon",
        number: 50,
      },
    ]);
    vi.mocked(generateBlogContent).mockResolvedValueOnce(generatedPost);
    vi.mocked(generateHeroImage).mockRejectedValueOnce(
      new Error("gateway error"),
    );

    const result = await electricVehiclesWorkflow({});

    expect(updatePostHeroImage).not.toHaveBeenCalled();
    expect(revalidatePostsCache).toHaveBeenCalled();
    expect(result.postId).toBe(generatedPost.postId);
    expect(result.message).toBe("[EV] Blog post generated successfully");
  });

  it("should use payload.month when provided and skip DB lookup", async () => {
    vi.mocked(getExistingPostByMonth).mockResolvedValueOnce([
      { id: "existing", title: "Existing", slug: "existing" },
    ]);

    const result = await electricVehiclesWorkflow({ month: "2023-06" });

    expect(getCarsLatestMonth).not.toHaveBeenCalled();
    expect(getExistingPostByMonth).toHaveBeenCalledWith(
      "2023-06",
      "electric-vehicles",
    );
    expect(result.message).toBe("[EV] Post already exists, skipping.");
  });

  it("should throw RetryableError when AI is rate limited (429)", async () => {
    vi.mocked(getCarsLatestMonth).mockResolvedValueOnce("2024-01");
    vi.mocked(getExistingPostByMonth).mockResolvedValueOnce([]);
    vi.mocked(getEvDataForMonth).mockResolvedValueOnce([
      {
        month: "2024-01",
        make: "Tesla",
        fuelType: "Electric",
        vehicleType: "Saloon",
        number: 50,
      },
    ]);
    vi.mocked(generateBlogContent).mockRejectedValueOnce(
      new Error("API error: 429 Too Many Requests"),
    );

    await expect(electricVehiclesWorkflow({})).rejects.toThrow(
      "AI rate limited",
    );
  });

  it("should throw FatalError when AI authentication fails (401)", async () => {
    vi.mocked(getCarsLatestMonth).mockResolvedValueOnce("2024-01");
    vi.mocked(getExistingPostByMonth).mockResolvedValueOnce([]);
    vi.mocked(getEvDataForMonth).mockResolvedValueOnce([
      {
        month: "2024-01",
        make: "Tesla",
        fuelType: "Electric",
        vehicleType: "Saloon",
        number: 50,
      },
    ]);
    vi.mocked(generateBlogContent).mockRejectedValueOnce(
      new Error("API error: 401 Unauthorized"),
    );

    await expect(electricVehiclesWorkflow({})).rejects.toThrow(
      "AI authentication failed",
    );
  });

  it("should rethrow unknown errors from AI generation", async () => {
    vi.mocked(getCarsLatestMonth).mockResolvedValueOnce("2024-01");
    vi.mocked(getExistingPostByMonth).mockResolvedValueOnce([]);
    vi.mocked(getEvDataForMonth).mockResolvedValueOnce([
      {
        month: "2024-01",
        make: "Tesla",
        fuelType: "Electric",
        vehicleType: "Saloon",
        number: 50,
      },
    ]);
    vi.mocked(generateBlogContent).mockRejectedValueOnce(
      new Error("Unknown AI error"),
    );

    await expect(electricVehiclesWorkflow({})).rejects.toThrow(
      "Unknown AI error",
    );
  });
});
