import { beforeEach, describe, expect, it, vi } from "vitest";

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

import { redis } from "@motormetrics/utils/redis";
import { getCarsLatestMonth } from "@web/queries/cars/latest-month";
import { carsWorkflow } from "@web/workflows/cars";
import { updateCars } from "@web/workflows/cars/steps/process-data";

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

    expect(result.message).toBe("No car records processed.");
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

    await carsWorkflow({});

    expect(redis.set).toHaveBeenCalledWith(
      "last_updated:cars",
      expect.any(Number),
    );
  });
});
