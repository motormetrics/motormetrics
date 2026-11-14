import {
  categoryCaption,
  leadSentence,
  monthsCaption,
  rangeStats,
  trendCaption,
  yearOnYear,
} from "@web/app/(main)/(dashboard)/cars/deregistrations/components/summary";
import { describe, expect, it } from "vitest";

const rows = [
  { counts: [0, 0], month: "2026-01", total: 0 },
  { counts: [30, 20], month: "2026-02", total: 50 },
  { counts: [60, 40], month: "2026-03", total: 100 },
  { counts: [45, 35], month: "2026-04", total: 80 },
];

describe("yearOnYear", () => {
  it("should describe a rise, a fall and no change", () => {
    expect(yearOnYear(109, 100)).toBe("up 9.0%");
    expect(yearOnYear(90, 100)).toBe("down 10.0%");
    expect(yearOnYear(100, 100)).toBe("unchanged");
  });

  it("should return null without a year-ago figure", () => {
    expect(yearOnYear(100, 0)).toBeNull();
  });
});

describe("rangeStats", () => {
  it("should place the month between the low and high, skipping empty months", () => {
    expect(rangeStats(rows, "2026-04")).toEqual({
      count: 3,
      high: 100,
      latest: 80,
      low: 50,
      where: "20.0% below the high",
    });
  });

  it("should name the high and the low", () => {
    expect(rangeStats(rows, "2026-03")?.where).toBe("Highest in 3 months");
    expect(rangeStats(rows, "2026-02")?.where).toBe("Lowest in 3 months");
  });

  it("should return null for a month outside the window", () => {
    expect(rangeStats(rows, "2025-12")).toBeNull();
  });
});

describe("leadSentence", () => {
  const categories = [
    { count: 45, label: "Category A" },
    { count: 35, label: "Category B" },
  ];

  it("should lead with the largest category and the year-on-year change", () => {
    expect(leadSentence(categories, 80, "2026-04", "up 8.9%")).toBe(
      "Category A made up 56.3% of the 80 vehicles scrapped or exported in April 2026, returning their COEs to the quota; the total was up 8.9% on a year earlier.",
    );
  });

  it("should drop the change without a year-ago figure", () => {
    expect(leadSentence(categories, 80, "2026-04", null)).toMatch(
      /to the quota\.$/,
    );
  });

  it("should return null without data", () => {
    expect(leadSentence([], 0, "2026-04", null)).toBeNull();
  });
});

describe("trendCaption", () => {
  it("should name the peak and a category that led every month", () => {
    expect(trendCaption(rows, "2026-04", ["Category A", "Category B"])).toBe(
      "Deregistrations peaked at 100 in March 2026 over the 3 months to April 2026, and Category A was the largest category in every month.",
    );
  });

  it("should leave out the leader when it changes", () => {
    const mixed = [...rows, { counts: [10, 90], month: "2026-05", total: 100 }];

    expect(trendCaption(mixed, "2026-05", ["A", "B"])).not.toMatch(
      /every month/,
    );
  });
});

describe("categoryCaption", () => {
  it("should sum the two largest categories' share", () => {
    expect(
      categoryCaption(
        [
          { count: 60, label: "Category A" },
          { count: 30, label: "Category B" },
          { count: 10, label: "Taxis" },
        ],
        100,
        "2026-03",
      ),
    ).toBe(
      "Category A (60) and Category B (30) made up 90.0% of March 2026's deregistrations.",
    );
  });
});

describe("monthsCaption", () => {
  it("should give the first category's low and high months", () => {
    expect(monthsCaption(rows, "Category A")).toBe(
      "Category A deregistrations ranged from 30 in February 2026 to 60 in March 2026.",
    );
  });
});
