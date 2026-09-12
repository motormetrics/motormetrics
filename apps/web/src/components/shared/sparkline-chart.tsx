"use client";

import { AreaChart } from "@heroui-pro/react/area-chart";

/**
 * The sparkline under every overview headline figure: Pro's area chart with its
 * axes hidden, and a tooltip naming the hovered point.
 *
 * The y-axis spans the series' own range rather than starting at zero, so a
 * premium moving a few percent still reads as movement. Renders nothing for a
 * series too short to draw.
 */
export function SparklineChart({
  className,
  data,
  format,
  height = 150,
  name,
  title,
}: {
  className?: string;
  data: { label: string; value: number }[];
  /** Number format for the tooltip value; whole numbers by default. */
  format?: Intl.NumberFormatOptions;
  height?: number;
  /** Series name shown in the tooltip. */
  name: string;
  /** Accessible name for the chart. */
  title: string;
}) {
  if (data.length < 2) {
    return null;
  }

  const numberFormat = new Intl.NumberFormat("en-SG", {
    maximumFractionDigits: 0,
    ...format,
  });

  return (
    <div aria-label={title} className={className} role="img">
      <AreaChart
        data={data}
        height={height}
        margin={{ bottom: 0, left: 0, right: 0, top: 8 }}
      >
        <AreaChart.XAxis dataKey="label" hide />
        <AreaChart.YAxis domain={["dataMin", "dataMax"]} hide />
        <AreaChart.Area
          dataKey="value"
          dot={false}
          fill="var(--chart-1)"
          fillOpacity={0.1}
          name={name}
          stroke="var(--chart-1)"
          strokeWidth={3}
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
