import { db } from "@motormetrics/database/client";
import { coeResults } from "@motormetrics/database/schema";
import type { COEResult } from "@web/types";
import { and, asc, eq, max, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

export async function getLatestCoeResults(): Promise<COEResult[]> {
  "use cache";
  cacheLife("max");
  cacheTag("coe:latest");

  // Use SQL subqueries to get latest month and latest bidding number in a single query
  const latestMonthSubquery = db
    .select({ month: max(coeResults.month) })
    .from(coeResults);

  const latestBiddingSubquery = db
    .select({ biddingNo: max(coeResults.biddingNo) })
    .from(coeResults)
    .where(eq(coeResults.month, sql`(${latestMonthSubquery})`));

  const results = await db
    .select()
    .from(coeResults)
    .where(
      and(
        eq(coeResults.month, sql`(${latestMonthSubquery})`),
        eq(coeResults.biddingNo, sql`(${latestBiddingSubquery})`),
      ),
    )
    .orderBy(asc(coeResults.vehicleClass));

  return results as COEResult[];
}
