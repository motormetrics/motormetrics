"use client";

import { AreaChart } from "@heroui-pro/react/area-chart";
import { formatCurrency } from "@motormetrics/utils/format-currency";
import { compactCurrency } from "@web/utils/formatting/chart-axis";

/**
 * The full-width premium history, one line per selected category's exercises.
 *
 * Pro's chart rather than hand-rolled SVG: this one carries axes, gridlines and
 * a tooltip, which is the boundary set in `apps/web/AGENTS.md`.
 *
 * The y-axis is left on `["auto", "auto"]` rather than anchored at zero. A
 * category's premium moves by a few percent between exercises against a base of
 * six figures, so a zero-based axis would draw every series as a flat line.
 */
export function PremiumTrendChart({
  data,
}: {
  data: { label: string; premium: number }[];
}) {
  return (
    <AreaChart data={data} height={340}>
      <defs>
        <linearGradient id="coePremiumFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.22} />
          <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
        </linearGradient>
      </defs>
      <AreaChart.Grid vertical={false} />
      <AreaChart.XAxis dataKey="label" tickMargin={8} />
      <AreaChart.YAxis
        domain={["auto", "auto"]}
        orientation="right"
        tickFormatter={compactCurrency}
        width={70}
      />
      <AreaChart.Area
        dataKey="premium"
        dot={false}
        fill="url(#coePremiumFill)"
        name="Premium"
        stroke="var(--chart-1)"
        strokeWidth={3}
        type="monotone"
      />
      <AreaChart.Tooltip
        content={
          <AreaChart.TooltipContent
            valueFormatter={(value) => formatCurrency(Number(value))}
          />
        }
      />
    </AreaChart>
  );
}
