"use client";

import { Card } from "@heroui/react";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@web/components/charts/chart";
import Typography from "@web/components/typography";
import { formatNumber } from "@web/utils/charts";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";

interface TypeBreakdownChartProps {
  data: { name: string; value: number }[];
  title: string;
  description?: string;
}

export function TypeBreakdownChart({
  data,
  title,
  description,
}: TypeBreakdownChartProps) {
  const chartData = data.map((item, index) => ({
    ...item,
    fill: `var(--chart-${Math.min(index + 1, 6)})`,
  }));

  const chartConfig = Object.fromEntries(
    data.map((item, index) => [
      item.name,
      { label: item.name, color: `var(--chart-${Math.min(index + 1, 6)})` },
    ]),
  );

  return (
    <Card>
      <Card.Header className="flex flex-col items-start gap-2">
        <Typography.H4>{title}</Typography.H4>
        {description && <Typography.TextSm>{description}</Typography.TextSm>}
      </Card.Header>
      <Card.Content>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid
              horizontal={false}
              strokeDasharray="3 3"
              className="stroke-default-200"
            />
            <XAxis
              type="number"
              tickFormatter={formatNumber}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              tickLine={false}
              axisLine={false}
              width={100}
            />
            <ChartTooltip
              cursor={{ fill: "hsl(var(--muted))", opacity: 0.2 }}
              content={<ChartTooltipContent />}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {chartData.map((entry) => (
                <Cell key={`cell-${entry.name}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </Card.Content>
    </Card>
  );
}
