import {
  and,
  asc,
  coe,
  db,
  desc,
  eq,
  max,
  or,
  sql,
} from "@motormetrics/database";
import type { COEResult } from "@web/types";
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

/**
 * Get the previous bidding round results (one round before the latest).
 * Handles both same-month previous round and previous month's last round.
 */
export async function getPreviousCoeResults(): Promise<COEResult[]> {
  "use cache";
  cacheLife("max");
  cacheTag("coe:previous");

  // First get the two most recent bidding rounds
  const recentRounds = await db
    .selectDistinct({
      month: coe.month,
      biddingNo: coe.biddingNo,
    })
    .from(coe)
    .orderBy(desc(coe.month), desc(coe.biddingNo))
    .limit(2);

  if (recentRounds.length < 2) {
    return [];
  }

  // Get the second most recent round (previous round)
  const previousRound = recentRounds[1];

  const results = await db
    .select()
    .from(coe)
    .where(
      and(
        eq(coe.month, previousRound.month),
        eq(coe.biddingNo, previousRound.biddingNo),
      ),
    )
    .orderBy(asc(coe.vehicleClass));

  return results as COEResult[];
}

/**
 * Get both latest and previous bidding round results in a single call.
 * Useful for calculating period-over-period changes.
 */
export async function getLatestAndPreviousCoeResults(): Promise<{
  latest: COEResult[];
  previous: COEResult[];
}> {
  "use cache";
  cacheLife("max");
  cacheTag("coe:latest", "coe:previous");

  // Get the two most recent bidding rounds
  const recentRounds = await db
    .selectDistinct({
      month: coe.month,
      biddingNo: coe.biddingNo,
    })
    .from(coe)
    .orderBy(desc(coe.month), desc(coe.biddingNo))
    .limit(2);

  if (recentRounds.length === 0) {
    return { latest: [], previous: [] };
  }

  const latestRound = recentRounds[0];
  const previousRound = recentRounds[1];

  // Fetch both rounds in a single query
  const allResults = await db
    .select()
    .from(coe)
    .where(
      or(
        and(
          eq(coe.month, latestRound.month),
          eq(coe.biddingNo, latestRound.biddingNo),
        ),
        previousRound
          ? and(
              eq(coe.month, previousRound.month),
              eq(coe.biddingNo, previousRound.biddingNo),
            )
          : sql`false`,
      ),
    )
    .orderBy(asc(coe.vehicleClass));

  const latest = allResults.filter(
    (r) =>
      r.month === latestRound.month && r.biddingNo === latestRound.biddingNo,
  ) as COEResult[];

  const previous = previousRound
    ? (allResults.filter(
        (r) =>
          r.month === previousRound.month &&
          r.biddingNo === previousRound.biddingNo,
      ) as COEResult[])
    : [];

  return { latest, previous };
}
