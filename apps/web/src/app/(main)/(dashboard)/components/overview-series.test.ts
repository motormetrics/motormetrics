import {
  axisTicks,
  sumByMonth,
  summariseMonth,
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

describe("summariseMonth", () => {
  const series = [
    { month: "2025-12", total: 4500 },
    { month: "2026-01", total: 3900 },
    { month: "2026-02", total: 3800 },
    { month: "2026-03", total: 3964 },
    { month: "2026-04", total: 4210 },
  ];

  it("should name the month, the change and the last month as high", () => {
    expect(
      summariseMonth(series, "2026-04", "new cars registered", "BMW led"),
    ).toBe(
      "April 2026: 4,210 new cars registered, up 6.2% on March, the most since December 2025; BMW led.",
    );
  });

  it("should leave out a low that reaches back under three months", () => {
    expect(summariseMonth(series, "2026-02", "new cars registered")).toBe(
      "February 2026: 3,800 new cars registered, down 2.6% on January.",
    );
  });

  it("should name the year of a previous month in another year", () => {
    expect(summariseMonth(series, "2026-01", "vehicles deregistered")).toBe(
      "January 2026: 3,900 vehicles deregistered, down 13.3% on December 2025.",
    );
  });

  it("should state an unchanged month and a month with no earlier figure", () => {
    const flat = [
      { month: "2026-01", total: 3900 },
      { month: "2026-02", total: 3900 },
    ];

    expect(summariseMonth(flat, "2026-02", "new cars registered")).toBe(
      "February 2026: 3,900 new cars registered, unchanged on January.",
    );
    expect(summariseMonth(flat, "2026-01", "new cars registered")).toBe(
      "January 2026: 3,900 new cars registered.",
    );
  });

  it("should return nothing for a month the series lacks", () => {
    expect(
      summariseMonth(series, "2026-05", "new cars registered"),
    ).toBeUndefined();
  });
});
