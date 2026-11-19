import { describe, expect, it } from "vitest";
import { formatGrowthRate } from "./format-growth-rate";

describe("formatGrowthRate", () => {
  it("should add + sign for positive values", () => {
    expect(formatGrowthRate(5.5)).toBe("+5.5%");
    expect(formatGrowthRate(100)).toBe("+100.0%");
  });

  it("should not add sign for negative values", () => {
    expect(formatGrowthRate(-3.2)).toBe("-3.2%");
    expect(formatGrowthRate(-100)).toBe("-100.0%");
  });

  it("should handle zero", () => {
    expect(formatGrowthRate(0)).toBe("0.0%");
  });

  it("should round to 1 decimal place", () => {
    expect(formatGrowthRate(5.56)).toBe("+5.6%");
    expect(formatGrowthRate(-3.14)).toBe("-3.1%");
  });
});
