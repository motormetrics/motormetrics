"use client";

import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { cn } from "@heroui/theme";
import {
  CHART_CURSOR,
  CHART_GRID,
  CHART_HEIGHTS,
} from "@motormetrics/theme/charts";
import { CARD_PADDING, RADIUS } from "@motormetrics/theme/spacing";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@motormetrics/ui/components/chart";
import Typography from "@web/components/typography";
import type { EvMarketShare } from "@web/queries/cars/electric-vehicles";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

interface MarketShareChartProps {
  data: EvMarketShare[];
}

const chartConfig = {
  evShare: { label: "EV Market Share (%)", color: "var(--chart-1)" },
};

export function MarketShareChart({ data }: MarketShareChartProps) {
  return (
    <Card className={cn(RADIUS.card, CARD_PADDING.standard)}>
      <CardHeader className="flex flex-col items-start gap-2">
        <Typography.H4>EV Market Share</Typography.H4>
        <Typography.TextSm className="text-default-500">
          Percentage of electrified vehicles among all new registrations
        </Typography.TextSm>
      </CardHeader>
      <CardBody>
        <ChartContainer
          config={chartConfig}
          className={cn(CHART_HEIGHTS.tall, "w-full")}
        >
          <AreaChart data={data}>
            <CartesianGrid {...CHART_GRID.default} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => {
                const [year, month] = value.split("-");
                return `${month}/${year.slice(2)}`;
              }}
              interval="preserveStartEnd"
              minTickGap={40}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value.toFixed(0)}%`}
              width={50}
            />
            <ChartTooltip
              cursor={CHART_CURSOR.highlight}
              content={
                <ChartTooltipContent
                  formatter={(value) => `${(value as number).toFixed(1)}%`}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="evShare"
              fill="var(--chart-1)"
              stroke="var(--chart-1)"
              fillOpacity={0.3}
            />
          </AreaChart>
        </ChartContainer>
      </CardBody>
      <CardFooter>
        <Typography.TextSm className="text-default-500">
          Includes BEV, PHEV, and conventional hybrid vehicles as a share of
          total new registrations each month.
        </Typography.TextSm>
      </CardFooter>
    </Card>
  );
}
