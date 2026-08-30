"use client";

import { BarChart } from "@heroui-pro/react";

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
 * The full-width monthly column chart.
 *
 * Pro's chart rather than hand-rolled SVG: this one carries axes, gridlines and
 * a tooltip, which is the boundary set in `apps/web/CLAUDE.md` — inline SVG is
 * for sparklines and gauges inside cards.
 *
 * The comp highlights the latest column in a darker fill. Per-bar colouring
 * needs Recharts' `Cell`, which Pro does not re-export, so every column shares
 * one fill and the selected month is identified by the headline above instead.
 */
export function RegistrationsChart({
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
