import { summariseMake } from "@web/app/(main)/(dashboard)/cars/makes/[make]/components/summary";
import { describe, expect, it } from "vitest";

const figures = {
  count: 612,
  make: "BMW",
  marketCount: 4221,
  month: "2026-09",
  previousCount: 567,
  yearToDate: 7340,
};

describe("summariseMake", () => {
  it("should describe the month, its change, its share and the year to date", () => {
    expect(summariseMake({ ...figures, rank: 2 })).toBe(
      "BMW registered 612 new cars in September 2026, up 7.9% on August — 14.5% of the market. 7,340 so far in 2026, the 2nd-most of any make.",
    );
  });

  it("should call the leading make the most of any make", () => {
    expect(summariseMake({ ...figures, rank: 1 })).toContain(
      "7,340 so far in 2026, the most of any make.",
    );
  });

  it("should leave out the rank when it is not known", () => {
    expect(summariseMake(figures)).toContain("7,340 so far in 2026.");
  });

  it("should describe a fall and a flat month", () => {
    expect(summariseMake({ ...figures, previousCount: 680 })).toContain(
      "down 10.0% on August",
    );
    expect(summariseMake({ ...figures, previousCount: 612 })).toContain(
      "level with August",
    );
  });

  it("should name the year when the previous month falls in the year before", () => {
    expect(
      summariseMake({
        ...figures,
        make: "Mercedes-Benz",
        month: "2026-01",
        yearToDate: 612,
      }),
    ).toBe(
      "Mercedes-Benz registered 612 new cars in January 2026, up 7.9% on December 2025 — 14.5% of the market.",
    );
  });

  it("should skip the change and the share without a baseline", () => {
    expect(
      summariseMake({
        ...figures,
        make: "Audi",
        marketCount: 0,
        previousCount: 0,
      }),
    ).toBe(
      "Audi registered 612 new cars in September 2026. 7,340 so far in 2026.",
    );
  });

  it("should return undefined when the make registered nothing in the month", () => {
    expect(summariseMake({ ...figures, count: 0 })).toBeUndefined();
  });
});
