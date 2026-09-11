import { db } from "@motormetrics/database/client";
import { cars } from "@motormetrics/database/schema";
import { and, desc, eq, inArray, sum } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

const BEV_FUEL_TYPES = ["Electric"];
const PHEV_FUEL_TYPES = [
  "Petrol-Electric (Plug-In)",
  "Diesel-Electric (Plug-In)",
];
const HYBRID_FUEL_TYPES = ["Petrol-Electric", "Diesel-Electric"];
const ALL_EV_FUEL_TYPES = [
  ...BEV_FUEL_TYPES,
  ...PHEV_FUEL_TYPES,
  ...HYBRID_FUEL_TYPES,
];

export interface EvMonthlyTrend {
  month: string;
  BEV: number;
  PHEV: number;
  Hybrid: number;
}

export interface EvMarketShare {
  month: string;
  evCount: number;
  totalCount: number;
  evShare: number;
}

export interface EvTopMake {
  make: string;
  count: number;
}

export interface EvLatestSummary {
  month: string;
  totalEv: number;
  evSharePercent: number;
  bevCount: number;
  topMake: string;
}

export interface EvMakeDetail {
  make: string;
  bev: number;
  phev: number;
  hybrid: number;
  total: number;
}

export async function getEvMonthlyTrend(): Promise<EvMonthlyTrend[]> {
  "use cache: remote";
  cacheLife("max");
  cacheTag("cars:fuel:electric", "cars:fuel:hybrid");

  const results = await db
    .select({
      month: cars.month,
      fuelType: cars.fuelType,
      count: sum(cars.number).mapWith(Number),
    })
    .from(cars)
    .where(inArray(cars.fuelType, ALL_EV_FUEL_TYPES))
    .groupBy(cars.month, cars.fuelType)
    .orderBy(cars.month);

  const monthMap = new Map<string, EvMonthlyTrend>();

  for (const row of results) {
    if (!monthMap.has(row.month)) {
      monthMap.set(row.month, { month: row.month, BEV: 0, PHEV: 0, Hybrid: 0 });
    }
    const entry = monthMap.get(row.month)!;
    // `sum()` is null only for an empty group, which a GROUP BY cannot produce
    const count = row.count ?? 0;

    if (BEV_FUEL_TYPES.includes(row.fuelType)) {
      entry.BEV += count;
    } else if (PHEV_FUEL_TYPES.includes(row.fuelType)) {
      entry.PHEV += count;
    } else if (HYBRID_FUEL_TYPES.includes(row.fuelType)) {
      entry.Hybrid += count;
    }
  }

  return Array.from(monthMap.values());
}

export async function getEvMarketShare(): Promise<EvMarketShare[]> {
  "use cache: remote";
  cacheLife("max");
  cacheTag("cars:fuel:electric", "cars:fuel:hybrid");

  // One scan grouped by month and fuel type, split here, rather than batching
  // an EV-filtered scan alongside a second unfiltered scan of the whole table.
  const rows = await db
    .select({
      month: cars.month,
      fuelType: cars.fuelType,
      count: sum(cars.number).mapWith(Number),
    })
    .from(cars)
    .groupBy(cars.month, cars.fuelType);

  const byMonth = new Map<string, EvMarketShare>();
  // Months the EV-filtered query would have returned a row for. A month with no
  // electrified registrations at all was absent from that result, so it stays
  // out of this one rather than appearing as a zero.
  const monthsWithEv = new Set<string>();

  for (const row of rows) {
    // `sum()` is null only for an empty group, which a GROUP BY cannot produce
    const count = row.count ?? 0;

    const entry = byMonth.get(row.month) ?? {
      month: row.month,
      evCount: 0,
      totalCount: 0,
      evShare: 0,
    };

    entry.totalCount += count;

    if (ALL_EV_FUEL_TYPES.includes(row.fuelType)) {
      entry.evCount += count;
      monthsWithEv.add(row.month);
    }

    byMonth.set(row.month, entry);
  }

  return Array.from(byMonth.values())
    .filter((entry) => monthsWithEv.has(entry.month))
    .map((entry) => ({
      ...entry,
      evShare:
        entry.totalCount > 0 ? (entry.evCount / entry.totalCount) * 100 : 0,
    }))
    .sort((first, second) => first.month.localeCompare(second.month));
}

