"use client";

import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
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
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
} from "recharts";

interface ComparisonMixedChartProps {
  data: Pqp.Comparison[];
}

const chartConfig: ChartConfig = {};

export function ComparisonMixedChart({ data }: ComparisonMixedChartProps) {
  return (
    <Card className="p-3">
      <CardHeader>
        <div className="flex flex-col gap-1">
          <Typography.H4>Latest COE Premium vs PQP Rate</Typography.H4>
          <Typography.TextSm className="text-default-500">
            Comparison of latest COE bidding premium against current PQP rates
          </Typography.TextSm>
        </div>
      </CardHeader>
      <CardBody>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ComposedChart data={data}>
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              className="stroke-default-200"
            />
            <XAxis dataKey="category" />
            <YAxis
              domain={[
                (dataMin: number) => Math.floor(dataMin / 10000) * 10000,
                (dataMax: number) => Math.ceil(dataMax / 10000) * 10000,
              ]}
              tickFormatter={numberFormat}
            />
            <ChartTooltip
              cursor={{ fill: "hsl(var(--muted))", opacity: 0.2 }}
              content={<ChartTooltipContent />}
            />
            <Bar
              dataKey="latestPremium"
              name="Latest COE Premium"
              fill="var(--chart-1)"
              radius={[8, 8, 0, 0]}
              maxBarSize={40}
            />
            <Line
              dataKey="pqpRate"
              name="PQP Rate (Baseline)"
              type="monotone"
              stroke="var(--chart-2)"
              strokeWidth={2}
              strokeDasharray="8 4"
            />
            <ChartLegend />
          </ComposedChart>
        </ChartContainer>
      </CardBody>
      <CardFooter>
        <p className="text-default-500 text-sm">
          Latest COE premium (bars) vs PQP baseline (dashed line). Bars above
          line indicate strong demand; bars below suggest favourable renewal
          conditions.
        </p>
      </CardFooter>
    </Card>
  );
}
