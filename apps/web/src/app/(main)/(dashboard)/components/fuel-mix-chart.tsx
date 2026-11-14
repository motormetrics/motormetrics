"use client";

import { cn } from "@heroui/react";
import { ChartTooltip } from "@heroui-pro/react";
import { BarChart } from "@heroui-pro/react/bar-chart";
import { formatNumber } from "@motormetrics/utils/format-currency";
import { compactCount } from "@web/utils/formatting/chart-axis";

export interface FuelMixSeries {
  /** Chart-colour custom property, shared with the legend. */
  color: string;
  /** Sanitised data key: LTA's fuel names carry spaces and brackets. */
  key: string;
  label: string;
}

export type FuelMixPoint = {
  /** "Aug". */
  label: string;
  /** "2026" under the first month and every January; empty elsewhere. */
  year: string;
  /** "August 2026", the tooltip header. */
  title: string;
  /** Every fuel type's registrations that month, charted or not. */
  total: number;
} & Record<string, number | string>;

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
 * New cars by month as zero-based columns, each stacked by fuel type, with a
 * tooltip listing every segment and its share of the month.
 */
export function FuelMixChart({
  data,
  series,
  ticks,
}: {
  data: FuelMixPoint[];
  /** Bottom of the stack first. */
  series: FuelMixSeries[];
  /** Zero-based ticks from `axisTicks`. */
  ticks: number[];
}) {
  const lastIndex = data.length - 1;

  return (
    <BarChart
      data={data}
      height={300}
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
      {series.map(({ color, key, label }) => (
        <BarChart.Bar
          dataKey={key}
          fill={color}
          key={key}
          maxBarSize={72}
          name={label}
          stackId="fuel"
          stroke="var(--background)"
          strokeWidth={1}
        />
      ))}
      <BarChart.Tooltip
        content={({ active, payload }) => {
          const point = payload?.[0]?.payload as FuelMixPoint | undefined;
          if (!active || !point) {
            return null;
          }

          return (
            <ChartTooltip>
              <ChartTooltip.Header>{point.title}</ChartTooltip.Header>
              <span className="font-semibold text-sm tabular-nums">
                {formatNumber(point.total)} new cars
              </span>
              {[...series].reverse().map(({ key, label }) => {
                const count = Number(point[key]);
                return (
                  <span className="text-xs tabular-nums" key={key}>
                    {label} {formatNumber(count)} ·{" "}
                    {point.total > 0
                      ? `${((count / point.total) * 100).toFixed(1)}%`
                      : "–"}
                  </span>
                );
              })}
            </ChartTooltip>
          );
        }}
      />
    </BarChart>
  );
}
