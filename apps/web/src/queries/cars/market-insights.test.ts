import * as marketInsights from "@web/queries/cars/market-insights";
import {
  cacheTagMock,
  queueSelect,
  resetDbMocks,
} from "@web/queries/test-utils";
import { describe, expect, it } from "vitest";

describe("car market insight queries", () => {
  beforeEach(() => {
    resetDbMocks();
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
});
