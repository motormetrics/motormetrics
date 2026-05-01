import { redis } from "@motormetrics/utils";
import type { Period } from "@web/app/(main)/(dashboard)/coe/search-params";
import { LAST_UPDATED_COE_KEY } from "@web/config";
import { groupCOEResultsByBidding } from "@web/lib/coe/calculations";
import {
  getCoeMonths,
  getCoeResultsByPeriod,
  getMonthBiddingRounds,
} from "@web/queries/coe";

export async function fetchCOEPageData(period: Period = "12m") {
  const [monthsResult, coeResults, lastUpdated] = await Promise.all([
    getCoeMonths(),
    getCoeResultsByPeriod(period),
    redis.get<number>(LAST_UPDATED_COE_KEY),
  ]);

  const months = monthsResult.map(({ month }) => month);

  return {
    coeResults,
    months,
    lastUpdated,
    data: groupCOEResultsByBidding(coeResults),
  };
}

/**
 * Load data for the COE Results page
 *
 * Loads period-filtered COE results with chart data for trends and historical analysis.
 * Also fetches bidding rounds (1st and 2nd) for the selected or latest month.
 *
 * @param period - Time period for filtering (12m, 5y, 10y, ytd, all)
 * @param month - Optional specific month to show bidding rounds for (YYYY-MM format)
 * @returns COE results, grouped chart data, bidding rounds, and last updated timestamp
 */
export async function loadResultsPageData(
  period: Period = "12m",
  month?: string,
) {
  const [periodData, monthRounds] = await Promise.all([
    fetchCOEPageData(period),
    getMonthBiddingRounds(month),
  ]);

  return {
    coeResults: periodData.coeResults,
    chartData: periodData.data,
    lastUpdated: periodData.lastUpdated,
    months: periodData.months,
    // Bidding rounds for selected month
    biddingMonth: monthRounds.month,
    firstRound: monthRounds.firstRound,
    secondRound: monthRounds.secondRound,
  };
}
