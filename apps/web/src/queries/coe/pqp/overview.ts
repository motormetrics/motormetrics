import { db } from "@motormetrics/database/client";
import { coe, pqp } from "@motormetrics/database/schema";
import type { Pqp } from "@web/types/coe";
import { and, desc, eq, inArray, max, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

/** Every category LTA publishes a PQP for. */
export const PQP_CATEGORIES = [
  "Category A",
  "Category B",
  "Category C",
  "Category D",
] as const;

export type PQPCategory = (typeof PQP_CATEGORIES)[number];

/**
 * The categories the PQP page reports on, and the only ones this query reads.
 *
 * C is goods vehicles and buses and D is motorcycles — neither is a car, which
 * is what the rest of the site covers. This is the single switch for that
 * decision: widen it (to `PQP_CATEGORIES`, or any subset) and the query, the
 * page's category tabs, its tables and its URL parser all widen with it.
 */
export const PQP_REPORTED_CATEGORIES = [
  "Category A",
  "Category B",
] as const satisfies readonly PQPCategory[];

export type PQPReportedCategory = (typeof PQP_REPORTED_CATEGORIES)[number];

const createEmptyRates = (): Pqp.Rates => ({
  "Category A": 0,
  "Category B": 0,
  "Category C": 0,
  "Category D": 0,
});

/**
 * Aggregated PQP insights for the last 12 months.
 *
 * `categories` narrows what is read from the database, not just what is
 * returned. `Pqp.Rates` still carries a key per published category, so a month
 * row reports 0 for any category outside the requested set rather than dropping
 * the key — the shape stays stable whichever categories are asked for.
 */
export async function getPQPOverview(
  categories: readonly PQPCategory[] = PQP_REPORTED_CATEGORIES,
): Promise<Pqp.Overview> {
  "use cache";
  cacheLife("max");
  cacheTag("coe:pqp");

  // The latest exercise: the highest bidding number within the latest month
  const latestCoeMonth = db.select({ month: max(coe.month) }).from(coe);
  const latestCoeBiddingNo = db
    .select({ biddingNo: max(coe.biddingNo) })
    .from(coe)
    .where(eq(coe.month, sql`(${latestCoeMonth})`));

  const [recentMonthRows, latestCoeResults] = await db.batch([
    db
      .selectDistinct({ month: pqp.month })
      .from(pqp)
      .orderBy(desc(pqp.month))
      .limit(12),
    db
      .select({
        vehicleClass: coe.vehicleClass,
        premium: coe.premium,
      })
      .from(coe)
      .where(
        and(
          eq(coe.month, sql`(${latestCoeMonth})`),
          eq(coe.biddingNo, sql`(${latestCoeBiddingNo})`),
          inArray(coe.vehicleClass, categories),
        ),
      ),
  ]);

  const recentMonths = recentMonthRows.map((row) => row.month);

  const pqpRates =
    recentMonths.length > 0
      ? await db
          .select({
            month: pqp.month,
            vehicleClass: pqp.vehicleClass,
            pqp: pqp.pqp,
          })
          .from(pqp)
          .where(
            and(
              inArray(pqp.month, recentMonths),
              inArray(pqp.vehicleClass, categories),
            ),
          )
      : [];

  const monthRateMap = new Map<string, Pqp.Rates>(
    recentMonths.map((month) => [month, createEmptyRates()]),
  );

  for (const rate of pqpRates) {
    const monthRates = monthRateMap.get(rate.month);
    if (monthRates) {
      monthRates[rate.vehicleClass as keyof Pqp.Rates] = rate.pqp;
    }
  }

  const coePremiumMap = new Map(
    latestCoeResults.map((result) => [
      result.vehicleClass as PQPCategory,
      result.premium,
    ]),
  );

  // The most recent month's rates, which the comparison measures premiums against
  const latestPqpRates =
    monthRateMap.get(recentMonths[0]) ?? createEmptyRates();

  const tableRows: Pqp.TableRow[] = recentMonths.map((month) => {
    const rates = monthRateMap.get(month) ?? createEmptyRates();

    return {
      key: month,
      month,
      "Category A": rates["Category A"],
      "Category B": rates["Category B"],
      "Category C": rates["Category C"],
      "Category D": rates["Category D"],
    };
  });

  const trendData: Pqp.TrendPoint[] = [...tableRows].sort((a, b) =>
    a.month.localeCompare(b.month),
  );

  const categorySummaries: Pqp.CategorySummary[] = categories.map(
    (category) => {
      const coePremium = coePremiumMap.get(category) ?? 0;
      const pqpRate = latestPqpRates[category];
      const difference = coePremium - pqpRate;
      const differencePercent = pqpRate > 0 ? (difference * 100) / pqpRate : 0;
      const pqpCost5Year = pqpRate * 0.5;
      const pqpCost10Year = pqpRate;
      const savings5Year = coePremium * 0.5 - pqpCost5Year;
      const savings10Year = difference;

      return {
        category,
        coePremium,
        pqpRate,
        difference,
        differencePercent,
        pqpCost5Year,
        pqpCost10Year,
        savings5Year,
        savings10Year,
      };
    },
  );

  const comparison: Pqp.Comparison[] = categorySummaries.map((row) => ({
    category: row.category,
    latestPremium: row.coePremium,
    pqpRate: row.pqpRate,
    difference: row.difference,
    differencePercent: row.differencePercent,
  }));

  const latestMonth = tableRows[0]?.month ?? null;

  return {
    latestMonth,
    tableRows,
    trendData,
    comparison,
    categorySummaries,
  };
}
