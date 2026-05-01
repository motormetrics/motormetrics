import { and, asc, coe, db, gte, lte, max, min } from "@motormetrics/database";
import type { Period } from "@web/app/(main)/(dashboard)/coe/search-params";
import { getDateRangeFromPeriod } from "@web/lib/coe/calculations";
import type { COEResult } from "@web/types";
import { cacheLife, cacheTag } from "next/cache";

export interface CoeMarketShareData {
  category: string;
  premium: number;
  percentage: number;
  quota: number;
  colour: string;
}

export async function getCoeResults(): Promise<COEResult[]> {
  "use cache";
  cacheLife("max");
  cacheTag("coe:results");

  const results = await db
    .select()
    .from(coe)
    .orderBy(asc(coe.month), asc(coe.biddingNo), asc(coe.vehicleClass));

  return results as COEResult[];
}

export async function getCoeResultsByPeriod(
  period: Period = "12m",
): Promise<COEResult[]> {
  "use cache";
  cacheLife("max");
  cacheTag(`coe:period:${period}`);

  const [latestResult, earliestResult] = await db.batch([
    db.select({ month: max(coe.month) }).from(coe),
    db.select({ month: min(coe.month) }).from(coe),
  ]);

  const latestMonth = latestResult[0]?.month;
  const earliestMonth = earliestResult[0]?.month;

  if (!latestMonth || !earliestMonth) {
    return [];
  }

  const { start, end } = getDateRangeFromPeriod(
    period,
    latestMonth,
    earliestMonth,
  );

  const results = await db
    .select()
    .from(coe)
    .where(and(gte(coe.month, start), lte(coe.month, end)))
    .orderBy(asc(coe.month), asc(coe.biddingNo), asc(coe.vehicleClass));

  return results as COEResult[];
}
