import { db } from "@motormetrics/database/client";
import { coeResults } from "@motormetrics/database/schema";
import { getDateRangeFromPeriod } from "@web/lib/coe/calculations";
import type { COEResult } from "@web/types";
import type { Period } from "@web/types/coe";
import { and, asc, gte, lte, max, min } from "drizzle-orm";
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
    .from(coeResults)
    .orderBy(
      asc(coeResults.month),
      asc(coeResults.biddingNo),
      asc(coeResults.vehicleClass),
    );

  return results as COEResult[];
}

export async function getCoeResultsByPeriod(
  period: Period = "12m",
): Promise<COEResult[]> {
  "use cache";
  cacheLife("max");
  cacheTag(`coe:period:${period}`);

  const [latestResult, earliestResult] = await db.batch([
    db.select({ month: max(coeResults.month) }).from(coeResults),
    db.select({ month: min(coeResults.month) }).from(coeResults),
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
    .from(coeResults)
    .where(and(gte(coeResults.month, start), lte(coeResults.month, end)))
    .orderBy(
      asc(coeResults.month),
      asc(coeResults.biddingNo),
      asc(coeResults.vehicleClass),
    );

  return results as COEResult[];
}
