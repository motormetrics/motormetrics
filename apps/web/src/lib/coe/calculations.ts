import { formatCurrency } from "@motormetrics/utils";
import type { Period } from "@web/app/(main)/(explore)/coe/search-params";
import type { CoeMarketShareData } from "@web/queries/coe";
import type { COEBiddingResult, COEResult } from "@web/types";
import { format, subMonths, subYears } from "date-fns";

export const COE_CATEGORY_MAP = {
  A: "Category A (Cars up to 1600cc & 130bhp)",
  B: "Category B (Cars above 1600cc or 130bhp)",
  C: "Category C (Goods vehicles & buses)",
  D: "Category D (Motorcycles)",
  E: "Category E (Open category)",
} as const;

export const formatCOECategory = (category: string): string => {
  return (
    COE_CATEGORY_MAP[category as keyof typeof COE_CATEGORY_MAP] || category
  );
};

export const calculateCOEPremiumInsights = (
  data: CoeMarketShareData[],
): {
  averagePremium: number;
  highestCategory: string;
  lowestCategory: string;
  premiumSpread: number;
  insights: string[];
} => {
  const sortedByPremium = [...data].sort((a, b) => b.premium - a.premium);

  const averagePremium =
    data.reduce((sum, item) => sum + item.premium, 0) / data.length;
  const highestCategory = sortedByPremium[0];
  const lowestCategory = sortedByPremium[sortedByPremium.length - 1];
  const premiumSpread = highestCategory.premium - lowestCategory.premium;

  const insights: string[] = [];

  if (premiumSpread > 50000) {
    insights.push(
      `Large premium spread of ${formatCurrency(Math.round(premiumSpread))} between categories`,
    );
  }

  if (highestCategory.premium > averagePremium * 1.5) {
    insights.push(
      `${highestCategory.category} trading significantly above average`,
    );
  }

  if (lowestCategory.premium < averagePremium * 0.5) {
    insights.push(
      `${lowestCategory.category} trading significantly below average`,
    );
  }

  return {
    averagePremium,
    highestCategory: highestCategory.category,
    lowestCategory: lowestCategory.category,
    premiumSpread,
    insights,
  };
};

export const formatCOEDataForChart = (
  data: CoeMarketShareData[],
): Array<{
  name: string;
  value: number;
  premium: number;
  colour: string;
}> => {
  return data.map((item) => ({
    name: formatCOECategory(item.category),
    value: item.quota,
    premium: item.premium,
    colour: item.colour,
  }));
};

/**
 * Groups COE results by month and bidding number, transforming from
 * separate records per vehicle class into a single record with all
 * categories as fields.
 */
export const groupCOEResultsByBidding = (
  coeResults: COEResult[],
): COEBiddingResult[] => {
  const groupedData = coeResults.reduce<
    Record<string, Partial<COEBiddingResult>>
  >((acc, item) => {
    const key = `${item.month}-${item.biddingNo}`;

    if (!acc[key]) {
      acc[key] = {
        month: item.month,
        biddingNo: item.biddingNo,
      };
    }
    acc[key][item.vehicleClass] = item.premium;

    return acc;
  }, {});

  return Object.values(groupedData) as COEBiddingResult[];
};

export interface TrendInsight {
  category: string;
  latest: number;
  change: number;
  highest: number;
  lowest: number;
  average: number;
}

/**
 * Calculate trend insights for COE categories.
 * Analyzes latest prices, percentage changes, and historical statistics per category.
 */
