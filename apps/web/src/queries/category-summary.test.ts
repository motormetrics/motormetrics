import { beforeEach, describe, expect, it, vi } from "vitest";
import { getCategorySummaryByYear } from "./cars/category-summary";
import {
  cacheLifeMock,
  cacheTagMock,
  queueSelect,
  resetDbMocks,
} from "./test-utils";

describe("category summary queries", () => {
  beforeEach(() => {
    resetDbMocks();
  });

  it("should return category summary for current year", async () => {
    // Queue: 1) latest month carrying registrations, 2) totals per fuel type
    queueSelect(
      [{ month: "2024-11" }],
      [
        { fuelType: "Petrol", total: 60000 },
        { fuelType: "Electric", total: 15000 },
        { fuelType: "Petrol-Electric", total: 20000 },
        { fuelType: "Diesel-Electric (Plug-In)", total: 5000 },
      ],
    );

    const result = await getCategorySummaryByYear();

    expect(result).toEqual({
      year: 2024,
      total: 100000,
      electric: 15000,
      hybrid: 25000,
    });
    expect(cacheLifeMock).toHaveBeenCalledWith("max");
    expect(cacheTagMock).toHaveBeenCalledWith(
      "cars:annual",
      "cars:fuel:electric",
      "cars:fuel:hybrid",
    );
  });

  it("should return category summary for explicit year", async () => {
    // An explicit year skips the latest-month lookup, so there is one query
    queueSelect([
      { fuelType: "Petrol", total: 60000 },
      { fuelType: "Electric", total: 10000 },
      { fuelType: "Petrol-Electric", total: 20000 },
    ]);

    const result = await getCategorySummaryByYear(2023);

    expect(result).toEqual({
      year: 2023,
      total: 90000,
      electric: 10000,
      hybrid: 20000,
    });
    expect(cacheTagMock).toHaveBeenCalledWith("cars:year:2023");
  });

  it("should return default values when no data exists", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-06-15"));

    // The latest-month lookup comes back empty, so no second query runs
    queueSelect([]);

    const result = await getCategorySummaryByYear();

    expect(result.year).toBe(2024);
    expect(result.total).toBe(0);
    expect(result.electric).toBe(0);
    expect(result.hybrid).toBe(0);

    vi.useRealTimers();
  });
});
