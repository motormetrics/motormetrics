import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@motormetrics/utils", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@motormetrics/utils")>()),
  redis: {
    set: vi.fn(),
  },
}));

vi.mock("@web/workflows/ev-charging/steps/process-data", () => ({
  updateEvChargingPoints: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(),
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
}));

vi.mock("workflow", () => ({
  getWritable: vi.fn(() => ({
    getWriter: () => ({
      write: vi.fn().mockResolvedValue(undefined),
      releaseLock: vi.fn(),
    }),
  })),
  FatalError: class FatalError extends Error {},
  RetryableError: class RetryableError extends Error {},
}));

import { redis } from "@motormetrics/utils";
import {
  evChargingWorkflow,
  LAST_UPDATED_EV_CHARGING_KEY,
} from "@web/workflows/ev-charging";
import { updateEvChargingPoints } from "@web/workflows/ev-charging/steps/process-data";
import { revalidateTag } from "next/cache";

describe("evChargingWorkflow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return early without revalidating when no records are processed", async () => {
    vi.mocked(updateEvChargingPoints).mockResolvedValueOnce({
      recordsProcessed: 0,
      table: "ev_charging_points",
      message: "",
      timestamp: "",
    });

    const result = await evChargingWorkflow();

    expect(result.message).toBe("No EV charging point records processed.");
    expect(redis.set).not.toHaveBeenCalled();
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("should update redis timestamp and revalidate cache when records are processed", async () => {
    vi.mocked(updateEvChargingPoints).mockResolvedValueOnce({
      recordsProcessed: 42,
      table: "ev_charging_points",
      message: "",
      timestamp: "",
    });

    const result = await evChargingWorkflow();

    expect(redis.set).toHaveBeenCalledWith(
      LAST_UPDATED_EV_CHARGING_KEY,
      expect.any(Number),
    );
    expect(revalidateTag).toHaveBeenCalledWith("ev-charging", "max");
    expect(result.message).toBe(
      "[EV CHARGING] Data processed and cache revalidated successfully",
    );
  });
});
