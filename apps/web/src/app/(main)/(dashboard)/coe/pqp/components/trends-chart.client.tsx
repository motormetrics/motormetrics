"use client";

import { LineChart, Widget } from "@heroui-pro/react";

import { formatDateToMonthYear } from "@motormetrics/utils";
import { numberFormat } from "@ruchernchong/number-format";
import type { Pqp } from "@web/types/coe";

interface TrendsChartProps {
  categories?: Array<keyof Pqp.Rates>;
  data: Pqp.TrendPoint[];
}

const categoryColors: Record<keyof Pqp.Rates, string> = {
  "Category A": "var(--chart-1)",
  "Category B": "var(--chart-2)",
  "Category C": "var(--chart-3)",
  "Category D": "var(--chart-4)",
};

const defaultCategories = Object.keys(categoryColors) as Array<keyof Pqp.Rates>;

export function TrendsChart({
  categories = defaultCategories,
  data,
}: TrendsChartProps) {
  const trendSeries = categories.map((category) => ({
    color: categoryColors[category],
    dataKey: category,
  }));
  const chartData: Record<string, string | number>[] = data.map((item) => ({
    ...item,
  }));

  return (
    <Widget>
      <Widget.Header>
        <Widget.Title>PQP Trends</Widget.Title>
        <Widget.Description>
          12-month movement for renewal baselines across selected COE
          categories.
        </Widget.Description>
        <Widget.Legend>
          {trendSeries.map((item) => (
            <Widget.LegendItem key={item.dataKey} color={item.color}>
              {item.dataKey}
            </Widget.LegendItem>
          ))}
        </Widget.Legend>
      </Widget.Header>
      <Widget.Content>
        <LineChart data={chartData} height={300} width="100%">
          <LineChart.Grid vertical={false} strokeDasharray="3 3" />
          <LineChart.XAxis
            dataKey="month"
            tickFormatter={(value: string | number) =>
              formatDateToMonthYear(String(value))
            }
          />
          <LineChart.YAxis
            domain={[
              (dataMin: number) => Math.floor(dataMin / 10000) * 10000,
              (dataMax: number) => Math.ceil(dataMax / 10000) * 10000,
            ]}
            tickFormatter={numberFormat}
          />
          <LineChart.Tooltip
            cursor={false}
            content={<LineChart.TooltipContent />}
          />
          {trendSeries.map((item) => (
            <LineChart.Line
              key={item.dataKey}
              dataKey={item.dataKey}
              name={item.dataKey}
              type="monotone"
              stroke={item.color}
              strokeWidth={2}
            />
          ))}
        </LineChart>
      </Widget.Content>
      <Widget.Footer>
        Historical PQP rates (3-month average COE prices) used for COE renewals
        across categories.
      </Widget.Footer>
    </Widget>
  );
}
