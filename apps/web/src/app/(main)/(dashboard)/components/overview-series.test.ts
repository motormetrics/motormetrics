import {
  axisTicks,
  sumByMonth,
  windowEndingAt,
} from "@web/app/(main)/(dashboard)/components/overview-series";
import { describe, expect, it } from "vitest";

describe("sumByMonth", () => {
  it("should add every category into one total per month, oldest first", () => {
    const rows = [
      { month: "2025-02", number: 5 },
      { month: "2025-01", number: 3 },
      { month: "2025-02", number: null },
      { month: "2025-01", number: 4 },
    ];

    expect(sumByMonth(rows)).toEqual([
      { month: "2025-01", total: 7 },
      { month: "2025-02", total: 5 },
    ]);
  });
});

describe("windowEndingAt", () => {
  const series = ["2025-01", "2025-02", "2025-03", "2025-04"].map((month) => ({
    month,
  }));

  it("should return the last entries up to the selected month", () => {
    expect(
      windowEndingAt(series, "2025-03", 2).map((item) => item.month),
    ).toEqual(["2025-02", "2025-03"]);
  });

  it("should end at the newest entry not after a month the series lacks", () => {
    expect(
      windowEndingAt(series, "2025-06", 8).map((item) => item.month),
    ).toEqual(["2025-01", "2025-02", "2025-03", "2025-04"]);
  });

  it("should return nothing when every entry is after the month", () => {
    expect(windowEndingAt(series, "2024-12", 8)).toEqual([]);
  });
});

describe("axisTicks", () => {
  it("should anchor counts at zero on a round step", () => {
    expect(axisTicks([4266, 6390, 4549], { zero: true })).toEqual([
      0, 2000, 4000, 6000, 8000,
    ]);
  });

  it("should span only the data when not anchored at zero", () => {
    expect(axisTicks([48.4, 70.1, 63.3], { zero: false })).toEqual([
      40, 50, 60, 70, 80,
    ]);
  });

  it("should give a flat series one step of height", () => {
    expect(axisTicks([5, 5], { zero: false })).toEqual([5, 6]);
  });

  it("should return no ticks for an empty series", () => {
    expect(axisTicks([], { zero: true })).toEqual([]);
  });
});
