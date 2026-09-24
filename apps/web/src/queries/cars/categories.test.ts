import { describe, expect, it } from "vitest";
import { FUEL_TYPE, VEHICLE_TYPE } from "./categories";

describe("categories queries", () => {
  describe("type configs", () => {
    it("should have correct FUEL_TYPE config", () => {
      expect(FUEL_TYPE.fieldName).toBe("fuelType");
    });

    it("should have correct VEHICLE_TYPE config", () => {
      expect(VEHICLE_TYPE.fieldName).toBe("vehicleType");
    });
  });
});
