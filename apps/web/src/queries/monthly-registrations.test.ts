import { describe, expect, it } from "vitest";
import {
  getCarsComparison,
  getCarsData,
  getMonthlyRegistrationTotals,
  getMonthlyRegistrationTotalsByFuelType,
  getYearToDateByFuelType,
} from "./cars/monthly-registrations";
import {
  cacheLifeMock,
  cacheTagMock,
  queueBatch,
  queueSelect,
  resetDbMocks,
} from "./test-utils";

describe("monthly registration queries", () => {
  beforeEach(() => {
    resetDbMocks();
  });

  it("should aggregate monthly registrations by fuel and vehicle type", async () => {
    // Two grouped queries; the total is derived from the fuel type groups
    queueBatch([
      [
        { name: "Hybrid", count: 2 },
        { name: "Electric", count: 10 },
      ],
      [{ name: "SUV", count: 5 }],
    ]);

    const result = await getCarsData("2024-06");

    expect(result).toEqual({
      month: "2024-06",
      total: 12,
      fuelType: [
        { name: "Electric", count: 10 },
        { name: "Hybrid", count: 2 },
      ],
      vehicleType: [{ name: "SUV", count: 5 }],
    });
    expect(cacheLifeMock).toHaveBeenCalledWith("max");
    expect(cacheTagMock).toHaveBeenCalledWith("cars:month:2024-06");
  });

  it("should return 0 total when no data exists for month", async () => {
    queueBatch([[], []]);

    const result = await getCarsData("2099-01");

    expect(result.total).toBe(0);
    expect(result.fuelType).toEqual([]);
    expect(result.vehicleType).toEqual([]);
  });

  it("should drop groups that sum to nothing", async () => {
    queueBatch([
      [
        { name: "Electric", count: 10 },
        { name: "Diesel", count: 0 },
      ],
      [{ name: "SUV", count: 10 }],
    ]);

    const result = await getCarsData("2024-06");

    // The empty group still counts towards the total, as the old total query did
    expect(result.total).toBe(10);
    expect(result.fuelType).toEqual([{ name: "Electric", count: 10 }]);
  });

  it("should provide comparisons for previous month and year", async () => {
    // Two grouped queries spanning all three months, split by month here
    queueBatch([
      [
        { month: "2024-06", label: "Electric", count: 8 },
        { month: "2024-05", label: "Petrol", count: 3 },
      ],
      [
        { month: "2024-06", label: "SUV", count: 6 },
        { month: "2024-05", label: "Sedan", count: 4 },
      ],
    ]);

    const result = await getCarsComparison("2024-06");

    expect(result.currentMonth).toEqual({
      period: "2024-06",
      total: 8,
      fuelType: [{ label: "Electric", count: 8 }],
      vehicleType: [{ label: "SUV", count: 6 }],
    });
    expect(result.previousMonth).toEqual({
      period: "2024-05",
      total: 3,
      fuelType: [{ label: "Petrol", count: 3 }],
      vehicleType: [{ label: "Sedan", count: 4 }],
    });
    expect(result.previousYear).toEqual({
      period: "2023-06",
      total: 0,
      fuelType: [],
      vehicleType: [],
    });
    expect(cacheTagMock).toHaveBeenCalledWith("cars:month:2024-06");
  });

  it("should return 0 totals when no data exists for comparison periods", async () => {
    queueBatch([[], []]);

    const result = await getCarsComparison("2099-01");

    expect(result.currentMonth.total).toBe(0);
    expect(result.previousMonth.total).toBe(0);
    expect(result.previousYear.total).toBe(0);
  });

  it("should return monthly totals oldest first", async () => {
    // The query reads newest first; the series is reversed for the sparkline
    queueSelect([
      { month: "2024-03", total: 30 },
      { month: "2024-02", total: 20 },
    ]);

    const result = await getMonthlyRegistrationTotals();

    expect(result).toEqual([
      { month: "2024-02", total: 20 },
      { month: "2024-03", total: 30 },
    ]);
    expect(cacheTagMock).toHaveBeenCalledWith("cars:monthly-totals");
  });

  it("should report year-to-date registrations per fuel type", async () => {
    queueSelect([
      { name: "Electric", count: 40 },
      { name: "Petrol", count: 10 },
    ]);

    const result = await getYearToDateByFuelType(2024);

    expect(result).toEqual([
      { name: "Electric", count: 40 },
      { name: "Petrol", count: 10 },
    ]);
    expect(cacheTagMock).toHaveBeenCalledWith("cars:year:2024");
  });

  it("should tag the monthly series per fuel type", async () => {
    queueSelect([
      { month: "2024-03", total: 8 },
      { month: "2024-02", total: 5 },
    ]);

    const result = await getMonthlyRegistrationTotalsByFuelType("Electric");

    expect(result).toEqual([
      { month: "2024-02", total: 5 },
      { month: "2024-03", total: 8 },
    ]);
    expect(cacheTagMock).toHaveBeenCalledWith("cars:monthly-totals:Electric");
  });

  it("should treat a null sum as zero", async () => {
    queueSelect([{ month: "2024-02", total: null }]);

    const result = await getMonthlyRegistrationTotals();

    expect(result).toEqual([{ month: "2024-02", total: 0 }]);
  });
});
