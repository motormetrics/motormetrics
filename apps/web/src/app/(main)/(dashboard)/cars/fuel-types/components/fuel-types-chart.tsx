"use client";

import { ChartTooltip } from "@heroui-pro/react";
import { LineChart } from "@heroui-pro/react/line-chart";
import { formatNumber } from "@motormetrics/utils/format-currency";
import { compactCount } from "@web/utils/formatting/chart-axis";
import { useSyncExternalStore } from "react";

export interface FuelSeries {
  /** Chart-colour custom property, shared with the headline and the tables. */
  color: string;
  /** Sanitised data key — fuel names carry spaces, hyphens and brackets. */
  key: string;
  label: string;
}

export type FuelTrendPoint = {
  /** "Aug 2026", for the tooltip. */
  title: string;
  /** "Aug", for the axis. */
  label: string;
  /** "2026" on the first month and on each January, otherwise empty. */
  year: string;
  /** Every fuel type's registrations that month, plotted or not. */
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

/** Phone geometry below Tailwind's `md`: every third month ticked. */
const PHONE_QUERY = "(width < 48rem)";

const subscribePhone = (onChange: () => void) => {
  const query = window.matchMedia(PHONE_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

const isPhoneViewport = () => window.matchMedia(PHONE_QUERY).matches;

/**
 * One line per charted fuel type over twelve months, on a zero-based axis,
 * with a short-line legend above the plot as the comp draws it. Electric is
 * drawn a little heavier as the page's subject.
 */
export function FuelTypesChart({
  data,
  measure,
  series,
  ticks,
}: {
  data: FuelTrendPoint[];
  measure: "share" | "volume";
  series: FuelSeries[];
  /** Ticks from `axisTicks`, anchored at zero. */
  ticks: number[];
}) {
  const lastIndex = data.length - 1;
  const isPhone = useSyncExternalStore(
    subscribePhone,
    isPhoneViewport,
    () => false,
  );
  const tickEvery = isPhone ? 3 : 1;
  const formatValue = (value: number) =>
    measure === "share" ? `${value.toFixed(1)}%` : formatNumber(value);

  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-wrap gap-x-5 gap-y-2 text-muted-strong text-xs">
        {series.map(({ color, key, label }) => (
          <li className="inline-flex items-center gap-1.5" key={key}>
            <span
              aria-hidden
              className="block h-0.5 w-3"
              style={{ backgroundColor: color }}
            />
            {label}
          </li>
        ))}
      </ul>
      <LineChart
        data={data}
        height={isPhone ? 270 : 320}
        margin={{ bottom: 0, left: 0, right: 16, top: 12 }}
      >
        <LineChart.Grid
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
        <LineChart.XAxis
          dataKey="label"
          height={40}
          interval={0}
          tick={({ index, payload, x, y }: TickProps) => {
            const position = payload?.index ?? index ?? 0;
            const point = data[position];
            // Anchored to the newest month so the last tick is always drawn.
            if (!point || (lastIndex - position) % tickEvery !== 0) {
              return <g />;
            }
            return (
              <text
                className="fill-muted text-xs"
                dy="0.9em"
                textAnchor="middle"
                x={x}
                y={y}
              >
                <tspan x={x}>{point.label}</tspan>
                {point.year ? (
                  <tspan className="fill-subtle font-semibold" dy="1.2em" x={x}>
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
          tickFormatter={(value: number) =>
            measure === "share" ? `${value}%` : compactCount(value)
          }
          ticks={ticks}
          width={isPhone ? 40 : 48}
        />
        {series.map(({ color, key, label }) => (
          <LineChart.Line
            activeDot={{ fill: color, r: 3.5, stroke: "var(--background)" }}
            dataKey={key}
            dot={false}
            key={key}
            name={label}
            stroke={color}
            strokeWidth={label === "Electric" ? 2.5 : 2}
            type="linear"
          />
        ))}
        <LineChart.Tooltip
          content={({ active, payload }) => {
            const point = payload?.[0]?.payload as FuelTrendPoint | undefined;
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
                      {formatValue(Number(point[key]))}
                    </ChartTooltip.Value>
                  </ChartTooltip.Item>
                ))}
                <span className="text-muted text-xs tabular-nums">
                  {formatNumber(point.total)} new cars in all
                </span>
              </ChartTooltip>
            );
          }}
        />
      </LineChart>
    </div>
  );
}
