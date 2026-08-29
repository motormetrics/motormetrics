import {
  and,
  coe,
  db,
  desc,
  eq,
  inArray,
  isNotNull,
  pqp,
} from "@motormetrics/database";
import type { Pqp } from "@web/types/coe";
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

const toNumber = (value: number | string | null | undefined): number => {
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

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

  // Batch independent queries in a single round-trip
  const [recentMonthsRows, latestCoeMonthRow, latestPqpMonthRow] =
    await db.batch([
      db
        .selectDistinct({ month: pqp.month })
        .from(pqp)
        .where(isNotNull(pqp.month))
        .orderBy(desc(pqp.month))
        .limit(12),
      db
        .select({ month: coe.month })
        .from(coe)
        .where(isNotNull(coe.month))
        .orderBy(desc(coe.month))
        .limit(1),
      db
        .select({ month: pqp.month })
        .from(pqp)
        .where(isNotNull(pqp.month))
        .orderBy(desc(pqp.month))
        .limit(1),
    ]);

  const recentMonths = recentMonthsRows
    .map((row) => row.month)
    .filter((month): month is string => Boolean(month));

  const latestCoeMonth = latestCoeMonthRow[0]?.month ?? null;
  const latestPqpMonth = latestPqpMonthRow[0]?.month ?? null;

  const monthRateMap = new Map<string, Pqp.Rates>(
    recentMonths.map((month) => [month, createEmptyRates()]),
  );

  const coePremiumMap = new Map<PQPCategory, number>();
  const pqpRateMap = new Map<PQPCategory, number>();

  // Build conditional queries based on first batch results
  type PqpRatesResult = {
    month: string | null;
    vehicleClass: string;
    pqp: number | null;
  }[];
  type LatestBiddingResult = { biddingNo: number }[];
  type LatestPqpRatesResult = { vehicleClass: string; pqp: number | null }[];

  let pqpRates: PqpRatesResult = [];
  let latestCoeBiddingRow: LatestBiddingResult = [];
  let latestPqpRates: LatestPqpRatesResult = [];

  // Batch second round of queries (depend on first batch results)
  if (recentMonths.length > 0 || latestCoeMonth || latestPqpMonth) {
    const queries = [];
    const queryIndexes: {
      pqpRates?: number;
      biddingNo?: number;
      pqpLatest?: number;
    } = {};
    let queryIndex = 0;

    if (recentMonths.length > 0) {
      queries.push(
        db
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
          ),
      );
      queryIndexes.pqpRates = queryIndex++;
    }

    if (latestCoeMonth) {
      queries.push(
        db
          .select({ biddingNo: coe.biddingNo })
          .from(coe)
          .where(eq(coe.month, latestCoeMonth))
          .orderBy(desc(coe.biddingNo))
          .limit(1),
      );
      queryIndexes.biddingNo = queryIndex++;
    }

    if (latestPqpMonth) {
      queries.push(
        db
          .select({
            vehicleClass: pqp.vehicleClass,
            pqp: pqp.pqp,
          })
          .from(pqp)
          .where(
            and(
              eq(pqp.month, latestPqpMonth),
              inArray(pqp.vehicleClass, categories),
            ),
          ),
      );
      queryIndexes.pqpLatest = queryIndex++;
    }

    if (queries.length > 0) {
      const results = await db.batch(
        queries as [(typeof queries)[0], ...(typeof queries)[number][]],
      );

      if (queryIndexes.pqpRates !== undefined) {
        pqpRates = results[queryIndexes.pqpRates] as PqpRatesResult;
      }
      if (queryIndexes.biddingNo !== undefined) {
        latestCoeBiddingRow = results[
          queryIndexes.biddingNo
        ] as LatestBiddingResult;
      }
      if (queryIndexes.pqpLatest !== undefined) {
        latestPqpRates = results[
          queryIndexes.pqpLatest
        ] as LatestPqpRatesResult;
      }
    }
  }

  // Process PQP rates
  for (const rate of pqpRates) {
    if (!rate.month || !rate.vehicleClass) {
      continue;
    }

    const monthRates = monthRateMap.get(rate.month) ?? createEmptyRates();
    monthRates[rate.vehicleClass as keyof Pqp.Rates] = toNumber(rate.pqp);
    monthRateMap.set(rate.month, monthRates);
  }

  // Process latest PQP rates
  for (const rate of latestPqpRates) {
    if (!rate.vehicleClass) {
      continue;
    }

    pqpRateMap.set(rate.vehicleClass as PQPCategory, toNumber(rate.pqp));
  }

  // Fetch latest COE results if we have a bidding number
  const latestCoeBiddingNo = latestCoeBiddingRow[0]?.biddingNo ?? null;

  if (latestCoeMonth && latestCoeBiddingNo !== null) {
    const latestCoeResults = await db
      .select({
        vehicleClass: coe.vehicleClass,
        premium: coe.premium,
      })
      .from(coe)
      .where(
        and(
          eq(coe.month, latestCoeMonth),
          eq(coe.biddingNo, latestCoeBiddingNo),
          inArray(coe.vehicleClass, categories),
        ),
      );

    for (const result of latestCoeResults) {
      if (!result.vehicleClass) {
        continue;
      }

      coePremiumMap.set(
        result.vehicleClass as PQPCategory,
        toNumber(result.premium),
      );
    }
  }

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
      const pqpRate = pqpRateMap.get(category) ?? 0;
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
