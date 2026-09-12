import { describe, expect, it } from "vitest";
import {
  getEvLatestSummary,
  getEvMakeDetails,
  getEvMarketShare,
  getEvMonthlyTrend,
  getEvTopMakes,
} from "./cars/electric-vehicles";
import { cacheLifeMock, queueSelect, resetDbMocks } from "./test-utils";

describe("electric vehicle queries", () => {
  beforeEach(() => {
    resetDbMocks();
  });

  it("should split registrations into BEV, PHEV and hybrid", async () => {
    queueSelect([
      { month: "2024-01", fuelType: "Electric", count: 10 },
      { month: "2024-01", fuelType: "Petrol-Electric", count: 4 },
      { month: "2024-01", fuelType: "Petrol-Electric (Plug-In)", count: 2 },
    ]);

    const result = await getEvMonthlyTrend();

    expect(result).toEqual([{ month: "2024-01", BEV: 10, PHEV: 2, Hybrid: 4 }]);
    expect(cacheLifeMock).toHaveBeenCalledWith("max");
  });

  it("should measure the electrified share against every fuel type", async () => {
    queueSelect([
      { month: "2024-01", fuelType: "Electric", count: 20 },
      { month: "2024-01", fuelType: "Petrol", count: 80 },
    ]);

    const result = await getEvMarketShare();

    expect(result).toEqual([
      { month: "2024-01", evCount: 20, totalCount: 100, evShare: 20 },
    ]);
  });

  it("should omit months with no electrified registrations", async () => {
    queueSelect([
      { month: "2024-01", fuelType: "Electric", count: 20 },
      { month: "2024-02", fuelType: "Petrol", count: 50 },
    ]);

    const result = await getEvMarketShare();

    expect(result.map((entry) => entry.month)).toEqual(["2024-01"]);
  });

  it("should summarise the latest month by make", async () => {
    // 1. latest month carrying electrified registrations, 2. that month's rows
    queueSelect(
      [{ month: "2024-06" }],
      [
        { make: "BYD", fuelType: "Electric", count: 10 },
        { make: "Tesla", fuelType: "Electric", count: 30 },
        { make: "Toyota", fuelType: "Petrol", count: 60 },
      ],
    );

    const result = await getEvLatestSummary();

    expect(result).toEqual({
      month: "2024-06",
      totalEv: 40,
      evSharePercent: 40,
      bevCount: 40,
      topMake: "Tesla",
    });
  });

  it("should return null when no electrified registrations exist", async () => {
    queueSelect([]);

    expect(await getEvLatestSummary()).toBeNull();
  });

  it("should rank makes for the latest month", async () => {
    queueSelect([{ month: "2024-06" }], [{ make: "Tesla", count: 30 }]);

    expect(await getEvTopMakes()).toEqual([{ make: "Tesla", count: 30 }]);
  });

  it("should break each make down by electrification type", async () => {
    queueSelect(
      [{ month: "2024-06" }],
      [
        { make: "Tesla", fuelType: "Electric", count: 30 },
        { make: "Toyota", fuelType: "Petrol-Electric", count: 12 },
        { make: "Toyota", fuelType: "Petrol-Electric (Plug-In)", count: 3 },
      ],
    );

    // Largest total first
    expect(await getEvMakeDetails()).toEqual([
      { make: "Tesla", bev: 30, phev: 0, hybrid: 0, total: 30 },
      { make: "Toyota", bev: 0, phev: 3, hybrid: 12, total: 15 },
    ]);
  });

  it("should return an empty list when no month has electrified data", async () => {
    queueSelect([]);

    expect(await getEvMakeDetails()).toEqual([]);
  });
});
