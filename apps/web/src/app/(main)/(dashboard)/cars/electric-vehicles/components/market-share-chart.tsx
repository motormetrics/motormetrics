"use client";

import { Card, Text } from "@heroui/react";
import { AreaChart } from "@heroui-pro/react";
import type { EvMarketShare } from "@web/queries/cars/electric-vehicles";

interface MarketShareChartProps {
  data: EvMarketShare[];
}

export function MarketShareChart({ data }: MarketShareChartProps) {
  const chartData = data.map((item) => ({ ...item }));

  return (
    <Card>
      <Card.Header className="flex flex-col items-start gap-2">
        <Text type="h4">EV Market Share</Text>
        <Text type="body-sm" color="muted">
          Percentage of electrified vehicles among all new registrations
        </Text>
      </Card.Header>
      <Card.Content>
        <AreaChart data={chartData} height={400}>
          <AreaChart.Grid strokeDasharray="3 3" strokeOpacity={0.15} />
          <AreaChart.XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value: string) => {
              const [year, month] = value.split("-");
              return `${month}/${year.slice(2)}`;
            }}
            interval="preserveStartEnd"
            minTickGap={40}
          />
          <AreaChart.YAxis
            tickLine={false}
            axisLine={false}
            tickFormatter={(value: number) => `${value.toFixed(0)}%`}
            width={50}
          />
          <AreaChart.Tooltip
            cursor={{ fill: "var(--muted)", opacity: 0.2 }}
            content={
              <AreaChart.TooltipContent
                valueFormatter={(value) => `${(value as number).toFixed(1)}%`}
              />
            }
          />
          <AreaChart.Area
            type="monotone"
            dataKey="evShare"
            fill="var(--chart-1)"
            stroke="var(--chart-1)"
            fillOpacity={0.3}
          />
        </AreaChart>
      </Card.Content>
      <Card.Footer>
        <Text type="body-sm" color="muted">
          Includes BEV, PHEV, and conventional hybrid vehicles as a share of
          total new registrations each month.
        </Text>
      </Card.Footer>
    </Card>
  );
}
