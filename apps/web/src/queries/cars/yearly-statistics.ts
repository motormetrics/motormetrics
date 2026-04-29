import { and, cars, db, desc, eq, gt, sql } from "@motormetrics/database";
import { cacheLife, cacheTag } from "next/cache";

const yearExpr = sql`extract(year from to_date(${cars.month}, 'YYYY-MM'))`;

interface YearlyTotal {
  year: number;
  total: number;
}

interface YearOnly {
  year: number;
}

/**
 * Get yearly registration totals aggregated from monthly data (ascending order for charts)
 */
export async function getYearlyRegistrations(): Promise<YearlyTotal[]> {
  "use cache";
  cacheLife("max");
  cacheTag("cars:annual");

  return db
    .select({
      year: sql<number>`cast(${yearExpr} as integer)`.mapWith(Number),
      total: sql<number>`cast(sum(${cars.number}) as integer)`.mapWith(Number),
    })
    .from(cars)
    .where(gt(cars.number, 0))
    .groupBy(yearExpr)
    .orderBy(yearExpr);
}

/**
 * Get available years in descending order (for dropdowns/selectors)
 */
export async function getAvailableYears(): Promise<YearOnly[]> {
  "use cache";
  cacheLife("max");
  cacheTag("cars:annual");

  return db
    .select({
      year: sql<number>`cast(${yearExpr} as integer)`.mapWith(Number),
    })
    .from(cars)
    .where(gt(cars.number, 0))
    .groupBy(yearExpr)
    .orderBy(desc(yearExpr));
}

interface MakeValue {
  make: string;
  value: number;
}

/**
 * Get top car makes aggregated by year (defaults to latest year)
 */
export async function getTopMakesByYear(
  year?: number,
  limit = 8,
): Promise<MakeValue[]> {
  "use cache";
  cacheLife("max");
  cacheTag("cars:top-makes");
  if (year) {
    cacheTag(`cars:year:${year}`);
  }

  // Use SQL subquery for latest year instead of nested await
  const latestYearSubquery = db
    .select({ year: sql<number>`max(${yearExpr})` })
    .from(cars)
    .where(gt(cars.number, 0));

  const targetYear = year ?? sql`(${latestYearSubquery})`;
  const sumExpr = sql`sum(${cars.number})`;

  return db
    .select({
      make: cars.make,
      value: sql<number>`cast(${sumExpr} as integer)`.mapWith(Number),
    })
    .from(cars)
    .where(and(eq(yearExpr, targetYear), gt(cars.number, 0)))
    .groupBy(cars.make)
    .orderBy(desc(sumExpr))
    .limit(limit);
}
