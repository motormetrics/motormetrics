import {
  getRoadTax,
  getSurchargeYears,
} from "@web/app/(main)/(dashboard)/coe/pqp/components/road-tax";
import { describe, expect, it } from "vitest";

describe("getRoadTax", () => {
  it("should price a petrol car by engine capacity", () => {
    // (250 + 0.375 × 598) × 0.782, twice a year.
    const { base, extra } = getRoadTax({
      engineCapacity: 1598,
      fuel: "petrol",
      powerRating: 0,
    });
    expect(base).toBeCloseTo(741.73, 2);
    expect(extra).toBe(0);
  });

  it("should use the top engine band above 3,000cc", () => {
    const { base } = getRoadTax({
      engineCapacity: 3500,
      fuel: "petrol",
      powerRating: 0,
    });
    expect(base).toBeCloseTo((1525 + 500) * 0.782 * 2, 2);
  });

  it("should charge a hybrid the higher of engine and motor figures", () => {
    const engine = getRoadTax({
      engineCapacity: 1798,
      fuel: "petrol",
      powerRating: 0,
    }).base;
    const hybrid = getRoadTax({
      engineCapacity: 1798,
      fuel: "hybrid",
      powerRating: 150,
    }).base;
    // (250 + 3.75 × 120) × 0.782 × 2 beats the engine figure here.
    expect(hybrid).toBeCloseTo((250 + 3.75 * 120) * 0.782 * 2, 2);
    expect(hybrid).toBeGreaterThan(engine);
  });

  it("should add the Additional Flat Component for an electric car", () => {
    const { base, extra } = getRoadTax({
      engineCapacity: 0,
      fuel: "electric",
      powerRating: 100,
    });
    expect(base).toBeCloseTo((250 + 3.75 * 70) * 0.782 * 2, 2);
    expect(extra).toBe(700);
  });

  it("should add the diesel special tax with its S$100 minimum", () => {
    expect(
      getRoadTax({ engineCapacity: 1995, fuel: "diesel", powerRating: 0 })
        .extra,
    ).toBeCloseTo((0.2 * 1995 - 100) * 2, 2);
    expect(
      getRoadTax({ engineCapacity: 900, fuel: "diesel", powerRating: 0 }).extra,
    ).toBe(200);
  });
});

describe("getSurchargeYears", () => {
  it("should total 400% of a year over a 10-year renewal of a first COE", () => {
    expect(getSurchargeYears(10, 10)).toBeCloseTo(4, 5);
  });

  it("should total 150% of a year over a 5-year renewal of a first COE", () => {
    expect(getSurchargeYears(10, 5)).toBeCloseTo(1.5, 5);
  });

  it("should stay at 50% a year once the car is past 14 years", () => {
    expect(getSurchargeYears(20, 5)).toBeCloseTo(2.5, 5);
  });
});
