import { changeRatio, percentageChange } from "@web/utils/change-ratio";
import { describe, expect, it } from "vitest";

describe("changeRatio", () => {
  it("should return the signed relative change", () => {
    expect(changeRatio(110, 100)).toBeCloseTo(0.1);
    expect(changeRatio(90, 100)).toBeCloseTo(-0.1);
  });

  it("should return zero without a usable baseline", () => {
    expect(changeRatio(100, undefined)).toBe(0);
    expect(changeRatio(100, 0)).toBe(0);
  });
});

describe("percentageChange", () => {
  it("should return the signed change as a percentage", () => {
    expect(percentageChange(110, 100)).toBeCloseTo(10);
    expect(percentageChange(90, 100)).toBeCloseTo(-10);
  });

  it("should read an absent base as flat", () => {
    expect(percentageChange(100, 0)).toBe(0);
  });
});
