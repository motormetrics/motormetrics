"use client";

import { BarChart } from "@heroui-pro/react/bar-chart";
import { formatNumber } from "@motormetrics/utils/format-currency";
import { compactCount } from "@web/utils/formatting/chart-axis";

/**
 * The full-width monthly column chart on the registrations and make pages.
 *
 * Pro's chart rather than hand-rolled SVG: this one carries axes, gridlines and
 * a tooltip, which is the boundary set in `apps/web/AGENTS.md` — inline SVG is
 * for sparklines and gauges inside cards.
 *
 * The comp highlights the latest column in a darker fill. Per-bar colouring
 * needs Recharts' `Cell`, which Pro does not re-export, so every column shares
 * one fill and the selected month is identified by the headline above instead.
 */
export function MonthlyChart({
  data,
}: {
  data: { label: string; total: number }[];
}) {
  return (
    <BarChart data={data} height={320}>
      <BarChart.Grid vertical={false} />
      <BarChart.XAxis dataKey="label" tickMargin={8} />
      <BarChart.YAxis
        orientation="right"
        tickFormatter={compactCount}
        width={60}
      />
      <BarChart.Bar
        dataKey="total"
        fill="var(--chart-1)"
        radius={[8, 8, 4, 4]}
      />
      <BarChart.Tooltip
        content={
          <BarChart.TooltipContent
            valueFormatter={(value) => formatNumber(Number(value))}
          />
        }
      />
    </BarChart>
  );
}
