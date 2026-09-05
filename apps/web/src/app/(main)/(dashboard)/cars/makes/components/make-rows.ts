import type { CarLogo } from "@motormetrics/logos";
import { slugify } from "@motormetrics/utils";
import { HYBRID_REGEX } from "@web/config";
import type { MakeRegistrationStat } from "@web/queries/cars";
import {
  getCarsLatestMonth,
  getDistinctFuelTypes,
  getFuelTypeData,
  getMakeRegistrationStats,
} from "@web/queries/cars";
import { getAllCarLogos } from "@web/queries/logos";
import { cache } from "react";
import {
  FUEL_FILTERS,
  type FuelFilter,
  isFuelFilter,
  type Range,
} from "../search-params";

export { FUEL_FILTERS, type FuelFilter, isFuelFilter };

/** The `cars.fuelType` value that means battery-electric and nothing else. */
const BEV_FUEL_TYPE = "Electric";

/** The breakdown queries each powertrain tab resolves to. */
const FUEL_FILTER_QUERIES: Record<FuelFilter, string[]> = {
  Petrol: ["Petrol"],
  Hybrid: ["Petrol-Electric", "Diesel-Electric"],
  Electric: [BEV_FUEL_TYPE],
};

/** Whether a `cars.fuelType` value belongs to the tab. */
export function matchesFuelFilter(
  filter: FuelFilter,
  fuelType: string,
): boolean {
  if (filter === "Hybrid") {
    return HYBRID_REGEX.test(fuelType);
  }
  return fuelType === filter;
}

export interface MakeRow {
  count: number;
  logoUrl: string | null;
  make: string;
  /** 1-based position by count across every make in the active range. */
  rank: number;
  /** Percentage of the active range's total registrations. */
  share: number;
  slug: string;
  /** Rolling 12-month registrations, oldest first. */
  trend: number[];
  /** Percentage change against the same months a year earlier. */
  yoyChange: number | null;
}

export interface MakeRowsResult {
  /** Every fuel type with registrations, for the filter tabs. */
  fuelTypes: string[];
  latestMonth: string | null;
  rows: MakeRow[];
  total: number;
}

interface MakeTotals {
  count: number;
  make: string;
  trend: number[];
  yoyChange: number | null;
}

interface FuelRow {
  count: number;
  fuelType: string;
  make: string;
  month: string;
}

/**
 * Month arithmetic on `YYYY-MM` strings.
 *
 * Deliberately does not go through `Date`: Cache Components rejects reading the
 * current time anywhere in the prerender path, and plain arithmetic keeps this
 * provably clock-free.
 */
export function shiftMonth(month: string, delta: number): string {
  const [year, monthPart] = month.split("-").map(Number);
  const index = year * 12 + (monthPart - 1) + delta;
  return `${Math.floor(index / 12)}-${String((index % 12) + 1).padStart(2, "0")}`;
}

/** The 12 months ending at `latestMonth`, oldest first. */
export function rollingMonths(latestMonth: string): string[] {
  const start = shiftMonth(latestMonth, -11);
  return Array.from({ length: 12 }, (_, index) => shiftMonth(start, index));
}

export function buildLogoMap(logos: CarLogo[]): Record<string, string> {
  return logos.reduce<Record<string, string>>((acc, logo) => {
    if (logo.url) {
      acc[slugify(logo.make)] = logo.url;
    }
    return acc;
  }, {});
}

/**
 * Sort by count, rank, and work out each make's share of the visible total.
 * Makes with nothing registered in the range are dropped rather than shown as
 * an empty row.
 */
export function finaliseRows(
  totals: MakeTotals[],
  logoUrlBySlug: Record<string, string> = {},
): MakeRow[] {
  const ranked = totals
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count);
  const total = ranked.reduce((sum, item) => sum + item.count, 0);

  return ranked.map((item, index) => {
    const slug = slugify(item.make);
    return {
      count: item.count,
      logoUrl: logoUrlBySlug[slug] ?? null,
      make: item.make,
      rank: index + 1,
      share: total > 0 ? (item.count / total) * 100 : 0,
      slug,
      trend: item.trend,
      yoyChange: item.yoyChange,
    };
  });
}

