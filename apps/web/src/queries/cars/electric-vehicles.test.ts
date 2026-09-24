import {
  getEvMarketShare,
  getEvMonthlyTrend,
} from "@web/queries/cars/electric-vehicles";
import {
  cacheLifeMock,
  queueSelect,
  resetDbMocks,
} from "@web/queries/test-utils";
import { describe, expect, it } from "vitest";

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
});
