"use client";

import { ChartTooltip } from "@heroui-pro/react";
import { BarChart } from "@heroui-pro/react/bar-chart";
import { compactCount } from "@web/utils/formatting/chart-axis";

/** One month; `latest` or `earlier` carries the count, the other is zero. */
export interface RegistrationsPoint {
  [key: string]: number | string;
  count: number;
  earlier: number;
  /** "Aug". */
  label: string;
  latest: number;
  /** "August 2026", the tooltip header. */
  title: string;
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
 * The make's registrations by month as zero-based columns, the selected month
 * darker. Pro does not re-export Recharts' `Cell`, so the two shades are two
 * stacked series and each month fills exactly one of them.
 */
export function RegistrationsChart({
  data,
  ticks,
}: {
  data: RegistrationsPoint[];
  /** Zero-based ticks from `axisTicks`. */
  ticks: number[];
}) {
  return (
    <BarChart
      data={data}
      height={220}
      margin={{ bottom: 0, left: 0, right: 0, top: 8 }}
    >
      <BarChart.Grid vertical={false} />
      <BarChart.XAxis
        dataKey="label"
        height={40}
        // Twelve labels crowd a phone, so Recharts thins them from the start
        // and always keeps the selected month at the end.
        interval="preserveEnd"
        minTickGap={4}
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
        dataKey="earlier"
        fill="var(--chart-5)"
        maxBarSize={40}
        radius={[2, 2, 0, 0]}
        stackId="month"
      />
      <BarChart.Bar
        dataKey="latest"
        fill="var(--chart-1)"
        maxBarSize={40}
        radius={[2, 2, 0, 0]}
        stackId="month"
      />
      <BarChart.Tooltip
        content={({ active, payload }) => {
          const point = payload?.[0]?.payload as RegistrationsPoint | undefined;
          if (!active || !point) {
            return null;
          }
          return (
            <ChartTooltip>
              <ChartTooltip.Header>{point.title}</ChartTooltip.Header>
              <ChartTooltip.Item>
                <ChartTooltip.Indicator
                  color={point.latest ? "var(--chart-1)" : "var(--chart-5)"}
                />
                <ChartTooltip.Label>Registrations</ChartTooltip.Label>
                <ChartTooltip.Value>
                  {point.count.toLocaleString("en-SG")}
                </ChartTooltip.Value>
              </ChartTooltip.Item>
            </ChartTooltip>
          );
        }}
      />
    </BarChart>
  );
}