/**
 * Reshape `getMakeRegistrationStats()` for the active range.
 *
 * `count` is the year to date and `trend` the rolling 12 months, so two of the
 * three ranges fall straight out of the same query. The per-month figure has to
 * be supplied separately — `trend` carries no month labels, and a make that
 * skipped a month has a shorter array, so its last entry is not reliably the
 * latest month.
 */
export function buildTotalsFromStats(
  stats: MakeRegistrationStat[],
  range: Range,
  monthCountByMake: Record<string, number>,
): MakeTotals[] {
  return stats.map((stat) => {
    const trend = stat.trend.map((point) => point.value);
    let count = stat.count;
    if (range === "12m") {
      count = trend.reduce((sum, value) => sum + value, 0);
    } else if (range === "month") {
      count = monthCountByMake[stat.make] ?? 0;
    }

    return { count, make: stat.make, trend, yoyChange: stat.yoyChange };
  });
}

/**
 * Aggregate the raw `{ month, make, fuelType, count }` rows of one powertrain
 * tab into the same shape.
 *
 * Rows are re-filtered through `isMatch` because `getFuelTypeData` turns
 * hyphens into SQL wildcards, so asking for "Petrol-Electric" also returns the
 * plug-in variant — wanted for the Hybrid tab, not for an exact fuel type.
 *
 * The year-on-year window mirrors `getMakeRegistrationStats()`: January to the
 * latest month, against the same months a year earlier. Both paths feed the same
 * delta chips and the same footnote, so they have to measure the same thing.
 */
export function buildTotalsFromFuelRows(
  rows: FuelRow[],
  isMatch: (fuelType: string) => boolean,
  latestMonth: string,
  range: Range,
): MakeTotals[] {
  const latestYear = latestMonth.slice(0, 4);
  const previousYear = String(Number(latestYear) - 1);
  const previousStart = `${previousYear}-01`;
  const previousEnd = `${previousYear}-${latestMonth.slice(5)}`;
  const months = rollingMonths(latestMonth);
  const rollingStart = months[0];

  const totals = new Map<
    string,
    { currentYear: number; monthly: Map<string, number>; previousYear: number }
  >();

  for (const row of rows) {
    if (!isMatch(row.fuelType)) {
      continue;
    }

    const entry = totals.get(row.make) ?? {
      currentYear: 0,
      monthly: new Map<string, number>(),
      previousYear: 0,
    };

    if (row.month.startsWith(`${latestYear}-`)) {
      entry.currentYear += row.count;
    }
    if (row.month >= previousStart && row.month <= previousEnd) {
      entry.previousYear += row.count;
    }
    if (row.month >= rollingStart && row.month <= latestMonth) {
      entry.monthly.set(
        row.month,
        (entry.monthly.get(row.month) ?? 0) + row.count,
      );
    }

    totals.set(row.make, entry);
  }

  return [...totals].map(([make, entry]) => {
    const trend = months.map((month) => entry.monthly.get(month) ?? 0);
    let count = entry.currentYear;
    if (range === "12m") {
      count = trend.reduce((sum, value) => sum + value, 0);
    } else if (range === "month") {
      count = entry.monthly.get(latestMonth) ?? 0;
    }

    return {
      count,
      make,
      trend,
      yoyChange:
        entry.previousYear > 0
          ? ((entry.currentYear - entry.previousYear) / entry.previousYear) *
            100
          : null,
    };
  });
}

/**
 * Per-make totals for a single month, assembled from the per-fuel breakdowns.
 * There is no single-query equivalent that covers every make.
 */
async function loadMonthCounts(
  month: string,
  fuelTypes: string[],
): Promise<Record<string, number>> {
  const breakdowns = await Promise.all(
    fuelTypes.map((fuelType) => getFuelTypeData(fuelType, month)),
  );

  return breakdowns.reduce<Record<string, number>>((acc, breakdown, index) => {
    const fuelType = fuelTypes[index];
    for (const row of breakdown.data) {
      if (row.fuelType !== fuelType || row.month !== month) {
        continue;
      }
      acc[row.make] = (acc[row.make] ?? 0) + row.count;
    }
    return acc;
  }, {});
}

