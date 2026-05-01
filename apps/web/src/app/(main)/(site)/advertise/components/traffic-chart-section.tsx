"use client";

import { Card } from "@heroui/react";

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@web/components/charts/chart";
import Typography from "@web/components/typography";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

interface DailyTraffic {
  date: string;
  visitors: number;
  pageViews: number;
}

const chartConfig = {
  visitors: {
    label: "Visitors",
    color: "var(--chart-1)",
  },
  pageViews: {
    label: "Page Views",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function TrafficChartSection({ data }: { data: DailyTraffic[] }) {
  if (data.length === 0) {
    return null;
  }

  return (
    <section className="py-20 lg:py-28">
      <div className="flex flex-col gap-12">
        {/* Section header */}
        <div className="flex flex-col gap-4">
          <Typography.Label className="text-primary uppercase tracking-widest">
            Traffic Trend
          </Typography.Label>
          <Typography.H2 className="max-w-lg lg:text-4xl">
            Daily visitors over the last 30 days
          </Typography.H2>
        </div>

        {/* Chart */}
        <Card>
          <Card.Header className="flex flex-col items-start gap-2">
            <Typography.H4>Daily Visitors</Typography.H4>
            <Typography.TextSm className="text-default-600">
              Unique visitors and page views per day
            </Typography.TextSm>
          </Card.Header>
          <Card.Content className="pt-2">
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <AreaChart accessibilityLayer data={data}>
                <defs>
                  <linearGradient id="fillVisitors" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--chart-1)"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--chart-1)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  className="stroke-default-200"
                />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value: string) => {
                    const date = new Date(value);
                    return date.toLocaleDateString("en-SG", {
                      day: "numeric",
                      month: "short",
                    });
                  }}
                />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value: string) => {
                        const date = new Date(value);
                        return date.toLocaleDateString("en-SG", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        });
                      }}
                    />
                  }
                />
                <Area
                  dataKey="visitors"
                  type="monotone"
                  fill="url(#fillVisitors)"
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </Card.Content>
        </Card>
      </div>
    </section>
  );
}
