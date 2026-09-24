import {
  checkFuelTypeIfExist,
  checkVehicleTypeIfExist,
} from "@web/queries/cars/makes/entity-checks";
import { dbMock, resetDbMocks } from "@web/queries/test-utils";
import { describe, expect, it, vi } from "vitest";

describe("entity existence checks", () => {
  beforeEach(() => {
    resetDbMocks();
  });

  it("returns undefined when fuel type does not exist", async () => {
    vi.mocked(dbMock.query.cars.findFirst).mockResolvedValueOnce(undefined);

    await expect(checkFuelTypeIfExist("hydrogen")).resolves.toBeUndefined();
  });

  it("returns vehicle type when available", async () => {
    vi.mocked(dbMock.query.cars.findFirst).mockResolvedValueOnce({
      vehicleType: "Sedan",
    });

    await expect(checkVehicleTypeIfExist("sedan")).resolves.toEqual({
      vehicleType: "Sedan",
    });
  });
});
