"use client";

import { cn } from "@heroui/react";
import { ChartTooltip } from "@heroui-pro/react";
import { LineChart } from "@heroui-pro/react/line-chart";
import { formatCurrency } from "@motormetrics/utils/format-currency";
import { compactCurrency } from "@web/utils/formatting/chart-axis";

export interface PQPSeries {
  /** The data key, e.g. `Category A`. */
  key: string;
  /** "Category A", for the legend and tooltip. */
  label: string;
}

/** One published month; the category keys carry the term-scaled rates. */
export type PQPTrendPoint = Record<string, number | string> & {
  /** "Nov". */
  label: string;
  /** "November 2025", the tooltip header. */
  title: string;
  /** "2025" under the first month and every January; empty elsewhere. */
  year: string;
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

/** End labels closer than this, in px, are pushed apart. */
const LABEL_CLEARANCE = 16;
/** The plot area's height: 300 less the top margin and the x-axis. */
const PLOT_HEIGHT = 244;

/** "+0.4% vs previous month", with a true minus for a fall. */
const formatChange = (current: number, previous: number): string => {
  const ratio = (current - previous) / previous;
  return `${ratio < 0 ? "−" : "+"}${Math.abs(ratio * 100).toFixed(1)}% vs previous month`;
};

/**
 * The 12-month PQP trend, one line per category on a shared axis: the selected
 * category in the accent and heavier, the other in a lighter blue behind it.
 *
 * Pro's chart rather than hand-rolled SVG, since it carries axes, gridlines and
 * a tooltip. The y-axis spans the data, not zero; the section's source note
 * says so.
 */
export function PQPChart({
  data,
  selected,
  series,
  ticks,
}: {
  data: PQPTrendPoint[];
  /** The key drawn in the accent. */
  selected: string;
  series: PQPSeries[];
  /** Ticks from `axisTicks`, not anchored at zero. */
  ticks: number[];
}) {
  const lastIndex = data.length - 1;
  // The selected line is drawn last so it sits on top.
  const ordered = [...series].sort(
    (left, right) =>
      Number(left.key === selected) - Number(right.key === selected),
  );
  const colorOf = (key: string) =>
    key === selected ? "var(--chart-1)" : "var(--chart-4)";

  // Where the two end labels would collide, nudge the higher one up and the
  // lower one down. The y-axis is linear, so values stand in for positions.
  const span = (ticks.at(-1) ?? 1) - (ticks[0] ?? 0) || 1;
  const lastValues = series.map((item) => Number(data[lastIndex]?.[item.key]));
  const labelsClash =
    series.length === 2 &&
    (Math.abs(lastValues[0] - lastValues[1]) / span) * PLOT_HEIGHT <
      LABEL_CLEARANCE;
  const labelOffset = (key: string): number => {
    if (!labelsClash) {
      return 0;
    }
    const value = Number(data[lastIndex]?.[key]);
    return value >= Math.max(...lastValues)
      ? -LABEL_CLEARANCE / 2
      : LABEL_CLEARANCE / 2;
  };

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex flex-wrap items-center gap-4">
        {[...ordered].reverse().map(({ key, label }) => (
          <span
            className="inline-flex items-center gap-1.5 text-muted-strong text-sm"
            key={key}
          >
            <span
              aria-hidden
              className="block h-0.5 w-3"
              style={{ backgroundColor: colorOf(key) }}
            />
            {label}
          </span>
        ))}
      </div>
      <LineChart
        data={data}
        height={300}
        margin={{ bottom: 0, left: 0, right: 74, top: 12 }}
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
          height={44}
          // Evenly spaced, widening the step until the labels fit; the
          // first month is always drawn, so the opening year always shows.
          interval="equidistantPreserveStart"
          tick={({ index, payload, x, y }: TickProps) => {
            const point = data[payload?.index ?? index ?? 0];
            const year = point?.year;
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
          width={56}
        />
        {ordered.map(({ key, label }) => {
          const isSelected = key === selected;
          const color = colorOf(key);
          return (
            <LineChart.Line
              activeDot={{ fill: color, r: 4, strokeWidth: 0 }}
              dataKey={key}
              dot={({ cx, cy, index }: PointProps) =>
                cx === undefined || cy === undefined ? (
                  <g key={`${key}-${index}`} />
                ) : (
                  <g key={`${key}-${index}`}>
                    <circle
                      cx={cx}
                      cy={cy}
                      fill={index === lastIndex ? color : "var(--background)"}
                      r={index === lastIndex ? 4 : 2.5}
                      stroke={color}
                      strokeWidth={1.5}
                    />
                    {index === lastIndex ? (
                      <text
                        className={cn(
                          "font-semibold text-xs tabular-nums",
                          isSelected ? "fill-chart-1" : "fill-muted",
                        )}
                        dominantBaseline="middle"
                        x={cx + 10}
                        y={cy + labelOffset(key)}
                      >
                        {formatCurrency(Number(data[lastIndex]?.[key]))}
                      </text>
                    ) : null}
                  </g>
                )
              }
              isAnimationActive={false}
              key={key}
              name={label}
              stroke={color}
              strokeWidth={isSelected ? 2.25 : 1.75}
              type="linear"
            />
          );
        })}
        <LineChart.Tooltip
          content={({ active, payload }) => {
            const point = payload?.[0]?.payload as PQPTrendPoint | undefined;
            if (!active || !point) {
              return null;
            }
            const position = data.findIndex(
              (entry) => entry.title === point.title,
            );
            const previous = position > 0 ? data[position - 1] : undefined;
            const selectedLabel =
              series.find((item) => item.key === selected)?.label ?? selected;

            return (
              <ChartTooltip>
                <ChartTooltip.Header>{point.title}</ChartTooltip.Header>
                {[...ordered].reverse().map(({ key, label }) => (
                  <ChartTooltip.Item key={key}>
                    <ChartTooltip.Indicator color={colorOf(key)} />
                    <ChartTooltip.Label>{label}</ChartTooltip.Label>
                    <ChartTooltip.Value>
                      {formatCurrency(Number(point[key]))}
                    </ChartTooltip.Value>
                  </ChartTooltip.Item>
                ))}
                <span className="text-muted text-xs tabular-nums">
                  {previous
                    ? `${selectedLabel} ${formatChange(Number(point[selected]), Number(previous[selected]))}`
                    : "First month shown"}
                </span>
              </ChartTooltip>
            );
          }}
        />
      </LineChart>
    </div>
  );
}
