import {
  and,
  cars,
  db,
  desc,
  gt,
  gte,
  lte,
  max,
  sql,
} from "@motormetrics/database";
import { cacheLife, cacheTag } from "next/cache";

/**
 * Get popular car makes based on annual registration totals
 */
const getPopularMakesByYearData = async (year: string, limit: number = 8) => {
  const whereConditions = [
    gte(cars.month, `${year}-01`),
    lte(cars.month, `${year}-12`),
    gt(cars.number, 0),
  ];

  return db
    .select({
      make: cars.make,
    })
    .from(cars)
    .where(and(...whereConditions))
    .groupBy(cars.make)
    .orderBy(desc(sql`sum(${cars.number})`))
    .limit(limit);
};

/**
 * Query popular makes for the current year.
 * Returns array of make names sorted by registration volume.
 */
export async function getPopularMakes(year?: string) {
  "use cache";
  cacheLife("max");
  if (year) {
    cacheTag(`cars:year:${year}`);
  }

  if (year) {
    return getPopularMakesByYearData(year, 8);
  }

  const [latestMonthResult] = await db
    .select({ latestMonth: max(cars.month) })
    .from(cars);

  const latestMonth = latestMonthResult.latestMonth;
  if (!latestMonth) {
    return [];
  }

  const targetYear = latestMonth.split("-")[0];
  return getPopularMakesByYearData(targetYear, 8);
}
