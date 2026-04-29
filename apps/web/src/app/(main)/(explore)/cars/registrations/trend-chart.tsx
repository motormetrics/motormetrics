"use client";

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@motormetrics/ui/components/chart";
import { Bar, BarChart, Cell, LabelList, XAxis, YAxis } from "recharts";

interface MakeData {
  make: string;
  count: number;
}

interface TrendChartProps {
  data: MakeData[];
}

export const TrendChart = ({ data }: TrendChartProps) => {
  const chartData = data.slice(0, 10);
  const totalRegistrations = chartData.reduce(
    (sum, item) => sum + item.count,
    0,
  );
  const topMake = chartData[0];

  const chartConfig = {
    count: {
      label: "Count",
    },
    label: { color: "var(--background)" },
  } satisfies ChartConfig;

  return (
    <div className="flex flex-col gap-4">
      <ChartContainer config={chartConfig} className="h-[250px] w-full">
        <BarChart
          accessibilityLayer
          data={chartData}
          layout="vertical"
          aria-label={`Top ${chartData.length} car makes by registration count, showing ${chartData[0]?.make || "most popular"} leading with ${chartData[0]?.count || 0} registrations`}
        >
          <XAxis type="number" dataKey="count" hide />
          <YAxis
            dataKey="make"
            type="category"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            hide
          />
          <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
          <Bar dataKey="count" radius={4}>
            {chartData.map((_, index) => (
              <Cell
                key={
                  // biome-ignore lint/suspicious/noArrayIndexKey: Recharts Cell requires index-based keys
                  `cell-${index}`
                }
                fill={`var(--chart-${index + 1})`}
              />
            ))}
            <LabelList
              dataKey="make"
              position="insideLeft"
              offset={8}
              className="fill-(--color-label)"
              fontSize={12}
            />
            <LabelList
              dataKey="count"
              position="right"
              offset={8}
              className="fill-foreground"
              fontSize={12}
            />
          </Bar>
        </BarChart>
      </ChartContainer>
      <div className="flex flex-col gap-4">
        <div className="text-muted-foreground text-sm">
          <h4 className="mb-2 font-semibold text-foreground">Market Leaders</h4>
          <p>
            This chart shows the top 10 car makes by registration count.
            {topMake &&
              `${topMake.make} leads with ${topMake.count.toLocaleString()} registrations`}
            , representing the most popular vehicle brands among Singapore
            consumers.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 rounded-lg bg-muted/30 p-4 sm:grid-cols-3">
          <div className="text-center">
            <div className="font-semibold text-foreground text-lg">
              {topMake?.make || "N/A"}
            </div>
            <div className="text-muted-foreground text-xs">Top Make</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-foreground text-lg">
              {totalRegistrations.toLocaleString()}
            </div>
            <div className="text-muted-foreground text-xs">Total Shown</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-foreground text-lg">
              {chartData.length}
            </div>
            <div className="text-muted-foreground text-xs">Makes Displayed</div>
          </div>
        </div>
      </div>
    </div>
  );
};
