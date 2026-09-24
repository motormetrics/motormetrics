import { db } from "@motormetrics/database/client";
import { cars } from "@motormetrics/database/schema";
import { getCarsLatestMonth } from "@web/queries/cars/latest-month";
import { and, desc, gt, gte, lte, sql } from "drizzle-orm";
import { cacheLife } from "next/cache";

/**
 * Query popular makes for the latest year with registration data.
 * Returns array of make names sorted by annual registration volume.
 */
export async function getPopularMakes() {
  "use cache";
  cacheLife("max");

  const latestMonth = await getCarsLatestMonth();
  if (!latestMonth) {
    return [];
  }

  const year = latestMonth.split("-")[0];
  return db
    .select({
      make: cars.make,
    })
    .from(cars)
    .where(
      and(
        gte(cars.month, `${year}-01`),
        lte(cars.month, `${year}-12`),
        gt(cars.number, 0),
      ),
    )
    .groupBy(cars.make)
    .orderBy(desc(sql`sum(${cars.number})`))
    .limit(8);
}
