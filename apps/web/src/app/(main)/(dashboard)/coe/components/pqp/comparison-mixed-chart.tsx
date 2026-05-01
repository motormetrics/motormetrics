"use client";

import { Card } from "@heroui/react";
import { ComposedChart } from "@heroui-pro/react";

import { numberFormat } from "@ruchernchong/number-format";
import Typography from "@web/components/typography";
import type { Pqp } from "@web/types/coe";

interface ComparisonMixedChartProps {
  data: Pqp.Comparison[];
}

export function ComparisonMixedChart({ data }: ComparisonMixedChartProps) {
  const chartData: Record<string, string | number>[] = data.map((item) => ({
    ...item,
  }));

  return (
    <Card>
      <Card.Header>
        <div className="flex flex-col gap-1">
          <Typography.H4>Latest COE Premium vs PQP Rate</Typography.H4>
          <Typography.TextSm className="text-muted">
            Comparison of latest COE bidding premium against current PQP rates
          </Typography.TextSm>
        </div>
      </Card.Header>
      <Card.Content>
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
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          {[
            { color: "var(--chart-1)", label: "Latest COE Premium" },
            { color: "var(--chart-2)", label: "PQP Rate (Baseline)" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-muted text-xs">{item.label}</span>
            </div>
          ))}
        </div>
      </Card.Content>
      <Card.Footer>
        <p className="text-muted text-sm">
          Latest COE premium (bars) vs PQP baseline (dashed line). Bars above
          line indicate strong demand; bars below suggest favourable renewal
          conditions.
        </p>
      </Card.Footer>
    </Card>
  );
}
