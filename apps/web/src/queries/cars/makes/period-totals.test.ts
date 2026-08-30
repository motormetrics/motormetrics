import { describe, expect, it } from "vitest";
import {
  cacheLifeMock,
  cacheTagMock,
  queueSelect,
  resetDbMocks,
} from "../../test-utils";
import {
  getMakeCrossTab,
  getMakeTotalsInRange,
  getMarketMonthlyTotals,
} from "./period-totals";

describe("make period totals", () => {
  beforeEach(() => {
    resetDbMocks();
  });

  describe("getMakeCrossTab", () => {
    it("should return every month, fuel type and vehicle type cell", async () => {
      queueSelect([
        {
          count: 120,
          fuelType: "Petrol",
          month: "2024-03",
          vehicleType: "Sports Utility Vehicle",
        },
        {
          count: 40,
          fuelType: "Electric",
          month: "2024-03",
          vehicleType: "Hatchback",
        },
      ]);

      const result = await getMakeCrossTab("Toyota");

      expect(result).toHaveLength(2);
      expect(cacheLifeMock).toHaveBeenCalledWith("max");
      expect(cacheTagMock).toHaveBeenCalledWith("cars:make:Toyota");
    });

    it("should drop cells with no registrations", async () => {
      queueSelect([
        {
          count: 0,
          fuelType: "Diesel",
          month: "2024-03",
          vehicleType: "Hatchback",
        },
        {
          count: 12,
          fuelType: "Petrol",
          month: "2024-03",
          vehicleType: "Hatchback",
        },
      ]);

      const result = await getMakeCrossTab("Toyota");

      expect(result).toEqual([
        {
          count: 12,
          fuelType: "Petrol",
          month: "2024-03",
          vehicleType: "Hatchback",
        },
      ]);
    });
  });

  describe("getMakeTotalsInRange", () => {
    it("should return every make's total over the window", async () => {
      queueSelect([
        { count: 900, make: "TOYOTA" },
        { count: 400, make: "BMW" },
      ]);

      const result = await getMakeTotalsInRange("2024-01", "2024-12");

      expect(result).toEqual([
        { count: 900, make: "TOYOTA" },
        { count: 400, make: "BMW" },
      ]);
      expect(cacheLifeMock).toHaveBeenCalledWith("max");
      expect(cacheTagMock).toHaveBeenCalledWith("cars:makes");
    });

    it("should drop makes with no registrations in the window", async () => {
      queueSelect([
        { count: 900, make: "TOYOTA" },
        { count: 0, make: "LOTUS" },
      ]);

      const result = await getMakeTotalsInRange("2024-01", "2024-12");

      expect(result).toEqual([{ count: 900, make: "TOYOTA" }]);
    });
  });

  describe("getMarketMonthlyTotals", () => {
    it("should return all-cars totals per month", async () => {
      queueSelect([
        { month: "2024-01", total: 3000 },
        { month: "2024-02", total: 3200 },
      ]);

      const result = await getMarketMonthlyTotals("2024-01", "2024-02");

      expect(result).toEqual([
        { month: "2024-01", total: 3000 },
        { month: "2024-02", total: 3200 },
      ]);
      expect(cacheLifeMock).toHaveBeenCalledWith("max");
      expect(cacheTagMock).toHaveBeenCalledWith("cars:monthly-totals");
    });
  });
});