export const calculateTrendInsights = (
  data: COEBiddingResult[],
): TrendInsight[] => {
  const categories = [
    "Category A",
    "Category B",
    "Category C",
    "Category D",
    "Category E",
  ];

  return categories
    .map((category) => {
      const categoryData = data
        .filter((item) => item[category as keyof COEBiddingResult])
        .map((item) => ({
          month: item.month,
          premium: item[category as keyof COEBiddingResult] as number,
        }))
        .sort((a, b) => a.month.localeCompare(b.month));

      if (categoryData.length === 0) return null;

      const latest = categoryData[categoryData.length - 1];
      const previous = categoryData[categoryData.length - 2];
      const change = previous
        ? ((latest.premium - previous.premium) / previous.premium) * 100
        : 0;

      const highest = Math.max(...categoryData.map((d) => d.premium));
      const lowest = Math.min(...categoryData.map((d) => d.premium));
      const average =
        categoryData.reduce((sum, d) => sum + d.premium, 0) /
        categoryData.length;

      return {
        category,
        latest: latest.premium,
        change,
        highest,
        lowest,
        average,
      };
    })
    .filter((x) => x !== null) as TrendInsight[];
};

export interface CategoryStats {
  totalRounds: number;
  averagePremium: number;
  highestPremium: number;
  lowestPremium: number;
}

/**
 * Calculate statistics for a specific COE category.
 */
export const calculateCategoryStats = (results: COEResult[]): CategoryStats => {
  const premiums = results.map((item) => item.premium);

  return {
    totalRounds: results.length,
    averagePremium: Math.round(
      premiums.reduce((sum, p) => sum + p, 0) / premiums.length,
    ),
    highestPremium: Math.max(...premiums),
    lowestPremium: Math.min(...premiums),
  };
};

export interface OverviewStats {
  category: string;
  highest: number;
  lowest: number;
  highestRecord: {
    date?: string;
    amount: number;
  };
  lowestRecord: {
    date?: string;
    amount: number;
  };
}

export interface PremiumRangeStats {
  category: string;
  ytd: {
    highest: number;
    lowest: number;
    highestDate?: string;
    lowestDate?: string;
  } | null;
  allTime: {
    highest: number;
    lowest: number;
    highestDate?: string;
    lowestDate?: string;
  };
}

/**
 * Calculate overview statistics for COE categories across all data.
 * Returns highest/lowest premiums with dates for specified categories.
 */
export const calculateOverviewStats = (
  allResults: COEResult[],
  categories: string[],
): OverviewStats[] => {
  return categories
    .map((category) => {
      const categoryData = allResults
        .filter((item) => item.vehicleClass === category)
        .sort(
          (a, b) => new Date(a.month).getTime() - new Date(b.month).getTime(),
        );

      if (categoryData.length === 0) return null;

      const premiums = categoryData.map(({ premium }) => premium);
      const highest = Math.max(...premiums);
      const lowest = Math.min(...premiums);

      const highestRecord = categoryData.find(
        ({ premium }) => premium === highest,
      );
      const lowestRecord = categoryData.find(
        ({ premium }) => premium === lowest,
      );

      return {
        category,
        highest,
        lowest,
        highestRecord: {
          date: highestRecord?.month,
          amount: highest,
        },
        lowestRecord: {
          date: lowestRecord?.month,
          amount: lowest,
        },
      };
    })
    .filter((x) => x !== null) as OverviewStats[];
};

/**
 * Calculate premium range statistics for COE categories.
 * Returns YTD (current year) and all-time min/max premiums with dates.
 */
