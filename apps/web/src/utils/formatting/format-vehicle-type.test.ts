import { formatVehicleType } from "@web/utils/formatting/format-vehicle-type";
import { describe, expect, it } from "vitest";

describe("formatVehicleType", () => {
  it("should return mapped vehicle type", () => {
    expect(formatVehicleType("Multi-purpose Vehicle")).toBe("MPV");
    expect(formatVehicleType("Sports Utility Vehicle")).toBe("SUV");
  });

  it("should return original type when not in map", () => {
    expect(formatVehicleType("Unknown")).toBe("Unknown");
  });
});
