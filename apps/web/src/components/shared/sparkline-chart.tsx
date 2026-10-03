"use client";

import { AreaChart } from "@heroui-pro/react/area-chart";

/**
 * The sparkline under every overview headline figure: Pro's area chart with its
 * axes hidden, and a tooltip naming the hovered point.
 *
 * The y-axis spans the series' own range rather than starting at zero, so a
 * premium moving a few percent still reads as movement. Renders nothing for a
 * series too short to draw.
 *
 * The styling props default to the headline look; a table cell passes a thin
 * unfilled line with a dot on the latest point instead.
 */
export function SparklineChart({
  className,
  color = "var(--chart-1)",
  data,
  endDot = false,
  fillOpacity = 0.1,
  format,
  height = 150,
  margin = { bottom: 0, left: 0, right: 0, top: 8 },
  name,
  strokeWidth = 3,
  title,
}: {
  className?: string;
  /** Stroke, fill and end-dot colour. */
  color?: string;
  data: { label: string; value: number }[];
  /** Mark the latest point with a dot. */
  endDot?: boolean;
  fillOpacity?: number;
  /** Number format for the tooltip value; whole numbers by default. */
  format?: Intl.NumberFormatOptions;
  height?: number;
  margin?: { bottom?: number; left?: number; right?: number; top?: number };
  /** Series name shown in the tooltip. */
  name: string;
  strokeWidth?: number;
  /** Accessible name for the chart. */
  title: string;
}) {
  if (data.length < 2) {
    return null;
  }

  const lastIndex = data.length - 1;
  const numberFormat = new Intl.NumberFormat("en-SG", {
    maximumFractionDigits: 0,
    ...format,
  });

  return (
    <div aria-label={title} className={className} role="img">
      <AreaChart data={data} height={height} margin={margin}>
        <AreaChart.XAxis dataKey="label" hide />
        <AreaChart.YAxis domain={["dataMin", "dataMax"]} hide />
        <AreaChart.Area
          dataKey="value"
          dot={
            endDot
              ? ({ cx, cy, index }) =>
                  index === lastIndex ? (
                    <circle cx={cx} cy={cy} fill={color} key={index} r={2.5} />
                  ) : (
                    <g key={index} />
                  )
              : false
          }
          fill={color}
          fillOpacity={fillOpacity}
          name={name}
          stroke={color}
          strokeWidth={strokeWidth}
          type="monotone"
        />
        <AreaChart.Tooltip
          content={
            <AreaChart.TooltipContent
              valueFormatter={(value) => numberFormat.format(Number(value))}
            />
          }
        />
      </AreaChart>
    </div>
  );
}
