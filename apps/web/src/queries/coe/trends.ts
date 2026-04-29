import {
  and,
  asc,
  coe,
  db,
  desc,
  eq,
  gte,
  lte,
  max,
  type SelectCOE,
} from "@motormetrics/database";
import { getDateRangeForYear } from "@web/lib/coe/calculations";
import type { COECategory } from "@web/types";
import { subMonths } from "date-fns";
import { cacheLife, cacheTag } from "next/cache";

const COE_CATEGORIES: COECategory[] = [
  "Category A",
  "Category B",
  "Category C",
  "Category D",
  "Category E",
];

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

const getLatestCoeMonth = async (): Promise<string | null> => {
  const result = await db
    .select({ month: max(coe.month) })
    .from(coe)
    .then((rows) => rows[0]?.month ?? null);

  return result;
};

const getDateRangeRolling12Months = (
  endMonth: string,
): { startMonth: string; endMonth: string } => {
  const endDate = new Date(`${endMonth}-01`);
  const startDate = subMonths(endDate, 11);

  return {
    startMonth: startDate.toISOString().slice(0, 7),
    endMonth,
  };
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
  cacheTag(`coe:category:${category}`);
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

export async function getAllCoeCategoryTrends(
  year?: number,
): Promise<Record<COECategory, CoeMonthlyPremium[]>> {
  "use cache";
  cacheLife("max");
  cacheTag("coe:trends");
  if (year) {
    cacheTag(`coe:year:${year}`);
  }

  let startMonth: string;
  let endMonth: string;

  if (year) {
    ({ startMonth, endMonth } = getDateRangeForYear(year));
  } else {
    const latestMonth = await getLatestCoeMonth();
    if (!latestMonth) {
      return Object.fromEntries(
        COE_CATEGORIES.map((category) => [category, [] as CoeMonthlyPremium[]]),
      ) as Record<COECategory, CoeMonthlyPremium[]>;
    }
    ({ startMonth, endMonth } = getDateRangeRolling12Months(latestMonth));
  }

  const results = await fetchCoeResults(startMonth, endMonth);

  const categoryTrends = new Map<COECategory, Map<string, CoeMonthlyPremium>>();
  for (const category of COE_CATEGORIES) {
    categoryTrends.set(category, new Map());
  }

  for (const result of results) {
    const categoryMap = categoryTrends.get(result.vehicleClass as COECategory);
    if (!categoryMap) continue;
    upsertMonthlyTrend(categoryMap, result);
  }

  return Object.fromEntries(
    COE_CATEGORIES.map((category) => [
      category,
      Array.from(categoryTrends.get(category)?.values() ?? []),
    ]),
  ) as Record<COECategory, CoeMonthlyPremium[]>;
}
