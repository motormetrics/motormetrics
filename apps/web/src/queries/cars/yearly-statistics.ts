import { db } from "@motormetrics/database/client";
import { cars } from "@motormetrics/database/schema";
import { and, desc, gt, gte, lte, max, sum } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

interface YearlyTotal {
  year: number;
  total: number;
}

interface YearOnly {
  year: number;
}

interface MakeValue {
  make: string;
  value: number;
}

/** The year component of a stored `YYYY-MM` month. */
const yearOf = (month: string) => Number(month.slice(0, 4));

/** Year of the most recent month carrying registrations, or null when empty. */
const latestRegistrationYear = async (): Promise<number | null> => {
  const [latest] = await db
    .select({ month: max(cars.month) })
    .from(cars)
    .where(gt(cars.number, 0));

  return latest?.month ? yearOf(latest.month) : null;
};

/**
 * Get yearly registration totals aggregated from monthly data (ascending order for charts)
 */
export async function getYearlyRegistrations(): Promise<YearlyTotal[]> {
  "use cache: remote";
  cacheLife("max");
  cacheTag("cars:annual");

  // Grouped by month and folded into years here rather than grouping on
  // `extract(year from to_date(month, ...))`, which parsed a date on every row
  // of a full scan. A decade of months is a couple of hundred rows.
  const rows = await db
    .select({
      month: cars.month,
      total: sum(cars.number).mapWith(Number),
    })
    .from(cars)
    .where(gt(cars.number, 0))
    .groupBy(cars.month)
    .orderBy(cars.month);

  const totals = new Map<number, number>();

  for (const row of rows) {
    const year = yearOf(row.month);
    // `sum()` is null only for an empty group, which a GROUP BY cannot produce
    totals.set(year, (totals.get(year) ?? 0) + (row.total ?? 0));
  }

  return Array.from(totals, ([year, total]) => ({ year, total }));
}

/**
 * Get available years in descending order (for dropdowns/selectors)
 */
export async function getAvailableYears(): Promise<YearOnly[]> {
  "use cache: remote";
  cacheLife("max");
  cacheTag("cars:annual");

  const rows = await db
    .selectDistinct({ month: cars.month })
    .from(cars)
    .where(gt(cars.number, 0))
    .orderBy(desc(cars.month));

  const years = new Set(rows.map((row) => yearOf(row.month)));

  return Array.from(years, (year) => ({ year }));
}

/**
 * Get top car makes aggregated by year (defaults to latest year)
 */
export async function getTopMakesByYear(
  year?: number,
  limit = 8,
): Promise<MakeValue[]> {
  "use cache: remote";
  cacheLife("max");
  cacheTag("cars:top-makes");
  if (year) {
    cacheTag(`cars:year:${year}`);
  }

  const targetYear = year ?? (await latestRegistrationYear());

  if (!targetYear) {
    return [];
  }

  // Bounds on the stored `YYYY-MM` text rather than
  // `extract(year from to_date(month, ...)) = year`, which parsed a date on
  // every row and left the month index unusable. Lexicographic ordering on
  // `YYYY-MM` is chronological, so the range is exact.
  const rows = await db
    .select({
      make: cars.make,
      value: sum(cars.number).mapWith(Number),
    })
    .from(cars)
    .where(
      and(
        gte(cars.month, `${targetYear}-01`),
        lte(cars.month, `${targetYear}-12`),
        gt(cars.number, 0),
      ),
    )
    .groupBy(cars.make)
    .orderBy(desc(sum(cars.number)))
    .limit(limit);

  // `sum()` is null only for an empty group, which a GROUP BY cannot produce
  return rows.map(({ make, value }) => ({ make, value: value ?? 0 }));
}
