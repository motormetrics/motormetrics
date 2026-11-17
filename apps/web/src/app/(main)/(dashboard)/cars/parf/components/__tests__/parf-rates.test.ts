import {
  AGE_BRACKETS,
  calculateParf,
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
