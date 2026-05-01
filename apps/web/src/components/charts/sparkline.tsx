"use client";

import { cn } from "@heroui/react";

import { type ChartConfig, ChartContainer } from "@web/components/charts/chart";
import { Area, AreaChart } from "recharts";

interface SparklineData {
  value: number;
}

interface SparklineProps {
  data: SparklineData[];
  dataKey?: string;
  height?: string;
  colour?: string;
}

const DEFAULT_COLOUR = "var(--accent)";

export function Sparkline({
  data,
  dataKey = "value",
  height = "h-16",
  colour = DEFAULT_COLOUR,
}: SparklineProps) {
  const chartConfig = {} satisfies ChartConfig;

  if (data.length === 0) {
    return null;
  }

  const strokeColour = colour;
  const gradientId = `sparklineGradient-${colour.replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <ChartContainer config={chartConfig} className={cn("w-full", height)}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColour} stopOpacity={0.1} />
            <stop offset="100%" stopColor={strokeColour} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={strokeColour}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          dot={false}
          animationDuration={300}
        />
      </AreaChart>
    </ChartContainer>
  );
}
