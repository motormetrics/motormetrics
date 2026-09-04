"use client";

import { LineChart } from "@heroui-pro/react/line-chart";

const numberFormatter = new Intl.NumberFormat("en-SG");

/** Axis labels are compact — the comp reads "6k", not "6,100". */
function compact(value: number): string {
  if (value < 1000) {
    return String(value);
  }

  const thousands = value / 1000;

  return `${thousands.toFixed(thousands % 1 === 0 ? 0 : 1)}k`;
}

export interface DeregistrationSeries {
  /** Chart-colour custom property, e.g. `var(--chart-1)`. */
  color: string;
  /** Sanitised data key — category names carry spaces. */
  key: string;
  label: string;
}

/**
 * The monthly deregistration trend, one line per VQS category.
 *
 * Pro's chart rather than a hand-rolled SVG, and the legend is markup so the
 * swatches match the row dots in the table below — the same arrangement the
 * fuel and vehicle type reports use.
 */
export function DeregistrationsChart({
  data,
  series,
}: {
  data: Record<string, number | string>[];
  series: DeregistrationSeries[];
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
          tickFormatter={(value: number) => compact(value)}
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
              valueFormatter={(value) => numberFormatter.format(Number(value))}
            />
          }
        />
      </LineChart>
    </div>
  );
}
