import { asc, coe, db, eq, max } from "@motormetrics/database";
import type { COEResult } from "@web/types";
import { cacheLife, cacheTag } from "next/cache";

export interface MonthBiddingRounds {
  month: string;
  firstRound: COEResult[];
  secondRound: COEResult[];
}

/**
 * Get both bidding rounds for a specific month or the latest month.
 * Returns 1st and 2nd round data separately, with secondRound being empty
 * if the 2nd bidding hasn't occurred yet.
 *
 * @param month - Optional month to fetch (YYYY-MM format). If not provided, fetches the latest month.
 */
export async function getMonthBiddingRounds(
  month?: string,
): Promise<MonthBiddingRounds> {
  "use cache";
  cacheLife("max");
  cacheTag("coe:bidding-rounds", month ? `coe:month:${month}` : "coe:latest");

  let targetMonth = month;

  // If no month specified, get the latest month
  if (!targetMonth) {
    const [latestMonthResult] = await db
      .select({ month: max(coe.month) })
      .from(coe);
    targetMonth = latestMonthResult?.month ?? undefined;
  }

  if (!targetMonth) {
    return { month: "", firstRound: [], secondRound: [] };
  }

  // Get all results for the target month (both rounds)
  const monthResults = await db
    .select()
    .from(coe)
    .where(eq(coe.month, targetMonth))
    .orderBy(asc(coe.biddingNo), asc(coe.vehicleClass));

  // Split by bidding round
  const firstRound = monthResults.filter(
    (r) => r.biddingNo === 1,
  ) as COEResult[];
  const secondRound = monthResults.filter(
    (r) => r.biddingNo === 2,
  ) as COEResult[];

  return {
    month: targetMonth,
    firstRound,
    secondRound,
  };
}
