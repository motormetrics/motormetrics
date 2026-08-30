"use client";

import { LineChart } from "@heroui-pro/react";
import { CATEGORY_COLOURS } from "@web/app/(main)/(dashboard)/coe/results/components/series-filter";
import Typography from "@web/components/typography";
import type { COECategory } from "@web/types";

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
 * Closing premiums per exercise, one line per selected category.
 *
 * The y-axis is left on `["auto", "auto"]` rather than anchored at zero: the
 * categories are six-figure sums moving by a few percent an exercise, and a
 * zero-based axis flattens all of them.
 */
export function ResultsChart({
  categories,
  data,
}: {
  categories: COECategory[];
  data: Record<string, number | string>[];
}) {
  if (categories.length === 0) {
    return (
      <div className="flex h-[340px] items-center justify-center border-border border-y">
        <Typography.TextSm className="font-medium text-muted">
          Pick at least one category to plot.
        </Typography.TextSm>
      </div>
    );
  }

  return (
    <LineChart data={data} height={340}>
      <LineChart.Grid vertical={false} />
      <LineChart.XAxis dataKey="label" tickMargin={8} />
      <LineChart.YAxis
        domain={["auto", "auto"]}
        orientation="right"
        tickFormatter={compact}
        width={70}
      />
      {categories.map((category) => (
        <LineChart.Line
          dataKey={category}
          dot={false}
          key={category}
          name={category}
          stroke={CATEGORY_COLOURS[category]}
          strokeWidth={3}
          type="monotone"
        />
      ))}
      <LineChart.Tooltip
        content={
          <LineChart.TooltipContent
            indicator="line"
            valueFormatter={(value) => currencyFormatter.format(Number(value))}
          />
        }
      />
    </LineChart>
  );
}
