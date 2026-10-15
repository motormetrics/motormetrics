"use client";

import { ChartTooltip } from "@heroui-pro/react";
import { AreaChart } from "@heroui-pro/react/area-chart";
import { formatCurrency } from "@motormetrics/utils/format-currency";
import { premiumAxisTicks } from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import { compactCurrency } from "@web/utils/formatting/chart-axis";

export type PremiumPoint = {
  /** Read with `monthIndex` when `tickMonths` is set. */
  biddingNo?: number;
  label: string;
  /** Months since year zero, so ticks land on the same months every load. */
  monthIndex?: number;
  /** The tooltip header, e.g. "Sep 2026 · 2nd". */
  title: string;
  premium: number;
  /** The paired category's premium in the same exercise, drawn as a second line. */
  pairedPremium?: number;
  /** Change from the previous exercise as a ratio, e.g. `0.02` for +2.0%. */
  change?: number;
};

interface TickProps {
  payload?: { value?: string };
  x?: number | string;
  y?: number | string;
}

interface PointProps {
  cx?: number;
  cy?: number;
  index?: number;
}

interface GridLineProps {
  x1?: number;
  x2?: number;
  y1?: number;
  y2?: number;
  index?: number;
}

/** "+2.0% vs previous exercise", with a true minus for a fall. */
const formatChange = (change: number): string =>
  `${change < 0 ? "−" : "+"}${Math.abs(change * 100).toFixed(1)}% vs previous exercise`;

/**
 * The full-width premium history, one line per selected category's exercises.
 *
 * Pro's chart rather than hand-rolled SVG: this one carries axes, gridlines and
 * a tooltip, which is the boundary set in `apps/web/AGENTS.md`.
 *
 * The y-axis is not anchored at zero. A category's premium moves by a few
 * percent between exercises against a base of six figures, so a zero-based axis
 * would draw every series as a flat line. The ticks default to a round step
 * that covers the series (`premiumAxisTicks`), and the lowest one is drawn as
 * the baseline.
 */
