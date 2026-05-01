"use client";

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
import { Cell, Pie, PieChart } from "recharts";

interface MarketShareData {
  name: string;
  count: number;
  percentage: number;
  colour: string;
}

interface MarketShareDonutProps {
  data: MarketShareData[];
  title: string;
  subtitle?: string;
  variant?: "donut" | "pie";
  showLegend?: boolean;
  onValueChange?: (value: any) => void;
}

export function MarketShareDonut({
  data,
  title,
  subtitle,
  variant = "donut",
  showLegend = true,
  onValueChange,
}: MarketShareDonutProps) {
  // Consolidate all data transformations into single useMemo
  const { chartData, chartConfig, legendData } = useMemo(() => {
    const chartData = data.map((item) => ({
      name: item.name,
      value: item.count,
      fill: item.colour,
    }));

    const chartConfig = Object.fromEntries(
      data.map((item) => [item.name, { label: item.name, color: item.colour }]),
    );

    const legendData = data.map((item) => ({
      name: item.name,
      colour: item.colour,
      value: formatNumber(item.count),
    }));

    return { chartData, chartConfig, legendData };
  }, [data]);

  return (
    <ChartWidget
      title={title}
      subtitle={subtitle}
      isEmpty={!data || data.length === 0}
      emptyMessage="No market share data available"
    >
      <div className="flex flex-col gap-6">
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <PieChart>
            <Pie
              data={chartData}
              labelLine={false}
              innerRadius={variant === "donut" ? 40 : 0}
              dataKey="value"
              onClick={onValueChange}
            >
              {chartData.map((entry) => (
                <Cell key={`cell-${entry.name}`} fill={entry.fill} />
              ))}
            </Pie>
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            {showLegend && <ChartLegend content={<ChartLegendContent />} />}
          </PieChart>
        </ChartContainer>

        {showLegend && (
          <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
            {legendData.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="size-4 shrink-0 rounded-full"
                    style={{ backgroundColor: item.colour }}
                  />
                  <span className="truncate text-muted">{item.name}</span>
                </div>
                <span className="font-medium text-foreground">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </ChartWidget>
  );
}
