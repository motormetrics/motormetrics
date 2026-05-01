"use client";

import { CHART_MARGINS } from "@motormetrics/theme/charts";
import { formatDateToMonthYear } from "@motormetrics/utils";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@web/components/charts/chart";
import { ChartWidget } from "@web/components/charts/widget";
import { formatNumber } from "@web/utils/charts";
import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

interface TrendData {
  month: string;
  total: number;

  [key: string]: number | string;
}

interface TrendAreaChartProps {
  data: TrendData[];
  title: string;
  subtitle?: string;
  categories: string[];
  showTotal?: boolean;
  valueFormatter?: (value: number) => string;
}

export function TrendAreaChart({
  data,
  title,
  subtitle,
  categories,
  showTotal = false,
  valueFormatter = formatNumber,
}: TrendAreaChartProps) {
  // Format data inline (cheap operation, no need to memoize)
  const formattedData = data.map((item) => ({
    ...item,
    month: formatDateToMonthYear(item.month),
  }));

  // Compute display values inline (cheap array operations)
  const displayCategories = useMemo(
    () => (showTotal ? ["total", ...categories] : categories),
    [showTotal, categories],
  );

  // Only memoize the expensive chart config object creation
  const chartConfig = useMemo(() => {
    return Object.fromEntries(
      displayCategories.map((category, index) => [
        category,
        {
          label: category.charAt(0).toUpperCase() + category.slice(1),
          color: `var(--chart-${index + 1})`,
        },
      ]),
    );
  }, [displayCategories]);

  return (
    <ChartWidget
      title={title}
      subtitle={subtitle}
      isEmpty={!data || data.length === 0}
      emptyMessage="No trend data available"
    >
      <ChartContainer config={chartConfig} className="h-[300px] w-full">
        <AreaChart data={formattedData} margin={CHART_MARGINS.withLegend}>
          <defs>
            {displayCategories.map((category, index) => (
              <linearGradient
                key={`gradient-${category}`}
                id={`gradient-${category}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor={`var(--chart-${index + 1})`}
                  stopOpacity={0.4}
                />
                <stop
                  offset="100%"
                  stopColor={`var(--chart-${index + 1})`}
                  stopOpacity={0.05}
                />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid
            vertical={false}
            strokeDasharray="3 3"
            className="stroke-border"
          />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            className="text-xs"
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={60}
            tickFormatter={valueFormatter}
            className="text-xs"
          />
          <ChartTooltip
            cursor={{ fill: "var(--muted)", opacity: 0.2 }}
            content={<ChartTooltipContent />}
          />
          <ChartLegend content={<ChartLegendContent />} />
          {displayCategories.map((category, index) => (
            <Area
              key={category}
              type="natural"
              dataKey={category}
              stackId="1"
              stroke={`var(--chart-${index + 1})`}
              fill={`url(#gradient-${category})`}
              strokeWidth={2}
              connectNulls={true}
            />
          ))}
        </AreaChart>
      </ChartContainer>
    </ChartWidget>
  );
}
