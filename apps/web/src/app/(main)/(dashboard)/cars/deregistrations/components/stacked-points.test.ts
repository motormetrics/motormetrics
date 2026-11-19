import { stackedPoints } from "@web/app/(main)/(dashboard)/cars/deregistrations/components/stacked-points";
import { describe, expect, it } from "vitest";

describe("stackedPoints", () => {
  const series = [
    { counts: [3, 1], month: "2025-12", total: 4 },
    { counts: [5, 2], month: "2026-01", total: 7 },
    { counts: [6, 0], month: "2026-02", total: 6 },
  ];

  it("should put the selected month's counts in the selected series only", () => {
    const [, selected] = stackedPoints(series, "2026-01");

    expect(selected).toMatchObject({
      other0: 0,
      other1: 0,
      selected0: 5,
      selected1: 2,
      total: 7,
    });
  });

  it("should put every other month's counts in the other series", () => {
    const [first] = stackedPoints(series, "2026-01");

    expect(first).toMatchObject({
      other0: 3,
      other1: 1,
      selected0: 0,
      selected1: 0,
    });
  });

  it("should mark the year under the first month and every January", () => {
    expect(
      stackedPoints(series, "2026-02").map(({ label, year }) => [label, year]),
    ).toEqual([
      ["Dec", "2025"],
      ["Jan", "2026"],
      ["Feb", ""],
    ]);
  });

  it("should title each point with the full month for the tooltip", () => {
    expect(stackedPoints(series, "2026-02")[2].title).toBe("Feb 2026");
  });
});
