import {
  leaderOf,
  trendSummary,
} from "@web/app/(main)/(dashboard)/cars/makes/compare/[pair]/components/summary";
import { describe, expect, it } from "vitest";

describe("leaderOf", () => {
  it("should compare at the precision the figures are shown at", () => {
    expect(leaderOf(12.34, 12.31, 1)).toBeNull();
    expect(leaderOf(12.4, 12.31, 1)).toBe("a");
    expect(leaderOf(3, 5)).toBe("b");
  });
});

describe("trendSummary", () => {
  it("should describe both series from first to last month", () => {
    expect(
      trendSummary({
        months: ["2024-10", "2024-11", "2026-09"],
        nameA: "BMW",
        nameB: "AUDI",
        seriesA: [447, 375, 187],
        seriesB: [364, 416, 1242],
      }),
    ).toBe(
      "Monthly registrations from October 2024 to September 2026. BMW 447 to 187; AUDI 364 to 1,242.",
    );
  });
});
