import type { MakeFigures } from "@web/app/(main)/(dashboard)/cars/makes/compare/[pair]/components/figures";
import {
  buildSummaryRows,
  formatPoints,
  formatSignedPercent,
  leadSentence,
  monthlyRows,
  trendSummary,
} from "@web/app/(main)/(dashboard)/cars/makes/compare/[pair]/components/summary";
import { describe, expect, it } from "vitest";

const figures = (overrides: Partial<MakeFigures>): MakeFigures => ({
  change: null,
  electric: 0,
  fuelCounts: new Map(),
  previous: 0,
  series: [],
  vehicleCounts: new Map(),
  ytd: 0,
  ...overrides,
});

const bmw = figures({
  change: -30.4,
  electric: 840,
  previous: 3190,
  ytd: 2218,
});
const audi = figures({
  change: -26.0,
  electric: 444,
  previous: 3433,
  ytd: 2541,
});

describe("formatSignedPercent", () => {
  it("should sign rises with a plus and falls with a true minus", () => {
    expect(formatSignedPercent(4.24)).toBe("+4.2%");
    expect(formatSignedPercent(-3.1)).toBe("−3.1%");
    expect(formatSignedPercent(0.01)).toBe("0.0%");
  });

  it("should print a gap in points as a bare figure", () => {
    expect(formatPoints(-12.24)).toBe("12.2 pts");
  });
});

describe("buildSummaryRows", () => {
  const rows = buildSummaryRows({
    a: bmw,
    b: audi,
    marketTotal: 40_000,
    month: "2026-09",
  });

  it("should give the gap and the leader for each row", () => {
    expect(
      rows.map((row) => [row.id, row.a, row.b, row.gap, row.leader]),
    ).toEqual([
      ["registrations", "2,218", "2,541", "323", "b"],
      ["change", "−30.4%", "−26.0%", "4.4 pts", "b"],
      ["share", "5.5%", "6.4%", "0.9 pts", "b"],
      ["electric", "37.9%", "17.5%", "20.4 pts", "a"],
    ]);
  });

  it("should define the change against the previous year", () => {
    expect(rows[1].note).toBe("vs the same months of 2025");
  });

  it("should take each gap from the figures as shown, not the raw values", () => {
    const [, change, share, electric] = buildSummaryRows({
      a: { ...bmw, change: 5.06, electric: 1236 * 0.0126, ytd: 1236 },
      b: { ...audi, change: 4.94, electric: 1224 * 0.0124, ytd: 1224 },
      marketTotal: 10_000,
      month: "2026-09",
    });

    expect([change.a, change.b, change.gap]).toEqual([
      "+5.1%",
      "+4.9%",
      "0.2 pts",
    ]);
    expect([share.a, share.b, share.gap]).toEqual([
      "12.4%",
      "12.2%",
      "0.2 pts",
    ]);
    // 1.26 against 1.24 is a raw gap of 0.02, which would read "0.0 pts".
    expect([electric.a, electric.b, electric.gap, electric.leader]).toEqual([
      "1.3%",
      "1.2%",
      "0.1 pts",
      "a",
    ]);
  });

  it("should name the single baseline month in January", () => {
    const [, change] = buildSummaryRows({
      a: bmw,
      b: audi,
      marketTotal: 40_000,
      month: "2026-01",
    });

    expect(change.note).toBe("vs January 2025");
  });

  it("should show a dash when either make has no baseline", () => {
    const [, change] = buildSummaryRows({
      a: { ...bmw, change: null },
      b: audi,
      marketTotal: 40_000,
      month: "2026-09",
    });

    expect(change).toMatchObject({
      a: "—",
      b: "−26.0%",
      gap: "—",
      leader: null,
    });
  });

  it("should call equal figures level with no leader", () => {
    const [registrations] = buildSummaryRows({
      a: bmw,
      b: { ...audi, ytd: bmw.ytd },
      marketTotal: 40_000,
      month: "2026-09",
    });

    expect(registrations).toMatchObject({ gap: "Level", leader: null });
  });
});

describe("leadSentence", () => {
  it("should name the leader and the gap over the year to date", () => {
    expect(
      leadSentence({
        a: bmw,
        b: audi,
        month: "2026-09",
        nameA: "BMW",
        nameB: "AUDI",
      }),
    ).toBe(
      "AUDI registered 323 more new cars than BMW in Singapore from January to September 2026.",
    );
  });

  it("should say so when the two are level", () => {
    expect(
      leadSentence({
        a: bmw,
        b: { ...audi, ytd: bmw.ytd },
        month: "2026-09",
        nameA: "BMW",
        nameB: "AUDI",
      }),
    ).toBe(
      "BMW and AUDI each registered 2,218 new cars in Singapore from January to September 2026.",
    );
  });

  it("should name the single month in January", () => {
    expect(
      leadSentence({
        a: bmw,
        b: audi,
        month: "2026-01",
        nameA: "BMW",
        nameB: "AUDI",
      }),
    ).toContain("in Singapore in January 2026.");
  });
});

describe("trendSummary", () => {
  it("should describe both series from first to last month", () => {
    expect(
      trendSummary({
        months: ["2024-10", "2024-11", "2026-09"],
        nameA: "BMW",
        nameB: "AUDI",
        seriesA: [447, 375, 187],
        seriesB: [364, 416, 1242],
      }),
    ).toBe(
      "Monthly registrations from October 2024 to September 2026. BMW 447 to 187; AUDI 364 to 1,242.",
    );
  });
});

describe("monthlyRows", () => {
  it("should list months newest first with who was ahead", () => {
    const rows = monthlyRows({
      months: ["2026-07", "2026-08", "2026-09"],
      nameA: "BMW",
      nameB: "AUDI",
      seriesA: [10, 20, 30],
      seriesB: [15, 20, 5],
    });

    expect(rows.map((row) => [row.key, row.aheadBy, row.leader])).toEqual([
      ["2026-09", "BMW +25", "a"],
      ["2026-08", "Level", null],
      ["2026-07", "AUDI +5", "b"],
    ]);
  });
});
