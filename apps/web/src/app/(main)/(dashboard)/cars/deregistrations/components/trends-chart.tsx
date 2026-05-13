"use client";

import { Card, Text } from "@heroui/react";
import { AreaChart } from "@heroui-pro/react";

import { formatDateToMonthYear, formatNumber } from "@motormetrics/utils";

interface MonthlyTotal {
  month: string;
  total: number;
}

interface TrendsChartProps {
  data: MonthlyTotal[];
}

export function TrendsChart({ data }: TrendsChartProps) {
  const formattedData = data.map((item) => ({
    ...item,
    month: formatDateToMonthYear(item.month),
  }));

  if (data.length === 0) {
    return (
      <Card>
        <Card.Content>
          <Text type="body-sm" color="muted">
            No trend data available
          </Text>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Content>
        <AreaChart
          data={formattedData}
          height={300}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <defs>
            <linearGradient id="trendsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <AreaChart.Grid
            vertical={false}
            strokeDasharray="3 3"
            className="stroke-border"
          />
          <AreaChart.XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            className="text-xs"
            tick={{ fill: "var(--muted)" }}
          />
          <AreaChart.YAxis
            tickLine={false}
            axisLine={false}
            width={60}
            tickFormatter={formatNumber}
            className="text-xs"
            tick={{ fill: "var(--muted)" }}
          />
          <AreaChart.Tooltip
            cursor={{ fill: "var(--muted)", opacity: 0.2 }}
            content={
              <AreaChart.TooltipContent
                valueFormatter={(value) => formatNumber(value as number)}
              />
            }
          />
          <AreaChart.Area
            type="monotone"
            dataKey="total"
            stroke="var(--accent)"
            strokeWidth={2}
            fill="url(#trendsGradient)"
          />
        </AreaChart>
      </Card.Content>
    </Card>
  );
}
