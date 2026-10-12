"use client";

import { ChartTooltip } from "@heroui-pro/react";
import { AreaChart } from "@heroui-pro/react/area-chart";

export type EvSharePoint = {
  /** "Aug". */
  label: string;
  /** "2026" under the first month and every January; empty elsewhere. */
  year: string;
  /** "August 2026", the tooltip header. */
  title: string;
  /** Battery-electric share, in percent. */
  share: number;
  /** Points of change on the previous month; absent for the first. */
  change?: number;
};

interface GridLineProps {
  index?: number;
  x1?: number;
  x2?: number;
  y1?: number;
  y2?: number;
}

interface PointProps {
  cx?: number;
  cy?: number;
  index?: number;
}

interface TickProps {
  index?: number;
  payload?: { index?: number };
  x?: number | string;
  y?: number | string;
}

/** "+1.2 pts vs previous month", with a true minus for a fall. */
const formatChange = (change: number): string =>
  `${change < 0 ? "−" : "+"}${Math.abs(change).toFixed(1)} pts vs previous month`;

/**
 * Battery-electric share of new cars by month, with labelled axes, a dot per
 * month and the latest value written beside the line.
 *
 * Pro's chart rather than hand-rolled SVG, since it carries axes, gridlines
 * and a tooltip. The y-axis spans the data, not zero, and the section's
 * source note says so.
 */
export function EvShareChart({
  data,
  ticks,
}: {
  data: EvSharePoint[];
  /** Ticks from `axisTicks`, not anchored at zero. */
  ticks: number[];
}) {
  const lastIndex = data.length - 1;

  return (
    <AreaChart
      data={data}
      height={260}
      margin={{ bottom: 0, left: 0, right: 58, top: 12 }}
    >
      <AreaChart.Grid
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
      <AreaChart.XAxis
        dataKey="label"
        height={44}
        // Evenly spaced, widening the step until the labels fit; the first
        // month is always drawn, so the opening year always shows.
        interval="equidistantPreserveStart"
        tick={({ index, payload, x, y }: TickProps) => {
          const point = data[payload?.index ?? index ?? 0];
          const year = point?.year;
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
              {year ? (
                <tspan className="font-semibold" dy="1.25em" x={x}>
                  {year}
                </tspan>
              ) : null}
            </text>
          );
        }}
        tickMargin={6}
      />
      <AreaChart.YAxis
        domain={[ticks[0] ?? "auto", ticks.at(-1) ?? "auto"]}
        orientation="left"
        tickFormatter={(value: number) => `${value}%`}
        ticks={ticks}
        width={44}
      />
      <AreaChart.Area
        activeDot={{ fill: "var(--chart-1)", r: 4, strokeWidth: 0 }}
        dataKey="share"
        dot={({ cx, cy, index }: PointProps) =>
          cx === undefined || cy === undefined ? (
            <g key={`point-${index}`} />
          ) : (
            <g key={`point-${index}`}>
              <circle
                cx={cx}
                cy={cy}
                fill={
                  index === lastIndex ? "var(--chart-1)" : "var(--background)"
                }
                r={index === lastIndex ? 4 : 2.5}
                stroke="var(--chart-1)"
                strokeWidth={1.5}
              />
              {index === lastIndex ? (
                <text
                  className="fill-chart-1 font-semibold text-xs tabular-nums"
                  dominantBaseline="middle"
                  x={cx + 10}
                  y={cy}
                >
                  {`${data[lastIndex].share.toFixed(1)}%`}
                </text>
              ) : null}
            </g>
          )
        }
        fill="var(--chart-1)"
        fillOpacity={0.08}
        name="EV share"
        stroke="var(--chart-1)"
        strokeWidth={2}
        type="linear"
      />
      <AreaChart.Tooltip
        content={({ active, payload }) => {
          const point = payload?.[0]?.payload as EvSharePoint | undefined;
          if (!active || !point) {
            return null;
          }

          return (
            <ChartTooltip>
              <ChartTooltip.Header>{point.title}</ChartTooltip.Header>
              <span className="font-semibold text-sm tabular-nums">
                {point.share.toFixed(1)}%
              </span>
              <span className="text-muted text-xs tabular-nums">
                {point.change === undefined
                  ? "First in range"
                  : formatChange(point.change)}
              </span>
            </ChartTooltip>
          );
        }}
      />
    </AreaChart>
  );
}
