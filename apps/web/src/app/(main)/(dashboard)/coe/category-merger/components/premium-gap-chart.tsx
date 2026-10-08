"use client";

import { LineChart } from "@heroui-pro/react/line-chart";
import { formatCurrency } from "@motormetrics/utils/format-currency";
import { compactWholeCurrency } from "@web/utils/formatting/chart-axis";

// A type alias rather than an interface: the chart wants
// `Record<string, string | number>`, and only an alias is assignable to one.
export type PremiumGapPoint = {
  label: string;
  categoryA: number;
  categoryB: number;
};

const SERIES = [
  { color: "var(--chart-1)", key: "categoryA", label: "Category A" },
  { color: "var(--chart-2)", key: "categoryB", label: "Category B" },
] as const;

/**
 * Category A and B premiums at every exercise, so the narrowing gap LTA
 * describes is visible rather than asserted. Legend as markup, the same as
 * the PQP chart.
 */
export function PremiumGapChart({ data }: { data: PremiumGapPoint[] }) {
  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        {SERIES.map(({ color, key, label }) => (
          <span
            className="inline-flex items-center gap-2.5 font-bold text-sm"
            key={key}
          >
            <span
              className="size-3.5 rounded"
              style={{ backgroundColor: color }}
            />
            {label}
          </span>
        ))}
      </div>
      <LineChart data={data} height={320}>
        <LineChart.Grid vertical={false} />
        <LineChart.XAxis dataKey="label" minTickGap={32} tickMargin={8} />
        <LineChart.YAxis
          orientation="right"
          tickFormatter={(value: number) => compactWholeCurrency(value)}
          width={70}
        />
        {SERIES.map(({ color, key, label }) => (
          <LineChart.Line
            dataKey={key}
            dot={false}
            key={key}
            name={label}
            stroke={color}
            strokeWidth={2}
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
    </div>
  );
}
