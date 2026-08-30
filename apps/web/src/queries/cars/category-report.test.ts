import { describe, expect, it } from "vitest";
import {
  cacheLifeMock,
  cacheTagMock,
  queueSelect,
  resetDbMocks,
} from "../test-utils";
import {
  getCategoryMonthlySeries,
  getCategoryTotals,
  getElectricShareByVehicleType,
  getTopMakesByCategory,
} from "./category-report";

describe("category report queries", () => {
  beforeEach(() => {
    resetDbMocks();
  });

  describe("getCategoryTotals", () => {
    it("should return registrations per fuel type across the months", async () => {
      queueSelect([
        { name: "Petrol", count: 2000 },
        { name: "Electric", count: 800 },
      ]);

      const result = await getCategoryTotals("fuelType", ["2024-03"]);

      expect(result).toEqual([
        { name: "Petrol", count: 2000 },
        { name: "Electric", count: 800 },
      ]);
      expect(cacheLifeMock).toHaveBeenCalledWith("max");
      expect(cacheTagMock).toHaveBeenCalledWith("cars:month:2024-03");
    });

    it("should tag every month it reads", async () => {
      queueSelect([{ name: "Hatchback", count: 500 }]);

      await getCategoryTotals("vehicleType", ["2024-02", "2024-03"]);

      expect(cacheTagMock).toHaveBeenCalledWith(
        "cars:month:2024-02",
        "cars:month:2024-03",
      );
    });

    it("should return an empty array without reading when no months are given", async () => {
      const result = await getCategoryTotals("fuelType", []);

      expect(result).toEqual([]);
    });
  });

  describe("getCategoryMonthlySeries", () => {
    it("should return the per-month, per-type series", async () => {
      queueSelect([
        { month: "2024-02", name: "Petrol", count: 900 },
        { month: "2024-03", name: "Petrol", count: 1000 },
      ]);

      const result = await getCategoryMonthlySeries("fuelType", [
        "2024-02",
        "2024-03",
      ]);

      expect(result).toEqual([
        { month: "2024-02", name: "Petrol", count: 900 },
        { month: "2024-03", name: "Petrol", count: 1000 },
      ]);
      expect(cacheLifeMock).toHaveBeenCalledWith("max");
    });

    it("should return an empty array when no months are given", async () => {
      const result = await getCategoryMonthlySeries("vehicleType", []);

      expect(result).toEqual([]);
    });
  });

  describe("getTopMakesByCategory", () => {
    it("should rank types by total and keep the leading makes", async () => {
      queueSelect([
        { name: "Petrol", make: "TOYOTA", count: 500 },
        { name: "Electric", make: "TESLA", count: 400 },
        { name: "Petrol", make: "HONDA", count: 300 },
        { name: "Electric", make: "BYD", count: 200 },
      ]);

      const result = await getTopMakesByCategory("fuelType", ["2024-03"]);

      expect(result).toEqual([
        {
          name: "Petrol",
          total: 800,
          makes: [
            { count: 500, make: "TOYOTA" },
            { count: 300, make: "HONDA" },
          ],
        },
        {
          name: "Electric",
          total: 600,
          makes: [
            { count: 400, make: "TESLA" },
            { count: 200, make: "BYD" },
          ],
        },
      ]);
    });

    it("should cap the makes per type while still counting them in the total", async () => {
      queueSelect([
        { name: "Petrol", make: "TOYOTA", count: 500 },
        { name: "Petrol", make: "HONDA", count: 300 },
        { name: "Petrol", make: "MAZDA", count: 100 },
      ]);

      const result = await getTopMakesByCategory("fuelType", ["2024-03"], 2);

      expect(result[0].makes).toEqual([
        { count: 500, make: "TOYOTA" },
        { count: 300, make: "HONDA" },
      ]);
      expect(result[0].total).toBe(900);
    });

    it("should skip makes with no registrations", async () => {
      queueSelect([
        { name: "Petrol", make: "TOYOTA", count: 500 },
        { name: "Diesel", make: "ISUZU", count: 0 },
      ]);

      const result = await getTopMakesByCategory("fuelType", ["2024-03"]);

      expect(result).toEqual([
        { name: "Petrol", total: 500, makes: [{ count: 500, make: "TOYOTA" }] },
      ]);
    });

    it("should return an empty array when no months are given", async () => {
      const result = await getTopMakesByCategory("fuelType", []);

      expect(result).toEqual([]);
    });
  });

  describe("getElectricShareByVehicleType", () => {
    it("should return the battery-electric count beside the total", async () => {
      queueSelect([
        { name: "Sports Utility Vehicle", electric: 200, total: 1000 },
        { name: "Hatchback", electric: 50, total: 400 },
      ]);

      const result = await getElectricShareByVehicleType(["2024-03"]);

      expect(result).toEqual([
        { name: "Sports Utility Vehicle", electric: 200, total: 1000 },
        { name: "Hatchback", electric: 50, total: 400 },
      ]);
      expect(cacheTagMock).toHaveBeenCalledWith("cars:month:2024-03");
    });

    it("should return an empty array when no months are given", async () => {
      const result = await getElectricShareByVehicleType([]);

      expect(result).toEqual([]);
    });
  });
});
