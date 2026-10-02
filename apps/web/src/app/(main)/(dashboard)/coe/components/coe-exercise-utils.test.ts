import {
  biddingOrdinal,
  bidsAgainstQuota,
  changeRatio,
  formatExercise,
  formatExerciseTick,
  formatPremiumChange,
  groupByExercise,
  nextExercise,
  premiumAxisTicks,
  premiumRangeStats,
  recordHighs,
  summariseByYear,
  toCategory,
  toCategoryKey,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import type { COEResult } from "@web/types";
import { describe, expect, it } from "vitest";

const result = (
  month: string,
  biddingNo: number,
  vehicleClass: COEResult["vehicleClass"],
  premium: number,
): COEResult => ({
  bidsReceived: 2140,
  bidsSuccess: 1284,
  biddingNo,
  month,
  premium,
  quota: 1284,
  vehicleClass,
});

describe("groupByExercise", () => {
  it("collapses rows into one entry per month and bidding round", () => {
    const exercises = groupByExercise([
      result("2026-04", 1, "Category A", 103_800),
      result("2026-04", 1, "Category B", 140_800),
      result("2026-04", 2, "Category A", 103_000),
    ]);

    expect(exercises).toHaveLength(2);
    expect(exercises[0].key).toBe("2026-04:1");
    expect(Object.keys(exercises[0].results)).toEqual([
      "Category A",
      "Category B",
    ]);
    expect(exercises[1].results["Category A"]?.premium).toBe(103_000);
  });

  it("orders oldest first regardless of input order", () => {
    const exercises = groupByExercise([
      result("2026-04", 1, "Category A", 103_800),
      result("2025-12", 2, "Category A", 101_500),
      result("2026-04", 2, "Category A", 103_000),
      result("2025-12", 1, "Category A", 99_800),
    ]);

    expect(exercises.map((exercise) => exercise.key)).toEqual([
      "2025-12:1",
      "2025-12:2",
      "2026-04:1",
      "2026-04:2",
    ]);
  });

  it("returns an empty list when there are no results", () => {
    expect(groupByExercise([])).toEqual([]);
  });
});

describe("changeRatio", () => {
  it("returns the signed change against the baseline", () => {
    expect(changeRatio(103_000, 103_800)).toBeCloseTo(-0.0077, 4);
    expect(changeRatio(104_200, 102_100)).toBeCloseTo(0.0206, 4);
  });

  it("returns zero when there is no usable baseline", () => {
    expect(changeRatio(103_000, 0)).toBe(0);
  });
});

describe("formatPremiumChange", () => {
  const previous = { biddingNo: 1, month: "2026-08", premium: 130_500 };

  it("states a rise with the percentage and the dollar change", () => {
    expect(formatPremiumChange(133_110, previous)).toBe(
      "+2.0% (+$2,610) vs first bidding, Aug at $130,500",
    );
  });

  it("states a fall with a true minus", () => {
    expect(formatPremiumChange(127_890, previous)).toBe(
      "\u22122.0% (\u2212$2,610) vs first bidding, Aug at $130,500",
    );
  });

  it("says so when there is no earlier exercise", () => {
    expect(formatPremiumChange(130_500)).toBe("No earlier exercise to compare");
  });
});

describe("nextExercise", () => {
  it("moves to the second round of the same month", () => {
    expect(nextExercise({ biddingNo: 1, month: "2026-04" })).toEqual({
      biddingNo: 1 + 1,
      month: "2026-04",
    });
  });

  it("moves to the first round of the next month", () => {
    expect(nextExercise({ biddingNo: 2, month: "2026-04" })).toEqual({
      biddingNo: 1,
      month: "2026-05",
    });
  });

  it("rolls the year over in December", () => {
    expect(nextExercise({ biddingNo: 2, month: "2026-12" })).toEqual({
      biddingNo: 1,
      month: "2027-01",
    });
  });
});

describe("labels", () => {
  it("names an exercise in full", () => {
    expect(formatExercise({ biddingNo: 2, month: "2026-04" })).toBe(
      "Second bidding, April 2026",
    );
  });

  it("ticks an exercise short", () => {
    expect(formatExerciseTick({ biddingNo: 1, month: "2026-04" })).toBe(
      "Apr 1",
    );
  });

  it("falls back for an unexpected round", () => {
    expect(biddingOrdinal(9)).toBe("round 9");
  });
});

describe("category keys", () => {
  it("round-trips between the URL key and the stored category", () => {
    expect(toCategory("B")).toBe("Category B");
    expect(toCategoryKey("Category B")).toBe("B");
  });
});

describe("summariseByYear", () => {
  it("should average, high and low each category per year, newest first", () => {
    const years = summariseByYear(
      groupByExercise([
        result("2025-01", 1, "Category A", 90_000),
        result("2025-06", 2, "Category A", 110_000),
        result("2026-01", 1, "Category A", 100_000),
        result("2026-01", 1, "Category B", 120_000),
      ]),
    );

    expect(years.map((year) => year.year)).toEqual(["2026", "2025"]);
    expect(years[1].categories["Category A"]).toEqual({
      average: 100_000,
      high: 110_000,
      low: 90_000,
    });
    expect(years[1].categories["Category B"]).toBeUndefined();
  });
});

describe("recordHighs", () => {
  it("should keep the earliest exercise that set each category's high", () => {
    const highs = recordHighs(
      groupByExercise([
        result("2023-09", 1, "Category A", 106_000),
        result("2024-02", 1, "Category A", 106_000),
        result("2024-02", 1, "Category B", 150_000),
      ]),
    );

    expect(highs["Category A"]?.key).toBe("2023-09:1");
    expect(highs["Category B"]?.key).toBe("2024-02:1");
    expect(highs["Category C"]).toBeUndefined();
  });
});

describe("premiumAxisTicks", () => {
  it("should pick a round step that covers the lowest and highest premium", () => {
    expect(premiumAxisTicks([101_200, 104_300, 98_900, 107_100])).toEqual([
      97_500, 100_000, 102_500, 105_000, 107_500,
    ]);
  });

  it("should widen the step for a long, volatile range", () => {
    expect(premiumAxisTicks([30_000, 150_000])).toEqual([
      0, 50_000, 100_000, 150_000,
    ]);
  });

  it("should give a flat series two ticks around its value", () => {
    expect(premiumAxisTicks([104_000, 104_000])).toEqual([104_000, 104_250]);
    expect(premiumAxisTicks([104_100])).toEqual([104_000, 104_250]);
  });

  it("should return no ticks for an empty series", () => {
    expect(premiumAxisTicks([])).toEqual([]);
  });
});

describe("premiumRangeStats", () => {
  const view = [
    { biddingNo: 1, month: "2026-07", premium: 100_000 },
    { biddingNo: 2, month: "2026-07", premium: 96_000 },
    { biddingNo: 1, month: "2026-08", premium: 108_000 },
    { biddingNo: 2, month: "2026-08", premium: 96_000 },
    { biddingNo: 1, month: "2026-09", premium: 105_000 },
  ];

  it("should return the latest, high and low exercises with the change over the range", () => {
    expect(premiumRangeStats(view)).toEqual({
      change: 0.05,
      first: view[0],
      high: view[2],
      latest: view[4],
      low: view[1],
    });
  });

  it("should keep the earliest exercise on a tie", () => {
    expect(premiumRangeStats(view)?.low).toEqual({
      biddingNo: 2,
      month: "2026-07",
      premium: 96_000,
    });
  });

  it("should report a fall as a negative change", () => {
    expect(premiumRangeStats(view.slice(2, 4))?.change).toBeCloseTo(-0.1111, 4);
  });

  it("should return undefined for an empty range", () => {
    expect(premiumRangeStats([])).toBeUndefined();
  });
});

describe("bidsAgainstQuota", () => {
  const exercise = groupByExercise([
    {
      ...result("2026-09", 2, "Category A", 100_000),
      bidsReceived: 1500,
      quota: 1000,
    },
    {
      ...result("2026-09", 2, "Category B", 120_000),
      bidsReceived: 3000,
      quota: 1200,
    },
    {
      ...result("2026-09", 2, "Category D", 9000),
      bidsReceived: 400,
      quota: 500,
    },
  ])[0];
  const rows = bidsAgainstQuota(exercise);
  const row = (category: COEResult["vehicleClass"]) =>
    rows.find((item) => item.category === category);

  it("should clamp the overflow at 0 when bids fall short of the quota", () => {
    expect(row("Category D")?.overflow).toBe(0);
    expect(row("Category A")?.overflow).toBe(500);
  });

  it("should size every bar against one shared scale", () => {
    expect(row("Category B")?.bidWidth).toBe(100);
    expect(row("Category A")?.bidWidth).toBe(50);
    expect(row("Category B")?.quotaWidth).toBe(40);
    expect(row("Category C")).toMatchObject({ bidWidth: 0, quotaWidth: 0 });
  });

  it("should give bids per COE to 2 decimal places", () => {
    expect(row("Category B")?.ratio).toBe("2.50");
    expect(row("Category D")?.ratio).toBe("0.80");
    expect(row("Category C")?.ratio).toBe("0.00");
  });
});
