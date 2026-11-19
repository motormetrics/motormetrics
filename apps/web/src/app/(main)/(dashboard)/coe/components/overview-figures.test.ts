import type { CoeExercise } from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import {
  averagePremium,
  bidsPerCoe,
  type CoeOverviewData,
  categoryHistory,
  demandCaption,
  exerciseLabel,
  formatAmountChange,
  formatPercentChange,
  historyCaption,
  pqpFor,
  rangePosition,
} from "@web/app/(main)/(dashboard)/coe/components/overview-figures";
import { describe, expect, it } from "vitest";

const exercise = (
  month: string,
  biddingNo: number,
  premiumA: number,
): CoeExercise => ({
  biddingNo,
  key: `${month}:${biddingNo}`,
  month,
  results: {
    "Category A": {
      bidsReceived: 1_500,
      bidsSuccess: 1_000,
      premium: premiumA,
      quota: 1_000,
    },
    "Category D": {
      bidsReceived: 550,
      bidsSuccess: 500,
      premium: 9_000,
      quota: 500,
    },
  },
});

const history = [
  exercise("2026-09", 1, 100_000),
  exercise("2026-09", 2, 90_000),
  exercise("2026-10", 1, 110_000),
  exercise("2026-10", 2, 105_000),
];

const data: CoeOverviewData = {
  history,
  latest: history[3],
  pqp: {
    month: "2026-11",
    previousMonth: "2026-10",
    previousRates: {
      "Category A": 100_000,
      "Category B": 120_000,
      "Category C": 80_000,
      "Category D": 10_000,
    },
    rates: {
      "Category A": 102_000,
      "Category B": 120_000,
      "Category C": 80_000,
      "Category D": 10_000,
    },
  },
  previous: history[2],
};

describe("overview figures", () => {
  it("should sign changes with a true minus", () => {
    expect(formatPercentChange(0.053)).toBe("+5.3%");
    expect(formatPercentChange(-0.02)).toBe("−2.0%");
    expect(formatAmountChange(-6_997)).toBe("−$6,997");
  });

  it("should label an exercise with its month, year and round", () => {
    expect(exerciseLabel({ biddingNo: 2, month: "2026-10" })).toBe(
      "Oct 2026 · 2nd",
    );
  });

  it("should place the latest premium between the window's low and high", () => {
    const range = rangePosition(categoryHistory(history, "Category A"));
    expect(range?.low.premium).toBe(90_000);
    expect(range?.high.premium).toBe(110_000);
    expect(range?.where).toBe("4.5% below the high");
  });

  it("should call out a latest premium at the high", () => {
    const range = rangePosition(
      categoryHistory(history.slice(0, 3), "Category A"),
    );
    expect(range?.where).toBe("Highest in 3 exercises");
  });

  it("should average the premiums", () => {
    expect(averagePremium(categoryHistory(history, "Category A"))).toBe(
      101_250,
    );
    expect(averagePremium([])).toBe(0);
  });

  it("should give the PQP with its change, and none for Category E", () => {
    expect(pqpFor(data, "Category A")).toEqual({ change: 0.02, rate: 102_000 });
    expect(pqpFor(data, "Category E")).toBeUndefined();
  });

  it("should give bids per COE, or a dash without a quota", () => {
    expect(bidsPerCoe({ bidsReceived: 1_500, quota: 1_000 })).toBe("1.50");
    expect(bidsPerCoe({ bidsReceived: 10, quota: 0 })).toBe("—");
  });

  it("should caption the history from its low, high and change", () => {
    expect(
      historyCaption("Category A", categoryHistory(history, "Category A")),
    ).toBe(
      "Category A premiums ranged from $90,000 (Sept 2026 · 2nd) to $110,000 (Oct 2026 · 1st) over the last 4 exercises, a change of +5.0% from start to end.",
    );
  });

  it("should caption the most and least contested categories", () => {
    expect(demandCaption(history[3])).toBe(
      "Category A drew the most bids per certificate (1.50) and Category D the fewest (1.10); every category received more bids than it had COEs.",
    );
  });
});
