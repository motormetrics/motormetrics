"use client";

import { Card, Text } from "@heroui/react";
import { AreaChart, ChartTooltip, NumberValue } from "@heroui-pro/react";

interface DailyTraffic {
  date: string;
  visitors: number;
  pageViews: number;
}

export function TrafficChartSection({ data }: { data: DailyTraffic[] }) {
  if (data.length === 0) {
    return null;
  }

  return (
    <section className="py-20 lg:py-28">
      <div className="flex flex-col gap-12">
        {/* Section header */}
        <div className="flex flex-col gap-4">
          <Text type="body-sm" weight="medium">
            Traffic Trend
          </Text>
          <Text type="h2">Daily visitors over the last 30 days</Text>
        </div>

        {/* Chart */}
        <Card>
          <Card.Header className="flex flex-col items-start gap-2">
            <Text type="h4">Daily Visitors</Text>
            <Text type="body-sm" color="muted">
              Unique visitors and page views per day
            </Text>
          </Card.Header>
          <Card.Content className="pt-2">
            <AreaChart
              data={data as unknown as Record<string, string | number>[]}
              height={300}
            >
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
              <AreaChart.Grid
                vertical={false}
                strokeDasharray="3 3"
                className="stroke-border"
              />
              <AreaChart.XAxis
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
              <AreaChart.YAxis tickLine={false} axisLine={false} />
              <AreaChart.Tooltip
                content={({ active, label, payload }) => {
                  if (!active || !payload?.length) return null;

                  const dateLabel = (() => {
                    if (typeof label !== "string") return label;

                    const date = new Date(label);
                    return date.toLocaleDateString("en-SG", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    });
                  })();

                  return (
                    <ChartTooltip>
                      <ChartTooltip.Header>{dateLabel}</ChartTooltip.Header>
                      {payload.map((entry) => (
                        <ChartTooltip.Item key={String(entry.dataKey)}>
                          <ChartTooltip.Indicator
                            color={entry.color ?? entry.stroke}
                          />
                          <ChartTooltip.Label>{entry.name}</ChartTooltip.Label>
                          <ChartTooltip.Value>
                            <NumberValue
                              locale="en-SG"
                              maximumFractionDigits={0}
                              value={Number(entry.value)}
                            />
                          </ChartTooltip.Value>
                        </ChartTooltip.Item>
                      ))}
                    </ChartTooltip>
                  );
                }}
              />
              <AreaChart.Area
                dataKey="visitors"
                type="monotone"
                fill="url(#fillVisitors)"
                stroke="var(--chart-1)"
                strokeWidth={2}
              />
            </AreaChart>
          </Card.Content>
        </Card>
      </div>
    </section>
  );
}
