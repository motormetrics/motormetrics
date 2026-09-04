"use client";

import { BarChart } from "@heroui-pro/react/bar-chart";

const numberFormatter = new Intl.NumberFormat("en-SG");

/** Axis labels are compact — the comp reads "1.2k", not "1,240". */
function compact(value: number): string {
  if (value < 1000) {
    return String(value);
  }

  const thousands = value / 1000;

  return `${thousands.toFixed(thousands % 1 === 0 ? 0 : 1)}k`;
}

/**
 * The make's monthly column chart.
 *
 * Pro's chart rather than hand-rolled SVG: this one carries axes, gridlines and
 * a tooltip, which is the boundary set in `apps/web/CLAUDE.md`. Matches
 * `cars/registrations/components/registrations-chart.tsx`, including the single
 * fill — the comp darkens the latest column, which needs Recharts' `Cell`, and
 * Pro does not re-export it.
 */
export function MakeChart({
  data,
}: {
  data: { label: string; total: number }[];
}) {
  return (
    <BarChart data={data} height={320}>
      <BarChart.Grid vertical={false} />
      <BarChart.XAxis dataKey="label" tickMargin={8} />
      <BarChart.YAxis orientation="right" tickFormatter={compact} width={60} />
      <BarChart.Bar
        dataKey="total"
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
