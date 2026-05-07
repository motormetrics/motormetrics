"use client";

import { BarChart, NumberValue } from "@heroui-pro/react";

interface MakeData {
  make: string;
  count: number;
}

interface TrendChartProps {
  data: MakeData[];
}

export const TrendChart = ({ data }: TrendChartProps) => {
  const chartData = data.slice(0, 10);
  const chartRecords = chartData.map((item) => ({ ...item }));
  const totalRegistrations = chartData.reduce(
    (sum, item) => sum + item.count,
    0,
  );
  const topMake = chartData[0];

  return (
    <div className="flex flex-col gap-4">
      <BarChart
        data={chartRecords}
        height={250}
        layout="vertical"
        aria-label={`Top ${chartData.length} car makes by registration count, showing ${chartData[0]?.make || "most popular"} leading with ${chartData[0]?.count || 0} registrations`}
      >
        <BarChart.XAxis type="number" dataKey="count" hide />
        <BarChart.YAxis
          dataKey="make"
          type="category"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          width={120}
        />
        <BarChart.Tooltip
          content={<BarChart.TooltipContent indicator="line" />}
        />
        <BarChart.Bar
          dataKey="count"
          fill="var(--chart-1)"
          label={{
            dataKey: "count",
            fill: "var(--foreground)",
            fontSize: 12,
            offset: 8,
            position: "right",
          }}
          radius={4}
        />
      </BarChart>
      <div className="flex flex-col gap-4">
        <div className="text-muted text-sm">
          <h4 className="mb-2 font-semibold text-foreground">Market Leaders</h4>
          <p>
            This chart shows the top 10 car makes by registration count.
            {topMake ? (
              <>
                {topMake.make} leads with{" "}
                <NumberValue
                  locale="en-SG"
                  maximumFractionDigits={0}
                  value={topMake.count}
                />{" "}
                registrations
              </>
            ) : null}
            , representing the most popular vehicle brands among Singapore
            consumers.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 rounded-lg bg-surface/30 p-4 sm:grid-cols-3">
          <div className="text-center">
            <div className="font-semibold text-foreground text-lg">
              {topMake?.make || "N/A"}
            </div>
            <div className="text-muted text-xs">Top Make</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-foreground text-lg">
              <NumberValue
                locale="en-SG"
                maximumFractionDigits={0}
                value={totalRegistrations}
              />
            </div>
            <div className="text-muted text-xs">Total Shown</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-foreground text-lg">
              <NumberValue
                locale="en-SG"
                maximumFractionDigits={0}
                value={chartData.length}
              />
            </div>
            <div className="text-muted text-xs">Makes Displayed</div>
          </div>
        </div>
      </div>
    </div>
  );
};
