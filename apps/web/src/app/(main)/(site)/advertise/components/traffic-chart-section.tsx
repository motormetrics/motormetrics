"use client";

import { AreaChart, ChartTooltip, NumberValue } from "@heroui-pro/react";
import Typography from "@web/components/typography";

interface DailyTraffic {
  date: string;
  visitors: number;
  pageViews: number;
}

/**
 * The comp has no chart here, but the figures above it are real and this is
 * where they came from, so it stays — restyled to the comp's bare treatment:
 * a heading, a caption and the plot straight on the page, with no card.
 */
export function TrafficChartSection({ data }: { data: DailyTraffic[] }) {
  if (data.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline gap-4">
        <Typography.H2>Daily visitors</Typography.H2>
        <Typography.Text>
          Last 30 days · unique visitors per day
        </Typography.Text>
      </div>
      <AreaChart
        data={data as unknown as Record<string, string | number>[]}
        height={300}
      >
        <defs>
          <linearGradient id="fillVisitors" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <AreaChart.Grid
          vertical={false}
          strokeDasharray="3 3"
          className="stroke-chart-grid"
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
    </section>
  );
}
