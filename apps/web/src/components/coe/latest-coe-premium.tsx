"use client";

import { Card } from "@heroui/react";

import { AnimatedNumber } from "@web/components/animated-number";
import { Sparkline } from "@web/components/charts/sparkline";
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
      return "hsl(var(--heroui-danger))";
    case "down":
      return "hsl(var(--heroui-success))";
    case "neutral":
      return "hsl(var(--heroui-warning))";
    default:
      return "hsl(var(--heroui-primary))";
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

        return (
          <Card
            key={result.vehicleClass}
            className="rounded-2xl p-3 transition-shadow transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            <Card.Header>
              <div className="flex items-center gap-2">
                <Typography.H4>{result.vehicleClass}</Typography.H4>
              </div>
            </Card.Header>
            <Card.Content>
              <div className="grid grid-cols-2 items-center gap-2">
                <div className="bg-gradient-to-br from-primary to-primary/70 bg-clip-text font-bold text-2xl text-transparent">
                  <AnimatedNumber value={result.premium} format="currency" />
                </div>
                {sparklineData.length > 0 && (
                  <Sparkline
                    data={sparklineData}
                    colour={getTrendColour(trend)}
                  />
                )}
              </div>
            </Card.Content>
          </Card>
        );
      })}
    </>
  );
}
