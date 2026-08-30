/**
 * Queries backing the fuel-type and vehicle-type index pages.
 *
 * `cars` is a month × make × fuelType × vehicleType cross-tab, so every figure
 * on those pages is a different projection of the same table. Each function
 * here takes the dimension as an argument rather than existing twice, which is
 * what lets `/cars/fuel-types` and `/cars/vehicle-types` share one component.
 *
 * Every function takes an explicit list of months instead of a limit: the pages
 * are anchored to whichever month the selector is on, and "the twelve months
 * ending at the selected one" is not expressible as an `ORDER BY … LIMIT`.
 */

import { cars, db, desc, inArray, sql } from "@motormetrics/database";
import { cacheLife, cacheTag } from "next/cache";

export type CategoryField = "fuelType" | "vehicleType";

/** The `cars` column a dimension resolves to. */
function columnFor(field: CategoryField) {
  return field === "fuelType" ? cars.fuelType : cars.vehicleType;
}

/** One cache tag per month, so a monthly data drop invalidates only its own. */
function monthTags(months: string[]): string[] {
  return months.map((month) => `cars:month:${month}`);
}

export interface CategoryTotal {
  count: number;
  name: string;
}

/**
 * Registrations per type across the given months — one month for the monthly
 * view, a year's worth for the year-to-date one.
 */
export async function getCategoryTotals(
  field: CategoryField,
  months: string[],
): Promise<CategoryTotal[]> {
  "use cache";
  cacheLife("max");
  cacheTag(...monthTags(months));

  if (months.length === 0) {
    return [];
  }

  const column = columnFor(field);

  return db
    .select({
      name: column,
      count: sql<number>`sum(${cars.number})`.mapWith(Number),
    })
    .from(cars)
    .where(inArray(cars.month, months))
    .groupBy(column)
    .orderBy(desc(sql<number>`sum(${cars.number})`));
}

export interface CategoryMonthlyPoint {
  count: number;
  month: string;
  name: string;
}

/**
 * The per-month, per-type series behind the share chart and the month-by-month
 * table. Returned long rather than pivoted — the callers need different shapes.
 */
export async function getCategoryMonthlySeries(
  field: CategoryField,
  months: string[],
): Promise<CategoryMonthlyPoint[]> {
  "use cache";
  cacheLife("max");
  cacheTag(...monthTags(months));

  if (months.length === 0) {
    return [];
  }

  const column = columnFor(field);

  return db
    .select({
      month: cars.month,
      name: column,
      count: sql<number>`sum(${cars.number})`.mapWith(Number),
    })
    .from(cars)
    .where(inArray(cars.month, months))
    .groupBy(cars.month, column)
    .orderBy(cars.month, desc(sql<number>`sum(${cars.number})`));
}

export interface CategoryLeader {
  makes: { count: number; make: string }[];
  name: string;
  total: number;
}

/**
 * The leading makes within each type.
 *
 * One query rather than a batch of per-type ones: the whole type × make
 * cross-tab for a year is a few hundred rows, so ranking in JavaScript is
 * cheaper than the round trips.
 */
export async function getTopMakesByCategory(
  field: CategoryField,
  months: string[],
  makesPerType = 3,
): Promise<CategoryLeader[]> {
  "use cache";
  cacheLife("max");
  cacheTag(...monthTags(months));

  if (months.length === 0) {
    return [];
  }

  const column = columnFor(field);

  const rows = await db
    .select({
      name: column,
      make: cars.make,
      count: sql<number>`sum(${cars.number})`.mapWith(Number),
    })
    .from(cars)
    .where(inArray(cars.month, months))
    .groupBy(column, cars.make)
    .orderBy(desc(sql<number>`sum(${cars.number})`));

  const byType = new Map<string, CategoryLeader>();

  for (const { count, make, name } of rows) {
    if (count <= 0) {
      continue;
    }

    const leader = byType.get(name) ?? { makes: [], name, total: 0 };
    leader.total += count;

    if (leader.makes.length < makesPerType) {
      leader.makes.push({ count, make });
    }

    byType.set(name, leader);
  }

  return [...byType.values()].sort((a, b) => b.total - a.total);
}

export interface ElectricShare {
  electric: number;
  name: string;
  total: number;
}

/**
 * How much of each vehicle type is battery-electric.
 *
 * Only `Electric` counts: the hybrids LTA records as `Petrol-Electric` and
 * `Diesel-Electric` still burn fuel, and folding them in here would report a
 * number the source data does not.
 */
export async function getElectricShareByVehicleType(
  months: string[],
): Promise<ElectricShare[]> {
  "use cache";
  cacheLife("max");
  cacheTag(...monthTags(months));

  if (months.length === 0) {
    return [];
  }

  return db
    .select({
      name: cars.vehicleType,
      electric:
        sql<number>`sum(case when ${cars.fuelType} = 'Electric' then ${cars.number} else 0 end)`.mapWith(
          Number,
        ),
      total: sql<number>`sum(${cars.number})`.mapWith(Number),
    })
    .from(cars)
    .where(inArray(cars.month, months))
    .groupBy(cars.vehicleType);
}
