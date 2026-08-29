import {
  and,
  asc,
  cars,
  db,
  desc,
  gte,
  ilike,
  lte,
  sql,
} from "@motormetrics/database";
import { cacheLife, cacheTag } from "next/cache";

/**
 * Window-based reads for the make detail page.
 *
 * The page lets the reader pick a period — this month, year to date, the last
 * twelve months — anchored on the selected month rather than on the latest one.
 * `getMonthlyRegistrationTotals()` counts back from the latest month instead,
 * so it cannot answer "the twelve months ending in March 2024"; these take an
 * explicit `YYYY-MM` window and are shared by the headline, the rank and the
 * month-by-month table.
 */

export interface MakeCrossTabRow {
  count: number;
  fuelType: string;
  month: string;
  vehicleType: string;
}

/**
 * Every `(month, fuel type, vehicle type)` cell for one make, across all of
 * history.
 *
 * One read rather than one per period: `cars` is already a cross-tab, so a
 * single make's rows are a few hundred at most and every figure the page needs
 * — the headline, the mix table, the monthly series, the year-earlier
 * comparison — is a sum over a subset of them.
 */
export async function getMakeCrossTab(
  make: string,
): Promise<MakeCrossTabRow[]> {
  "use cache";
  cacheLife("max");
  cacheTag(`cars:make:${make}`);

  const rows = await db
    .select({
      count: sql<number>`sum(${cars.number})`.mapWith(Number),
      fuelType: cars.fuelType,
      month: cars.month,
      vehicleType: cars.vehicleType,
    })
    .from(cars)
    .where(ilike(cars.make, make))
    .groupBy(cars.month, cars.fuelType, cars.vehicleType)
    .orderBy(desc(cars.month));

  return rows.filter((row) => row.count > 0);
}

export interface MakePeriodTotal {
  count: number;
  make: string;
}

/**
 * Every make's registrations over a month window, highest first — the ranking
 * behind the page's rank cell, market share and peer list.
 */
export async function getMakeTotalsInRange(
  start: string,
  end: string,
): Promise<MakePeriodTotal[]> {
  "use cache";
  cacheLife("max");
  cacheTag("cars:makes");

  const rows = await db
    .select({
      count: sql<number>`sum(${cars.number})`.mapWith(Number),
      make: cars.make,
    })
    .from(cars)
    .where(and(gte(cars.month, start), lte(cars.month, end)))
    .groupBy(cars.make)
    .orderBy(desc(sql<number>`sum(${cars.number})`));

  return rows.filter((row) => row.count > 0);
}

export interface MarketMonthlyTotal {
  month: string;
  total: number;
}

/**
 * All-cars registrations per month across a window, oldest first. The make's
 * own figures are read against these in the month-by-month table.
 */
export async function getMarketMonthlyTotals(
  start: string,
  end: string,
): Promise<MarketMonthlyTotal[]> {
  "use cache";
  cacheLife("max");
  cacheTag("cars:monthly-totals");

  return db
    .select({
      month: cars.month,
      total: sql<number>`sum(${cars.number})`.mapWith(Number),
    })
    .from(cars)
    .where(and(gte(cars.month, start), lte(cars.month, end)))
    .groupBy(cars.month)
    .orderBy(asc(cars.month));
}