export const calculatePremiumRangeStats = (
  allResults: COEResult[],
  categories: string[],
): PremiumRangeStats[] => {
  // Derive current year from the latest result to avoid new Date() in prerender context
  const latestMonth = allResults.at(-1)?.month;
  const currentYear = latestMonth
    ? latestMonth.slice(0, 4)
    : new Date().getFullYear().toString();

  return categories
    .map((category) => {
      const categoryData = allResults.filter(
        (item) => item.vehicleClass === category,
      );

      if (categoryData.length === 0) return null;

      // All-time stats
      const allTimePremiums = categoryData.map(({ premium }) => premium);
      const allTimeHighest = Math.max(...allTimePremiums);
      const allTimeLowest = Math.min(...allTimePremiums);
      const allTimeHighestRecord = categoryData.find(
        ({ premium }) => premium === allTimeHighest,
      );
      const allTimeLowestRecord = categoryData.find(
        ({ premium }) => premium === allTimeLowest,
      );

      // YTD stats (filter by current year)
      const ytdData = categoryData.filter((item) =>
        item.month.startsWith(currentYear),
      );

      let ytdStats: PremiumRangeStats["ytd"] = null;
      if (ytdData.length > 0) {
        const ytdPremiums = ytdData.map(({ premium }) => premium);
        const ytdHighest = Math.max(...ytdPremiums);
        const ytdLowest = Math.min(...ytdPremiums);
        const ytdHighestRecord = ytdData.find(
          ({ premium }) => premium === ytdHighest,
        );
        const ytdLowestRecord = ytdData.find(
          ({ premium }) => premium === ytdLowest,
        );

        ytdStats = {
          highest: ytdHighest,
          lowest: ytdLowest,
          highestDate: ytdHighestRecord?.month,
          lowestDate: ytdLowestRecord?.month,
        };
      }

      return {
        category,
        ytd: ytdStats,
        allTime: {
          highest: allTimeHighest,
          lowest: allTimeLowest,
          highestDate: allTimeHighestRecord?.month,
          lowestDate: allTimeLowestRecord?.month,
        },
      };
    })
    .filter((x) => x !== null) as PremiumRangeStats[];
};

/**
 * Format a date to YYYY-MM format for the current month
 */
export const formatCurrentMonth = (date: Date): string =>
  date.toISOString().slice(0, 7);

/**
 * Get date range for a given year (defaults to current year)
 */
export const getDateRangeForYear = (
  year?: number,
): { startMonth: string; endMonth: string } => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const targetYear = year ?? currentYear;

  const startMonth = `${targetYear}-01`;
  const endMonth =
    targetYear < currentYear
      ? `${targetYear}-12`
      : formatCurrentMonth(currentDate);

  return { startMonth, endMonth };
};

/**
 * Get date range for the last 24 months from current date
 */
export const getDateRange24Months = (): {
  startMonth: string;
  endMonth: string;
} => {
  const currentDate = new Date();
  const startDate = subMonths(currentDate, 24);

  return {
    startMonth: startDate.toISOString().slice(0, 7),
    endMonth: currentDate.toISOString().slice(0, 7),
  };
};

/**
 * Convert a period string to a date range
 */
export const getDateRangeFromPeriod = (
  period: Period,
  latestMonth: string,
  earliestMonth: string,
): { start: string; end: string } => {
  const latest = new Date(`${latestMonth}-01`);

  switch (period) {
    case "12m":
      return {
        start: format(subMonths(latest, 12), "yyyy-MM"),
        end: latestMonth,
      };
    case "5y":
      return {
        start: format(subYears(latest, 5), "yyyy-MM"),
        end: latestMonth,
      };
    case "10y":
      return {
        start: format(subYears(latest, 10), "yyyy-MM"),
        end: latestMonth,
      };
    case "ytd":
      return { start: `${new Date().getFullYear()}-01`, end: latestMonth };
    case "all":
      return { start: earliestMonth, end: latestMonth };
  }
};

// ============================================================================
// Key Insights Calculation Functions
// ============================================================================

export interface PremiumMover {
  category: string;
  latestPremium: number;
  previousPremium: number;
  change: number;
  direction: "up" | "down" | "unchanged";
}

/**
 * Calculate premium change between latest and previous bidding rounds.
 * Returns categories sorted by absolute change percentage.
 */
export const calculateBiggestMovers = (
  latestResults: COEResult[],
  previousResults: COEResult[],
): PremiumMover[] => {
  return latestResults
    .map((latest) => {
      const previous = previousResults.find(
        (p) => p.vehicleClass === latest.vehicleClass,
      );

      if (!previous || previous.premium === 0) {
        return {
          category: latest.vehicleClass,
          latestPremium: latest.premium,
          previousPremium: 0,
          change: 0,
          direction: "unchanged" as const,
        };
      }

      const change =
        ((latest.premium - previous.premium) / previous.premium) * 100;

      return {
        category: latest.vehicleClass,
        latestPremium: latest.premium,
        previousPremium: previous.premium,
        change,
        direction:
          change > 0
            ? ("up" as const)
            : change < 0
              ? ("down" as const)
              : ("unchanged" as const),
      };
    })
    .sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
};

