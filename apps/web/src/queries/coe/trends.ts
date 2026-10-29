import { db } from "@motormetrics/database/client";
import { coe, type SelectCOE } from "@motormetrics/database/schema";
import { getDateRangeForYear } from "@web/lib/coe/calculations";
import type { COECategory } from "@web/types";
import { and, asc, desc, eq, gte, lte } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

const fetchCoeResults = async (
  startMonth: string,
  endMonth: string,
  category?: COECategory,
) => {
  const filters = [gte(coe.month, startMonth), lte(coe.month, endMonth)];

  if (category) {
    filters.push(eq(coe.vehicleClass, category));
  }

  return db
    .select()
    .from(coe)
    .where(and(...filters))
    .orderBy(asc(coe.month), desc(coe.biddingNo));
};

const upsertMonthlyTrend = (
  trends: Map<string, CoeMonthlyPremium>,
  result: SelectCOE,
) => {
  const biddingNo = result.biddingNo;

  const existing = trends.get(result.month);

  if (!existing || biddingNo > existing.biddingNo) {
    trends.set(result.month, {
      month: result.month,
      premium: result.premium,
      biddingNo,
    });
  }
};

export interface CoeMonthlyPremium {
  month: string;
  premium: number;
  biddingNo: number;
}

export async function getCoeCategoryTrends(
  category: COECategory,
  year?: number,
): Promise<CoeMonthlyPremium[]> {
  "use cache";
  cacheLife("max");
  cacheTag(`coe:category:${category}`, "coe:trends");
  if (year) {
    cacheTag(`coe:year:${year}`);
  }

  const { startMonth, endMonth } = getDateRangeForYear(year);

  const results = await fetchCoeResults(startMonth, endMonth, category);
  const monthlyTrends = new Map<string, CoeMonthlyPremium>();

  for (const result of results) {
    upsertMonthlyTrend(monthlyTrends, result);
  }

  return Array.from(monthlyTrends.values());
}
