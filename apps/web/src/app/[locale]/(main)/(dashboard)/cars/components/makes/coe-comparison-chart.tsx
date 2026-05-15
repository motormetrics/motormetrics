"use client";

import { ComposedChart } from "@heroui-pro/react";
import { formatDateToMonthYear } from "@motormetrics/utils";
import { numberFormat } from "@ruchernchong/number-format";
import type { MakeCoeComparisonData } from "@web/queries/cars/makes/coe-comparison";

interface CoeComparisonChartProps {
  data: MakeCoeComparisonData[];
}

export function CoeComparisonChart({ data }: CoeComparisonChartProps) {
  const chartData = data.map((item) => ({ ...item }));

  return (
    <div className="flex flex-col gap-4">
      <ComposedChart
        data={chartData}
        height={300}
        aria-label="Dual-axis chart comparing monthly registrations with COE Category A and B premiums"
      >
        <ComposedChart.Grid
          vertical={false}
          strokeDasharray="3 3"
          className="stroke-border"
        />
        <ComposedChart.XAxis
          dataKey="month"
          tickFormatter={formatDateToMonthYear}
          tickMargin={8}
        />

        {/* Left Y-axis for registrations */}
        <ComposedChart.YAxis
          yAxisId="registrations"
          type="number"
          orientation="left"
          label={{
            angle: -90,
            position: "insideLeft",
            style: { textAnchor: "middle" },
            value: "Registrations",
          }}
        />

        {/* Right Y-axis for COE premiums */}
        <ComposedChart.YAxis
          yAxisId="premium"
          orientation="right"
          domain={[
            (dataMin: number) => Math.floor(dataMin / 10000) * 10000,
            (dataMax: number) => Math.ceil(dataMax / 10000) * 10000,
          ]}
          tickFormatter={numberFormat}
          label={{
            angle: 90,
            position: "insideRight",
            style: { textAnchor: "middle" },
            value: "COE Premium (S$)",
          }}
        />

        <ComposedChart.Tooltip
          cursor={{ fill: "var(--muted)", opacity: 0.2 }}
          content={<ComposedChart.TooltipContent />}
        />

        <ComposedChart.Bar
          dataKey="registrations"
          yAxisId="registrations"
          fill="var(--chart-1)"
          radius={[4, 4, 0, 0]}
          maxBarSize={40}
        />

        <ComposedChart.Line
          dataKey="categoryAPremium"
          yAxisId="premium"
          type="monotone"
          dot={false}
          stroke="var(--chart-2)"
          strokeWidth={2}
        />

        <ComposedChart.Line
          dataKey="categoryBPremium"
          yAxisId="premium"
          type="monotone"
          dot={false}
          stroke="var(--chart-3)"
          strokeWidth={2}
          strokeDasharray="10 10"
        />
      </ComposedChart>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
        {[
          { color: "var(--chart-1)", label: "Registrations" },
          { color: "var(--chart-2)", label: "Category A Premium" },
          { color: "var(--chart-3)", label: "Category B Premium" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span
              className="size-2.5 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-muted text-xs">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
