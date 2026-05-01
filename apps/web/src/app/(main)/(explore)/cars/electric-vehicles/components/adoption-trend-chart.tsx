"use client";

import { Card, cn } from "@heroui/react";

import {
  CHART_CURSOR,
  CHART_GRID,
  CHART_HEIGHTS,
} from "@motormetrics/theme/charts";
import { EV_COLORS } from "@web/app/(main)/(explore)/cars/electric-vehicles/constants";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@web/components/charts/chart";
import Typography from "@web/components/typography";
import type { EvMonthlyTrend } from "@web/queries/cars/electric-vehicles";
import { Area, AreaChart, CartesianGrid, Legend, XAxis, YAxis } from "recharts";

interface AdoptionTrendChartProps {
  data: EvMonthlyTrend[];
}

const chartConfig = {
  BEV: { label: "BEV (Battery Electric)", color: EV_COLORS.BEV },
  PHEV: { label: "PHEV (Plug-In Hybrid)", color: EV_COLORS.PHEV },
  Hybrid: { label: "Hybrid (HEV)", color: EV_COLORS.Hybrid },
};

export function AdoptionTrendChart({ data }: AdoptionTrendChartProps) {
  const numberFormatter = new Intl.NumberFormat("en-SG");

  return (
    <Card>
      <Card.Header className="flex flex-col items-start gap-2">
        <Typography.H4>EV Adoption Trend</Typography.H4>
        <Typography.TextSm className="text-default-500">
          Monthly BEV, PHEV, and Hybrid registrations over time
        </Typography.TextSm>
      </Card.Header>
      <Card.Content>
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
              tickFormatter={(value) => numberFormatter.format(value)}
              width={60}
            />
            <ChartTooltip
              cursor={CHART_CURSOR.highlight}
              content={
                <ChartTooltipContent
                  formatter={(value) => numberFormatter.format(value as number)}
                />
              }
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="Hybrid"
              stackId="ev"
              fill={EV_COLORS.Hybrid}
              stroke={EV_COLORS.Hybrid}
              fillOpacity={0.4}
            />
            <Area
              type="monotone"
              dataKey="PHEV"
              stackId="ev"
              fill={EV_COLORS.PHEV}
              stroke={EV_COLORS.PHEV}
              fillOpacity={0.4}
            />
            <Area
              type="monotone"
              dataKey="BEV"
              stackId="ev"
              fill={EV_COLORS.BEV}
              stroke={EV_COLORS.BEV}
              fillOpacity={0.4}
            />
          </AreaChart>
        </ChartContainer>
      </Card.Content>
      <Card.Footer>
        <Typography.TextSm className="text-default-500">
          Stacked area chart showing combined electrified vehicle registrations.
          BEV = Battery Electric, PHEV = Plug-In Hybrid, Hybrid = Conventional
          Hybrid.
        </Typography.TextSm>
      </Card.Footer>
    </Card>
  );
}
