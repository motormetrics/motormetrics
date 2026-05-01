"use client";

import { Card } from "@heroui/react";
import { AreaChart } from "@heroui-pro/react";
import Typography from "@web/components/typography";
import type { EvMarketShare } from "@web/queries/cars/electric-vehicles";

interface MarketShareChartProps {
  data: EvMarketShare[];
}

export function MarketShareChart({ data }: MarketShareChartProps) {
  const chartData = data.map((item) => ({ ...item }));

  return (
    <Card>
      <Card.Header className="flex flex-col items-start gap-2">
        <Typography.H4>EV Market Share</Typography.H4>
        <Typography.TextSm className="text-muted">
          Percentage of electrified vehicles among all new registrations
        </Typography.TextSm>
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
        <Typography.TextSm className="text-muted">
          Includes BEV, PHEV, and conventional hybrid vehicles as a share of
          total new registrations each month.
        </Typography.TextSm>
      </Card.Footer>
    </Card>
  );
}
