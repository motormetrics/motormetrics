import { asc, cars, db, max, sql } from "@motormetrics/database";
import { cacheLife, cacheTag } from "next/cache";

export interface MakeRegistrationStat {
  make: string;
  count: number;
  share: number;
  trend: { value: number }[];
  yoyChange: number | null;
}

/**
 * Get registration count, market share, and rolling 12-month trend per make.
 */
export async function getMakeRegistrationStats(): Promise<
  MakeRegistrationStat[]
> {
  "use cache";
  cacheLife("max");
  cacheTag("cars:makes");

  const [latestMonthResult] = await db
    .select({ latestMonth: max(cars.month) })
    .from(cars);

  const latestMonth = latestMonthResult?.latestMonth;
  if (!latestMonth) {
    return [];
  }

  const year = latestMonth.split("-")[0];

  // Annual totals for the latest year (for count + share)
  const annualRows = await db
    .select({
      make: cars.make,
      count: sql<number>`cast(sum(${cars.number}) as int)`,
    })
    .from(cars)
    .where(
      sql`${cars.month} >= ${`${year}-01`} and ${cars.month} <= ${`${year}-12`}`,
    )
    .groupBy(cars.make);

  const grandTotal = annualRows.reduce((sum, row) => sum + row.count, 0);

  // Compute the 12-month cutoff in JS to avoid Postgres date casting issues
  // with YYYY-MM strings (which are not valid date literals without a day).
  const [latestYear, latestMonthNum] = latestMonth.split("-").map(Number);
  const cutoffDate = new Date(latestYear, latestMonthNum - 1 - 12);
  const cutoffMonth = `${cutoffDate.getFullYear()}-${String(cutoffDate.getMonth() + 1).padStart(2, "0")}`;

  // Rolling 12-month monthly data (for sparkline trend)
  const monthlyRows = await db
    .select({
      make: cars.make,
      month: cars.month,
      count: sql<number>`cast(sum(${cars.number}) as int)`,
    })
    .from(cars)
    .where(
      sql`${cars.month} > ${cutoffMonth} and ${cars.month} <= ${latestMonth}`,
    )
    .groupBy(cars.make, cars.month)
    .orderBy(asc(cars.month));

  // Group monthly rows by make
  const trendByMake = monthlyRows.reduce<Record<string, { value: number }[]>>(
    (acc, row) => {
      if (!acc[row.make]) acc[row.make] = [];
      acc[row.make].push({ value: row.count });
      return acc;
    },
    {},
  );

  const prevYear = String(Number(year) - 1);

  // Annual totals for the previous year (for YoY comparison)
  const prevYearRows = await db
    .select({
      make: cars.make,
      count: sql<number>`cast(sum(${cars.number}) as int)`,
    })
    .from(cars)
    .where(
      sql`${cars.month} >= ${`${prevYear}-01`} and ${cars.month} <= ${`${prevYear}-12`}`,
    )
    .groupBy(cars.make);

  const prevYearByMake = prevYearRows.reduce<Record<string, number>>(
    (acc, row) => {
      acc[row.make] = row.count;
      return acc;
    },
    {},
  );

  return annualRows.map((row) => {
    const prev = prevYearByMake[row.make];
    const yoyChange =
      prev !== undefined && prev > 0 ? ((row.count - prev) / prev) * 100 : null;

    return {
      make: row.make,
      count: row.count,
      share: grandTotal > 0 ? (row.count / grandTotal) * 100 : 0,
      trend: trendByMake[row.make] ?? [],
      yoyChange,
    };
  });
}