export async function getEvTopMakes(limit = 10): Promise<EvTopMake[]> {
  "use cache: remote";
  cacheLife("max");
  cacheTag("cars:fuel:electric", "cars:fuel:hybrid");

  const latestMonthResult = await db
    .select({ month: cars.month })
    .from(cars)
    .where(inArray(cars.fuelType, ALL_EV_FUEL_TYPES))
    .orderBy(desc(cars.month))
    .limit(1);

  const latestMonth = latestMonthResult[0]?.month;
  if (!latestMonth) return [];

  const rows = await db
    .select({
      make: cars.make,
      count: sum(cars.number).mapWith(Number),
    })
    .from(cars)
    .where(
      and(
        eq(cars.month, latestMonth),
        inArray(cars.fuelType, ALL_EV_FUEL_TYPES),
      ),
    )
    .groupBy(cars.make)
    .orderBy(desc(sum(cars.number)))
    .limit(limit);

  // `sum()` is null only for an empty group, which a GROUP BY cannot produce
  return rows.map(({ make, count }) => ({ make, count: count ?? 0 }));
}

export async function getEvMakeDetails(): Promise<EvMakeDetail[]> {
  "use cache: remote";
  cacheLife("max");
  cacheTag("cars:fuel:electric", "cars:fuel:hybrid");

  const latestMonthResult = await db
    .select({ month: cars.month })
    .from(cars)
    .where(inArray(cars.fuelType, ALL_EV_FUEL_TYPES))
    .orderBy(desc(cars.month))
    .limit(1);

  const latestMonth = latestMonthResult[0]?.month;
  if (!latestMonth) return [];

  const results = await db
    .select({
      make: cars.make,
      fuelType: cars.fuelType,
      count: sum(cars.number).mapWith(Number),
    })
    .from(cars)
    .where(
      and(
        eq(cars.month, latestMonth),
        inArray(cars.fuelType, ALL_EV_FUEL_TYPES),
      ),
    )
    .groupBy(cars.make, cars.fuelType);

  const makeMap = new Map<string, EvMakeDetail>();

  for (const row of results) {
    if (!makeMap.has(row.make)) {
      makeMap.set(row.make, {
        make: row.make,
        bev: 0,
        phev: 0,
        hybrid: 0,
        total: 0,
      });
    }
    const entry = makeMap.get(row.make)!;
    // `sum()` is null only for an empty group, which a GROUP BY cannot produce
    const count = row.count ?? 0;

    if (BEV_FUEL_TYPES.includes(row.fuelType)) {
      entry.bev += count;
    } else if (PHEV_FUEL_TYPES.includes(row.fuelType)) {
      entry.phev += count;
    } else if (HYBRID_FUEL_TYPES.includes(row.fuelType)) {
      entry.hybrid += count;
    }
    entry.total += count;
  }

  return Array.from(makeMap.values()).sort((a, b) => b.total - a.total);
}

export async function getEvLatestSummary(): Promise<EvLatestSummary | null> {
  "use cache: remote";
  cacheLife("max");
  cacheTag("cars:fuel:electric", "cars:fuel:hybrid");

  const latestMonthResult = await db
    .select({ month: cars.month })
    .from(cars)
    .where(inArray(cars.fuelType, ALL_EV_FUEL_TYPES))
    .orderBy(desc(cars.month))
    .limit(1);

  const latestMonth = latestMonthResult[0]?.month;
  if (!latestMonth) return null;

  // One scan of the month grouped by make and fuel type. The four batched
  // aggregates it replaces were a single round-trip but ran serially, scanning
  // the same month four times over.
  const rows = await db
    .select({
      make: cars.make,
      fuelType: cars.fuelType,
      count: sum(cars.number).mapWith(Number),
    })
    .from(cars)
    .where(eq(cars.month, latestMonth))
    .groupBy(cars.make, cars.fuelType);

  let totalEv = 0;
  let bevCount = 0;
  let total = 0;
  const evByMake = new Map<string, number>();

  for (const row of rows) {
    // `sum()` is null only for an empty group, which a GROUP BY cannot produce
    const count = row.count ?? 0;

    total += count;

    if (ALL_EV_FUEL_TYPES.includes(row.fuelType)) {
      totalEv += count;
      evByMake.set(row.make, (evByMake.get(row.make) ?? 0) + count);
    }

    if (BEV_FUEL_TYPES.includes(row.fuelType)) {
      bevCount += count;
    }
  }

  const [topMake] = Array.from(evByMake).sort(
    ([, first], [, second]) => second - first,
  );

  return {
    month: latestMonth,
    totalEv,
    evSharePercent: total > 0 ? (totalEv / total) * 100 : 0,
    bevCount,
    topMake: topMake?.[0] ?? "N/A",
  };
}