export function PremiumTrendChart({
  data,
  domain,
  label = "Premium",
  pairedLabel,
  tickMonths,
  ticks,
}: {
  data: PremiumPoint[];
  domain?: [number, number];
  /** The series name in the tooltip. */
  label?: string;
  /** Names the `pairedPremium` line; without it only `premium` is drawn. */
  pairedLabel?: string;
  /**
   * Months between x ticks, on first exercises; 12 or more shows years only.
   * Recharts drops any that would collide on a narrow chart. Without it
   * every label is a tick.
   */
  tickMonths?: number;
  ticks?: number[];
}) {
  const axisTicks =
    ticks ?? premiumAxisTicks(data.map((point) => point.premium));
  const axisDomain = domain ?? [axisTicks[0], axisTicks[axisTicks.length - 1]];
  const lastIndex = data.length - 1;
  const every = tickMonths;
  const yearOnly = every !== undefined && every >= 12;
  const ticked = every
    ? data.flatMap((point, position) =>
        point.biddingNo === 1 && (point.monthIndex ?? 0) % every === 0
          ? [position]
          : [],
      )
    : [];

  return (
    <AreaChart
      className="[&_.recharts-cartesian-axis-tick-value]:text-xs"
      data={data}
      height={340}
      margin={{ bottom: 0, left: 0, right: 84, top: 12 }}
    >
      <defs>
        <linearGradient id="coePremiumFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.22} />
          <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
        </linearGradient>
      </defs>
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
      {every ? (
        <AreaChart.XAxis
          // Titles are unique per exercise, so the planned ticks can be
          // named; Recharts then drops any of those that would collide.
          dataKey="title"
          height={44}
          interval="preserveStartEnd"
          tick={({ payload, x, y }: TickProps) => {
            const position = data.findIndex(
              (point) => point.title === payload?.value,
            );
            const point = data[position];
            if (!point) {
              return <g />;
            }
            const monthIndex = point.monthIndex ?? 0;
            const year = String(Math.floor(monthIndex / 12));
            // January and the first drawn tick carry the year under the month.
            const showYear =
              !yearOnly && (monthIndex % 12 === 0 || position === ticked[0]);
            return (
              <text
                className="fill-muted text-xs tabular-nums"
                textAnchor="middle"
                x={x}
                y={y}
              >
                <tspan dy="0.9em" x={x}>
                  {yearOnly ? year : point.label}
                </tspan>
                {showYear ? (
                  <tspan className="font-semibold" dy="1.25em" x={x}>
                    {year}
                  </tspan>
                ) : null}
              </text>
            );
          }}
          tickFormatter={(title: string) => {
            const point = data.find((entry) => entry.title === title);
            return yearOnly
              ? String(Math.floor((point?.monthIndex ?? 0) / 12))
              : (point?.label ?? title);
          }}
          tickMargin={6}
          ticks={ticked.map((position) => data[position].title)}
        />
      ) : (
        <AreaChart.XAxis dataKey="label" tickMargin={8} />
      )}
      <AreaChart.YAxis
        domain={axisDomain}
        orientation="left"
        tickFormatter={compactCurrency}
        ticks={axisTicks}
        width={56}
      />
      <AreaChart.Area
        dataKey="premium"
        dot={({ cx, cy, index }: PointProps) =>
          index === lastIndex && cx !== undefined && cy !== undefined ? (
            <g key="last-point">
              <circle cx={cx} cy={cy} fill="var(--chart-1)" r={4} />
              <text
                className="fill-foreground font-semibold text-xs tabular-nums"
                dominantBaseline="middle"
                x={cx + 10}
                y={cy}
              >
                {formatCurrency(data[lastIndex].premium)}
              </text>
            </g>
          ) : (
            <g key={`point-${index}`} />
          )
        }
        fill="url(#coePremiumFill)"
        name={label}
        stroke="var(--chart-1)"
        strokeWidth={3}
        type="monotone"
      />
      {pairedLabel ? (
        <AreaChart.Area
          dataKey="pairedPremium"
          dot={({ cx, cy, index }: PointProps) => {
            const pairedPremium = data[lastIndex].pairedPremium;
            return index === lastIndex &&
              cx !== undefined &&
              cy !== undefined &&
              pairedPremium !== undefined ? (
              <g key="paired-last-point">
                <circle cx={cx} cy={cy} fill="var(--chart-2)" r={4} />
                <text
                  className="fill-foreground font-semibold text-xs tabular-nums"
                  dominantBaseline="middle"
                  x={cx + 10}
                  y={cy}
                >
                  {formatCurrency(pairedPremium)}
                </text>
              </g>
            ) : (
              <g key={`paired-point-${index}`} />
            );
          }}
          fill="none"
          name={pairedLabel}
          stroke="var(--chart-2)"
          strokeWidth={3}
          type="monotone"
        />
      ) : null}
      <AreaChart.Tooltip
        content={({ active, payload }) => {
          const point = payload?.[0]?.payload as PremiumPoint | undefined;
          if (!active || !point) {
            return null;
          }

          return (
            <ChartTooltip>
              <ChartTooltip.Header>{point.title}</ChartTooltip.Header>
              <ChartTooltip.Item>
                <ChartTooltip.Indicator color="var(--chart-1)" />
                <ChartTooltip.Label>{label}</ChartTooltip.Label>
                <ChartTooltip.Value>
                  {formatCurrency(point.premium)}
                </ChartTooltip.Value>
              </ChartTooltip.Item>
              {pairedLabel && point.pairedPremium !== undefined ? (
                <ChartTooltip.Item>
                  <ChartTooltip.Indicator color="var(--chart-2)" />
                  <ChartTooltip.Label>{pairedLabel}</ChartTooltip.Label>
                  <ChartTooltip.Value>
                    {formatCurrency(point.pairedPremium)}
                  </ChartTooltip.Value>
                </ChartTooltip.Item>
              ) : null}
              {point.change === undefined ? null : (
                <span className="text-muted text-xs tabular-nums">
                  {formatChange(point.change)}
                </span>
              )}
            </ChartTooltip>
          );
        }}
      />
    </AreaChart>
  );
}
