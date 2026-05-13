"use client";

import { ComposedChart, Widget } from "@heroui-pro/react";

import { numberFormat } from "@ruchernchong/number-format";
import type { Pqp } from "@web/types/coe";

interface ComparisonMixedChartProps {
  data: Pqp.Comparison[];
}

export function ComparisonMixedChart({ data }: ComparisonMixedChartProps) {
  const chartData: Record<string, string | number>[] = data.map((item) => ({
    ...item,
  }));

  return (
    <Widget>
      <Widget.Header>
        <Widget.Title>Premium vs PQP</Widget.Title>
        <Widget.Description>
          Latest bidding premium against the current renewal baseline.
        </Widget.Description>
        <Widget.Legend>
          <Widget.LegendItem color="var(--chart-1)">
            Latest COE Premium
          </Widget.LegendItem>
          <Widget.LegendItem color="var(--chart-2)">PQP Rate</Widget.LegendItem>
        </Widget.Legend>
      </Widget.Header>
      <Widget.Content>
        <ComposedChart data={chartData} height={300} width="100%">
          <ComposedChart.Grid vertical={false} strokeDasharray="3 3" />
          <ComposedChart.XAxis dataKey="category" />
          <ComposedChart.YAxis
            domain={[
              (dataMin: number) => Math.floor(dataMin / 10000) * 10000,
              (dataMax: number) => Math.ceil(dataMax / 10000) * 10000,
            ]}
            tickFormatter={numberFormat}
          />
          <ComposedChart.Tooltip
            cursor={{ fill: "var(--muted)", opacity: 0.2 }}
            content={<ComposedChart.TooltipContent />}
          />
          <ComposedChart.Bar
            dataKey="latestPremium"
            name="Latest COE Premium"
            fill="var(--chart-1)"
            radius={[8, 8, 0, 0]}
            maxBarSize={40}
          />
          <ComposedChart.Line
            dataKey="pqpRate"
            name="PQP Rate (Baseline)"
            type="monotone"
            stroke="var(--chart-2)"
            strokeWidth={2}
            strokeDasharray="8 4"
          />
        </ComposedChart>
      </Widget.Content>
      <Widget.Footer>
        Latest COE premium (bars) vs PQP baseline (dashed line). Bars above line
        indicate strong demand; bars below suggest favourable renewal
        conditions.
      </Widget.Footer>
    </Widget>
  );
}
