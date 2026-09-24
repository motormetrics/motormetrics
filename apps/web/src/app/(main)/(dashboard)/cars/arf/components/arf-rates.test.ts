import { describe, expect, it } from "vitest";
import { ARF_SCHEDULES, calculateArf } from "./arf-rates";

const [current, from2022, before2022] = ARF_SCHEDULES;

describe("calculateArf", () => {
  it("should match LTA's worked example for a $100,000 OMV", () => {
    const { total, bands } = calculateArf(100_000, current.tiers);

    expect(total).toBe(200_000);
    expect(bands.map((band) => band.amount)).toEqual([
      20_000, 28_000, 38_000, 50_000, 64_000,
    ]);
  });

  it("should stop at the band the OMV falls in", () => {
    const { total, bands } = calculateArf(35_000, current.tiers);

    expect(total).toBe(41_000);
    expect(bands).toHaveLength(2);
    expect(bands[1]).toEqual({
      from: 20_000,
      to: 35_000,
      rate: 1.4,
      amount: 21_000,
    });
  });

  it("should apply each schedule's own bands", () => {
    expect(calculateArf(100_000, from2022.tiers).total).toBe(160_000);
    expect(calculateArf(100_000, before2022.tiers).total).toBe(152_000);
  });

  it("should return nothing for a zero OMV", () => {
    expect(calculateArf(0, current.tiers)).toEqual({ total: 0, bands: [] });
  });
});
