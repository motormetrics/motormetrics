import {
  getFuelTypeData,
  getMakeDetails,
} from "@web/queries/cars/makes/entity-breakdowns";
import { queueBatch, resetDbMocks } from "@web/queries/test-utils";
import { describe, expect, it } from "vitest";

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
