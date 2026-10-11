"use client";

import { ChartTooltip } from "@heroui-pro/react";
import { BarChart } from "@heroui-pro/react/bar-chart";
import { compactCount } from "@web/utils/formatting/chart-axis";

/** One month; `selected` or `other` carries the total, the rest is zero. */
export interface TrendPoint {
  [key: string]: number | string;
  /** "Aug". */
  label: string;
  other: number;
  selected: number;
  /** "August 2026", the tooltip header. */
  title: string;
  total: number;
  /** "2026" under the first month and every January; empty elsewhere. */
  year: string;
}

interface TickProps {
  index?: number;
  payload?: { index?: number };
  x?: number | string;
  y?: number | string;
}

/**
 * Twelve months of new car registrations as zero-based columns, the selected
 * month darker. Pro does not re-export Recharts' `Cell`, so the two shades
 * are two stacked series and each month fills exactly one of them.
 */
export function RegistrationsTrendChart({
  data,
  ticks,
}: {
  data: TrendPoint[];
  /** Zero-based ticks from `axisTicks`. */
  ticks: number[];
}) {
  return (
    <BarChart
      data={data}
      height={260}
      margin={{ bottom: 0, left: 0, right: 0, top: 8 }}
    >
      <BarChart.Grid vertical={false} />
      <BarChart.XAxis
        dataKey="label"
        height={40}
        interval={0}
        tick={({ index, payload, x, y }: TickProps) => {
          const point = data[payload?.index ?? index ?? 0];
          return (
            <text
              className="fill-muted text-xs tabular-nums"
              textAnchor="middle"
              x={x}
              y={y}
            >
              <tspan dy="0.9em" x={x}>
                {point?.label}
              </tspan>
              {point?.year ? (
                <tspan className="font-semibold" dy="1.25em" x={x}>
                  {point.year}
                </tspan>
              ) : null}
            </text>
          );
        }}
        tickMargin={6}
      />
      <BarChart.YAxis
        domain={[0, ticks.at(-1) ?? "auto"]}
        orientation="left"
        tickFormatter={compactCount}
        ticks={ticks}
        width={44}
      />
      <BarChart.Bar
        dataKey="other"
        fill="var(--chart-5)"
        maxBarSize={48}
        radius={[2, 2, 0, 0]}
        stackId="month"
      />
      <BarChart.Bar
        dataKey="selected"
        fill="var(--chart-1)"
        maxBarSize={48}
        radius={[2, 2, 0, 0]}
        stackId="month"
      />
      <BarChart.Tooltip
        content={({ active, payload }) => {
          const point = payload?.[0]?.payload as TrendPoint | undefined;
          if (!active || !point) {
            return null;
          }
          return (
            <ChartTooltip>
              <ChartTooltip.Header>{point.title}</ChartTooltip.Header>
              <ChartTooltip.Item>
                <ChartTooltip.Indicator
                  color={point.selected ? "var(--chart-1)" : "var(--chart-5)"}
                />
                <ChartTooltip.Label>New cars</ChartTooltip.Label>
                <ChartTooltip.Value>
                  {point.total.toLocaleString("en-SG")}
                </ChartTooltip.Value>
              </ChartTooltip.Item>
            </ChartTooltip>
          );
        }}
      />
    </BarChart>
  );
}
