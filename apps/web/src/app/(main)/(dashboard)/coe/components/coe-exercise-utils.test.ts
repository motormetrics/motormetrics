import {
  biddingOrdinal,
  changeRatio,
  formatExercise,
  groupByExercise,
  premiumAxisTicks,
  premiumRangeStats,
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

describe("labels", () => {
  it("should name an exercise in full", () => {
    expect(formatExercise({ biddingNo: 2, month: "2026-04" })).toBe(
      "Second bidding, April 2026",
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
