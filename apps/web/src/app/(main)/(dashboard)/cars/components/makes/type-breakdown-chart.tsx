"use client";

import { Card, Text } from "@heroui/react";
import { BarChart } from "@heroui-pro/react";
import { formatNumber } from "@motormetrics/utils";

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

  return (
    <Card>
      <Card.Header className="flex flex-col items-start gap-2">
        <Text type="h4">{title}</Text>
        {description && (
          <Text type="body-sm" color="muted">
            {description}
          </Text>
        )}
      </Card.Header>
      <Card.Content>
        <BarChart data={chartData} height={200} layout="vertical">
          <BarChart.Grid
            horizontal={false}
            strokeDasharray="3 3"
            className="stroke-border"
          />
          <BarChart.XAxis
            type="number"
            tickFormatter={formatNumber}
            tickLine={false}
            axisLine={false}
          />
          <BarChart.YAxis
            type="category"
            dataKey="name"
            tickLine={false}
            axisLine={false}
            width={100}
          />
          <BarChart.Tooltip
            cursor={{ fill: "var(--muted)", opacity: 0.2 }}
            content={<BarChart.TooltipContent />}
          />
          <BarChart.Bar
            dataKey="value"
            fill="var(--chart-1)"
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </Card.Content>
    </Card>
  );
}
