"use client";

import { ComposedChart } from "@heroui-pro/react/composed-chart";

const currencyFormatter = new Intl.NumberFormat("en-SG", {
  currency: "SGD",
  maximumFractionDigits: 0,
  style: "currency",
});

export interface PQPComparisonPoint {
  /** Indexed because Pro's chart types the data as a plain record. */
  [key: string]: string | number;
  category: string;
  latestPremium: number;
  pqpRate: number;
}

/**
 * The published PQP against the latest closing premium, category by category.
 *
 * This is the comparison the page is actually asked for — a bar above the line
 * means the market is bidding above the renewal rate, and a bar below it means
 * renewing is the dearer of the two. The premium is the bars because it is the
 * figure that moves; the rate is the dashed baseline it is read against.
 *
 * Both figures are the full ten-year values: a five-year renewal is not a like
 * comparison against a premium bought for ten years of COE.
 */
export function PQPComparisonChart({ data }: { data: PQPComparisonPoint[] }) {
  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <span className="inline-flex items-center gap-2.5 font-bold text-sm">
          <span
            className="size-3.5 rounded"
            style={{ backgroundColor: "var(--chart-1)" }}
          />
          Latest closing premium
        </span>
        <span className="inline-flex items-center gap-2.5 font-bold text-sm">
          <span
            className="h-[3px] w-5.5 rounded-full"
            style={{ backgroundColor: "var(--chart-2)" }}
          />
          PQP rate
        </span>
      </div>
      <ComposedChart data={data} height={300} width="100%">
        <ComposedChart.Grid vertical={false} />
        <ComposedChart.XAxis dataKey="category" tickMargin={8} />
        <ComposedChart.YAxis
          domain={[
            (dataMin: number) => Math.floor(dataMin / 10000) * 10000,
            (dataMax: number) => Math.ceil(dataMax / 10000) * 10000,
          ]}
          orientation="right"
          tickFormatter={(value: number) => `$${Math.round(value / 1000)}k`}
          width={70}
        />
        <ComposedChart.Bar
          dataKey="latestPremium"
          fill="var(--chart-1)"
          maxBarSize={48}
          name="Latest closing premium"
          radius={[8, 8, 0, 0]}
        />
        <ComposedChart.Line
          dataKey="pqpRate"
          name="PQP rate"
          stroke="var(--chart-2)"
          strokeDasharray="8 4"
          strokeWidth={2.5}
          type="monotone"
        />
        <ComposedChart.Tooltip
          content={
            <ComposedChart.TooltipContent
              valueFormatter={(value) =>
                currencyFormatter.format(Number(value))
              }
            />
          }
          cursor={{ fill: "var(--muted)", opacity: 0.2 }}
        />
      </ComposedChart>
    </div>
  );
}
