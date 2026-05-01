"use client";

import { LineChart } from "@heroui-pro/react";
import Typography from "@web/components/typography";

interface MakeTrendChartProps {
  data: Array<{
    month: string;
    count?: number;
    number?: number;
  }>;
}

export function MakeTrendChart({ data }: MakeTrendChartProps) {
  const monthlyTotals: { [key: string]: number } = {};
  for (const item of data) {
    const month = item.month;
    const count = item.count ?? item.number ?? 0;
    if (monthlyTotals[month]) {
      monthlyTotals[month] += count;
    } else {
      monthlyTotals[month] = count;
    }
  }

  const chartData = Object.entries(monthlyTotals).map(([month, count]) => ({
    month,
    count,
  }));

  const totalRegistrations = chartData.reduce(
    (sum, item) => sum + item.count,
    0,
  );
  const peakMonth = chartData.reduce(
    (max, item) => (item.count > max.count ? item : max),
    chartData[0] || {
      month: "N/A",
      count: 0,
    },
  );

  return (
    <div className="flex flex-col gap-4">
      <LineChart
        data={chartData}
        height={300}
        aria-label={`Monthly registration trend chart showing ${chartData.length} months of data with ${chartData.reduce((sum, item) => sum + item.count, 0)} total registrations`}
      >
        <LineChart.Grid
          vertical={false}
          strokeDasharray="3 3"
          className="stroke-border"
        />
        <LineChart.XAxis dataKey="month" tickMargin={8} />
        <LineChart.Tooltip
          cursor={false}
          content={<LineChart.TooltipContent indicator="line" />}
        />
        <LineChart.Line
          dataKey="count"
          type="monotone"
          dot={false}
          fill="var(--chart-1)"
          stroke="var(--chart-1)"
          strokeWidth={2}
        />
      </LineChart>
      <div className="flex flex-col gap-4">
        <div>
          <Typography.H4>Registration Trends</Typography.H4>
          <Typography.TextSm>
            This chart shows monthly registration trends over time.
            {peakMonth &&
              `Peak registrations occurred in ${peakMonth.month} with ${peakMonth.count.toLocaleString()} vehicles`}
            , helping identify seasonal patterns and market performance.
          </Typography.TextSm>
        </div>
        <div className="grid grid-cols-1 gap-4 rounded-lg bg-surface/30 p-4 sm:grid-cols-3">
          <div className="text-center">
            <Typography.TextLg>{peakMonth?.month || "N/A"}</Typography.TextLg>
            <Typography.Caption>Peak Month</Typography.Caption>
          </div>
          <div className="text-center">
            <Typography.TextLg>
              {totalRegistrations.toLocaleString()}
            </Typography.TextLg>
            <Typography.Caption>Total Period</Typography.Caption>
          </div>
          <div className="text-center">
            <Typography.TextLg>{chartData.length}</Typography.TextLg>
            <Typography.Caption>Months Tracked</Typography.Caption>
          </div>
        </div>
      </div>
    </div>
  );
}
