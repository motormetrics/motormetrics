"use client";

import { AreaChart } from "@heroui-pro/react/area-chart";

/** "18.4%" for the tooltip. */
const SHARE_FORMAT = new Intl.NumberFormat("en-SG", {
  maximumFractionDigits: 1,
  style: "unit",
  unit: "percent",
});

/**
 * The share history under the EV headline figure: a lightly filled area with
 * its axes hidden and a tooltip naming the hovered month. A file of its own
 * because Pro charts are client components and the hero is not.
 *
 * The y-axis spans the series' own range rather than starting at zero, so a
 * share moving a few points still reads as movement. Renders nothing for a
 * series too short to draw.
 */
export function EvShareSparkline({
  data,
}: {
  data: { label: string; value: number }[];
}) {
  if (data.length < 2) {
    return null;
  }

  return (
    <AreaChart
      aria-label={`Battery-electric share of new car registrations over the last ${data.length} months`}
      data={data}
      height={150}
      margin={{ bottom: 0, left: 0, right: 0, top: 8 }}
      role="img"
    >
      <AreaChart.XAxis dataKey="label" hide />
      <AreaChart.YAxis domain={["dataMin", "dataMax"]} hide />
      <AreaChart.Area
        dataKey="value"
        dot={false}
        fill="var(--chart-1)"
        fillOpacity={0.1}
        name="EV share"
        stroke="var(--chart-1)"
        strokeWidth={3}
        type="monotone"
      />
      <AreaChart.Tooltip
        content={
          <AreaChart.TooltipContent
            valueFormatter={(value) => SHARE_FORMAT.format(Number(value))}
          />
        }
      />
    </AreaChart>
  );
}
