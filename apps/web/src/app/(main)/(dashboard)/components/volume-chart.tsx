"use client";

import { cn } from "@heroui/react";
import { ChartTooltip } from "@heroui-pro/react";
import { BarChart } from "@heroui-pro/react/bar-chart";
import { formatNumber } from "@motormetrics/utils/format-currency";
import { compactCount } from "@web/utils/formatting/chart-axis";

export interface VolumePoint {
  /** "Aug". */
  label: string;
  /** "2026" under the first month and every January; empty elsewhere. */
  year: string;
  /** "August 2026", the tooltip header. */
  title: string;
  value: number;
}

interface GridLineProps {
  index?: number;
  x1?: number;
  x2?: number;
  y1?: number;
  y2?: number;
}

interface TickProps {
  index?: number;
  payload?: { index?: number };
  x?: number | string;
  y?: number | string;
}

/**
 * A monthly count as zero-based columns, the newest one darker: new cars by
 * month, vehicles deregistered by month.
 *
 * Pro's chart rather than hand-rolled SVG, since it carries axes, gridlines
 * and a tooltip. Pro does not re-export Recharts' `Cell`, so the newest month
 * is a second series stacked on the first: each row fills exactly one of them.
 */
export function VolumeChart({
  data,
  ticks,
  unit,
}: {
  data: VolumePoint[];
  /** Zero-based ticks from `axisTicks`. */
  ticks: number[];
  /** "new cars", "vehicles" — follows the figure in the tooltip. */
  unit: string;
}) {
  const lastIndex = data.length - 1;
  const rows = data.map((point, index) => ({
    ...point,
    earlier: index === lastIndex ? 0 : point.value,
    latest: index === lastIndex ? point.value : 0,
  }));

  return (
    <BarChart
      data={rows}
      height={250}
      margin={{ bottom: 0, left: 0, right: 0, top: 8 }}
    >
      <BarChart.Grid
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
      <BarChart.XAxis
        dataKey="label"
        height={44}
        interval={0}
        tick={({ index, payload, x, y }: TickProps) => {
          const position = payload?.index ?? index ?? 0;
          const point = data[position];
          const isLatest = position === lastIndex;
          // Twelve ticks collide below md, so phones draw every other month,
          // anchored to the newest. The first month may then go unticked, so
          // the first drawn tick carries its year instead.
          const hiddenOnPhone = (lastIndex - position) % 2 === 1;
          const phoneYear =
            !point?.year && position === lastIndex % 2
              ? point?.title.slice(-4)
              : "";
          return (
            <text
              className={cn(
                "fill-muted text-xs tabular-nums",
                hiddenOnPhone && "max-md:hidden",
              )}
              textAnchor="middle"
              x={x}
              y={y}
            >
              <tspan
                className={isLatest ? "fill-foreground font-semibold" : ""}
                dy="0.9em"
                x={x}
              >
                {point?.label}
              </tspan>
              {point?.year ? (
                <tspan className="font-semibold" dy="1.25em" x={x}>
                  {point.year}
                </tspan>
              ) : null}
              {phoneYear ? (
                <tspan className="font-semibold md:hidden" dy="1.25em" x={x}>
                  {phoneYear}
                </tspan>
              ) : null}
            </text>
          );
        }}
        tickMargin={6}
      />
      <BarChart.YAxis
        domain={[0, ticks.at(-1) ?? "auto"]}
        tickFormatter={compactCount}
        ticks={ticks}
        width={44}
      />
      <BarChart.Bar
        dataKey="earlier"
        fill="var(--chart-4)"
        maxBarSize={34}
        radius={[2, 2, 0, 0]}
        stackId="volume"
      />
      <BarChart.Bar
        dataKey="latest"
        fill="var(--chart-1)"
        maxBarSize={34}
        radius={[2, 2, 0, 0]}
        stackId="volume"
      />
      <BarChart.Tooltip
        content={({ active, payload }) => {
          const point = payload?.[0]?.payload as VolumePoint | undefined;
          if (!active || !point) {
            return null;
          }

          return (
            <ChartTooltip>
              <ChartTooltip.Header>{point.title}</ChartTooltip.Header>
              <span className="font-semibold text-sm tabular-nums">
                {formatNumber(point.value)} {unit}
              </span>
            </ChartTooltip>
          );
        }}
      />
    </BarChart>
  );
}
