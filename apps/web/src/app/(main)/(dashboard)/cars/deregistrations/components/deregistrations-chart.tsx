"use client";

import { ChartTooltip } from "@heroui-pro/react";
import { BarChart } from "@heroui-pro/react/bar-chart";
import type { StackedPoint } from "@web/app/(main)/(dashboard)/cars/deregistrations/components/stacked-points";
import { compactCount } from "@web/utils/formatting/chart-axis";
import { Fragment } from "react";

export interface DeregistrationSeries {
  /** Chart-colour custom property, e.g. `var(--chart-1)`. */
  color: string;
  label: string;
}

interface TickProps {
  index?: number;
  payload?: { index?: number };
  x?: number | string;
  y?: number | string;
}

/** How far the months other than the selected one recede, as in the comp. */
const DIMMED_OPACITY = 0.55;

/**
 * Twelve months of deregistrations as zero-based columns, stacked by COE
 * category, with the selected month at full strength and the rest dimmed.
 *
 * The legend is markup so the swatches match the category table below. The
 * two-line month axis is adapted from the registrations page's trend chart.
 */
export function DeregistrationsChart({
  data,
  series,
  ticks,
}: {
  data: StackedPoint[];
  series: DeregistrationSeries[];
  /** Zero-based ticks from `axisTicks`. */
  ticks: number[];
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-muted-strong text-xs">
        {series.map(({ color, label }) => (
          <span
            className="inline-flex items-center gap-1.5 whitespace-nowrap"
            key={label}
          >
            <span
              aria-hidden
              className="size-3 shrink-0 rounded-sm"
              style={{ backgroundColor: color }}
            />
            {label}
          </span>
        ))}
      </div>
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
        {/* Each category draws its dimmed and full-strength series back to
            back, so the stack order holds whichever of the two a month fills. */}
        {series.map(({ color, label }, index) => (
          <Fragment key={label}>
            <BarChart.Bar
              dataKey={`other${index}`}
              fill={color}
              fillOpacity={DIMMED_OPACITY}
              maxBarSize={48}
              name={label}
              stackId="month"
            />
            <BarChart.Bar
              dataKey={`selected${index}`}
              fill={color}
              maxBarSize={48}
              name={label}
              stackId="month"
            />
          </Fragment>
        ))}
        <BarChart.Tooltip
          content={({ active, payload }) => {
            const point = payload?.[0]?.payload as StackedPoint | undefined;
            if (!active || !point) {
              return null;
            }
            return (
              <ChartTooltip>
                <ChartTooltip.Header>
                  {point.title} · {point.total.toLocaleString("en-SG")} vehicles
                </ChartTooltip.Header>
                {series.map(({ color, label }, index) => (
                  <ChartTooltip.Item key={label}>
                    <ChartTooltip.Indicator color={color} />
                    <ChartTooltip.Label>{label}</ChartTooltip.Label>
                    <ChartTooltip.Value>
                      {(
                        Number(point[`selected${index}`]) +
                        Number(point[`other${index}`])
                      ).toLocaleString("en-SG")}
                    </ChartTooltip.Value>
                  </ChartTooltip.Item>
                ))}
              </ChartTooltip>
            );
          }}
        />
      </BarChart>
    </div>
  );
}
