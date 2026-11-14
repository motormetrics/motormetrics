import { sparkPath } from "@web/app/(main)/(dashboard)/components/coe-figures";
import { describe, expect, it } from "vitest";

describe("sparkPath", () => {
  it("should span the box with the high at the top and the low at the bottom", () => {
    expect(sparkPath([10, 20, 15])).toBe(
      "M0.00 36.00 L50.00 4.00 L100.00 20.00",
    );
  });

  it("should draw a flat series along the bottom without dividing by zero", () => {
    expect(sparkPath([5, 5])).toBe("M0.00 36.00 L100.00 36.00");
  });
});
