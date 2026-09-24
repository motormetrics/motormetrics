import { db } from "@motormetrics/database/client";
import { coe } from "@motormetrics/database/schema";
import type { COEResult } from "@web/types";
import { and, asc, eq, max, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

export async function getLatestCoeResults(): Promise<COEResult[]> {
  "use cache";
  cacheLife("max");
  cacheTag("coe:latest");

  // Use SQL subqueries to get latest month and latest bidding number in a single query
  const latestMonthSubquery = db.select({ month: max(coe.month) }).from(coe);

  const latestBiddingSubquery = db
    .select({ biddingNo: max(coe.biddingNo) })
    .from(coe)
    .where(eq(coe.month, sql`(${latestMonthSubquery})`));

  const results = await db
    .select()
    .from(coe)
    .where(
      and(
        eq(coe.month, sql`(${latestMonthSubquery})`),
        eq(coe.biddingNo, sql`(${latestBiddingSubquery})`),
      ),
    )
    .orderBy(asc(coe.vehicleClass));

  return results as COEResult[];
}
