import {
  biddingOrdinal,
  bidsAgainstQuota,
  changeRatio,
  describePremiumMove,
  formatExercise,
  formatExerciseTick,
  formatPremiumChange,
  groupByExercise,
  nextExercise,
  premiumAxisTicks,
  premiumRangeStats,
  recordHighs,
  summariseByYear,
  summariseCategoryExercise,
  summariseExercise,
  summarisePQP,
  summariseYears,
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
  it("should collapse rows into one entry per month and bidding round", () => {
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

  it("should order oldest first regardless of input order", () => {
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

  it("should return an empty list when there are no results", () => {
    expect(groupByExercise([])).toEqual([]);
  });
});

describe("changeRatio", () => {
  it("should return the signed change against the baseline", () => {
    expect(changeRatio(103_000, 103_800)).toBeCloseTo(-0.0077, 4);
    expect(changeRatio(104_200, 102_100)).toBeCloseTo(0.0206, 4);
  });

  it("should return zero when there is no usable baseline", () => {
    expect(changeRatio(103_000, 0)).toBe(0);
  });
});

describe("formatPremiumChange", () => {
  const previous = { biddingNo: 1, month: "2026-08", premium: 130_500 };

  it("should state a rise with the percentage and the dollar change", () => {
    expect(formatPremiumChange(133_110, previous)).toBe(
      "+2.0% (+$2,610) vs first bidding, Aug at $130,500",
    );
  });

  it("should state a fall with a true minus", () => {
    expect(formatPremiumChange(127_890, previous)).toBe(
      "\u22122.0% (\u2212$2,610) vs first bidding, Aug at $130,500",
    );
  });

  it("should say so when there is no earlier exercise", () => {
    expect(formatPremiumChange(130_500)).toBe("No earlier exercise to compare");
  });
});

describe("nextExercise", () => {
  it("should move to the second round of the same month", () => {
    expect(nextExercise({ biddingNo: 1, month: "2026-04" })).toEqual({
      biddingNo: 1 + 1,
      month: "2026-04",
    });
  });

  it("should move to the first round of the next month", () => {
    expect(nextExercise({ biddingNo: 2, month: "2026-04" })).toEqual({
      biddingNo: 1,
      month: "2026-05",
    });
  });

  it("should roll the year over in December", () => {
    expect(nextExercise({ biddingNo: 2, month: "2026-12" })).toEqual({
      biddingNo: 1,
      month: "2027-01",
    });
  });
});

describe("labels", () => {
  it("should name an exercise in full", () => {
    expect(formatExercise({ biddingNo: 2, month: "2026-04" })).toBe(
      "Second bidding, April 2026",
    );
  });

  it("should tick an exercise short", () => {
    expect(formatExerciseTick({ biddingNo: 1, month: "2026-04" })).toBe(
      "Apr 1",
    );
  });

  it("should fall back for an unexpected round", () => {
    expect(biddingOrdinal(9)).toBe("round 9");
  });
});

describe("category keys", () => {
  it("should round-trip between the URL key and the stored category", () => {
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

/** Category A premiums, one per exercise, starting at the first bidding of Jan 2025. */
const seriesA = (premiums: number[]) =>
  groupByExercise(
    premiums.map((premium, index) =>
      result(
        `2025-${String(Math.floor(index / 2) + 1).padStart(2, "0")}`,
        (index % 2) + 1,
        "Category A",
        premium,
      ),
    ),
  );

describe("describePremiumMove", () => {
  it("should name the last exercise that was as high", () => {
    const exercises = seriesA([
      130_000, 110_000, 111_000, 112_000, 113_000, 114_000, 115_000, 120_000,
      126_000,
    ]);

    expect(describePremiumMove(exercises, "Category A")).toBe(
      "Cat A rose $6,000 to $126,000, its highest since Jan 2025",
    );
  });

  it("should leave out a high that reaches back under three months", () => {
    const exercises = seriesA([125_000, 110_000, 120_000]);

    expect(describePremiumMove(exercises, "Category A")).toBe(
      "Cat A rose $10,000 to $120,000",
    );
  });

  it("should call a new high or low a record", () => {
    expect(describePremiumMove(seriesA([100_000, 105_000]), "Category A")).toBe(
      "Cat A rose $5,000 to $105,000, a record high",
    );
    expect(describePremiumMove(seriesA([100_000, 95_000]), "Category A")).toBe(
      "Cat A fell $5,000 to $95,000, a record low",
    );
  });

  it("should handle an unchanged premium, a first exercise and a missing category", () => {
    expect(describePremiumMove(seriesA([100_000, 100_000]), "Category A")).toBe(
      "Cat A held at $100,000",
    );
    expect(describePremiumMove(seriesA([100_000]), "Category A")).toBe(
      "Cat A closed at $100,000",
    );
    expect(
      describePremiumMove(seriesA([100_000]), "Category B"),
    ).toBeUndefined();
  });
});

describe("summariseExercise", () => {
  it("should lead with the exercise and join Cat A and B", () => {
    const exercises = groupByExercise([
      result("2026-09", 2, "Category A", 125_000),
      result("2026-09", 2, "Category B", 131_000),
      result("2026-10", 1, "Category A", 130_001),
      result("2026-10", 1, "Category B", 130_100),
    ]);

    expect(summariseExercise(exercises)).toBe(
      "First bidding, October 2026: Cat A rose $5,001 to $130,001, a record high; Cat B fell $900 to $130,100, a record low.",
    );
  });

  it("should return nothing without results", () => {
    expect(summariseExercise([])).toBeUndefined();
  });
});

describe("summariseCategoryExercise", () => {
  const figures = { bidsReceived: 2140, bidsSuccess: 1284, quota: 1284 };

  it("should name the exercise and describe the category's move", () => {
    expect(
      summariseCategoryExercise(
        [
          { ...figures, biddingNo: 2, month: "2026-09", premium: 131_000 },
          { ...figures, biddingNo: 1, month: "2026-10", premium: 128_500 },
        ],
        "Category B",
      ),
    ).toBe(
      "First bidding, October 2026: Cat B fell $2,500 to $128,500, a record low.",
    );
  });

  it("should return nothing without exercises", () => {
    expect(summariseCategoryExercise([], "Category A")).toBeUndefined();
  });
});

describe("summariseYears", () => {
  it("should compare each car category's average with the year before", () => {
    const years = summariseByYear(
      groupByExercise([
        result("2025-01", 1, "Category A", 90_000),
        result("2025-06", 2, "Category A", 110_000),
        result("2025-06", 2, "Category B", 125_000),
        result("2026-01", 1, "Category A", 104_000),
        result("2026-01", 1, "Category B", 125_000),
        result("2026-01", 1, "Category E", 130_000),
      ]),
    );

    expect(summariseYears(years)).toBe(
      "2026 average: Cat A $104,000, up $4,000 on 2025's $100,000; Cat B $125,000, level with 2025's $125,000.",
    );
  });

  it("should give the average alone in the first year and fall back to nothing", () => {
    const years = summariseByYear(
      groupByExercise([result("2026-01", 1, "Category A", 104_000)]),
    );

    expect(summariseYears(years)).toBe("2026 average: Cat A $104,000.");
    expect(summariseYears([])).toBeUndefined();
  });
});

describe("summarisePQP", () => {
  const month = (value: string, categoryA: number, categoryB: number) => ({
    month: value,
    "Category A": categoryA,
    "Category B": categoryB,
  });

  it("should give the 10-year rate, its change and the 5-year cost for Cat A and B", () => {
    expect(
      summarisePQP([
        month("2026-09", 100_000, 120_500),
        month("2026-10", 104_201, 119_000),
      ]),
    ).toBe(
      "October 2026 PQP for a 10-year renewal: Cat A $104,201, up $4,201 on September; Cat B $119,000, down $1,500 on September. A 5-year renewal costs half: $52,101 for Cat A and $59,500 for Cat B.",
    );
  });

  it("should leave out the change for the first month and skip an unreported category", () => {
    expect(summarisePQP([month("2026-10", 104_000, 0)])).toBe(
      "October 2026 PQP for a 10-year renewal: Cat A $104,000. A 5-year renewal costs half: $52,000 for Cat A.",
    );
  });

  it("should return nothing without a published rate", () => {
    expect(summarisePQP([])).toBeUndefined();
    expect(summarisePQP([month("2026-10", 0, 0)])).toBeUndefined();
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
