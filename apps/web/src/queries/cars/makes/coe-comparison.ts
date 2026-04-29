import {
  and,
  asc,
  avg,
  cars,
  coe,
  db,
  gte,
  ilike,
  inArray,
  lte,
  sql,
} from "@motormetrics/database";
import { getDateRange24Months } from "@web/lib/coe/calculations";
import { cacheLife, cacheTag } from "next/cache";

export interface MakeCoeComparisonData {
  month: string;
  registrations: number;
  categoryAPremium: number;
  categoryBPremium: number;
}

export async function getMakeCoeComparison(
  make: string,
): Promise<MakeCoeComparisonData[]> {
  "use cache";
  cacheLife("max");

  const { startMonth, endMonth } = getDateRange24Months();
  cacheTag(`cars:make:${make}`);

  // Execute both queries in parallel using db.batch()
  const [makeRegistrations, coePremiums] = await db.batch([
    // Query 1: Fetch make registrations by month
    db
      .select({
        month: cars.month,
        count: sql<number>`sum(${cars.number})`.mapWith(Number),
      })
      .from(cars)
      .where(
        and(
          ilike(cars.make, make),
          gte(cars.month, startMonth),
          lte(cars.month, endMonth),
        ),
      )
      .groupBy(cars.month)
      .orderBy(asc(cars.month)),

    // Query 2: Fetch COE premium averages for Category A and B using CASE WHEN
    db
      .select({
        month: coe.month,
        categoryAPremium: avg(
          sql`CASE WHEN ${coe.vehicleClass} = 'Category A' THEN ${coe.premium} END`,
        ).mapWith(Number),
        categoryBPremium: avg(
          sql`CASE WHEN ${coe.vehicleClass} = 'Category B' THEN ${coe.premium} END`,
        ).mapWith(Number),
      })
      .from(coe)
      .where(
        and(
          gte(coe.month, startMonth),
          lte(coe.month, endMonth),
          inArray(coe.vehicleClass, ["Category A", "Category B"]),
        ),
      )
      .groupBy(coe.month)
      .orderBy(asc(coe.month)),
  ]);

  // Create a Map for efficient COE premium lookup by month
  const coePremiumMap = new Map(
    coePremiums.map((coe) => [
      coe.month,
      {
        categoryA: coe.categoryAPremium ?? 0,
        categoryB: coe.categoryBPremium ?? 0,
      },
    ]),
  );

  return makeRegistrations.map(({ month, count }) => ({
    month,
    registrations: count,
    categoryAPremium: coePremiumMap.get(month)?.categoryA ?? 0,
    categoryBPremium: coePremiumMap.get(month)?.categoryB ?? 0,
  }));
}
