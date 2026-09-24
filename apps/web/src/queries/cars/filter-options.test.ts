import {
  getCarsMonths,
  getDistinctFuelTypes,
  getDistinctMakes,
  getDistinctVehicleTypes,
} from "@web/queries/cars/filter-options";
import {
  cacheLifeMock,
  cacheTagMock,
  queueSelect,
  queueSelectDistinct,
  resetDbMocks,
} from "@web/queries/test-utils";

describe("car filter option queries", () => {
  beforeEach(() => {
    resetDbMocks();
  });

  it("should return distinct makes from the database", async () => {
    queueSelectDistinct([{ make: "Audi" }, { make: "Tesla" }]);

    await expect(getDistinctMakes()).resolves.toEqual([
      { make: "Audi" },
      { make: "Tesla" },
    ]);
  });

  it("should return fuel types with registrations > 0 for a given month", async () => {
    queueSelect([
      { fuelType: "Electric" },
      { fuelType: "Hybrid" },
      { fuelType: "Petrol" },
    ]);

    const result = await getDistinctFuelTypes("2024-04");

    expect(result).toEqual([
      { fuelType: "Electric" },
      { fuelType: "Hybrid" },
      { fuelType: "Petrol" },
    ]);
  });

  it("should return fuel types with registrations > 0 without month filter", async () => {
    queueSelect([{ fuelType: "Electric" }, { fuelType: "Diesel" }]);

    const result = await getDistinctFuelTypes();

    expect(result).toEqual([{ fuelType: "Electric" }, { fuelType: "Diesel" }]);
  });

  it("should return vehicle types with registrations > 0 for a given month", async () => {
    queueSelect([{ vehicleType: "Cars" }, { vehicleType: "Motor cycles" }]);

    const result = await getDistinctVehicleTypes("2024-01");

    expect(result).toEqual([
      { vehicleType: "Cars" },
      { vehicleType: "Motor cycles" },
    ]);
  });

  it("should return vehicle types with registrations > 0 without month filter", async () => {
    queueSelect([{ vehicleType: "Cars" }, { vehicleType: "Goods Vehicles" }]);

    const result = await getDistinctVehicleTypes();

    expect(result).toEqual([
      { vehicleType: "Cars" },
      { vehicleType: "Goods Vehicles" },
    ]);
  });

  it("should return distinct months and register cache metadata", async () => {
    queueSelectDistinct([{ month: "2024-06" }, { month: "2024-05" }]);

    const result = await getCarsMonths();

    expect(result).toEqual([{ month: "2024-06" }, { month: "2024-05" }]);
    expect(cacheLifeMock).toHaveBeenCalledWith("max");
    expect(cacheTagMock).toHaveBeenCalledWith("cars:months");
  });
});
