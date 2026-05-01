"use client";

import { Card } from "@heroui/react";

import { formatDateToMonthYear } from "@motormetrics/utils";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@web/components/charts/chart";
import Typography from "@web/components/typography";
import { formatNumber } from "@web/utils/charts";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

interface MonthlyTotal {
  month: string;
  total: number;
}

interface TrendsChartProps {
  data: MonthlyTotal[];
}

export function TrendsChart({ data }: TrendsChartProps) {
  const chartConfig = {
    total: { label: "Deregistrations", color: "hsl(var(--heroui-primary))" },
  } as const;

  const formattedData = data.map((item) => ({
    ...item,
    month: formatDateToMonthYear(item.month),
  }));

  if (data.length === 0) {
    return (
      <Card className="p-3">
        <Card.Content className="p-4">
          <Typography.TextSm>No trend data available</Typography.TextSm>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card className="p-3">
      <Card.Content className="p-4">
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <AreaChart
            data={formattedData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <defs>
              <linearGradient id="trendsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="hsl(var(--heroui-primary))"
                  stopOpacity={0.3}
                />
                <stop
                  offset="100%"
                  stopColor="hsl(var(--heroui-primary))"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              className="stroke-default-200"
            />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              className="text-xs"
              tick={{ fill: "hsl(var(--heroui-default-500))" }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={60}
              tickFormatter={formatNumber}
              className="text-xs"
              tick={{ fill: "hsl(var(--heroui-default-500))" }}
            />
            <ChartTooltip
              cursor={{ fill: "hsl(var(--muted))", opacity: 0.2 }}
              content={
                <ChartTooltipContent
                  formatter={(value) => formatNumber(value as number)}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke="hsl(var(--heroui-primary))"
              strokeWidth={2}
              fill="url(#trendsGradient)"
            />
          </AreaChart>
        </ChartContainer>
      </Card.Content>
    </Card>
  );
}
