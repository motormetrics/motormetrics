import { premiumRangeStats } from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import {
  allCategoriesCaption,
  formatSignedCurrency,
  formatSignedPercent,
  historyCaption,
  premiumsLead,
  rangeCaption,
  rangePosition,
  successRateCaption,
} from "@web/app/(main)/(dashboard)/coe/premiums/components/premiums-shared";
import type { CategoryExercise } from "@web/queries/coe";
import { describe, expect, it } from "vitest";

const exercise = (
  month: string,
  biddingNo: number,
  premium: number,
  figures: Partial<CategoryExercise> = {},
): CategoryExercise => ({
  biddingNo,
  bidsReceived: 1000,
  bidsSuccess: 800,
  month,
  premium,
  quota: 800,
  ...figures,
});

describe("formatSignedPercent and formatSignedCurrency", () => {
  it("should use a true minus for a fall and a plus for a rise", () => {
    expect(formatSignedPercent(-0.0123)).toBe("−1.2%");
    expect(formatSignedPercent(0.05)).toBe("+5.0%");
    expect(formatSignedCurrency(-1500)).toBe("−$1,500");
    expect(formatSignedCurrency(2000)).toBe("+$2,000");
  });
});

describe("rangePosition", () => {
  it("should name the high and the low", () => {
    expect(rangePosition(100, 200, 200, "24 exercises")).toBe(
      "Highest in 24 exercises",
    );
    expect(rangePosition(100, 200, 100, "12 months")).toBe(
      "Lowest in 12 months",
    );
  });

  it("should give the distance below the high in between", () => {
    expect(rangePosition(100, 200, 150, "24 exercises")).toBe(
      "25.0% below the high",
    );
  });
});

describe("premiumsLead", () => {
  it("should quote the bids, quota and success rate", () => {
    expect(
      premiumsLead(
        exercise("2026-10", 2, 100_000, {
          bidsReceived: 1507,
          bidsSuccess: 1193,
          quota: 1193,
        }),
        "Category A",
      ),
    ).toBe(
      "1,507 bids were made for 1,193 Category A certificates, and 79% of them succeeded.",
    );
  });

  it("should fall back to the premium without a quota", () => {
    expect(
      premiumsLead(exercise("2026-10", 2, 100_000, { quota: 0 }), "Category A"),
    ).toBe("Category A closed at $100,000.");
  });
});

describe("historyCaption", () => {
  it("should name the low, the high and the change over the window", () => {
    const caption = historyCaption(
      [
        exercise("2026-08", 1, 100_000),
        exercise("2026-08", 2, 90_000),
        exercise("2026-10", 1, 120_000),
        exercise("2026-10", 2, 110_000),
      ],
      "Category A",
    );

    expect(caption).toBe(
      "Category A premiums ranged from $90,000 (Aug 2026 · 2nd) to $120,000 (Oct 2026 · 1st) over these 4 exercises, a change of +10.0% from start to end.",
    );
  });

  it("should return undefined for fewer than two exercises", () => {
    expect(
      historyCaption([exercise("2026-10", 2, 1)], "Category A"),
    ).toBeUndefined();
  });
});

describe("allCategoriesCaption", () => {
  it("should name the highest category and count the falls", () => {
    expect(
      allCategoriesCaption(
        [
          { changeRatio: -0.01, key: "A", premium: 100 },
          { changeRatio: 0.02, key: "B", premium: 300 },
          { changeRatio: -0.03, key: "C", premium: 200 },
        ],
        "first exercise of September 2026",
      ),
    ).toBe(
      "Category B closed highest, at $300; two of the three categories closed lower than in the first exercise of September 2026.",
    );
  });

  it("should say all when every category fell", () => {
    expect(
      allCategoriesCaption(
        [
          { changeRatio: -0.01, key: "A", premium: 100 },
          { changeRatio: -0.02, key: "B", premium: 300 },
        ],
        "first exercise of September 2026",
      ),
    ).toContain("all two categories closed lower");
  });

  it("should leave out the comparison without a previous exercise", () => {
    expect(
      allCategoriesCaption(
        [{ changeRatio: null, key: "A", premium: 100 }],
        null,
      ),
    ).toBe("Category A closed highest, at $100.");
  });
});

describe("successRateCaption", () => {
  it("should give the lowest and highest success rate", () => {
    expect(
      successRateCaption(
        [
          exercise("2026-10", 2, 1, { bidsReceived: 100, bidsSuccess: 80 }),
          exercise("2026-10", 1, 1, { bidsReceived: 100, bidsSuccess: 50 }),
          exercise("2026-08", 2, 1, { bidsReceived: 0, bidsSuccess: 0 }),
        ],
        "Category A",
      ),
    ).toBe(
      "The Category A success rate ranged from 50% (Oct 2026 · 1st) to 80% (Oct 2026 · 2nd) over these 3 exercises.",
    );
  });

  it("should return undefined without any bids", () => {
    expect(
      successRateCaption(
        [exercise("2026-10", 2, 1, { bidsReceived: 0 })],
        "Category A",
      ),
    ).toBeUndefined();
  });
});

describe("rangeCaption", () => {
  it("should note an all-time high set this year", () => {
    const year = [
      exercise("2026-01", 1, 100_000),
      exercise("2026-10", 2, 130_000),
    ];
    expect(
      rangeCaption(
        "Category A",
        2026,
        premiumRangeStats(year),
        premiumRangeStats([exercise("2010-01", 1, 18_000), ...year]),
      ),
    ).toBe(
      "Category A has moved by $30,000 in 2026 to date; its all-time high is $130,000 (Oct 2026 · 2nd), set this year.",
    );
  });

  it("should return undefined without a range", () => {
    expect(
      rangeCaption("Category A", 2026, undefined, undefined),
    ).toBeUndefined();
  });
});
