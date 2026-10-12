"use client";

import { LineChart } from "@heroui-pro/react/line-chart";

/** Whole-dollar premiums for the tooltip. */
const PREMIUM_FORMAT = new Intl.NumberFormat("en-SG", {
  currency: "SGD",
  maximumFractionDigits: 0,
  style: "currency",
});

/**
 * A category's premium trend in the COE table: a thin line with a dot on the
 * latest month, axes hidden, and a tooltip naming the hovered month. A file of
 * its own because Pro charts are client components and the table is not.
 *
 * The y-axis spans the series' own range rather than starting at zero. Renders
 * nothing for a series too short to draw.
 */
export function CoePremiumSparkline({
  category,
  className,
  data,
}: {
  /** "Category A", which names the chart. */
  category: string;
  className?: string;
  data: { label: string; value: number }[];
}) {
  if (data.length < 2) {
    return null;
  }

  const lastIndex = data.length - 1;

  return (
    <LineChart
      aria-label={`${category} premiums over the last ${data.length} months`}
      className={className}
      data={data}
      height={28}
      margin={{ bottom: 3, left: 0, right: 3, top: 3 }}
      role="img"
    >
      <LineChart.XAxis dataKey="label" hide />
      <LineChart.YAxis domain={["dataMin", "dataMax"]} hide />
      <LineChart.Line
        dataKey="value"
        dot={({ cx, cy, index }) =>
          index === lastIndex ? (
            <circle cx={cx} cy={cy} fill="var(--chart-3)" key={index} r={2.5} />
          ) : (
            <g key={index} />
          )
        }
        name="Premium"
        stroke="var(--chart-3)"
        strokeWidth={1.5}
        type="monotone"
      />
      <LineChart.Tooltip
        content={
          <LineChart.TooltipContent
            valueFormatter={(value) => PREMIUM_FORMAT.format(Number(value))}
          />
        }
      />
    </LineChart>
  );
}
