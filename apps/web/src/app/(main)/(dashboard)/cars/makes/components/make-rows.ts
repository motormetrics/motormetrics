import { slugify } from "@motormetrics/utils/slugify";
import {
  type FuelFilter,
  isFuelFilter,
  type Range,
} from "@web/app/(main)/(dashboard)/cars/makes/search-params";
import { HYBRID_REGEX } from "@web/config";
import { LOGOS_CACHE_TAG } from "@web/lib/cache-tags/logos";
import type { MakeRegistrationStat } from "@web/queries/cars";
import {
  getCarsLatestMonth,
  getDistinctFuelTypes,
  getFuelTypeData,
  getMakeRegistrationStats,
} from "@web/queries/cars";
import { getMakeTotalsInRange } from "@web/queries/cars/makes/period-totals";
import { getCarLogoMap } from "@web/queries/logos";
import { shiftMonth } from "@web/utils/dates/month-arithmetic";
import { cacheLife, cacheTag } from "next/cache";

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
  /** Percentage change against the same period a year earlier. */
  yoyChange: number | null;
}

export interface MakeRowsResult {
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

/** The 12 months ending at `latestMonth`, oldest first. */
export function rollingMonths(latestMonth: string): string[] {
  const start = shiftMonth(latestMonth, -11);
  return Array.from({ length: 12 }, (_, index) => shiftMonth(start, index));
}

interface MonthWindow {
  end: string;
  start: string;
}

/** The months the active range covers, ending at `latestMonth`. */
export function rangeWindow(latestMonth: string, range: Range): MonthWindow {
  if (range === "month") {
    return { end: latestMonth, start: latestMonth };
  }
  if (range === "12m") {
    return { end: latestMonth, start: shiftMonth(latestMonth, -11) };
  }
  return { end: latestMonth, start: `${latestMonth.slice(0, 4)}-01` };
}

/**
 * The same period a year earlier, which every range's change is measured
 * against: the same month, the same January-to-month span, or the twelve
 * months before the rolling twelve.
 */
export function priorWindow(latestMonth: string, range: Range): MonthWindow {
  const { end, start } = rangeWindow(latestMonth, range);
  return { end: shiftMonth(end, -12), start: shiftMonth(start, -12) };
}

function percentChange(current: number, previous: number): number | null {
  return previous > 0 ? ((current - previous) / previous) * 100 : null;
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
 *
 * The query's `yoyChange` is the year-to-date change only, so the other two
 * ranges measure theirs against `priorCountByMake`, each make's total over
 * `priorWindow()`.
 */
export function buildTotalsFromStats(
  stats: MakeRegistrationStat[],
  range: Range,
  monthCountByMake: Record<string, number>,
  priorCountByMake: Record<string, number> = {},
): MakeTotals[] {
  return stats.map((stat) => {
    const trend = stat.trend.map((point) => point.value);
    let count = stat.count;
    if (range === "12m") {
      count = trend.reduce((sum, value) => sum + value, 0);
    } else if (range === "month") {
      count = monthCountByMake[stat.make] ?? 0;
    }

    const yoyChange =
      range === "ytd"
        ? stat.yoyChange
        : percentChange(count, priorCountByMake[stat.make] ?? 0);

    return { count, make: stat.make, trend, yoyChange };
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
 * The change compares the active range against `priorWindow()`, as the
 * all-fuels path does. Both paths feed the same delta chips and the same
 * footnote, so they have to measure the same thing.
 */
export function buildTotalsFromFuelRows(
  rows: FuelRow[],
  isMatch: (fuelType: string) => boolean,
  latestMonth: string,
  range: Range,
): MakeTotals[] {
  const months = rollingMonths(latestMonth);
  const current = rangeWindow(latestMonth, range);
  const prior = priorWindow(latestMonth, range);

  const monthlyByMake = new Map<string, Map<string, number>>();

  for (const row of rows) {
    if (!isMatch(row.fuelType)) {
      continue;
    }

    const monthly = monthlyByMake.get(row.make) ?? new Map<string, number>();
    monthly.set(row.month, (monthly.get(row.month) ?? 0) + row.count);
    monthlyByMake.set(row.make, monthly);
  }

  const sumWindow = (monthly: Map<string, number>, window: MonthWindow) => {
    let sum = 0;
    for (const [month, count] of monthly) {
      if (month >= window.start && month <= window.end) {
        sum += count;
      }
    }
    return sum;
  };

  return [...monthlyByMake].map(([make, monthly]) => {
    const count = sumWindow(monthly, current);

    return {
      count,
      make,
      trend: months.map((month) => monthly.get(month) ?? 0),
      yoyChange: percentChange(count, sumWindow(monthly, prior)),
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
 * Cached per range and fuel filter so the four sections that read the same
 * rows behind their own Suspense boundaries share one entry, and the reshaping
 * work is done once per data release rather than once per request.
 */
export async function loadMakeRows(
  range: Range,
  fuel: string | null,
): Promise<MakeRowsResult> {
  "use cache";
  cacheLife("max");
  cacheTag("cars:months", "cars:makes", LOGOS_CACHE_TAG);
  if (isFuelFilter(fuel)) {
    cacheTag(
      ...FUEL_FILTER_QUERIES[fuel].map((fuelType) => `cars:fuel:${fuelType}`),
    );
  }

  const [latestMonth, fuelTypeRows, logoUrlBySlug] = await Promise.all([
    getCarsLatestMonth(),
    getDistinctFuelTypes(),
    getCarLogoMap(),
  ]);

  const fuelTypes = fuelTypeRows.map((row) => row.fuelType);

  if (!latestMonth) {
    return { latestMonth: null, rows: [], total: 0 };
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
    const prior = priorWindow(latestMonth, range);
    const [stats, monthCountByMake, priorTotals] = await Promise.all([
      getMakeRegistrationStats(),
      range === "month"
        ? loadMonthCounts(latestMonth, fuelTypes)
        : Promise.resolve({}),
      range === "ytd"
        ? Promise.resolve([])
        : getMakeTotalsInRange(prior.start, prior.end),
    ]);
    const priorCountByMake = Object.fromEntries(
      priorTotals.map((item) => [item.make, item.count]),
    );
    totals = buildTotalsFromStats(
      stats,
      range,
      monthCountByMake,
      priorCountByMake,
    );
  }

  const rows = finaliseRows(totals, logoUrlBySlug);

  return {
    latestMonth,
    rows,
    total: rows.reduce((sum, row) => sum + row.count, 0),
  };
}

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

export async function loadElectricOnlyMakes(): Promise<ElectricOnlySummary | null> {
  "use cache";
  cacheLife("max");
  cacheTag(
    "cars:months",
    "cars:makes",
    `cars:fuel:${BEV_FUEL_TYPE}`,
    LOGOS_CACHE_TAG,
  );

  const [latestMonth, stats, electric, logoUrlBySlug] = await Promise.all([
    getCarsLatestMonth(),
    getMakeRegistrationStats(),
    getFuelTypeData(BEV_FUEL_TYPE),
    getCarLogoMap(),
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

  return selectElectricOnlyMakes(stats, electricByMake, logoUrlBySlug);
}
