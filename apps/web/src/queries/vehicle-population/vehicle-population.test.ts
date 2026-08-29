import { describe, expect, it } from "vitest";
import {
  cacheLifeMock,
  cacheTagMock,
  queueSelect,
  queueSelectDistinct,
  resetDbMocks,
} from "../test-utils";
import { getVehiclePopulationYears } from "./available-years";
import { getVehiclePopulationByCategoryAndFuelType } from "./by-category-and-fuel-type";
import { getVehiclePopulationByYearAndFuelType } from "./by-year-and-fuel-type";
import { getVehiclePopulationYearlyTotals } from "./yearly-totals";

describe("vehicle population queries", () => {
  beforeEach(() => {
    resetDbMocks();
  });

  describe("getVehiclePopulationYears", () => {
    it("should return distinct years in descending order", async () => {
      queueSelectDistinct([{ year: "2025" }, { year: "2024" }]);

      const result = await getVehiclePopulationYears();

      expect(result).toEqual([{ year: "2025" }, { year: "2024" }]);
      expect(cacheLifeMock).toHaveBeenCalledWith("max");
      expect(cacheTagMock).toHaveBeenCalledWith("vehicle-population:years");
    });

    it("should return empty array when no data exists", async () => {
      queueSelectDistinct([]);

      const result = await getVehiclePopulationYears();

      expect(result).toEqual([]);
    });
  });

  describe("getVehiclePopulationYearlyTotals", () => {
    it("should return yearly totals aggregated by year", async () => {
      queueSelect([
        { year: "2025", total: 990000 },
        { year: "2024", total: 960000 },
      ]);

      const result = await getVehiclePopulationYearlyTotals();

      expect(result).toEqual([
        { year: "2025", total: 990000 },
        { year: "2024", total: 960000 },
      ]);
      expect(cacheLifeMock).toHaveBeenCalledWith("max");
      expect(cacheTagMock).toHaveBeenCalledWith("vehicle-population:totals");
    });
  });

  describe("getVehiclePopulationByYearAndFuelType", () => {
    it("should return population grouped by year and fuel type", async () => {
      queueSelect([
        { year: "2025", fuelType: "Petrol", total: 500000 },
        { year: "2025", fuelType: "Electric", total: 40000 },
      ]);

      const result = await getVehiclePopulationByYearAndFuelType();

      expect(result).toEqual([
        { year: "2025", fuelType: "Petrol", total: 500000 },
        { year: "2025", fuelType: "Electric", total: 40000 },
      ]);
      expect(cacheLifeMock).toHaveBeenCalledWith("max");
      expect(cacheTagMock).toHaveBeenCalledWith("vehicle-population:totals");
    });
  });

  describe("getVehiclePopulationByCategoryAndFuelType", () => {
    it("should return population grouped by year, category and fuel type", async () => {
      queueSelect([
        { year: "2025", category: "Cars", fuelType: "Petrol", total: 500000 },
        {
          year: "2025",
          category: "Motorcycles",
          fuelType: "Petrol",
          total: 130000,
        },
      ]);

      const result = await getVehiclePopulationByCategoryAndFuelType();

      expect(result).toEqual([
        { year: "2025", category: "Cars", fuelType: "Petrol", total: 500000 },
        {
          year: "2025",
          category: "Motorcycles",
          fuelType: "Petrol",
          total: 130000,
        },
      ]);
      expect(cacheLifeMock).toHaveBeenCalledWith("max");
      expect(cacheTagMock).toHaveBeenCalledWith("vehicle-population:totals");
    });

    it("should return an empty array when no data exists", async () => {
      queueSelect([]);

      await expect(
        getVehiclePopulationByCategoryAndFuelType(),
      ).resolves.toEqual([]);
    });
  });
});
