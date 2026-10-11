"use client";

import { ChartTooltip } from "@heroui-pro/react";
import { LineChart } from "@heroui-pro/react/line-chart";
import { formatCurrency } from "@motormetrics/utils/format-currency";
import { toCategoryKey } from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import { CATEGORY_COLOURS } from "@web/app/(main)/(dashboard)/coe/results/components/series-filter";
import type { COECategory } from "@web/types";
import { compactCurrency } from "@web/utils/formatting/chart-axis";
import { useSyncExternalStore } from "react";

/** One exercise; the category keys carry its closing premiums. */
export type ResultsPoint = Record<string, number | string> & {
  /** "Sep". */
  label: string;
  /** Months since year zero, so ticks land on the same months every load. */
  monthIndex: number;
  biddingNo: number;
  /** "Sep 2026 · 2nd", the tooltip header. */
  title: string;
};

interface TickProps {
  index?: number;
  payload?: { index?: number };
  x?: number | string;
  y?: number | string;
}

/** Phone geometry below Tailwind's `md`: a tick every fourth month. */
const PHONE_QUERY = "(width < 48rem)";

const subscribePhone = (onChange: () => void) => {
  const query = window.matchMedia(PHONE_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

const isPhoneViewport = () => window.matchMedia(PHONE_QUERY).matches;

/**
 * Closing premiums per exercise, one line per selected category, on a shared
 * axis that spans the data rather than zero: the premiums are six-figure sums
 * moving a few percent an exercise, and a zero base flattens them. The
 * section's source note says so.
 */
export function ResultsChart({
  categories,
  data,
  ticks,
}: {
  categories: COECategory[];
  data: ResultsPoint[];
  /** Ticks from `axisTicks`, not anchored at zero. */
  ticks: number[];
}) {
  const lastIndex = data.length - 1;
  const isPhone = useSyncExternalStore(
    subscribePhone,
    isPhoneViewport,
    () => false,
  );
  const tickEvery = isPhone ? 4 : 2;
  const ticked = data.flatMap((point, position) =>
    point.biddingNo === 1 && point.monthIndex % tickEvery === 0
      ? [position]
      : [],
  );

  return (
    <LineChart
      data={data}
      height={isPhone ? 270 : 320}
      margin={{ bottom: 0, left: 0, right: isPhone ? 10 : 16, top: 12 }}
    >
      <LineChart.Grid vertical={false} />
      <LineChart.XAxis
        dataKey="label"
        height={44}
        interval={0}
        tick={({ index, payload, x, y }: TickProps) => {
          const position = payload?.index ?? index ?? 0;
          if (!ticked.includes(position)) {
            return <g />;
          }
          const point = data[position];
          // January carries its year, and so does the first drawn tick.
          const year =
            point && (point.monthIndex % 12 === 0 || position === ticked[0])
              ? String(Math.floor(point.monthIndex / 12))
              : "";
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
      <LineChart.YAxis
        domain={[ticks[0] ?? "auto", ticks.at(-1) ?? "auto"]}
        orientation="left"
        tickFormatter={compactCurrency}
        ticks={ticks}
        width={isPhone ? 46 : 56}
      />
      {categories.map((category) => {
        const color = CATEGORY_COLOURS[category];
        return (
          <LineChart.Line
            activeDot={{ fill: color, r: 4, strokeWidth: 0 }}
            dataKey={category}
            dot={({ cx, cy, index }) =>
              index === lastIndex && cx !== undefined && cy !== undefined ? (
                <circle
                  cx={cx}
                  cy={cy}
                  fill={color}
                  key={`${category}-${index}`}
                  r={4}
                  stroke="var(--background)"
                  strokeWidth={1.5}
                />
              ) : (
                <g key={`${category}-${index}`} />
              )
            }
            isAnimationActive={false}
            key={category}
            name={category}
            stroke={color}
            strokeWidth={2}
            type="linear"
          />
        );
      })}
      <LineChart.Tooltip
        content={({ active, payload }) => {
          const point = payload?.[0]?.payload as ResultsPoint | undefined;
          if (!active || !point) {
            return null;
          }

          return (
            <ChartTooltip>
              <ChartTooltip.Header>{point.title}</ChartTooltip.Header>
              {categories.map((category) => (
                <ChartTooltip.Item key={category}>
                  <ChartTooltip.Indicator color={CATEGORY_COLOURS[category]} />
                  <ChartTooltip.Label>
                    Cat {toCategoryKey(category)}
                  </ChartTooltip.Label>
                  <ChartTooltip.Value>
                    {formatCurrency(Number(point[category]))}
                  </ChartTooltip.Value>
                </ChartTooltip.Item>
              ))}
            </ChartTooltip>
          );
        }}
      />
    </LineChart>
  );
}
