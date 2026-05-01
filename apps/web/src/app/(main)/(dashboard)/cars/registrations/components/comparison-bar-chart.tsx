"use client";

import { Card } from "@heroui/react";

import { formatDateToMonthYear } from "@motormetrics/utils";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@web/components/charts/chart";
import Typography from "@web/components/typography";
import type { Registration } from "@web/types/cars";
import { formatNumber } from "@web/utils/charts";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

interface ComparisonBarChartProps {
  monthA: Registration;
  monthB: Registration;
  type: "fuelType" | "vehicleType";
  title: string;
  description?: string;
}

export function ComparisonBarChart({
  monthA,
  monthB,
  type,
  title,
  description,
}: ComparisonBarChartProps) {
  const allCategories = Array.from(
    new Set([
      ...monthA[type].map((item) => item.name),
      ...monthB[type].map((item) => item.name),
    ]),
  );

  const chartData = allCategories.map((name) => ({
    name,
    monthA: monthA[type].find((item) => item.name === name)?.count ?? 0,
    monthB: monthB[type].find((item) => item.name === name)?.count ?? 0,
  }));

  const labelA = formatDateToMonthYear(monthA.month);
  const labelB = formatDateToMonthYear(monthB.month);

  const chartConfig = {
    monthA: { label: labelA, color: "var(--chart-1)" },
    monthB: { label: labelB, color: "var(--chart-3)" },
  };

  const height = Math.max(200, allCategories.length * 56);

  return (
    <Card>
      <Card.Header className="flex flex-col items-start gap-2">
        <Typography.H4>{title}</Typography.H4>
        {description && <Typography.TextSm>{description}</Typography.TextSm>}
      </Card.Header>
      <Card.Content>
        <ChartContainer config={chartConfig} style={{ height }}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid
              horizontal={false}
              strokeDasharray="3 3"
              className="stroke-border"
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
              width={110}
            />
            <ChartTooltip
              cursor={{ fill: "var(--muted)", opacity: 0.2 }}
              content={<ChartTooltipContent />}
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="monthA" fill="var(--chart-1)" radius={[0, 4, 4, 0]} />
            <Bar dataKey="monthB" fill="var(--chart-3)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ChartContainer>
      </Card.Content>
    </Card>
  );
}
