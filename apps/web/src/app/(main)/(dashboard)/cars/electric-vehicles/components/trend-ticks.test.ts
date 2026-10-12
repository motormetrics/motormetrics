import { trendTicks } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/trend-ticks";
import { describe, expect, it } from "vitest";

describe("trendTicks", () => {
  it("should label every month with the year under the first of each year", () => {
    expect(trendTicks(["2025-11", "2025-12", "2026-01"], 1)).toEqual([
      { label: "Nov", year: "2025" },
      { label: "Dec", year: "" },
      { label: "Jan", year: "2026" },
    ]);
  });

  it("should count back from the newest month when thinning", () => {
    const ticks = trendTicks(
      ["2025-09", "2025-10", "2025-11", "2025-12", "2026-01"],
      2,
    );

    expect(ticks).toEqual([
      { label: "Sep", year: "2025" },
      null,
      { label: "Nov", year: "" },
      null,
      { label: "Jan", year: "2026" },
    ]);
  });

  it("should treat a step below one as every month", () => {
    expect(trendTicks(["2026-01"], 0)).toEqual([
      { label: "Jan", year: "2026" },
    ]);
  });
});
