"use client";

import { ChartTooltip } from "@heroui-pro/react";
import { LineChart } from "@heroui-pro/react/line-chart";
import { compactCount } from "@web/utils/formatting/chart-axis";

// A type alias rather than an interface: the chart wants
// `Record<string, string | number>`, and only an alias is assignable to one.
export type ComparePoint = {
  a: number;
  b: number;
  /** "Aug". */
  label: string;
  /** "August 2026", the tooltip header. */
  title: string;
  /** "2026" under the first month and every January; empty elsewhere. */
  year: string;
};

/** Make B's dash, on the line and on its legend swatch alike. */
const DASH = "6 4";

interface TickProps {
  index?: number;
  payload?: { index?: number };
  x?: number | string;
  y?: number | string;
}

/**
 * Both makes' monthly registrations on one zero-based axis: make A solid, make
 * B dashed, so the two never rest on colour alone. The legend repeats the
 * dash, and the wrapping figure carries the series in words for screen
 * readers.
 */
export function CompareTrendChart({
  data,
  nameA,
  nameB,
  summary,
  ticks,
}: {
  data: ComparePoint[];
  nameA: string;
  nameB: string;
  /** The chart in words, from `trendSummary`. */
  summary: string;
  /** Ticks from `axisTicks` with a zero anchor. */
  ticks: number[];
}) {
  const series = [
    { color: "var(--chart-1)", dash: undefined, key: "a", label: nameA },
    { color: "var(--chart-sand)", dash: DASH, key: "b", label: nameB },
  ] as const;

  return (
    <figure className="flex flex-col gap-3">
      <figcaption className="sr-only">{summary}</figcaption>
      <div aria-hidden className="flex flex-wrap items-center gap-x-5 gap-y-2">
        {series.map(({ color, dash, key, label }) => (
          <span
            className="inline-flex items-center gap-2 text-muted text-sm"
            key={key}
          >
            <svg aria-hidden="true" className="h-2 w-5" viewBox="0 0 20 8">
              <line
                stroke={color}
                strokeDasharray={dash}
                strokeWidth={2.5}
                x1={0}
                x2={20}
                y1={4}
                y2={4}
              />
            </svg>
            {label}
          </span>
        ))}
      </div>
      <div aria-hidden>
        <LineChart
          data={data}
          height={260}
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
            domain={[0, ticks.at(-1) ?? "auto"]}
            orientation="left"
            tickFormatter={compactCount}
            ticks={ticks}
            width={44}
          />
          {series.map(({ color, dash, key, label }) => (
            <LineChart.Line
              dataKey={key}
              dot={false}
              key={key}
              name={label}
              stroke={color}
              strokeDasharray={dash}
              strokeWidth={2}
              type="linear"
            />
          ))}
          <LineChart.Tooltip
            content={({ active, payload }) => {
              const point = payload?.[0]?.payload as ComparePoint | undefined;
              if (!active || !point) {
                return null;
              }
              return (
                <ChartTooltip>
                  <ChartTooltip.Header>{point.title}</ChartTooltip.Header>
                  {series.map(({ color, key, label }) => (
                    <ChartTooltip.Item key={key}>
                      <ChartTooltip.Indicator color={color} />
                      <ChartTooltip.Label>{label}</ChartTooltip.Label>
                      <ChartTooltip.Value>
                        {point[key].toLocaleString("en-SG")}
                      </ChartTooltip.Value>
                    </ChartTooltip.Item>
                  ))}
                </ChartTooltip>
              );
            }}
          />
        </LineChart>
      </div>
    </figure>
  );
}
