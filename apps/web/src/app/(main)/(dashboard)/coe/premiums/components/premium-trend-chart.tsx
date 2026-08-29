"use client";

import { AreaChart } from "@heroui-pro/react";

const currencyFormatter = new Intl.NumberFormat("en-SG", {
  currency: "SGD",
  maximumFractionDigits: 0,
  style: "currency",
});

/** Axis labels are compact — the comp reads "$100k", not "$100,000". */
function compact(value: number): string {
  if (Math.abs(value) < 1000) {
    return `$${Math.round(value)}`;
  }

  const thousands = value / 1000;

  return `$${thousands.toFixed(thousands % 1 === 0 ? 0 : 1)}k`;
}

/**
 * The full-width premium history, one line per selected category's exercises.
 *
 * Pro's chart rather than hand-rolled SVG: this one carries axes, gridlines and
 * a tooltip, which is the boundary set in `apps/web/CLAUDE.md`.
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
        tickFormatter={compact}
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
            valueFormatter={(value) => currencyFormatter.format(Number(value))}
          />
        }
      />
    </AreaChart>
  );
}
