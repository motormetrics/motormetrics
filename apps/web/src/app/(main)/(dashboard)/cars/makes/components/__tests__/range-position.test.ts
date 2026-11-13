import { rangePosition } from "@web/app/(main)/(dashboard)/cars/makes/components/makes-answer";

describe("rangePosition", () => {
  it("should call out a latest month that is the 12-month high", () => {
    expect(rangePosition([800, 900, 1200])).toEqual({
      high: 1200,
      low: 800,
      position: 100,
      where: "Highest in 12 months",
    });
  });

  it("should call out a latest month that is the 12-month low", () => {
    expect(rangePosition([1000, 900, 800])?.where).toBe("Lowest in 12 months");
  });

  it("should place a month between the low and high, measured from the high", () => {
    const result = rangePosition([819, 1561, 1150]);

    expect(result?.position).toBeCloseTo(44.6, 1);
    expect(result?.where).toBe("26.3% below the high");
  });

  it("should return null when there is no spread to draw", () => {
    expect(rangePosition([500, 500])).toBeNull();
    expect(rangePosition([])).toBeNull();
  });
});
