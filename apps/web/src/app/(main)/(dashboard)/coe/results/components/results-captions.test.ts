import type {
  CategoryFigures,
  CoeExercise,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import {
  chartCaption,
  demandLead,
  exercisesCaption,
  quotaCaption,
  recordsCaption,
} from "@web/app/(main)/(dashboard)/coe/results/components/results-captions";
import { describe, expect, it } from "vitest";

const figures = (
  premium: number,
  quota = 1_000,
  bidsReceived = 1_500,
  bidsSuccess = 900,
): CategoryFigures => ({ bidsReceived, bidsSuccess, premium, quota });

const exercise = (
  month: string,
  biddingNo: number,
  premiums: [number, number, number, number, number],
): CoeExercise => ({
  biddingNo,
  key: `${month}:${biddingNo}`,
  month,
  results: {
    "Category A": figures(premiums[0], 1_000, 1_500, 900),
    "Category B": figures(premiums[1], 900, 1_100, 850),
    "Category C": figures(premiums[2], 300, 500, 290),
    "Category D": figures(premiums[3], 500, 600, 490),
    "Category E": figures(premiums[4], 250, 450, 240),
  },
});

const exercises = [
  exercise("2026-08", 2, [100_000, 120_000, 80_000, 9_000, 125_000]),
  exercise("2026-09", 1, [110_000, 125_000, 82_000, 9_500, 130_000]),
  exercise("2026-09", 2, [105_000, 124_000, 81_000, 9_400, 129_000]),
];

describe("results captions", () => {
  it("should name the most contested category in the lead", () => {
    expect(demandLead(exercises[2])).toBe(
      "Every category drew more bids than COEs in the second bidding of September 2026; Category E was the most contested, at 1.80 bids per COE.",
    );
  });

  it("should caption one plotted category alone", () => {
    expect(chartCaption(exercises, ["Category A"])).toBe(
      "Category A rose 5.0% over the last 3 exercises, to $105,000.",
    );
  });

  it("should caption the largest and smallest moves among the plotted", () => {
    expect(chartCaption(exercises, ["Category A", "Category B"])).toBe(
      "Of the categories shown, Category A rose 5.0% over the last 3 exercises, to $105,000, and Category B rose 3.3%.",
    );
  });

  it("should count the categories that closed lower and the Category A peak", () => {
    expect(exercisesCaption(exercises)).toBe(
      "All five categories closed lower in the second bidding of September 2026 than the exercise before; Category A peaked at $110,000 in the first bidding, September 2026.",
    );
  });

  it("should name the highest record and the records set this year", () => {
    expect(
      recordsCaption(
        { "Category A": exercises[1], "Category E": exercises[1] },
        "2026",
      ),
    ).toBe(
      "Category E holds the highest premium on record, $130,000 in the first bidding, September 2026; Categories A and E set their records in 2026.",
    );
  });

  it("should name the lowest and highest success rates", () => {
    expect(quotaCaption(exercises[2])).toBe(
      "Category E had the lowest success rate, 53% of bids; Category D the highest, 82%.",
    );
  });
});
