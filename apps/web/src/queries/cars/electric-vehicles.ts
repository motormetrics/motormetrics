import { db } from "@motormetrics/database/client";
import { cars } from "@motormetrics/database/schema";
import { ALL_EV_FUEL_TYPES, EV_FUEL_TYPES } from "@web/config";
import { inArray, sum } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

type EvPowertrain = keyof typeof EV_FUEL_TYPES;

/** Each electrified fuel-type label mapped to the powertrain it counts towards. */
const POWERTRAIN_BY_FUEL_TYPE = new Map<string, EvPowertrain>(
  (Object.keys(EV_FUEL_TYPES) as EvPowertrain[]).flatMap((powertrain) =>
    EV_FUEL_TYPES[powertrain].map((fuelType): [string, EvPowertrain] => [
      fuelType,
      powertrain,
    ]),
  ),
);

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
    const entry = monthMap.get(row.month) ?? {
      month: row.month,
      BEV: 0,
      PHEV: 0,
      Hybrid: 0,
    };
    // `sum()` is null only for an empty group, which a GROUP BY cannot produce
    const count = row.count ?? 0;

    const powertrain = POWERTRAIN_BY_FUEL_TYPE.get(row.fuelType);
    if (powertrain) {
      entry[powertrain] += count;
    }

    monthMap.set(row.month, entry);
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
