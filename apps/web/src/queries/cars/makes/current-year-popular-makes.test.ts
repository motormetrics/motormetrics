import { getPopularMakes } from "@web/queries/cars/makes/current-year-popular-makes";
import {
  cacheLifeMock,
  cacheTagMock,
  dbMock,
  queueSelect,
  resetDbMocks,
} from "@web/queries/test-utils";
import { describe, expect, it, vi } from "vitest";

describe("popular makes queries", () => {
  beforeEach(() => {
    resetDbMocks();
  });

  it("loads the latest year with registration data", async () => {
    dbMock.query.cars.findFirst.mockResolvedValue({ month: "2024-05" });
    queueSelect([{ make: "Honda" }]);

    const result = await getPopularMakes();

    expect(result).toEqual([{ make: "Honda" }]);
    expect(cacheLifeMock).toHaveBeenCalledWith("max");
    // Only the latest-month lookup tags the entry
    expect(cacheTagMock).toHaveBeenCalledWith("cars:months");
    expect(cacheTagMock).not.toHaveBeenCalledWith(
      expect.stringMatching(/^cars:year:/),
    );
  });

  it("falls back to calendar year when latest month query returns no results", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2022-08-15"));

    dbMock.query.cars.findFirst.mockResolvedValue({ month: "2022-01" });
    queueSelect([{ make: "Mazda" }]);

    try {
      const result = await getPopularMakes();
      expect(result).toEqual([{ make: "Mazda" }]);
    } finally {
      vi.useRealTimers();
    }
  });
});
