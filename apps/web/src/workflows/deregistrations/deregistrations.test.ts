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

vi.mock("@web/workflows/deregistrations/steps/process-data", () => ({
  updateDeregistration: vi.fn(),
}));

vi.mock("@web/queries/deregistrations/latest-month", () => ({
  getDeregistrationsLatestMonth: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(),
}));

import { redis } from "@motormetrics/utils/redis";
import { getDeregistrationsLatestMonth } from "@web/queries/deregistrations/latest-month";
import { deregistrationsWorkflow } from "@web/workflows/deregistrations";
import { updateDeregistration } from "@web/workflows/deregistrations/steps/process-data";

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

    await deregistrationsWorkflow({});

    expect(redis.set).toHaveBeenCalledWith(
      "last_updated:deregistrations",
      expect.any(Number),
    );
  });
});
