import { db } from "@motormetrics/database/client";
import { cars } from "@motormetrics/database/schema";
import { inArray, sum } from "drizzle-orm";
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

export async function getEvMonthlyTrend(): Promise<EvMonthlyTrend[]> {
  "use cache";
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
  "use cache";
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
