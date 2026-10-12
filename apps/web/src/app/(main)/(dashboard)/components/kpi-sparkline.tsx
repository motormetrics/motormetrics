"use client";

import { LineChart } from "@heroui-pro/react/line-chart";

/**
 * The thin line under each KPI figure, with its axes hidden and a tooltip
 * naming the hovered month. A file of its own because Pro charts are client
 * components and the strip is not.
 *
 * The y-axis spans the series' own range rather than starting at zero, so a
 * few percent of movement still reads. Renders nothing for a series too short
 * to draw.
 */
export function KpiSparkline({
  data,
  format,
  label,
}: {
  data: { label: string; value: number }[];
  /** Number format for the tooltip value; whole numbers by default. */
  format?: Intl.NumberFormatOptions;
  /** The KPI's label, which names the series. */
  label: string;
}) {
  if (data.length < 2) {
    return null;
  }

  const numberFormat = new Intl.NumberFormat("en-SG", {
    maximumFractionDigits: 0,
    ...format,
  });

  return (
    <LineChart
      aria-label={`${label} over the last ${data.length} months`}
      className="pt-1"
      data={data}
      height={32}
      margin={{ bottom: 2, left: 0, right: 0, top: 2 }}
      role="img"
    >
      <LineChart.XAxis dataKey="label" hide />
      <LineChart.YAxis domain={["dataMin", "dataMax"]} hide />
      <LineChart.Line
        dataKey="value"
        dot={false}
        name={label}
        stroke="var(--chart-1)"
        strokeWidth={1.5}
        type="monotone"
      />
      <LineChart.Tooltip
        content={
          <LineChart.TooltipContent
            valueFormatter={(value) => numberFormat.format(Number(value))}
          />
        }
      />
    </LineChart>
  );
}
