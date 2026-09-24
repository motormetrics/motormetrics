"use client";

import { LineChart } from "@heroui-pro/react/line-chart";
import { formatCurrency } from "@motormetrics/utils/format-currency";
import { compactWholeCurrency } from "@web/utils/formatting/chart-axis";

export interface PQPSeries {
  /** Chart-colour custom property, e.g. `var(--chart-1)`. */
  color: string;
  key: string;
  label: string;
}

/**
 * The 12-month PQP trend, one line per category.
 *
 * Pro's chart rather than a hand-rolled SVG, with the legend as markup so the
 * swatches match the row dots in the table below — the arrangement the other
 * report-family pages use.
 */
export function PQPChart({
  data,
  series,
}: {
  data: Record<string, number | string>[];
  series: PQPSeries[];
}) {
  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        {series.map(({ color, key, label }) => (
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
        <LineChart.XAxis dataKey="label" tickMargin={8} />
        <LineChart.YAxis
          orientation="right"
          tickFormatter={(value: number) => compactWholeCurrency(value)}
          width={70}
        />
        {series.map(({ color, key, label }) => (
          <LineChart.Line
            dataKey={key}
            dot={false}
            key={key}
            name={label}
            stroke={color}
            strokeWidth={2.5}
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
