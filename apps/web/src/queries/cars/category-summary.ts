import { and, cars, db, eq, gt, sql } from "@motormetrics/database";
import { cacheLife, cacheTag } from "next/cache";

export interface CategorySummary {
  year: number;
  total: number;
  electric: number;
  hybrid: number;
}

const yearExpr = sql`extract(year from to_date(${cars.month}, 'YYYY-MM'))`;

/**
 * Get category summary (total, electric, hybrid) for a given year
 * Defaults to the latest year if no year is provided
 */
export async function getCategorySummaryByYear(
  year?: number,
): Promise<CategorySummary> {
  "use cache";
  cacheLife("max");
  cacheTag("cars:annual", "cars:fuel:electric", "cars:fuel:hybrid");
  if (year) {
    cacheTag(`cars:year:${year}`);
  }

  // Use SQL subquery for latest year when not provided
  const latestYearSubquery = db
    .select({ year: sql<number>`max(${yearExpr})` })
    .from(cars)
    .where(gt(cars.number, 0));

  const targetYear = year ?? sql`(${latestYearSubquery})`;

  const result = await db
    .select({
      year: sql<number>`cast(${yearExpr} as integer)`.mapWith(Number),
      total: sql<number>`sum(${cars.number})`.mapWith(Number),
      electric:
        sql<number>`sum(case when ${cars.fuelType} = 'Electric' then ${cars.number} else 0 end)`.mapWith(
          Number,
        ),
      hybrid:
        sql<number>`sum(case when ${cars.fuelType} like '%-Electric%' and ${cars.fuelType} != 'Electric' then ${cars.number} else 0 end)`.mapWith(
          Number,
        ),
    })
    .from(cars)
    .where(and(eq(yearExpr, targetYear), gt(cars.number, 0)))
    .groupBy(yearExpr);

  return (
    result[0] ?? {
      year: year ?? new Date().getFullYear(),
      total: 0,
      electric: 0,
      hybrid: 0,
    }
  );
}
