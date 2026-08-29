import { describe, expect, it } from "vitest";
import {
  cacheLifeMock,
  cacheTagMock,
  queueSelect,
  resetDbMocks,
} from "../test-utils";
import {
  getTypeCrossMixInWindow,
  getTypeDistributionInWindow,
  getTypeMakesInWindow,
  getTypeMonthlySeries,
} from "./type-detail";

describe("type detail queries", () => {
  beforeEach(() => {
    resetDbMocks();
  });

  describe("getTypeMonthlySeries", () => {
    it("should return the series oldest first", async () => {
      queueSelect([
        { month: "2024-03", count: 300, total: 3000 },
        { month: "2024-02", count: 250, total: 2800 },
      ]);

      const result = await getTypeMonthlySeries(
        "fuelType",
        "Electric",
        "2024-03",
      );

      expect(result).toEqual([
        { month: "2024-02", count: 250, total: 2800 },
        { month: "2024-03", count: 300, total: 3000 },
      ]);
      expect(cacheLifeMock).toHaveBeenCalledWith("max");
      expect(cacheTagMock).toHaveBeenCalledWith(
        "cars:month:2024-03",
        "cars:fuel:Electric",
      );
    });

    it("should tag the vehicle dimension by its own family", async () => {
      queueSelect([]);

      await getTypeMonthlySeries("vehicleType", "Hatchback", "2024-03", 6);

      expect(cacheTagMock).toHaveBeenCalledWith(
        "cars:month:2024-03",
        "cars:vehicle:Hatchback",
      );
    });
  });

  describe("getTypeDistributionInWindow", () => {
    it("should return every value of the dimension, largest first", async () => {
      queueSelect([
        { name: "Petrol", count: 2000 },
        { name: "Electric", count: 800 },
      ]);

      const result = await getTypeDistributionInWindow(
        "fuelType",
        "2024-01",
        "2024-12",
      );

      expect(result).toEqual([
        { name: "Petrol", count: 2000 },
        { name: "Electric", count: 800 },
      ]);
      expect(cacheTagMock).toHaveBeenCalledWith(
        "cars:month:2024-12",
        "cars:annual",
      );
    });

    it("should drop rows with no type recorded", async () => {
      queueSelect([
        { name: "Petrol", count: 2000 },
        { name: null, count: 40 },
      ]);

      const result = await getTypeDistributionInWindow(
        "fuelType",
        "2024-01",
        "2024-12",
      );

      expect(result).toEqual([{ name: "Petrol", count: 2000 }]);
    });
  });

  describe("getTypeMakesInWindow", () => {
    it("should return the type's makes over the window", async () => {
      queueSelect([
        { make: "TESLA", count: 400 },
        { make: "BYD", count: 200 },
      ]);

      const result = await getTypeMakesInWindow(
        "fuelType",
        "Electric",
        "2024-01",
        "2024-12",
      );

      expect(result).toEqual([
        { make: "TESLA", count: 400 },
        { make: "BYD", count: 200 },
      ]);
      expect(cacheTagMock).toHaveBeenCalledWith(
        "cars:month:2024-12",
        "cars:fuel:Electric",
      );
    });
  });

  describe("getTypeCrossMixInWindow", () => {
    it("should split one type across the other dimension", async () => {
      queueSelect([
        { name: "Sports Utility Vehicle", count: 300 },
        { name: "Hatchback", count: 100 },
      ]);

      const result = await getTypeCrossMixInWindow(
        "fuelType",
        "Electric",
        "2024-01",
        "2024-12",
      );

      expect(result).toEqual([
        { name: "Sports Utility Vehicle", count: 300 },
        { name: "Hatchback", count: 100 },
      ]);
    });

    it("should cross a vehicle type against fuel types and drop unrecorded ones", async () => {
      queueSelect([
        { name: "Petrol", count: 500 },
        { name: null, count: 10 },
      ]);

      const result = await getTypeCrossMixInWindow(
        "vehicleType",
        "Hatchback",
        "2024-01",
        "2024-12",
      );

      expect(result).toEqual([{ name: "Petrol", count: 500 }]);
      expect(cacheTagMock).toHaveBeenCalledWith(
        "cars:month:2024-12",
        "cars:vehicle:Hatchback",
      );
    });
  });
});
