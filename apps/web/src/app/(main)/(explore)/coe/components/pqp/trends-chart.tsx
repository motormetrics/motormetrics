"use client";

import { Card } from "@heroui/react";

import { formatDateToMonthYear } from "@motormetrics/utils";
import { numberFormat } from "@ruchernchong/number-format";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartTooltip,
  ChartTooltipContent,
} from "@web/components/charts/chart";
import Typography from "@web/components/typography";
import type { Pqp } from "@web/types/coe";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

interface TrendsChartProps {
  data: Pqp.TrendPoint[];
}

const chartConfig: ChartConfig = {};

export function TrendsChart({ data }: TrendsChartProps) {
  return (
    <Card>
      <Card.Header>
        <div className="flex flex-col gap-1">
          <Typography.H4>PQP Trends</Typography.H4>
          <Typography.TextSm className="text-muted">
            Historical Prevailing Quota Premium rates across all COE categories
          </Typography.TextSm>
        </div>
      </Card.Header>
      <Card.Content>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <LineChart data={data}>
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              className="stroke-border"
            />
            <XAxis
              dataKey="month"
              tickFormatter={(value) => formatDateToMonthYear(value)}
            />
            <YAxis
              domain={[
                (dataMin: number) => Math.floor(dataMin / 10000) * 10000,
                (dataMax: number) => Math.ceil(dataMax / 10000) * 10000,
              ]}
              tickFormatter={numberFormat}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line
              dataKey="Category A"
              name="Category A"
              type="monotone"
              stroke="var(--chart-1)"
              strokeWidth={2}
            />
            <Line
              dataKey="Category B"
              name="Category B"
              type="monotone"
              stroke="var(--chart-2)"
              strokeWidth={2}
            />
            <ChartLegend />
          </LineChart>
        </ChartContainer>
      </Card.Content>
      <Card.Footer>
        <p className="text-muted text-sm">
          Historical PQP rates (3-month average COE prices) used for COE
          renewals across categories.
        </p>
      </Card.Footer>
    </Card>
  );
}
