import { db } from "@motormetrics/database/client";
import { cars } from "@motormetrics/database/schema";
import { and, gt, gte, lte, max, sum } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

export interface CategorySummary {
  year: number;
  total: number;
  electric: number;
  hybrid: number;
}

/** The year component of a stored `YYYY-MM` month. */
const yearOf = (month: string) => Number(month.slice(0, 4));

/**
 * LTA names every electrified fuel type with an `-Electric` component —
 * `Petrol-Electric`, `Diesel-Electric (Plug-In)` and so on. `Electric` alone is
 * fully battery electric and counted separately.
 */
const isHybrid = (fuelType: string) =>
  fuelType.includes("-Electric") && fuelType !== "Electric";

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

  let targetYear = year;

  if (!targetYear) {
    const [latest] = await db
      .select({ month: max(cars.month) })
      .from(cars)
      .where(gt(cars.number, 0));

    targetYear = latest?.month ? yearOf(latest.month) : undefined;
  }

  if (!targetYear) {
    return {
      year: new Date().getFullYear(),
      total: 0,
      electric: 0,
      hybrid: 0,
    };
  }

  // Bounds on the stored `YYYY-MM` text rather than
  // `extract(year from to_date(month, ...)) = year`, which parsed a date on
  // every row and left the month index unusable. Lexicographic ordering on
  // `YYYY-MM` is chronological, so the range is exact.
  const rows = await db
    .select({
      fuelType: cars.fuelType,
      total: sum(cars.number).mapWith(Number),
    })
    .from(cars)
    .where(
      and(
        gte(cars.month, `${targetYear}-01`),
        lte(cars.month, `${targetYear}-12`),
        gt(cars.number, 0),
      ),
    )
    .groupBy(cars.fuelType);

  const summary: CategorySummary = {
    year: targetYear,
    total: 0,
    electric: 0,
    hybrid: 0,
  };

  for (const row of rows) {
    // `sum()` is null only for an empty group, which a GROUP BY cannot produce
    const total = row.total ?? 0;

    summary.total += total;

    if (row.fuelType === "Electric") {
      summary.electric += total;
    } else if (isHybrid(row.fuelType)) {
      summary.hybrid += total;
    }
  }

  return summary;
}
