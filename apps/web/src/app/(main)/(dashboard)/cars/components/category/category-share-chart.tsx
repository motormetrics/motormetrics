"use client";

import { LineChart } from "@heroui-pro/react";

const numberFormatter = new Intl.NumberFormat("en-SG");

/** Axis labels are compact — the comp reads "6k", not "6,100". */
function compact(value: number): string {
  if (value < 1000) {
    return String(value);
  }

  const thousands = value / 1000;

  return `${thousands.toFixed(thousands % 1 === 0 ? 0 : 1)}k`;
}

export interface CategorySeries {
  /** Chart-colour custom property, e.g. `var(--chart-1)`. */
  color: string;
  /** Sanitised data key — type names carry spaces, slashes and brackets. */
  key: string;
  label: string;
}

/**
 * The multi-line trend the comps draw above the tables, one line per type.
 *
 * Pro's chart rather than the comp's hand-rolled SVG: it carries the axes,
 * gridlines and tooltip the comp draws by hand, which is the boundary set in
 * `apps/web/CLAUDE.md`.
 *
 * The legend is markup rather than `LineChart.Legend` so it can sit above the
 * plot in the comp's type scale, and so the swatches match the row dots in the
 * table below.
 */
export function CategoryShareChart({
  data,
  measure,
  series,
}: {
  data: Record<string, number | string>[];
  measure: "share" | "volume";
  series: CategorySeries[];
}) {
  const formatValue = (value: number) =>
    measure === "share"
      ? `${value.toFixed(1)}%`
      : numberFormatter.format(value);

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        {series.map(({ color, key, label }) => (
          <span
            className="inline-flex items-center gap-2.5 font-bold text-[0.875rem]"
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
          tickFormatter={(value: number) =>
            measure === "share" ? `${value.toFixed(0)}%` : compact(value)
          }
          width={60}
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
              valueFormatter={(value) => formatValue(Number(value))}
            />
          }
        />
      </LineChart>
    </div>
  );
}
