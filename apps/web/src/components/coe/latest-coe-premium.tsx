"use client";

import { KpiWithChartInline } from "@web/components/kpi-with-chart-inline";
import type { CoeMonthlyPremium } from "@web/queries/coe";
import type { COECategory, COEResult } from "@web/types";

interface LatestCoePremiumProps {
  results: COEResult[];
  trends?: Record<COECategory, CoeMonthlyPremium[]>;
}

type Trend = "up" | "down" | "neutral";

const calculateTrend = (data: { value: number }[]): Trend | undefined => {
  if (data.length < 2) return undefined;

  const first = data[0].value;
  const last = data[data.length - 1].value;

  if (last > first) return "up";
  if (last < first) return "down";
  return "neutral";
};

// For COE: price up = bad (danger/red), price down = good (success/green)
const getTrendColour = (trend?: Trend): string => {
  switch (trend) {
    case "up":
      return "var(--danger)";
    case "down":
      return "var(--success)";
    case "neutral":
      return "var(--warning)";
    default:
      return "var(--accent)";
  }
};

export function LatestCoePremium({ results, trends }: LatestCoePremiumProps) {
  return (
    <>
      {results.map((result) => {
        const categoryTrends = trends?.[result.vehicleClass] || [];
        const sparklineData = categoryTrends.map((point) => ({
          value: point.premium,
        }));
        const trend = calculateTrend(sparklineData);
        const trendColour = getTrendColour(trend);

        return (
          <KpiWithChartInline
            key={result.vehicleClass}
            title={result.vehicleClass}
            value={result.premium}
            valueProps={{
              currency: "SGD",
              locale: "en-SG",
              maximumFractionDigits: 0,
              style: "currency",
            }}
            chartColor={trendColour}
            chartData={sparklineData}
            chartProps={{ height: 70, strokeWidth: 1.5 }}
          />
        );
      })}
    </>
  );
}
