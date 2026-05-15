"use client";

import { Card } from "@heroui/react";
import { BarChart, ChartTooltip, NumberValue } from "@heroui-pro/react";
import { formatNumber } from "@motormetrics/utils";

import type { CategoryWithPercentage } from "@web/app/[locale]/(main)/(dashboard)/cars/deregistrations/components/constants";

interface CategoryBreakdownProps {
  data: CategoryWithPercentage[];
}

export function CategoryBreakdown({ data }: CategoryBreakdownProps) {
  // Sort by total descending for better visualization
  const sortedData = [...data].sort((a, b) => b.total - a.total);
  const chartData = sortedData.map((item) => ({ ...item }));

  return (
    <Card className="h-full">
      <Card.Content>
        <h3 className="mb-3 font-medium text-muted text-xs uppercase tracking-wider">
          Distribution
        </h3>
        <BarChart data={chartData} height={300} layout="vertical">
          <BarChart.Grid
            horizontal={false}
            strokeDasharray="3 3"
            stroke="var(--border)"
          />
          <BarChart.XAxis
            type="number"
            tickLine={false}
            axisLine={false}
            tickFormatter={formatNumber}
            tick={{ fill: "var(--muted)" }}
          />
          <BarChart.YAxis
            type="category"
            dataKey="category"
            tickLine={false}
            axisLine={false}
            width={100}
            tick={{ fill: "var(--muted)" }}
            tickFormatter={(value: string) =>
              value
                .replace("Category ", "")
                .replace("Vehicles Exempted From VQS", "VQS")
            }
          />
          <BarChart.Tooltip
            cursor={{ fill: "var(--muted)", opacity: 0.3 }}
            content={({ active, payload }) => {
              const entry = payload?.[0];
              if (!active || !entry) return null;
              const percentage = (entry.payload as CategoryWithPercentage)
                .percentage;

              return (
                <ChartTooltip>
                  <ChartTooltip.Item>
                    <ChartTooltip.Indicator color={entry.payload.colour} />
                    <ChartTooltip.Label>{entry.name}</ChartTooltip.Label>
                    <ChartTooltip.Value>
                      <NumberValue
                        locale="en-SG"
                        maximumFractionDigits={0}
                        value={entry.value as number}
                      />{" "}
                      (
                      <NumberValue
                        maximumFractionDigits={1}
                        style="percent"
                        value={percentage / 100}
                      />
                      )
                    </ChartTooltip.Value>
                  </ChartTooltip.Item>
                </ChartTooltip>
              );
            }}
          />
          <BarChart.Bar
            dataKey="total"
            fill="var(--chart-1)"
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </Card.Content>
    </Card>
  );
}
