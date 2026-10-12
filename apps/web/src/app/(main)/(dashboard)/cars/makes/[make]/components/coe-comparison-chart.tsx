"use client";

import { ChartTooltip } from "@heroui-pro/react";
import { LineChart } from "@heroui-pro/react/line-chart";
import { formatCurrency } from "@motormetrics/utils/format-currency";
import { compactCurrency } from "@web/utils/formatting/chart-axis";

// A type alias rather than an interface: the chart wants
// `Record<string, string | number>`, and only an alias is assignable to one.
export type PremiumPoint = {
  categoryA: number;
  categoryB: number;
  /** "Aug". */
  label: string;
  /** "August 2026", the tooltip header. */
  title: string;
  /** "2026" under the first month and every January; empty elsewhere. */
  year: string;
};

const SERIES = [
  { color: "var(--chart-1)", key: "categoryA", label: "Category A premium" },
  { color: "var(--chart-sand)", key: "categoryB", label: "Category B premium" },
] as const;

interface TickProps {
  index?: number;
  payload?: { index?: number };
  x?: number | string;
  y?: number | string;
}

/**
 * Category A and B premiums on the same months as the registration bars
 * above, as two lines. The axis spans the premiums rather than starting at
 * zero, so their movement does not flatten; the caption says so.
 */
export function CoeComparisonChart({
  data,
  ticks,
}: {
  data: PremiumPoint[];
  /** Ticks from `axisTicks` without a zero anchor. */
  ticks: number[];
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        {SERIES.map(({ color, key, label }) => (
          <span
            className="inline-flex items-center gap-2 text-muted text-sm"
            key={key}
          >
            <span
              aria-hidden
              className="h-0.5 w-4"
              style={{ backgroundColor: color }}
            />
            {label}
          </span>
        ))}
      </div>
      <LineChart
        data={data}
        height={250}
        margin={{ bottom: 0, left: 0, right: 8, top: 8 }}
      >
        <LineChart.Grid vertical={false} />
        <LineChart.XAxis
          dataKey="label"
          height={40}
          interval="preserveEnd"
          minTickGap={12}
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
        <LineChart.YAxis
          domain={[ticks[0] ?? "auto", ticks.at(-1) ?? "auto"]}
          orientation="left"
          tickFormatter={compactCurrency}
          ticks={ticks}
          width={52}
        />
        {SERIES.map(({ color, key, label }) => (
          <LineChart.Line
            dataKey={key}
            dot={false}
            key={key}
            name={label}
            stroke={color}
            strokeWidth={2}
            type="linear"
          />
        ))}
        <LineChart.Tooltip
          content={({ active, payload }) => {
            const point = payload?.[0]?.payload as PremiumPoint | undefined;
            if (!active || !point) {
              return null;
            }
            return (
              <ChartTooltip>
                <ChartTooltip.Header>{point.title}</ChartTooltip.Header>
                {SERIES.map(({ color, key }) => (
                  <ChartTooltip.Item key={key}>
                    <ChartTooltip.Indicator color={color} />
                    <ChartTooltip.Label>
                      {key === "categoryA" ? "Cat A" : "Cat B"}
                    </ChartTooltip.Label>
                    <ChartTooltip.Value>
                      {formatCurrency(point[key])}
                    </ChartTooltip.Value>
                  </ChartTooltip.Item>
                ))}
              </ChartTooltip>
            );
          }}
        />
      </LineChart>
    </div>
  );
}
