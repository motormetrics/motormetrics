"use client";

import { ChartTooltip } from "@heroui-pro/react";
import { BarChart } from "@heroui-pro/react/bar-chart";
import { compactCount } from "@web/utils/formatting/chart-axis";

/** One month; `selected` or `other` carries the total, the rest is zero. */
export interface TrendPoint {
  [key: string]: number | string;
  /** "Aug", or empty where the axis is thinned. */
  label: string;
  other: number;
  selected: number;
  /** "Aug 2026", the tooltip header. */
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
 * Monthly registrations as zero-based columns, the selected month darker.
 * Pro does not re-export Recharts' `Cell`, so the two shades are two stacked
 * series and each month fills exactly one of them.
 *
 * Adapted from the Cars overview's trend chart; the axis here thins itself
 * for the longer ranges, as the comp does.
 */
export function RegistrationsTrendChart({
  data,
  seriesName,
  ticks,
}: {
  data: TrendPoint[];
  /** "New cars", or "Electric cars" when a fuel type is selected. */
  seriesName: string;
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
          // A thinned month with no label still carries its year on a January.
          const lines = [point?.label, point?.year].filter(Boolean);
          return (
            <text
              className="fill-muted text-xs tabular-nums"
              textAnchor="middle"
              x={x}
              y={y}
            >
              {lines.map((line, lineIndex) => (
                <tspan
                  className={lineIndex > 0 ? "font-semibold" : undefined}
                  dy={lineIndex > 0 ? "1.25em" : "0.9em"}
                  key={line}
                  x={x}
                >
                  {line}
                </tspan>
              ))}
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
                <ChartTooltip.Label>{seriesName}</ChartTooltip.Label>
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
