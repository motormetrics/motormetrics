"use client";

import { Card } from "@heroui/react";
import { BarChart } from "@heroui-pro/react";

import Typography from "@web/components/typography";
import { formatNumber } from "@web/utils/charts";

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
        <Typography.H4>{title}</Typography.H4>
        {description && <Typography.TextSm>{description}</Typography.TextSm>}
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
