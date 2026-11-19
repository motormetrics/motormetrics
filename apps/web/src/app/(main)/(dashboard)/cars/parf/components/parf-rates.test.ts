import {
  AGE_BRACKETS,
  calculateParf,
  uniformRateCut,
} from "@web/app/(main)/(dashboard)/cars/parf/components/parf-rates";
import { describe, expect, it } from "vitest";

const [youngest] = AGE_BRACKETS;
const oldest = AGE_BRACKETS[AGE_BRACKETS.length - 1];

describe("calculateParf", () => {
  it("should apply each schedule's rate below the caps", () => {
    expect(calculateParf(40_000, youngest)).toEqual({
      newCapped: false,
      newRebate: 12_000,
      oldCapped: false,
      oldRebate: 30_000,
      oldUncapped: 30_000,
      shortfall: 18_000,
    });
  });

  it("should cap each schedule at its own limit", () => {
    const result = calculateParf(200_000, youngest);

    expect(result.oldRebate).toBe(60_000);
    expect(result.oldUncapped).toBe(150_000);
    expect(result.newRebate).toBe(30_000);
    expect(result.oldCapped).toBe(true);
    expect(result.newCapped).toBe(true);
  });

  it("should pay nothing over 10 years under either schedule", () => {
    const result = calculateParf(80_000, oldest);

    expect(result.oldRebate).toBe(0);
    expect(result.newRebate).toBe(0);
    expect(result.shortfall).toBe(0);
  });
});

describe("uniformRateCut", () => {
  it("should return the cut when every paying bracket falls by the same amount", () => {
    expect(uniformRateCut(AGE_BRACKETS)).toBe(45);
  });

  it("should return null when the cuts differ", () => {
    expect(
      uniformRateCut([
        { key: "a", label: "A", newRate: 0.3, oldRate: 0.75 },
        { key: "b", label: "B", newRate: 0.3, oldRate: 0.7 },
      ]),
    ).toBeNull();
  });
});
