"use client";

import { ChartTooltip } from "@heroui-pro/react";
import { AreaChart } from "@heroui-pro/react/area-chart";
import { formatCurrency } from "@motormetrics/utils/format-currency";
import { premiumAxisTicks } from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import { compactCurrency } from "@web/utils/formatting/chart-axis";
import { useSyncExternalStore } from "react";

type PremiumPoint = {
  label: string;
  /** The tooltip header when the axis label alone is ambiguous, e.g. no year. */
  title?: string;
  premium: number;
  /** Change from the previous exercise as a ratio, e.g. `0.02` for +2.0%. */
  change?: number;
};

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

/** The design's phone geometry: no end label and a narrow right margin. */
const PHONE_QUERY = "(max-width: 720px)";

const subscribePhone = (onChange: () => void) => {
  const query = window.matchMedia(PHONE_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

const isPhoneViewport = () => window.matchMedia(PHONE_QUERY).matches;

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
  ticks,
}: {
  data: PremiumPoint[];
  domain?: [number, number];
  ticks?: number[];
}) {
  const axisTicks =
    ticks ?? premiumAxisTicks(data.map((point) => point.premium));
  const axisDomain = domain ?? [axisTicks[0], axisTicks[axisTicks.length - 1]];
  const lastIndex = data.length - 1;
  const isPhone = useSyncExternalStore(
    subscribePhone,
    isPhoneViewport,
    () => false,
  );

  return (
    <AreaChart
      className="[&_.recharts-cartesian-axis-tick-value]:text-xs"
      data={data}
      height={340}
      margin={{ bottom: 0, left: 0, right: isPhone ? 10 : 84, top: 12 }}
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
      <AreaChart.XAxis dataKey="label" tickMargin={8} />
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
              {isPhone ? null : (
                <text
                  className="fill-foreground font-semibold text-xs tabular-nums"
                  dominantBaseline="middle"
                  x={cx + 10}
                  y={cy}
                >
                  {formatCurrency(data[lastIndex].premium)}
                </text>
              )}
            </g>
          ) : (
            <g key={`point-${index}`} />
          )
        }
        fill="url(#coePremiumFill)"
        name="Premium"
        stroke="var(--chart-1)"
        strokeWidth={3}
        type="monotone"
      />
      <AreaChart.Tooltip
        content={({ active, label, payload }) => {
          const point = payload?.[0]?.payload as PremiumPoint | undefined;
          if (!active || !point) {
            return null;
          }

          return (
            <ChartTooltip>
              <ChartTooltip.Header>{point.title ?? label}</ChartTooltip.Header>
              <ChartTooltip.Item>
                <ChartTooltip.Indicator color="var(--chart-1)" />
                <ChartTooltip.Label>Premium</ChartTooltip.Label>
                <ChartTooltip.Value>
                  {formatCurrency(point.premium)}
                </ChartTooltip.Value>
              </ChartTooltip.Item>
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
