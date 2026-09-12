import { db } from "@motormetrics/database/client";
import { cars } from "@motormetrics/database/schema";
import type { Comparison, Registration } from "@web/types/cars";
import { format, subMonths } from "date-fns";
import { and, desc, eq, gt, gte, inArray, lte, sum } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

/**
 * Registration groups largest first — the `order by sum(number) desc` the
 * grouped queries used to carry, applied here so a month can be grouped once
 * and split by dimension rather than queried once per dimension.
 *
 * `sum()` is null only for an empty group, which a GROUP BY cannot produce.
 */
const sortByCount = <Row extends { count: number | null }>(
  rows: Row[],
): (Row & { count: number })[] =>
  rows
    .map((row) => ({ ...row, count: row.count ?? 0 }))
    .sort((first, second) => second.count - first.count);

export async function getCarsData(month: string): Promise<Registration> {
  "use cache";
  cacheLife("max");
  cacheTag(`cars:month:${month}`);

  // Two grouped scans rather than three. The separate total query is gone: the
  // fuel type groups partition the month's rows, so their sum is that total.
  const [fuelTypeRows, vehicleTypeRows] = await db.batch([
    db
      .select({
        name: cars.fuelType,
        count: sum(cars.number).mapWith(Number),
      })
      .from(cars)
      .where(eq(cars.month, month))
      .groupBy(cars.fuelType),
    db
      .select({
        name: cars.vehicleType,
        count: sum(cars.number).mapWith(Number),
      })
      .from(cars)
      .where(eq(cars.month, month))
      .groupBy(cars.vehicleType),
  ]);

  const fuelType = sortByCount(fuelTypeRows);
  const total = fuelType.reduce((running, row) => running + row.count, 0);

  return {
    month,
    total,
    // `having sum(number) > 0` on the grouped queries, applied here
    fuelType: fuelType.filter((row) => row.count > 0),
    vehicleType: sortByCount(vehicleTypeRows).filter((row) => row.count > 0),
  };
}

export async function getCarsComparison(month: string): Promise<Comparison> {
  "use cache";
  cacheLife("max");
  cacheTag(`cars:month:${month}`);

  const currentDate = new Date(`${month}-01`);
  const previousMonthStr = format(subMonths(currentDate, 1), "yyyy-MM");
  const previousYearStr = format(subMonths(currentDate, 12), "yyyy-MM");
  const months = [month, previousMonthStr, previousYearStr];

  // Two scans covering all three months, rather than nine single-month scans.
  // The batch was one round-trip either way, but its statements ran serially,
  // so the month partitions were read three times over.
  const [fuelTypeRows, vehicleTypeRows] = await db.batch([
    db
      .select({
        month: cars.month,
        label: cars.fuelType,
        count: sum(cars.number).mapWith(Number),
      })
      .from(cars)
      .where(inArray(cars.month, months))
      .groupBy(cars.month, cars.fuelType),
    db
      .select({
        month: cars.month,
        label: cars.vehicleType,
        count: sum(cars.number).mapWith(Number),
      })
      .from(cars)
      .where(inArray(cars.month, months))
      .groupBy(cars.month, cars.vehicleType),
  ]);

  const forPeriod = (period: string) => {
    const fuelType = sortByCount(
      fuelTypeRows.filter((row) => row.month === period),
    );
    const vehicleType = sortByCount(
      vehicleTypeRows.filter((row) => row.month === period),
    );

    return {
      period,
      // The fuel type groups partition the period's rows, so they sum to its total
      total: fuelType.reduce((running, row) => running + row.count, 0),
      fuelType: fuelType.map(({ label, count }) => ({ label, count })),
      vehicleType: vehicleType.map(({ label, count }) => ({ label, count })),
    };
  };

  return {
    currentMonth: forPeriod(month),
    previousMonth: forPeriod(previousMonthStr),
    previousYear: forPeriod(previousYearStr),
  };
}

export interface MonthlyTotal {
  month: string;
  total: number;
}

/**
 * Monthly registration totals, oldest first. Backs the Overview hero sparkline,
 * which needs a month-over-month series rather than the yearly totals used by
 * the annual chart.
 */
export async function getMonthlyRegistrationTotals(
  limit = 12,
): Promise<MonthlyTotal[]> {
  "use cache";
  cacheLife("max");
  cacheTag("cars:monthly-totals");

  const results = await db
    .select({
      month: cars.month,
      total: sum(cars.number).mapWith(Number),
    })
    .from(cars)
    .groupBy(cars.month)
    .orderBy(desc(cars.month))
    .limit(limit);

  return results
    .map(({ month, total }) => ({ month, total: total ?? 0 }))
    .reverse();
}

/**
 * Year-to-date registrations per fuel type, for the year-to-date column the
 * registrations table carries beside each month's figure.
 */
export async function getYearToDateByFuelType(
  year: number,
): Promise<{ count: number; name: string }[]> {
  "use cache";
  cacheLife("max");
  cacheTag(`cars:year:${year}`);

  // A range on the stored `YYYY-MM` text rather than `ilike '<year>-%'`, which
  // no btree index can serve. Lexicographic ordering on `YYYY-MM` is
  // chronological, so the bounds are exact.
  const results = await db
    .select({
      name: cars.fuelType,
      count: sum(cars.number).mapWith(Number),
    })
    .from(cars)
    .where(and(gte(cars.month, `${year}-01`), lte(cars.month, `${year}-12`)))
    .groupBy(cars.fuelType)
    .having(gt(sum(cars.number), 0))
    .orderBy(desc(sum(cars.number)));

  return results.map(({ name, count }) => ({ name, count: count ?? 0 }));
}

/**
 * The same series narrowed to one fuel type, as LTA records it — `Electric`,
 * `Petrol-Electric (Plug-In)` and so on. Kept separate from
 * `getMonthlyRegistrationTotals()` so each fuel type caches under its own tag
 * rather than sharing the unfiltered one.
 */
export async function getMonthlyRegistrationTotalsByFuelType(
  fuelType: string,
  limit = 12,
): Promise<MonthlyTotal[]> {
  "use cache";
  cacheLife("max");
  cacheTag(`cars:monthly-totals:${fuelType}`);

  const results = await db
    .select({
      month: cars.month,
      total: sum(cars.number).mapWith(Number),
    })
    .from(cars)
    .where(eq(cars.fuelType, fuelType))
    .groupBy(cars.month)
    .having(gt(sum(cars.number), 0))
    .orderBy(desc(cars.month))
    .limit(limit);

  return results
    .map(({ month, total }) => ({ month, total: total ?? 0 }))
    .reverse();
}
