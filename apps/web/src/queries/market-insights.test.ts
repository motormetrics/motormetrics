import { describe, expect, it, vi } from "vitest";
import {
  cacheLifeMock,
  cacheTagMock,
  queueBatch,
  queueSelect,
  resetDbMocks,
} from "./test-utils";

vi.mock("@web/queries/cars/monthly-registrations", () => ({
  getCarsData: vi.fn(),
}));

import { getCarsData } from "@web/queries/cars/monthly-registrations";
import * as marketInsights from "./cars/market-insights";

const mockedGetCarsData = vi.mocked(getCarsData);

describe("car market insight queries", () => {
  beforeEach(() => {
    resetDbMocks();
    mockedGetCarsData.mockReset();
  });

  it("returns the top fuel and vehicle types", async () => {
    // getTopTypes uses db.batch with 2 queries
    queueBatch([
      [{ name: "Electric", total: 60 }],
      [{ name: "SUV", total: 40 }],
    ]);

    const result = await marketInsights.getTopTypes("2024-04");

    expect(result).toEqual({
      month: "2024-04",
      topFuelType: { name: "Electric", total: 60 },
      topVehicleType: { name: "SUV", total: 40 },
    });
    expect(cacheLifeMock).toHaveBeenCalledWith("max");
    expect(cacheTagMock).toHaveBeenCalledWith("cars:month:2024-04");
  });

  it("falls back to placeholder entries when no types exist", async () => {
    queueBatch([[], []]);

    const result = await marketInsights.getTopTypes("2024-05");

    expect(result.topFuelType).toEqual({ name: "N/A", total: 0 });
    expect(result.topVehicleType).toEqual({ name: "N/A", total: 0 });
  });

  it("returns top makes for the month", async () => {
    queueSelect([{ make: "Toyota", total: 15 }]);

    const result = await marketInsights.getTopMakes("2024-05");

    expect(result).toEqual([{ make: "Toyota", total: 15 }]);
  });

  it("groups top makes for every fuel type", async () => {
    // A single grouped query returns every fuel type / make pair for the month
    queueSelect([
      { fuelType: "Hybrid", make: "Toyota", count: 20 },
      { fuelType: "Electric", make: "Tesla", count: 80 },
      { fuelType: "Electric", make: "BYD", count: 20 },
    ]);

    const result = await marketInsights.getTopMakesByFuelType("2024-06");

    // Fuel types ordered by their total, makes ordered within each
    expect(result).toEqual([
      {
        fuelType: "Electric",
        total: 100,
        makes: [
          { make: "Tesla", count: 80 },
          { make: "BYD", count: 20 },
        ],
      },
      {
        fuelType: "Hybrid",
        total: 20,
        makes: [{ make: "Toyota", count: 20 }],
      },
    ]);
    expect(cacheTagMock).toHaveBeenCalledWith("cars:month:2024-06");
  });

  it("reports every make in the fuel type total but only the top five", async () => {
    queueSelect(
      Array.from({ length: 7 }, (_, index) => ({
        fuelType: "Electric",
        make: `Make ${index}`,
        count: index + 1,
      })),
    );

    const [electric] = await marketInsights.getTopMakesByFuelType("2024-06");

    expect(electric.total).toBe(28);
    expect(electric.makes).toEqual([
      { make: "Make 6", count: 7 },
      { make: "Make 5", count: 6 },
      { make: "Make 4", count: 5 },
      { make: "Make 3", count: 4 },
      { make: "Make 2", count: 3 },
    ]);
  });

  it("computes market share breakdowns from cached data", async () => {
    mockedGetCarsData.mockResolvedValue({
      month: "2024-07",
      total: 100,
      fuelType: [
        { name: "Electric", count: 60 },
        { name: "Hybrid", count: 40 },
      ],
      vehicleType: [],
    });

    const result = await marketInsights.getCarMarketShareData(
      "2024-07",
      "fuelType",
    );

    expect(result).toMatchObject({
      month: "2024-07",
      total: 100,
      category: "fuelType",
      dominantType: { name: "Electric", percentage: 60 },
    });
    expect(result.data).toHaveLength(2);
  });
});
