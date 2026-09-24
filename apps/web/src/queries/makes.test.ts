import { describe, expect, it, vi } from "vitest";
import { getPopularMakes } from "./cars/makes/current-year-popular-makes";
import {
  getFuelTypeData,
  getMakeDetails,
} from "./cars/makes/entity-breakdowns";
import {
  checkFuelTypeIfExist,
  checkVehicleTypeIfExist,
} from "./cars/makes/entity-checks";
import {
  cacheLifeMock,
  cacheTagMock,
  dbMock,
  queueBatch,
  queueSelect,
  resetDbMocks,
} from "./test-utils";

describe("car make breakdown queries", () => {
  beforeEach(() => {
    resetDbMocks();
  });

  it("returns make details with summed totals", async () => {
    // getMakeDetails now uses db.batch with 2 queries
    queueBatch([
      [{ total: 42 }],
      [
        {
          month: "2024-01",
          fuelType: "Hybrid",
          vehicleType: "SUV",
          count: 42,
        },
      ],
    ]);

    const result = await getMakeDetails("toyota-prius", "2024-01");

    expect(result).toEqual({
      total: 42,
      data: [
        {
          month: "2024-01",
          fuelType: "Hybrid",
          vehicleType: "SUV",
          count: 42,
        },
      ],
    });
  });

  it("returns fuel type aggregates for battery electric vehicles", async () => {
    // getFuelTypeData now uses db.batch with 2 queries
    queueBatch([
      [{ total: 12 }],
      [{ month: "2024-02", make: "Tesla", fuelType: "Electric", count: 12 }],
    ]);

    const result = await getFuelTypeData("battery-electric", "2024-02");

    expect(result).toEqual({
      total: 12,
      data: [
        {
          month: "2024-02",
          make: "Tesla",
          fuelType: "Electric",
          count: 12,
        },
      ],
    });
  });

  it("should return fuel type data without month filter", async () => {
    queueBatch([
      [{ total: 25 }],
      [{ month: "2024-01", make: "Tesla", fuelType: "Electric", count: 25 }],
    ]);

    const result = await getFuelTypeData("electric");

    expect(result).toEqual({
      total: 25,
      data: [
        { month: "2024-01", make: "Tesla", fuelType: "Electric", count: 25 },
      ],
    });
  });

  it("should return zero total when no results match", async () => {
    queueBatch([[{ total: null }], []]);

    const result = await getFuelTypeData("nonexistent");

    expect(result).toEqual({ total: 0, data: [] });
  });
});

describe("entity existence checks", () => {
  beforeEach(() => {
    resetDbMocks();
  });

  it("returns undefined when fuel type does not exist", async () => {
    vi.mocked(dbMock.query.cars.findFirst).mockResolvedValueOnce(undefined);

    await expect(checkFuelTypeIfExist("hydrogen")).resolves.toBeUndefined();
  });

  it("returns vehicle type when available", async () => {
    vi.mocked(dbMock.query.cars.findFirst).mockResolvedValueOnce({
      vehicleType: "Sedan",
    });

    await expect(checkVehicleTypeIfExist("sedan")).resolves.toEqual({
      vehicleType: "Sedan",
    });
  });
});

describe("popular makes queries", () => {
  beforeEach(() => {
    resetDbMocks();
  });

  it("returns popular makes for a provided year", async () => {
    queueSelect([{ make: "Tesla" }, { make: "BMW" }]);

    const result = await getPopularMakes("2023");

    expect(result).toEqual([{ make: "Tesla" }, { make: "BMW" }]);
    expect(cacheLifeMock).toHaveBeenCalledWith("max");
    expect(cacheTagMock).toHaveBeenCalledWith("cars:year:2023");
  });

  it("loads current year when year argument is omitted", async () => {
    queueSelect([{ latestMonth: "2024-05" }], [{ make: "Honda" }]);

    const result = await getPopularMakes();

    expect(result).toEqual([{ make: "Honda" }]);
    // cacheTag is only called when year is explicitly provided
    expect(cacheTagMock).not.toHaveBeenCalled();
  });

  it("falls back to calendar year when latest month query returns no results", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2022-08-15"));

    queueSelect([{ latestMonth: "2022-01" }], [{ make: "Mazda" }]);

    try {
      const result = await getPopularMakes();
      expect(result).toEqual([{ make: "Mazda" }]);
    } finally {
      vi.useRealTimers();
    }
  });
});
