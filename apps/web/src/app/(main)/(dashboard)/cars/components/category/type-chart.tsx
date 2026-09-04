"use client";

import { BarChart } from "@heroui-pro/react/bar-chart";

const numberFormatter = new Intl.NumberFormat("en-SG");

/** Axis labels are compact — the comp reads "6k", not "6,100". */
function compact(value: number): string {
  if (value < 1000) {
    return String(value);
  }

  const thousands = value / 1000;

  return `${thousands.toFixed(thousands % 1 === 0 ? 0 : 1)}k`;
}

/**
 * The full-width monthly column chart on a type detail page.
 *
 * Same construction as `registrations/components/registrations-chart.tsx`:
 * Pro's chart rather than hand-rolled SVG, because this one carries axes,
 * gridlines and a tooltip. The comp darkens the latest column; per-bar
 * colouring needs Recharts' `Cell`, which Pro does not re-export, so every
 * column shares one fill and the anchor month is marked in the table below.
 */
export function TypeChart({
  data,
}: {
  data: { count: number; label: string }[];
}) {
  return (
    <BarChart data={data} height={320}>
      <BarChart.Grid vertical={false} />
      <BarChart.XAxis dataKey="label" tickMargin={8} />
      <BarChart.YAxis orientation="right" tickFormatter={compact} width={60} />
      <BarChart.Bar
        dataKey="count"
        fill="var(--chart-1)"
        radius={[8, 8, 4, 4]}
      />
      <BarChart.Tooltip
        content={
          <BarChart.TooltipContent
            valueFormatter={(value) => numberFormatter.format(Number(value))}
          />
        }
      />
    </BarChart>
  );
}
