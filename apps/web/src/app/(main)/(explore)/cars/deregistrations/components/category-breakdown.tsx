"use client";

import { Card } from "@heroui/react";

import type { CategoryWithPercentage } from "@web/app/(main)/(explore)/cars/deregistrations/components/constants";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@web/components/charts/chart";
import { formatNumber, formatPercentage } from "@web/utils/charts";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";

interface CategoryBreakdownProps {
  data: CategoryWithPercentage[];
}

export function CategoryBreakdown({ data }: CategoryBreakdownProps) {
  const chartConfig = {
    total: { label: "Deregistrations", color: "var(--primary)" },
  } as const;

  // Sort by total descending for better visualization
  const sortedData = [...data].sort((a, b) => b.total - a.total);

  return (
    <Card className="h-full">
      <Card.Content>
        <h3 className="mb-3 font-medium text-default-500 text-xs uppercase tracking-wider">
          Distribution
        </h3>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart data={sortedData} layout="vertical">
            <CartesianGrid
              horizontal={false}
              strokeDasharray="3 3"
              stroke="var(--default-200)"
            />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tickFormatter={formatNumber}
              tick={{ fill: "var(--default-500)" }}
            />
            <YAxis
              type="category"
              dataKey="category"
              tickLine={false}
              axisLine={false}
              width={100}
              tick={{ fill: "var(--default-600)" }}
              tickFormatter={(value: string) =>
                value
                  .replace("Category ", "")
                  .replace("Vehicles Exempted From VQS", "VQS")
              }
            />
            <ChartTooltip
              cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
              content={
                <ChartTooltipContent
                  formatter={(value, _name, item) => {
                    const percentage = (item.payload as CategoryWithPercentage)
                      .percentage;
                    return `${formatNumber(value as number)} (${formatPercentage(percentage)})`;
                  }}
                />
              }
            />
            <Bar dataKey="total" radius={[0, 4, 4, 0]}>
              {sortedData.map((entry) => (
                <Cell key={entry.category} fill={entry.colour} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </Card.Content>
    </Card>
  );
}
