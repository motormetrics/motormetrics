import {
  compareCaption,
  monthsCaption,
  pqpLead,
  ratesCaption,
  renewalSeries,
  renewalsCaption,
  trendCaption,
} from "@web/app/(main)/(dashboard)/coe/pqp/components/pqp-captions";
import { describe, expect, it } from "vitest";

const rates = (values: number[], start = 3) =>
  values.map((rate, index) => ({
    month: `2026-${String(start + index).padStart(2, "0")}`,
    rate,
  }));

describe("pqpLead", () => {
  it("should quote the cost and its change on the previous month", () => {
    expect(pqpLead("Category A", "10", rates([100_000, 102_000]))).toBe(
      "Renewing a Category A COE for 10 years costs $102,000 in April, 2.0% more than in March.",
    );
    expect(pqpLead("Category B", "5", rates([50_000, 49_000]))).toBe(
      "Renewing a Category B COE for 5 years costs $49,000 in April, 2.0% less than in March.",
    );
  });

  it("should leave out the change without a previous month", () => {
    expect(pqpLead("Category A", "10", rates([100_000]))).toBe(
      "Renewing a Category A COE for 10 years costs $100,000 in March.",
    );
  });

  it("should return undefined without rates", () => {
    expect(pqpLead("Category A", "10", [])).toBeUndefined();
  });
});

describe("trendCaption", () => {
  it("should measure the rise from the window's low", () => {
    expect(trendCaption("Category A", rates([110, 100, 120]))).toBe(
      "The Category A PQP rose from its 3-month low of $100 in April 2026 to $120 in May 2026, +20.0%.",
    );
  });

  it("should say when the latest month is the low", () => {
    expect(trendCaption("Category A", rates([120, 110, 100]))).toBe(
      "The Category A PQP for May 2026, $100, is its lowest in 3 months.",
    );
  });
});

describe("ratesCaption", () => {
  it("should give each gap when every PQP is below its premium", () => {
    expect(
      ratesCaption([
        { key: "A", premium: 100, rate: 90 },
        { key: "B", premium: 200, rate: 190 },
      ]),
    ).toBe(
      "Both PQPs sit below the latest closing premium: Category A by 10.0% and Category B by 5.0%.",
    );
  });

  it("should give signed gaps when a PQP is above its premium", () => {
    expect(
      ratesCaption([
        { key: "A", premium: 100, rate: 110 },
        { key: "B", premium: 200, rate: 190 },
      ]),
    ).toBe(
      "Category A's PQP is +10.0% against its latest premium, and Category B's PQP is −5.0% against its latest premium.",
    );
  });

  it("should return undefined without premiums", () => {
    expect(ratesCaption([{ key: "A", premium: 0, rate: 90 }])).toBeUndefined();
  });
});

describe("compareCaption", () => {
  it("should name the dearer category and note both renew for less", () => {
    expect(
      compareCaption([
        { key: "A", premium: 130, rate: 120 },
        { key: "B", premium: 140, rate: 125 },
      ]),
    ).toBe(
      "Category B costs more to renew than Category A, $125 against $120, and both renew for less than a new COE would have cost at the latest exercise.",
    );
  });

  it("should stop after the comparison when a PQP is above its premium", () => {
    expect(
      compareCaption([
        { key: "A", premium: 110, rate: 120 },
        { key: "B", premium: 140, rate: 125 },
      ]),
    ).toBe(
      "Category B costs more to renew than Category A, $125 against $120.",
    );
  });
});

describe("monthsCaption", () => {
  it("should count a run of rises", () => {
    expect(monthsCaption("Category A", rates([100, 90, 95, 99]))).toBe(
      "The Category A PQP has risen for 2 months in a row, since April 2026.",
    );
  });

  it("should count a run of falls", () => {
    expect(monthsCaption("Category B", rates([120, 110, 100]))).toBe(
      "The Category B PQP has fallen for 2 months in a row, since March 2026.",
    );
  });

  it("should give the latest change without a run", () => {
    expect(monthsCaption("Category A", rates([100, 90, 99]))).toBe(
      "The Category A PQP changed +10.0% in May 2026.",
    );
  });
});

const CATEGORIES = ["Category A", "Category B"];

const revalidations = [
  { month: "2026-09", type: "10 Year", category: "Category A", number: 272 },
  { month: "2026-08", type: "10 Year", category: "Category A", number: 121 },
  { month: "2026-08", type: "10 Year", category: "Category B", number: 307 },
  { month: "2026-09", type: "10 Year", category: "Category B", number: 627 },
  { month: "2026-09", type: "5 Year", category: "Category A", number: 593 },
  { month: "2026-09", type: "10 Year", category: "Category C", number: 49 },
];

describe("renewalSeries", () => {
  it("should keep one term and the given categories, oldest month first", () => {
    expect(renewalSeries(revalidations, CATEGORIES, "10")).toEqual([
      { month: "2026-08", counts: { "Category A": 121, "Category B": 307 } },
      { month: "2026-09", counts: { "Category A": 272, "Category B": 627 } },
    ]);
  });

  it("should count a category missing from a month as zero", () => {
    expect(renewalSeries(revalidations, CATEGORIES, "5")).toEqual([
      { month: "2026-09", counts: { "Category A": 593, "Category B": 0 } },
    ]);
  });

  it("should keep only the latest months", () => {
    expect(
      renewalSeries(revalidations, CATEGORIES, "10", 1).map(
        ({ month }) => month,
      ),
    ).toEqual(["2026-09"]);
  });
});

describe("renewalsCaption", () => {
  const series = renewalSeries(revalidations, CATEGORIES, "10");

  it("should quote the latest month against the one before", () => {
    expect(renewalsCaption("Category A", "10", series)).toBe(
      "In September 2026, 272 Category A COEs were renewed for 10 years, up from 121 in August.",
    );
  });

  it("should quote the latest month alone without a previous month", () => {
    expect(renewalsCaption("Category B", "10", series.slice(-1))).toBe(
      "In September 2026, 627 Category B COEs were renewed for 10 years.",
    );
  });

  it("should return undefined without data", () => {
    expect(renewalsCaption("Category A", "10", [])).toBeUndefined();
  });
});
