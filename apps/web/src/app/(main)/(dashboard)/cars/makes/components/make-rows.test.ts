import { describe, expect, it } from "vitest";
import {
  buildLogoMap,
  buildTotalsFromFuelRows,
  buildTotalsFromStats,
  finaliseRows,
  rollingMonths,
  selectElectricOnlyMakes,
  shiftMonth,
} from "./make-rows";

const stats = [
  {
    make: "TOYOTA",
    count: 1000,
    share: 50,
    trend: [{ value: 60 }, { value: 40 }],
    yoyChange: 25,
  },
  {
    make: "BYD",
    count: 600,
    share: 30,
    trend: [{ value: 20 }, { value: 30 }],
    yoyChange: null,
  },
  {
    make: "SAAB",
    count: 0,
    share: 0,
    trend: [],
    yoyChange: null,
  },
];

describe("shiftMonth", () => {
  it("steps forward and backward within a year", () => {
    expect(shiftMonth("2025-04", 2)).toBe("2025-06");
    expect(shiftMonth("2025-04", -2)).toBe("2025-02");
  });

  it("rolls over year boundaries in both directions", () => {
    expect(shiftMonth("2025-01", -1)).toBe("2024-12");
    expect(shiftMonth("2024-12", 1)).toBe("2025-01");
    expect(shiftMonth("2025-06", -11)).toBe("2024-07");
  });
});

describe("rollingMonths", () => {
  it("returns the twelve months ending at the given month, oldest first", () => {
    const months = rollingMonths("2025-03");

    expect(months).toHaveLength(12);
    expect(months[0]).toBe("2024-04");
    expect(months.at(-1)).toBe("2025-03");
  });
});

describe("buildLogoMap", () => {
  it("keys logo urls by slug and skips makes without one", () => {
    expect(
      buildLogoMap([
        { make: "Mercedes Benz", filename: "mb.png", url: "https://x/mb.png" },
        { make: "Saab", filename: "", url: "" },
      ]),
    ).toEqual({ "mercedes-benz": "https://x/mb.png" });
  });
});

describe("buildTotalsFromStats", () => {
  it("uses the year-to-date count for the ytd range", () => {
    const totals = buildTotalsFromStats(stats, "ytd", {});

    expect(totals[0]).toMatchObject({ count: 1000, make: "TOYOTA" });
  });

  it("sums the rolling trend for the twelve-month range", () => {
    const totals = buildTotalsFromStats(stats, "12m", {});

    expect(totals[0].count).toBe(100);
    expect(totals[1].count).toBe(50);
  });

  it("takes the supplied per-month counts for the month range", () => {
    const totals = buildTotalsFromStats(stats, "month", { TOYOTA: 88 });

    expect(totals[0].count).toBe(88);
    // A make with no registrations that month falls to zero rather than
    // borrowing the last value of its trend.
    expect(totals[1].count).toBe(0);
  });

  it("carries the year-on-year change through unchanged", () => {
    const totals = buildTotalsFromStats(stats, "ytd", {});

    expect(totals[0].yoyChange).toBe(25);
    expect(totals[1].yoyChange).toBeNull();
  });
});

describe("buildTotalsFromFuelRows", () => {
  const rows = [
    // Inside the prior-year comparison window (Jan–Feb 2024).
    { count: 10, fuelType: "Electric", make: "BYD", month: "2024-02" },
    // Later in 2024: outside that window, inside the rolling 12 months.
    { count: 7, fuelType: "Electric", make: "BYD", month: "2024-11" },
    { count: 20, fuelType: "Electric", make: "BYD", month: "2025-01" },
    { count: 30, fuelType: "Electric", make: "BYD", month: "2025-02" },
    // Returned by the same wildcard query but a different fuel type.
    {
      count: 99,
      fuelType: "Electric (Plug-In)",
      make: "BYD",
      month: "2025-02",
    },
    { count: 5, fuelType: "Electric", make: "TESLA", month: "2025-02" },
  ];

  it("ignores rows whose fuel type only matched the sql wildcard", () => {
    const totals = buildTotalsFromFuelRows(rows, "Electric", "2025-02", "ytd");
    const byd = totals.find((item) => item.make === "BYD");

    expect(byd?.count).toBe(50);
  });

  it("computes each range from the same rows", () => {
    const month = buildTotalsFromFuelRows(rows, "Electric", "2025-02", "month");
    const rolling = buildTotalsFromFuelRows(rows, "Electric", "2025-02", "12m");

    expect(month.find((item) => item.make === "BYD")?.count).toBe(30);
    expect(rolling.find((item) => item.make === "BYD")?.count).toBe(57);
  });

  it("aligns the trend to the twelve months ending at the latest month", () => {
    const [byd] = buildTotalsFromFuelRows(rows, "Electric", "2025-02", "ytd");

    expect(byd.trend).toHaveLength(12);
    expect(byd.trend.at(-1)).toBe(30);
    expect(byd.trend.at(-2)).toBe(20);
  });

  it("compares against the same months a year earlier, not the whole year", () => {
    const totals = buildTotalsFromFuelRows(rows, "Electric", "2025-02", "ytd");

    // Jan–Feb 2025 is 50 against Jan–Feb 2024 of 10. Counting all of 2024
    // would fold in the November 7 and understate this as +194%.
    expect(totals.find((item) => item.make === "BYD")?.yoyChange).toBe(400);
  });

  it("reports no change when the make has no prior-year registrations", () => {
    const totals = buildTotalsFromFuelRows(rows, "Electric", "2025-02", "ytd");

    expect(totals.find((item) => item.make === "TESLA")?.yoyChange).toBeNull();
  });
});

describe("finaliseRows", () => {
  const totals = [
    { count: 200, make: "BYD", trend: [], yoyChange: 5 },
    { count: 800, make: "TOYOTA", trend: [], yoyChange: null },
    { count: 0, make: "SAAB", trend: [], yoyChange: null },
  ];

  it("ranks by count and drops makes with nothing registered", () => {
    const rows = finaliseRows(totals);

    expect(rows.map((row) => row.make)).toEqual(["TOYOTA", "BYD"]);
    expect(rows.map((row) => row.rank)).toEqual([1, 2]);
  });

  it("shares each make out of the visible total", () => {
    const rows = finaliseRows(totals);

    expect(rows[0].share).toBe(80);
    expect(rows[1].share).toBe(20);
  });

  it("attaches a logo url by slug when one exists", () => {
    const rows = finaliseRows(totals, { toyota: "https://x/toyota.png" });

    expect(rows[0].logoUrl).toBe("https://x/toyota.png");
    expect(rows[1].logoUrl).toBeNull();
  });
});

describe("selectElectricOnlyMakes", () => {
  it("keeps only makes whose whole year is battery-electric", () => {
    const summary = selectElectricOnlyMakes(
      stats,
      new Map([
        ["TOYOTA", 400],
        ["BYD", 600],
      ]),
    );

    expect(summary.makes.map((make) => make.make)).toEqual(["BYD"]);
  });

  it("reports their combined share of all registrations", () => {
    const summary = selectElectricOnlyMakes(stats, new Map([["BYD", 600]]));

    expect(summary.sharePercent).toBeCloseTo(37.5);
  });

  it("reports a zero share when no make is electric-only", () => {
    const summary = selectElectricOnlyMakes(stats, new Map());

    expect(summary.makes).toEqual([]);
    expect(summary.sharePercent).toBe(0);
  });
});
