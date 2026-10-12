"use client";

import { ChartTooltip } from "@heroui-pro/react";
import { AreaChart } from "@heroui-pro/react/area-chart";
import { compactCount } from "@web/utils/formatting/chart-axis";
import { useSyncExternalStore } from "react";

export type PopulationPoint = {
  /** "2025". */
  year: string;
  population: number;
  /** Change on the year before as a ratio; absent for the first year. */
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

/**
 * Phone geometry below Tailwind's `md`: no end label and every fifth year
 * ticked.
 */
const PHONE_QUERY = "(width < 48rem)";

const subscribePhone = (onChange: () => void) => {
  const query = window.matchMedia(PHONE_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

const isPhoneViewport = () => window.matchMedia(PHONE_QUERY).matches;

/** "+0.3% vs 2024", with a true minus for a fall. */
const formatChange = (change: number, year: string): string =>
  `${change < 0 ? "−" : "+"}${Math.abs(change * 100).toFixed(1)}% vs ${year}`;

/**
 * The car population at each year end, with labelled axes, a dot per year and
 * the latest value written beside the line.
 *
 * Adapted from the home page's EV share chart. The y-axis spans the data, not
 * zero — the population moves by a few percent a year on a base of six
 * figures — and the section's source note says so.
 */
export function PopulationChart({
  data,
  ticks,
}: {
  data: PopulationPoint[];
  /** Ticks from `axisTicks`, not anchored at zero. */
  ticks: number[];
}) {
  const lastIndex = data.length - 1;
  const isPhone = useSyncExternalStore(
    subscribePhone,
    isPhoneViewport,
    () => false,
  );
  const tickEvery = isPhone ? 5 : 2;

  return (
    <AreaChart
      data={data}
      height={isPhone ? 260 : 320}
      margin={{ bottom: 0, left: 0, right: isPhone ? 16 : 56, top: 12 }}
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
        dataKey="year"
        interval={0}
        tick={({ index, payload, x, y }: TickProps) => {
          const position = payload?.index ?? index ?? 0;
          // Anchored to the newest year so the last tick is always drawn.
          if ((lastIndex - position) % tickEvery !== 0) {
            return <g />;
          }
          return (
            <text
              className="fill-muted text-xs tabular-nums"
              dy="0.9em"
              textAnchor="middle"
              x={x}
              y={y}
            >
              {data[position]?.year}
            </text>
          );
        }}
        tickMargin={6}
      />
      <AreaChart.YAxis
        domain={[ticks[0] ?? "auto", ticks.at(-1) ?? "auto"]}
        orientation="left"
        tickFormatter={compactCount}
        ticks={ticks}
        width={isPhone ? 44 : 56}
      />
      <AreaChart.Area
        activeDot={{ fill: "var(--chart-1)", r: 4, strokeWidth: 0 }}
        dataKey="population"
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
              {index === lastIndex && !isPhone ? (
                <text
                  className="fill-chart-1 font-semibold text-xs tabular-nums"
                  dominantBaseline="middle"
                  x={cx + 10}
                  y={cy}
                >
                  {compactCount(
                    Math.round(data[lastIndex].population / 100) * 100,
                  )}
                </text>
              ) : null}
            </g>
          )
        }
        fill="var(--chart-1)"
        fillOpacity={0.08}
        name="Cars"
        stroke="var(--chart-1)"
        strokeWidth={2}
        type="linear"
      />
      <AreaChart.Tooltip
        content={({ active, payload }) => {
          const point = payload?.[0]?.payload as PopulationPoint | undefined;
          if (!active || !point) {
            return null;
          }
          const position = data.indexOf(point);

          return (
            <ChartTooltip>
              <ChartTooltip.Header>
                31 December {point.year}
              </ChartTooltip.Header>
              <span className="font-semibold text-sm tabular-nums">
                {point.population.toLocaleString("en-SG")} cars
              </span>
              <span className="text-muted text-xs tabular-nums">
                {point.change === undefined
                  ? "First year in range"
                  : formatChange(point.change, data[position - 1]?.year ?? "")}
              </span>
            </ChartTooltip>
          );
        }}
      />
    </AreaChart>
  );
}
