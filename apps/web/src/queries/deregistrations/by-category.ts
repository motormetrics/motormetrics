import { db, deregistrations, desc, eq, sql } from "@motormetrics/database";
import { cacheLife, cacheTag } from "next/cache";

interface CategoryTotal {
  category: string;
  total: number;
}

interface MonthTotal {
  total: number;
}

/**
 * Get deregistration breakdown by category for a specific month
 */
export async function getDeregistrationsByCategory(
  month: string,
): Promise<CategoryTotal[]> {
  "use cache";
  cacheLife("max");
  cacheTag(`deregistrations:month:${month}`);

  return db
    .select({
      category: deregistrations.category,
      total:
        sql<number>`cast(sum(${deregistrations.number}) as integer)`.mapWith(
          Number,
        ),
    })
    .from(deregistrations)
    .where(eq(deregistrations.month, month))
    .groupBy(deregistrations.category)
    .orderBy(desc(sql`sum(${deregistrations.number})`));
}

/**
 * Get total deregistrations for a specific month
 */
export async function getDeregistrationsTotalByMonth(
  month: string,
): Promise<MonthTotal[]> {
  "use cache";
  cacheLife("max");
  cacheTag(`deregistrations:month:${month}`);

  return db
    .select({
      total:
        sql<number>`cast(sum(${deregistrations.number}) as integer)`.mapWith(
          Number,
        ),
    })
    .from(deregistrations)
    .where(eq(deregistrations.month, month));
}
