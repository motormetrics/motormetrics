"use client";

import { ChartTooltip } from "@heroui-pro/react";
import { AreaChart } from "@heroui-pro/react/area-chart";
import { trendTicks } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/trend-ticks";
import type { Range } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/search-params";
import { compactCount } from "@web/utils/formatting/chart-axis";

/** One month of the selected powertrain. */
export interface RegistrationTrendPoint {
  [key: string]: number | string;
  /** "+2.0% vs previous month", or "First in range" for the first month. */
  change: string;
  /** `yyyy-MM`. */
  month: string;
  /** "August 2026", the tooltip header. */
  title: string;
  value: number;
}

interface PointProps {
  cx?: number;
  cy?: number;
  index?: number;
}

interface TickProps {
  payload?: { value?: string };
  x?: number | string;
  y?: number | string;
}

/**
 * Months between x-axis ticks, per range. Recharts drops any that would
 * collide on a narrow chart.
 */
const TICK_EVERY: Record<Range, number> = { "1Y": 1, "3Y": 3, All: 6 };

/** Up to a year of months, every point carries a dot. */
const DOT_LIMIT = 12;

/**
 * Monthly registrations for one powertrain as a zero-based line over a soft
 * fill, the newest month marked and labelled.
 */
export function RegistrationTrendChart({
  data,
  range,
  ticks,
}: {
  data: RegistrationTrendPoint[];
  range: Range;
  /** Zero-based ticks from `axisTicks`. */
  ticks: number[];
}) {
  const monthTicks = trendTicks(
    data.map((point) => point.month),
    TICK_EVERY[range],
  );
  const lastIndex = data.length - 1;
  const showDots = data.length <= DOT_LIMIT;

  return (
    <AreaChart
      data={data}
      height={300}
      margin={{ bottom: 0, left: 0, right: 64, top: 12 }}
    >
      <defs>
        <linearGradient id="evTrendFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.14} />
          <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.04} />
        </linearGradient>
      </defs>
      <AreaChart.Grid vertical={false} />
      <AreaChart.XAxis
        dataKey="month"
        height={40}
        // Only the planned months are ticks; Recharts drops any of those
        // that would collide on a narrow chart.
        interval="preserveStartEnd"
        tick={({ payload, x, y }: TickProps) => {
          const tick =
            monthTicks[
              data.findIndex((point) => point.month === payload?.value)
            ];
          if (!tick) {
            return <g />;
          }
          return (
            <text
              className="fill-muted text-xs tabular-nums"
              textAnchor="middle"
              x={x}
              y={y}
            >
              <tspan dy="0.9em" x={x}>
                {tick.label}
              </tspan>
              {tick.year ? (
                <tspan className="font-semibold" dy="1.25em" x={x}>
                  {tick.year}
                </tspan>
              ) : null}
            </text>
          );
        }}
        tickFormatter={(month: string) =>
          monthTicks[data.findIndex((point) => point.month === month)]?.label ??
          month
        }
        tickMargin={6}
        ticks={data
          .filter((_, position) => monthTicks[position])
          .map((point) => point.month)}
      />
      <AreaChart.YAxis
        domain={[0, ticks.at(-1) ?? "auto"]}
        orientation="left"
        tickFormatter={compactCount}
        ticks={ticks}
        width={44}
      />
      <AreaChart.Area
        activeDot={{ fill: "var(--chart-1)", r: 4, strokeWidth: 0 }}
        dataKey="value"
        dot={({ cx, cy, index }: PointProps) => {
          if (cx === undefined || cy === undefined) {
            return <g key={`point-${index}`} />;
          }
          if (index === lastIndex) {
            return (
              <g key="last-point">
                <circle cx={cx} cy={cy} fill="var(--chart-1)" r={4} />
                <text
                  className="fill-accent-strong font-semibold text-xs tabular-nums"
                  dominantBaseline="middle"
                  x={cx + 10}
                  y={cy}
                >
                  {data[lastIndex]?.value.toLocaleString("en-SG")}
                </text>
              </g>
            );
          }
          return showDots ? (
            <circle
              cx={cx}
              cy={cy}
              fill="var(--background)"
              key={`point-${index}`}
              r={2.5}
              stroke="var(--chart-1)"
              strokeWidth={1.5}
            />
          ) : (
            <g key={`point-${index}`} />
          );
        }}
        fill="url(#evTrendFill)"
        name="Registrations"
        stroke="var(--chart-1)"
        strokeWidth={2}
        type="linear"
      />
      <AreaChart.Tooltip
        content={({ active, payload }) => {
          const point = payload?.[0]?.payload as
            | RegistrationTrendPoint
            | undefined;
          if (!active || !point) {
            return null;
          }
          return (
            <ChartTooltip>
              <ChartTooltip.Header>{point.title}</ChartTooltip.Header>
              <ChartTooltip.Item>
                <ChartTooltip.Indicator color="var(--chart-1)" />
                <ChartTooltip.Label>Registrations</ChartTooltip.Label>
                <ChartTooltip.Value>
                  {point.value.toLocaleString("en-SG")} cars
                </ChartTooltip.Value>
              </ChartTooltip.Item>
              <span className="text-muted text-xs tabular-nums">
                {point.change}
              </span>
            </ChartTooltip>
          );
        }}
      />
    </AreaChart>
  );
}
