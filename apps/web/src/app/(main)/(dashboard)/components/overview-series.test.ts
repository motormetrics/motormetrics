import { describe, expect, it } from "vitest";
import {
  changeRatio,
  donutArcs,
  nextMonth,
  pqpMonthsFor,
  sumByMonth,
  windowEndingAt,
} from "./overview-series";

describe("nextMonth", () => {
  it("should step to the following month", () => {
    expect(nextMonth("2025-10")).toBe("2025-11");
  });

  it("should roll December into January of the next year", () => {
    expect(nextMonth("2025-12")).toBe("2026-01");
  });
});

describe("sumByMonth", () => {
  it("should add every category into one total per month, oldest first", () => {
    const rows = [
      { month: "2025-02", number: 5 },
      { month: "2025-01", number: 3 },
      { month: "2025-02", number: null },
      { month: "2025-01", number: 4 },
    ];

    expect(sumByMonth(rows)).toEqual([
      { month: "2025-01", total: 7 },
      { month: "2025-02", total: 5 },
    ]);
  });
});

describe("windowEndingAt", () => {
  const series = ["2025-01", "2025-02", "2025-03", "2025-04"].map((month) => ({
    month,
  }));

  it("should return the last entries up to the selected month", () => {
    expect(
      windowEndingAt(series, "2025-03", 2).map((item) => item.month),
    ).toEqual(["2025-02", "2025-03"]);
  });

  it("should end at the newest entry not after a month the series lacks", () => {
    expect(
      windowEndingAt(series, "2025-06", 8).map((item) => item.month),
    ).toEqual(["2025-01", "2025-02", "2025-03", "2025-04"]);
  });

  it("should return nothing when every entry is after the month", () => {
    expect(windowEndingAt(series, "2024-12", 8)).toEqual([]);
  });
});

describe("pqpMonthsFor", () => {
  it("should quote the month after the selection and the month before it", () => {
    expect(pqpMonthsFor(["2025-09", "2025-11", "2025-10"], "2025-10")).toEqual({
      current: "2025-11",
      previous: "2025-10",
    });
  });

  it("should fall back to the newest published month before the target", () => {
    expect(pqpMonthsFor(["2025-09", "2025-10"], "2025-10")).toEqual({
      current: "2025-10",
      previous: "2025-09",
    });
  });

  it("should use the earliest month when nothing has been published yet", () => {
    expect(pqpMonthsFor(["2026-01", "2026-02"], "2025-10")).toEqual({
      current: "2026-01",
      previous: undefined,
    });
  });

  it("should return null with no published months", () => {
    expect(pqpMonthsFor([], "2025-10")).toBeNull();
  });
});

describe("donutArcs", () => {
  it("should place each segment after the ones before it", () => {
    const arcs = donutArcs(
      [
        { color: "a", label: "Half", value: 50 },
        { color: "b", label: "Other half", value: 50 },
      ],
      74,
      16,
    );
    const circumference = 2 * Math.PI * 74;
    const half = circumference / 2;

    expect(arcs[0].dashArray).toBe(
      `${(half - 16).toFixed(2)} ${(circumference - half + 16).toFixed(2)}`,
    );
    expect(arcs[0].dashOffset).toBe("-8.00");
    expect(arcs[1].dashOffset).toBe((-(half + 8)).toFixed(2));
  });

  it("should keep a near-zero share visible as a tick", () => {
    const [tiny] = donutArcs(
      [
        { color: "a", label: "Tiny", value: 0.001 },
        { color: "b", label: "Rest", value: 100 },
      ],
      74,
      16,
    );

    expect(tiny.dashArray.startsWith("2.00 ")).toBe(true);
  });
});

describe("changeRatio", () => {
  it("should return the signed relative change", () => {
    expect(changeRatio(110, 100)).toBeCloseTo(0.1);
    expect(changeRatio(90, 100)).toBeCloseTo(-0.1);
  });

  it("should return zero without a usable baseline", () => {
    expect(changeRatio(100, undefined)).toBe(0);
    expect(changeRatio(100, 0)).toBe(0);
  });
});
