"use client";

import { Typography } from "@heroui/react";
import { LineChart } from "@heroui-pro/react/line-chart";
import { formatCurrency } from "@motormetrics/utils/format-currency";
import { CATEGORY_COLOURS } from "@web/app/(main)/(dashboard)/coe/results/components/series-filter";
import type { COECategory } from "@web/types";
import { compactCurrency } from "@web/utils/formatting/chart-axis";

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
        <Typography.Paragraph color="muted" size="sm">
          Pick at least one category to plot.
        </Typography.Paragraph>
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
        tickFormatter={compactCurrency}
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
            valueFormatter={(value) => formatCurrency(Number(value))}
          />
        }
      />
    </LineChart>
  );
}
