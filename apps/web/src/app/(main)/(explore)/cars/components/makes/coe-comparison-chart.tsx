"use client";

import { formatDateToMonthYear } from "@motormetrics/utils";
import { numberFormat } from "@ruchernchong/number-format";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@web/components/charts/chart";
import type { MakeCoeComparisonData } from "@web/queries/cars/makes/coe-comparison";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Label,
  Line,
  XAxis,
  YAxis,
} from "recharts";

interface CoeComparisonChartProps {
  data: MakeCoeComparisonData[];
}

const chartConfig = {
  registrations: {
    label: "Registrations",
    color: "var(--chart-1)",
  },
  categoryAPremium: {
    label: "Category A Premium",
    color: "var(--chart-2)",
  },
  categoryBPremium: {
    label: "Category B Premium",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

export function CoeComparisonChart({ data }: CoeComparisonChartProps) {
  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <ComposedChart
        accessibilityLayer
        data={data}
        aria-label="Dual-axis chart comparing monthly registrations with COE Category A and B premiums"
      >
        <CartesianGrid
          vertical={false}
          strokeDasharray="3 3"
          className="stroke-default-200"
        />
        <XAxis
          dataKey="month"
          tickFormatter={formatDateToMonthYear}
          tickMargin={8}
        />

        {/* Left Y-axis for registrations */}
        <YAxis yAxisId="registrations" type="number" orientation="left">
          <Label
            value="Registrations"
            angle={-90}
            position="insideLeft"
            style={{ textAnchor: "middle" }}
          />
        </YAxis>

        {/* Right Y-axis for COE premiums */}
        <YAxis
          yAxisId="premium"
          orientation="right"
          domain={[
            (dataMin: number) => Math.floor(dataMin / 10000) * 10000,
            (dataMax: number) => Math.ceil(dataMax / 10000) * 10000,
          ]}
          tickFormatter={numberFormat}
        >
          <Label
            value="COE Premium (S$)"
            angle={90}
            position="insideRight"
            style={{ textAnchor: "middle" }}
          />
        </YAxis>

        <ChartTooltip
          cursor={{ fill: "hsl(var(--muted))", opacity: 0.2 }}
          content={<ChartTooltipContent />}
        />

        <Bar
          dataKey="registrations"
          yAxisId="registrations"
          fill="var(--chart-1)"
          radius={[4, 4, 0, 0]}
          maxBarSize={40}
        />

        <Line
          dataKey="categoryAPremium"
          yAxisId="premium"
          type="monotone"
          dot={false}
          stroke="var(--chart-2)"
          strokeWidth={2}
        />

        <Line
          dataKey="categoryBPremium"
          yAxisId="premium"
          type="monotone"
          dot={false}
          stroke="var(--chart-3)"
          strokeWidth={2}
          strokeDasharray="10 10"
        />

        <ChartLegend content={<ChartLegendContent />} />
      </ComposedChart>
    </ChartContainer>
  );
}