export interface NearRecordStatus {
  category: string;
  currentPremium: number;
  allTimeHigh: number;
  allTimeLow: number;
  nearHigh: boolean;
  nearLow: boolean;
  percentFromHigh: number;
  percentFromLow: number;
}

/**
 * Check if categories are within a threshold of all-time records.
 * Default threshold is 5% of the record value.
 */
export const calculateNearRecords = (
  latestResults: COEResult[],
  allTimeStats: PremiumRangeStats[],
  thresholdPercent = 5,
): NearRecordStatus[] => {
  return latestResults
    .map((result) => {
      const stats = allTimeStats.find(
        (s) => s.category === result.vehicleClass,
      );

      if (!stats) return null;

      const { allTime } = stats;
      const current = result.premium;

      const percentFromHigh =
        allTime.highest > 0
          ? ((allTime.highest - current) / allTime.highest) * 100
          : 0;

      const percentFromLow =
        allTime.lowest > 0
          ? ((current - allTime.lowest) / allTime.lowest) * 100
          : 0;

      return {
        category: result.vehicleClass,
        currentPremium: current,
        allTimeHigh: allTime.highest,
        allTimeLow: allTime.lowest,
        nearHigh: percentFromHigh <= thresholdPercent,
        nearLow: current <= allTime.lowest * (1 + thresholdPercent / 100),
        percentFromHigh,
        percentFromLow,
      };
    })
    .filter((x) => x !== null);
};

export interface DemandMetrics {
  category: string;
  quota: number;
  bidsReceived: number;
  bidsSuccess: number;
  oversubscriptionRatio: number;
  successRate: number;
}

/**
 * Calculate demand and oversubscription metrics for COE categories.
 * - Oversubscription ratio: bidsReceived / quota (higher = more demand)
 * - Success rate: bidsSuccess / quota (closer to 1 = filled quota)
 */
export const calculateDemandMetrics = (
  results: COEResult[],
): DemandMetrics[] => {
  return results
    .map((result) => {
      const { vehicleClass, quota, bidsReceived, bidsSuccess } = result;

      const oversubscriptionRatio = quota > 0 ? bidsReceived / quota : 0;
      const successRate = quota > 0 ? bidsSuccess / quota : 0;

      return {
        category: vehicleClass,
        quota,
        bidsReceived,
        bidsSuccess,
        oversubscriptionRatio,
        successRate,
      };
    })
    .sort((a, b) => b.oversubscriptionRatio - a.oversubscriptionRatio);
};

export interface KeyInsight {
  type: "mover" | "record" | "demand" | "spread";
  category?: string;
  message: string;
  value?: number;
  direction?: "up" | "down";
}

/**
 * Generate key insights from COE data combining biggest movers
 * and near-record prices.
 */
export const generateKeyInsights = (
  movers: PremiumMover[],
  nearRecords: NearRecordStatus[],
  limit = 4,
): KeyInsight[] => {
  const insights: KeyInsight[] = [];

  // Add biggest movers (top 2)
  movers.slice(0, 2).forEach((mover) => {
    if (Math.abs(mover.change) >= 1) {
      const direction = mover.direction === "up" ? "up" : "down";
      const arrow = direction === "up" ? "↑" : "↓";
      insights.push({
        type: "mover",
        category: mover.category,
        message: `${mover.category} ${arrow} ${Math.abs(mover.change).toFixed(1)}% from last round`,
        value: mover.change,
        direction,
      });
    }
  });

  // Add near-record insights
  nearRecords.forEach((record) => {
    if (record.nearHigh) {
      insights.push({
        type: "record",
        category: record.category,
        message: `${record.category} at ${(100 - record.percentFromHigh).toFixed(0)}% of all-time high`,
        value: 100 - record.percentFromHigh,
        direction: "up",
      });
    }
  });

  return insights.slice(0, limit);
};