/**
 * Every make for the active range and fuel filter, ranked and shared out.
 *
 * Memoised per request because four sections read the same rows behind their
 * own Suspense boundaries.
 */
export const loadMakeRows = cache(
  async (range: Range, fuel: string | null): Promise<MakeRowsResult> => {
    const [latestMonth, fuelTypeRows, logoResult] = await Promise.all([
      getCarsLatestMonth(),
      getDistinctFuelTypes(),
      getAllCarLogos(),
    ]);

    const fuelTypes = fuelTypeRows.map((row) => row.fuelType);
    const logoUrlBySlug = buildLogoMap(
      "logos" in logoResult ? logoResult.logos : [],
    );

    if (!latestMonth) {
      return { fuelTypes, latestMonth: null, rows: [], total: 0 };
    }

    let totals: MakeTotals[];
    if (isFuelFilter(fuel)) {
      const breakdowns = await Promise.all(
        FUEL_FILTER_QUERIES[fuel].map((fuelType) => getFuelTypeData(fuelType)),
      );
      totals = buildTotalsFromFuelRows(
        breakdowns.flatMap((breakdown) => breakdown.data),
        (fuelType) => matchesFuelFilter(fuel, fuelType),
        latestMonth,
        range,
      );
    } else {
      const [stats, monthCountByMake] = await Promise.all([
        getMakeRegistrationStats(),
        range === "month"
          ? loadMonthCounts(latestMonth, fuelTypes)
          : Promise.resolve({}),
      ]);
      totals = buildTotalsFromStats(stats, range, monthCountByMake);
    }

    const rows = finaliseRows(totals, logoUrlBySlug);

    return {
      fuelTypes,
      latestMonth,
      rows,
      total: rows.reduce((sum, row) => sum + row.count, 0),
    };
  },
);

export interface ElectricOnlyMake {
  count: number;
  logoUrl: string | null;
  make: string;
  slug: string;
}

export interface ElectricOnlySummary {
  makes: ElectricOnlyMake[];
  sharePercent: number;
}

/**
 * Decide which makes sell nothing but battery-electric cars by comparing each
 * make's Electric registrations for the latest year against its total for the
 * same year — a make whose two figures agree has no petrol, diesel or hybrid
 * line at all.
 */
export function selectElectricOnlyMakes(
  stats: MakeRegistrationStat[],
  electricByMake: Map<string, number>,
  logoUrlBySlug: Record<string, string> = {},
): ElectricOnlySummary {
  const grandTotal = stats.reduce((sum, stat) => sum + stat.count, 0);
  const electricOnly = stats
    .filter(
      (stat) => stat.count > 0 && electricByMake.get(stat.make) === stat.count,
    )
    .sort((a, b) => b.count - a.count);

  const electricOnlyTotal = electricOnly.reduce(
    (sum, stat) => sum + stat.count,
    0,
  );

  return {
    makes: electricOnly.map((stat) => {
      const slug = slugify(stat.make);
      return {
        count: stat.count,
        logoUrl: logoUrlBySlug[slug] ?? null,
        make: stat.make,
        slug,
      };
    }),
    sharePercent: grandTotal > 0 ? (electricOnlyTotal / grandTotal) * 100 : 0,
  };
}

export const loadElectricOnlyMakes = cache(
  async (): Promise<ElectricOnlySummary | null> => {
    const [latestMonth, stats, electric, logoResult] = await Promise.all([
      getCarsLatestMonth(),
      getMakeRegistrationStats(),
      getFuelTypeData(BEV_FUEL_TYPE),
      getAllCarLogos(),
    ]);

    if (!latestMonth) {
      return null;
    }

    const latestYear = latestMonth.slice(0, 4);
    const electricByMake = new Map<string, number>();
    for (const row of electric.data) {
      if (
        row.fuelType !== BEV_FUEL_TYPE ||
        !row.month.startsWith(`${latestYear}-`)
      ) {
        continue;
      }
      electricByMake.set(
        row.make,
        (electricByMake.get(row.make) ?? 0) + row.count,
      );
    }

    return selectElectricOnlyMakes(
      stats,
      electricByMake,
      buildLogoMap("logos" in logoResult ? logoResult.logos : []),
    );
  },
);
