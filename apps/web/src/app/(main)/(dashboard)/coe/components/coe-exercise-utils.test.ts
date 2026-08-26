import type { COEResult } from "@web/types";
import { describe, expect, it } from "vitest";
import {
  biddingOrdinal,
  changeRatio,
  formatExercise,
  formatExerciseTick,
  groupByExercise,
  nextExercise,
  toCategory,
  toCategoryKey,
} from "./coe-exercise-utils";

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
