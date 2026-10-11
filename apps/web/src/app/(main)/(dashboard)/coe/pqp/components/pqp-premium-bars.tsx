"use client";

import { ChartTooltip } from "@heroui-pro/react";
import { BarChart } from "@heroui-pro/react/bar-chart";
import { formatCurrency } from "@motormetrics/utils/format-currency";
import { compactCurrency } from "@web/utils/formatting/chart-axis";

export interface PQPPremiumPoint {
  [key: string]: number | string;
  /** "Cat A". */
  category: string;
  pqp: number;
  premium: number;
}

/**
 * Each category's PQP against its latest closing premium, as zero-based bars
 * on one shared scale, so the gap between renewing and bidding reads as
 * length.
 *
 * Pro's chart rather than hand-rolled bars, since it carries an axis and a
 * tooltip. The selected category's PQP is darker; Pro does not re-export
 * Recharts' `Cell`, so it is a second series stacked on the first and each
 * row fills exactly one of them.
 */
export function PQPPremiumBars({
  data,
  selected,
  ticks,
}: {
  data: PQPPremiumPoint[];
  /** "Cat A", the row whose PQP is darker. */
  selected: string;
  /** Zero-based ticks from `axisTicks`. */
  ticks: number[];
}) {
  const rows = data.map((point) => ({
    ...point,
    pqpOther: point.category === selected ? 0 : point.pqp,
    pqpSelected: point.category === selected ? point.pqp : 0,
  }));

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex flex-wrap items-center gap-4 text-muted-strong text-sm">
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden className="block h-2.5 w-3 rounded-xs bg-chart-1" />
          PQP
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden className="block h-2.5 w-3 rounded-xs bg-chart-5" />
          Latest premium
        </span>
      </div>
      <BarChart
        data={rows}
        height={data.length * 72 + 28}
        layout="vertical"
        margin={{ bottom: 0, left: 0, right: 16, top: 0 }}
      >
        <BarChart.Grid horizontal={false} />
        <BarChart.XAxis
          domain={[0, ticks.at(-1) ?? "auto"]}
          tickFormatter={compactCurrency}
          ticks={ticks}
          type="number"
        />
        <BarChart.YAxis
          dataKey="category"
          tickMargin={8}
          type="category"
          width={48}
        />
        <BarChart.Bar
          barSize={14}
          dataKey="pqpSelected"
          fill="var(--chart-1)"
          radius={[0, 2, 2, 0]}
          stackId="pqp"
        />
        <BarChart.Bar
          barSize={14}
          dataKey="pqpOther"
          fill="var(--chart-3)"
          radius={[0, 2, 2, 0]}
          stackId="pqp"
        />
        <BarChart.Bar
          barSize={14}
          dataKey="premium"
          fill="var(--chart-5)"
          radius={[0, 2, 2, 0]}
        />
        <BarChart.Tooltip
          content={({ active, payload }) => {
            const point = payload?.[0]?.payload as PQPPremiumPoint | undefined;
            if (!active || !point) {
              return null;
            }

            return (
              <ChartTooltip>
                <ChartTooltip.Header>{point.category}</ChartTooltip.Header>
                <ChartTooltip.Item>
                  <ChartTooltip.Indicator
                    color={
                      point.category === selected
                        ? "var(--chart-1)"
                        : "var(--chart-3)"
                    }
                  />
                  <ChartTooltip.Label>PQP</ChartTooltip.Label>
                  <ChartTooltip.Value>
                    {formatCurrency(point.pqp)}
                  </ChartTooltip.Value>
                </ChartTooltip.Item>
                <ChartTooltip.Item>
                  <ChartTooltip.Indicator color="var(--chart-5)" />
                  <ChartTooltip.Label>Latest premium</ChartTooltip.Label>
                  <ChartTooltip.Value>
                    {formatCurrency(point.premium)}
                  </ChartTooltip.Value>
                </ChartTooltip.Item>
              </ChartTooltip>
            );
          }}
        />
      </BarChart>
    </div>
  );
}
