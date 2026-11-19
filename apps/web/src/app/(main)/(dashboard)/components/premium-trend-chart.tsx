"use client";

import { ChartTooltip } from "@heroui-pro/react";
import { LineChart } from "@heroui-pro/react/line-chart";
import { formatCurrency } from "@motormetrics/utils/format-currency";
import { compactCurrency } from "@web/utils/formatting/chart-axis";

export type PremiumTrendPoint = {
  /** "Nov 1": the month and the bidding number. */
  label: string;
  premium: number;
  /** A second category's premium at the same exercise, drawn behind the first. */
  second?: number;
  /** "First bidding, November 2026", the tooltip header. */
  title: string;
};

interface GridLineProps {
  index?: number;
  x1?: number;
  x2?: number;
  y1?: number;
  y2?: number;
}

/**
 * One category's closing premium per exercise as a line, with a second
 * category behind it when `secondName` is given. The y-axis spans the data,
 * not zero; the section's source note says so.
 */
export function PremiumTrendChart({
  ariaLabel,
  data,
  name = "Category A premium",
  secondName,
  ticks,
}: {
  ariaLabel: string;
  data: PremiumTrendPoint[];
  /** The first line's name. */
  name?: string;
  /** The second line's name; each point then carries `second`. */
  secondName?: string;
  /** Ticks from `premiumAxisTicks`, not anchored at zero. */
  ticks: number[];
}) {
  return (
    <div aria-label={ariaLabel} role="img">
      <LineChart
        data={data}
        height={260}
        margin={{ bottom: 0, left: 0, right: 8, top: 12 }}
      >
        <LineChart.Grid
          horizontal={({ index, x1, x2, y1, y2 }: GridLineProps) => (
            <line
              key={`grid-${index}`}
              stroke="var(--muted)"
              strokeOpacity={index === 0 ? 0.6 : 0.15}
              x1={x1}
              x2={x2}
              y1={y1}
              y2={y2}
            />
          )}
          vertical={false}
        />
        <LineChart.XAxis
          dataKey="label"
          interval="equidistantPreserveStart"
          tickMargin={6}
        />
        <LineChart.YAxis
          domain={[ticks[0] ?? "auto", ticks.at(-1) ?? "auto"]}
          tickFormatter={compactCurrency}
          ticks={ticks}
          width={56}
        />
        {secondName ? (
          <LineChart.Line
            activeDot={{ fill: "var(--chart-4)", r: 4, strokeWidth: 0 }}
            dataKey="second"
            dot={false}
            isAnimationActive={false}
            name={secondName}
            stroke="var(--chart-4)"
            strokeWidth={2}
            type="linear"
          />
        ) : null}
        <LineChart.Line
          activeDot={{ fill: "var(--chart-1)", r: 4, strokeWidth: 0 }}
          dataKey="premium"
          dot={false}
          isAnimationActive={false}
          name={name}
          stroke="var(--chart-1)"
          strokeWidth={2}
          type="linear"
        />
        <LineChart.Tooltip
          content={({ active, payload }) => {
            const point = payload?.[0]?.payload as
              | PremiumTrendPoint
              | undefined;
            if (!active || !point) {
              return null;
            }
            return (
              <ChartTooltip>
                <ChartTooltip.Header>{point.title}</ChartTooltip.Header>
                {secondName && point.second !== undefined ? (
                  <>
                    <ChartTooltip.Item>
                      <ChartTooltip.Indicator color="var(--chart-1)" />
                      <ChartTooltip.Label>{name}</ChartTooltip.Label>
                      <ChartTooltip.Value>
                        {formatCurrency(point.premium)}
                      </ChartTooltip.Value>
                    </ChartTooltip.Item>
                    <ChartTooltip.Item>
                      <ChartTooltip.Indicator color="var(--chart-4)" />
                      <ChartTooltip.Label>{secondName}</ChartTooltip.Label>
                      <ChartTooltip.Value>
                        {formatCurrency(point.second)}
                      </ChartTooltip.Value>
                    </ChartTooltip.Item>
                  </>
                ) : (
                  <span className="font-semibold text-sm tabular-nums">
                    {formatCurrency(point.premium)}
                  </span>
                )}
              </ChartTooltip>
            );
          }}
        />
      </LineChart>
    </div>
  );
}
