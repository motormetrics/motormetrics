import {
  aggregateMakesByFuelType,
  batteryElectricMakes,
  batteryElectricShares,
  buildRegistrationSplit,
  changeRatio,
  electrifiedMakes,
  powertrainTotal,
  resolveMonthIndex,
  sliceRange,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/ev-series";
import type { EvMarketShare, EvMonthlyTrend } from "@web/queries/cars";
import type { FuelType } from "@web/types/cars";
import { describe, expect, it } from "vitest";

const point: EvMonthlyTrend = {
  month: "2025-10",
  BEV: 1854,
  PHEV: 120,
  Hybrid: 1450,
};

const segments = [
  { colour: "bev", key: "bev" as const, label: "Battery-electric" },
  { colour: "phev", key: "phev" as const, label: "Plug-in hybrid" },
  { colour: "hybrid", key: "hybrid" as const, label: "Hybrid" },
];
const combustion = { colour: "other", label: "Petrol & diesel" };

const fuelTypes: FuelType[] = [
  {
    fuelType: "Electric",
    total: 500,
    makes: [
      { make: "Tesla", count: 300 },
      { make: "BYD", count: 200 },
    ],
  },
  {
    fuelType: "Petrol-Electric",
    total: 260,
    makes: [
      { make: "Toyota", count: 210 },
      { make: "Tesla", count: 50 },
    ],
  },
  {
    fuelType: "Petrol",
    total: 900,
    makes: [{ make: "Honda", count: 900 }],
  },
];

describe("resolveMonthIndex", () => {
  const months = ["2025-06", "2025-07", "2025-08"];

  it("should return the index of an exact match", () => {
    expect(resolveMonthIndex(months, "2025-07")).toBe(1);
  });

  it("should fall back to the newest month at or before the request", () => {
    expect(resolveMonthIndex(months, "2025-09")).toBe(2);
  });

  it("should fall back to the newest month when the request predates the series", () => {
    expect(resolveMonthIndex(months, "2024-01")).toBe(2);
  });

  it("should return -1 for an empty series", () => {
    expect(resolveMonthIndex([], "2025-07")).toBe(-1);
  });
});

describe("powertrainTotal", () => {
  it("should return the requested powertrain on its own", () => {
    expect(powertrainTotal(point, "bev")).toBe(1854);
    expect(powertrainTotal(point, "phev")).toBe(120);
    expect(powertrainTotal(point, "hybrid")).toBe(1450);
  });

  it("should sum every powertrain for the combined view", () => {
    expect(powertrainTotal(point, "all")).toBe(3424);
  });
});

describe("sliceRange", () => {
  const series = Array.from({ length: 40 }, (_, index) => index);

  it("should keep twelve months for 1Y", () => {
    expect(sliceRange(series, 39, "1Y")).toHaveLength(12);
    expect(sliceRange(series, 39, "1Y").at(0)).toBe(28);
  });

  it("should keep thirty-six months for 3Y", () => {
    expect(sliceRange(series, 39, "3Y")).toHaveLength(36);
  });

  it("should keep everything up to the selected month for All", () => {
    expect(sliceRange(series, 20, "All")).toHaveLength(21);
  });

  it("should not run off the start of a short series", () => {
    expect(sliceRange([1, 2, 3], 2, "3Y")).toEqual([1, 2, 3]);
  });

  it("should return nothing when the month could not be resolved", () => {
    expect(sliceRange(series, -1, "1Y")).toEqual([]);
  });
});

describe("changeRatio", () => {
  it("should return the signed relative change", () => {
    expect(changeRatio(110, 100)).toBeCloseTo(0.1);
    expect(changeRatio(90, 100)).toBeCloseTo(-0.1);
  });

  it("should return zero when there is no previous value to compare against", () => {
    expect(changeRatio(110, 0)).toBe(0);
  });
});

describe("batteryElectricShares", () => {
  const trend: EvMonthlyTrend[] = [
    { month: "2025-09", BEV: 1711, PHEV: 100, Hybrid: 1380 },
    { month: "2025-10", BEV: 1854, PHEV: 120, Hybrid: 1450 },
  ];
  const marketShare: EvMarketShare[] = [
    { month: "2025-09", evCount: 3191, totalCount: 5800, evShare: 55 },
    { month: "2025-10", evCount: 3424, totalCount: 6100, evShare: 56 },
  ];

  it("should exclude hybrids from the share it reports", () => {
    const [september, october] = batteryElectricShares(trend, marketShare);

    expect(september).toBeCloseTo((1711 / 5800) * 100);
    expect(october).toBeCloseTo((1854 / 6100) * 100);
  });

  it("should report zero for a month with no registration total", () => {
    expect(batteryElectricShares(trend, [])).toEqual([0, 0]);
  });
});

describe("buildRegistrationSplit", () => {
  it("should add a combustion remainder that closes the split to the month total", () => {
    const split = buildRegistrationSplit(point, 6000, segments, combustion);

    expect(split.map(({ label }) => label)).toEqual([
      "Battery-electric",
      "Plug-in hybrid",
      "Hybrid",
      "Petrol & diesel",
    ]);
    expect(split.at(-1)?.value).toBe(2576);
    expect(split.reduce((sum, segment) => sum + segment.share, 0)).toBeCloseTo(
      100,
    );
  });

  it("should floor the remainder at zero when electrified rows exceed the total", () => {
    const split = buildRegistrationSplit(point, 100, segments, combustion);

    expect(split.at(-1)?.value).toBe(0);
  });

  it("should not divide by zero for a month with no registrations", () => {
    const split = buildRegistrationSplit(
      { month: "2025-10", BEV: 0, PHEV: 0, Hybrid: 0 },
      0,
      segments,
      combustion,
    );

    expect(split.every(({ share }) => share === 0)).toBe(true);
  });
});

describe("aggregateMakesByFuelType", () => {
  it("should sum a make across every included fuel type", () => {
    expect(electrifiedMakes(fuelTypes)).toEqual([
      { make: "Tesla", count: 350 },
      { make: "Toyota", count: 210 },
      { make: "BYD", count: 200 },
    ]);
  });

  it("should narrow to battery-electric rows", () => {
    expect(batteryElectricMakes(fuelTypes)).toEqual([
      { make: "Tesla", count: 300 },
      { make: "BYD", count: 200 },
    ]);
  });

  it("should drop makes with no registrations", () => {
    const withZero: FuelType[] = [
      {
        fuelType: "Electric",
        total: 0,
        makes: [{ make: "Ghost", count: 0 }],
      },
    ];

    expect(aggregateMakesByFuelType(withZero, ["Electric"])).toEqual([]);
  });

  it("should return nothing when no fuel type matches", () => {
    expect(aggregateMakesByFuelType(fuelTypes, ["Hydrogen"])).toEqual([]);
  });
});
