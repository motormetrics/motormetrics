"use client";

import { ChartTooltip } from "@heroui-pro/react";
import { BarChart } from "@heroui-pro/react/bar-chart";
import { parseAsString, useQueryState } from "nuqs";
import posthog from "posthog-js";
import { useSyncExternalStore, useTransition } from "react";

/** One month; `selected` or `other` carries the share, the other is zero. */
export interface ShareColumn {
  [key: string]: number | string;
  /** `yyyy-MM`, the month a click moves the page to. */
  key: string;
  /** "Aug". */
  label: string;
  other: number;
  selected: number;
  share: number;
  /** "Aug 2026", the tooltip header. */
  title: string;
  /** "2026" under the first month and every January; empty elsewhere. */
  year: string;
}

interface TickProps {
  index?: number;
  payload?: { index?: number };
  x?: number | string;
  y?: number | string;
}

const PHONE_QUERY = "(width < 48rem)";

const subscribePhone = (onChange: () => void) => {
  const query = window.matchMedia(PHONE_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

const isPhoneViewport = () => window.matchMedia(PHONE_QUERY).matches;

/**
 * The EV share by month as zero-based columns, the selected month darker.
 * Pro does not re-export Recharts' `Cell`, so the two shades are two stacked
 * series and each month fills exactly one of them.
 *
 * Selecting a column moves the whole page to that month, which is why this is
 * a client island — the columns themselves are computed on the server and
 * arrive as props.
 */
export function ShareColumns({
  columns,
  ticks,
}: {
  columns: ShareColumn[];
  /** Zero-based ticks from `axisTicks`. */
  ticks: number[];
}) {
  const [isPending, startTransition] = useTransition();
  const [, setMonth] = useQueryState(
    "month",
    parseAsString.withOptions({ shallow: false, startTransition }),
  );
  const isPhone = useSyncExternalStore(
    subscribePhone,
    isPhoneViewport,
    () => false,
  );

  const select = (column?: { payload?: ShareColumn }) => {
    const month = column?.payload?.key;
    if (!month) {
      return;
    }
    posthog.capture("dashboard_filter_changed", {
      filter: "month",
      value: month,
    });
    setMonth(month);
  };

  return (
    <BarChart
      className={isPending ? "opacity-70" : undefined}
      data={columns}
      height={isPhone ? 200 : 230}
      margin={{ bottom: 0, left: 0, right: 0, top: 8 }}
    >
      <BarChart.Grid vertical={false} />
      <BarChart.XAxis
        dataKey="label"
        height={40}
        interval={0}
        tick={({ index, payload, x, y }: TickProps) => {
          const column = columns[payload?.index ?? index ?? 0];
          return (
            <text
              className="fill-muted text-xs tabular-nums"
              textAnchor="middle"
              x={x}
              y={y}
            >
              <tspan dy="0.9em" x={x}>
                {column?.label}
              </tspan>
              {column?.year ? (
                <tspan className="font-semibold" dy="1.25em" x={x}>
                  {column.year}
                </tspan>
              ) : null}
            </text>
          );
        }}
        tickMargin={6}
      />
      <BarChart.YAxis
        domain={[0, ticks.at(-1) ?? "auto"]}
        orientation="left"
        tickFormatter={(value: number) => `${value}%`}
        ticks={ticks}
        width={40}
      />
      <BarChart.Bar
        className="cursor-pointer"
        dataKey="other"
        fill="var(--chart-5)"
        maxBarSize={40}
        onClick={select}
        radius={[2, 2, 0, 0]}
        stackId="month"
      />
      <BarChart.Bar
        className="cursor-pointer"
        dataKey="selected"
        fill="var(--chart-1)"
        maxBarSize={40}
        onClick={select}
        radius={[2, 2, 0, 0]}
        stackId="month"
      />
      <BarChart.Tooltip
        content={({ active, payload }) => {
          const column = payload?.[0]?.payload as ShareColumn | undefined;
          if (!active || !column) {
            return null;
          }
          return (
            <ChartTooltip>
              <ChartTooltip.Header>{column.title}</ChartTooltip.Header>
              <ChartTooltip.Item>
                <ChartTooltip.Indicator
                  color={column.selected ? "var(--chart-1)" : "var(--chart-5)"}
                />
                <ChartTooltip.Label>Share</ChartTooltip.Label>
                <ChartTooltip.Value>
                  {column.share.toFixed(1)}% of new cars
                </ChartTooltip.Value>
              </ChartTooltip.Item>
            </ChartTooltip>
          );
        }}
      />
    </BarChart>
  );
}
