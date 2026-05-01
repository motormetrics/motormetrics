"use client";

import { Card } from "@heroui/react";
import { AreaChart } from "@heroui-pro/react";

import { AnimatedNumber } from "@web/components/animated-number";
import Typography from "@web/components/typography";
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
        const gradientId = `coe-${result.vehicleClass}-sparkline`.replace(
          /[^a-zA-Z0-9-]/g,
          "",
        );

        return (
          <Card
            key={result.vehicleClass}
            className="transition-shadow transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            <Card.Header>
              <div className="flex items-center gap-2">
                <Typography.H4>{result.vehicleClass}</Typography.H4>
              </div>
            </Card.Header>
            <Card.Content>
              <div className="grid grid-cols-2 items-center gap-2">
                <div className="bg-gradient-to-br from-accent to-accent/70 bg-clip-text font-bold text-2xl text-transparent">
                  <AnimatedNumber value={result.premium} format="currency" />
                </div>
                {sparklineData.length > 0 && (
                  <AreaChart
                    data={sparklineData}
                    height={64}
                    margin={{ bottom: 0, left: 0, right: 0, top: 2 }}
                  >
                    <defs>
                      <linearGradient
                        id={gradientId}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor={trendColour}
                          stopOpacity={0.1}
                        />
                        <stop
                          offset="100%"
                          stopColor={trendColour}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <AreaChart.Area
                      dataKey="value"
                      dot={false}
                      fill={`url(#${gradientId})`}
                      stroke={trendColour}
                      strokeWidth={2}
                      type="monotone"
                    />
                  </AreaChart>
                )}
              </div>
            </Card.Content>
          </Card>
        );
      })}
    </>
  );
}
