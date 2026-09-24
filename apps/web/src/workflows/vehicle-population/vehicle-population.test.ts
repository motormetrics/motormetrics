import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@motormetrics/utils/redis", () => ({
  redis: {
    set: vi.fn(),
  },
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

vi.mock("@web/workflows/vehicle-population/steps/process-data", () => ({
  updateVehiclePopulation: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(),
}));

import { redis } from "@motormetrics/utils/redis";
import { vehiclePopulationWorkflow } from "@web/workflows/vehicle-population";
import { updateVehiclePopulation } from "@web/workflows/vehicle-population/steps/process-data";
import { revalidateTag } from "next/cache";

describe("vehiclePopulationWorkflow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("should return early when no records are processed", async () => {
    vi.mocked(updateVehiclePopulation).mockResolvedValueOnce({
      recordsProcessed: 0,
      table: "vehicle_population",
      message: "",
      timestamp: "",
    });

    const result = await vehiclePopulationWorkflow();

    expect(result.message).toBe("No vehicle population records processed.");
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("should process data and revalidate cache on success", async () => {
    vi.mocked(updateVehiclePopulation).mockResolvedValueOnce({
      recordsProcessed: 10,
      table: "vehicle_population",
      message: "",
      timestamp: "",
    });

    const result = await vehiclePopulationWorkflow();

    expect(redis.set).toHaveBeenCalled();
    expect(revalidateTag).toHaveBeenCalledWith(
      "vehicle-population:years",
      "max",
    );
    expect(revalidateTag).toHaveBeenCalledWith(
      "vehicle-population:totals",
      "max",
    );
    expect(result.message).toBe(
      "[VEHICLE POPULATION] Data processed and cache revalidated successfully",
    );
  });

  it("should update redis timestamp when records are processed", async () => {
    vi.mocked(updateVehiclePopulation).mockResolvedValueOnce({
      recordsProcessed: 5,
      table: "vehicle_population",
      message: "",
      timestamp: "",
    });

    await vehiclePopulationWorkflow();

    expect(redis.set).toHaveBeenCalledWith(
      "last_updated:vehicle-population",
      expect.any(Number),
    );
  });
});
