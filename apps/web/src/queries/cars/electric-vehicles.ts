import { cars, db, desc, eq, inArray, sql } from "@motormetrics/database";
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
  "use cache";
  cacheLife("max");
  cacheTag("cars:fuel:electric", "cars:fuel:hybrid");

  const results = await db
    .select({
      month: cars.month,
      fuelType: cars.fuelType,
      count: sql<number>`sum(${cars.number})`.mapWith(Number),
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

    if (BEV_FUEL_TYPES.includes(row.fuelType)) {
      entry.BEV += row.count;
    } else if (PHEV_FUEL_TYPES.includes(row.fuelType)) {
      entry.PHEV += row.count;
    } else if (HYBRID_FUEL_TYPES.includes(row.fuelType)) {
      entry.Hybrid += row.count;
    }
  }

  return Array.from(monthMap.values());
}

export async function getEvMarketShare(): Promise<EvMarketShare[]> {
  "use cache";
  cacheLife("max");
  cacheTag("cars:fuel:electric", "cars:fuel:hybrid");

  const evByMonthQuery = db
    .select({
      month: cars.month,
      evCount: sql<number>`sum(${cars.number})`.mapWith(Number),
    })
    .from(cars)
    .where(inArray(cars.fuelType, ALL_EV_FUEL_TYPES))
    .groupBy(cars.month);

  const totalByMonthQuery = db
    .select({
      month: cars.month,
      totalCount: sql<number>`sum(${cars.number})`.mapWith(Number),
    })
    .from(cars)
    .groupBy(cars.month);

  const [evByMonth, totalByMonth] = await db.batch([
    evByMonthQuery,
    totalByMonthQuery,
  ]);

  const totalMap = new Map(totalByMonth.map((r) => [r.month, r.totalCount]));

  return evByMonth
    .map((row) => {
      const total = totalMap.get(row.month) ?? 0;
      return {
        month: row.month,
        evCount: row.evCount,
        totalCount: total,
        evShare: total > 0 ? (row.evCount / total) * 100 : 0,
      };
    })
    .sort((a, b) => a.month.localeCompare(b.month));
}

export async function getEvTopMakes(limit = 10): Promise<EvTopMake[]> {
  "use cache";
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

  return db
    .select({
      make: cars.make,
      count: sql<number>`sum(${cars.number})`.mapWith(Number),
    })
    .from(cars)
    .where(
      sql`${cars.month} = ${latestMonth} AND ${cars.fuelType} IN ${ALL_EV_FUEL_TYPES}`,
    )
    .groupBy(cars.make)
    .orderBy(desc(sql<number>`sum(${cars.number})`))
    .limit(limit);
}

export async function getEvMakeDetails(): Promise<EvMakeDetail[]> {
  "use cache";
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
      count: sql<number>`sum(${cars.number})`.mapWith(Number),
    })
    .from(cars)
    .where(
      sql`${cars.month} = ${latestMonth} AND ${cars.fuelType} IN ${ALL_EV_FUEL_TYPES}`,
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

    if (BEV_FUEL_TYPES.includes(row.fuelType)) {
      entry.bev += row.count;
    } else if (PHEV_FUEL_TYPES.includes(row.fuelType)) {
      entry.phev += row.count;
    } else if (HYBRID_FUEL_TYPES.includes(row.fuelType)) {
      entry.hybrid += row.count;
    }
    entry.total += row.count;
  }

  return Array.from(makeMap.values()).sort((a, b) => b.total - a.total);
}

export async function getEvLatestSummary(): Promise<EvLatestSummary | null> {
  "use cache";
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

  const evTotalQuery = db
    .select({
      count: sql<number>`sum(${cars.number})`.mapWith(Number),
    })
    .from(cars)
    .where(
      sql`${cars.month} = ${latestMonth} AND ${cars.fuelType} IN ${ALL_EV_FUEL_TYPES}`,
    );

  const bevTotalQuery = db
    .select({
      count: sql<number>`sum(${cars.number})`.mapWith(Number),
    })
    .from(cars)
    .where(
      sql`${cars.month} = ${latestMonth} AND ${cars.fuelType} IN ${BEV_FUEL_TYPES}`,
    );

  const allTotalQuery = db
    .select({
      count: sql<number>`sum(${cars.number})`.mapWith(Number),
    })
    .from(cars)
    .where(eq(cars.month, latestMonth));

  const topMakeQuery = db
    .select({
      make: cars.make,
      count: sql<number>`sum(${cars.number})`.mapWith(Number),
    })
    .from(cars)
    .where(
      sql`${cars.month} = ${latestMonth} AND ${cars.fuelType} IN ${ALL_EV_FUEL_TYPES}`,
    )
    .groupBy(cars.make)
    .orderBy(desc(sql<number>`sum(${cars.number})`))
    .limit(1);

  const [evTotal, bevTotal, allTotal, topMake] = await db.batch([
    evTotalQuery,
    bevTotalQuery,
    allTotalQuery,
    topMakeQuery,
  ]);

  const totalEv = evTotal[0]?.count ?? 0;
  const total = allTotal[0]?.count ?? 0;

  return {
    month: latestMonth,
    totalEv,
    evSharePercent: total > 0 ? (totalEv / total) * 100 : 0,
    bevCount: bevTotal[0]?.count ?? 0,
    topMake: topMake[0]?.make ?? "N/A",
  };
}
