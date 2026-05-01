"use client";

import { Card, cn } from "@heroui/react";

import {
  CHART_CURSOR,
  CHART_GRID,
  CHART_HEIGHTS,
} from "@motormetrics/theme/charts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@web/components/charts/chart";
import Typography from "@web/components/typography";
import type { EvTopMake } from "@web/queries/cars/electric-vehicles";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";

interface TopMakesChartProps {
  data: EvTopMake[];
  month: string;
}

const chartConfig = {
  count: { label: "Registrations", color: "var(--chart-1)" },
};

export function TopMakesChart({ data, month }: TopMakesChartProps) {
  const numberFormatter = new Intl.NumberFormat("en-SG");

  return (
    <Card>
      <Card.Header className="flex flex-col items-start gap-2">
        <Typography.H4>Top EV Makes</Typography.H4>
        <Typography.TextSm className="text-default-500">
          Top 10 electrified vehicle makes for {month}
        </Typography.TextSm>
      </Card.Header>
      <Card.Content>
        <ChartContainer
          config={chartConfig}
          className={cn(CHART_HEIGHTS.tall, "w-full")}
        >
          <BarChart data={data} layout="vertical">
            <CartesianGrid {...CHART_GRID.default} horizontal={false} />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => numberFormatter.format(value)}
            />
            <YAxis
              type="category"
              dataKey="make"
              tickLine={false}
              axisLine={false}
              width={100}
            />
            <ChartTooltip
              cursor={CHART_CURSOR.highlight}
              content={
                <ChartTooltipContent
                  formatter={(value) => numberFormatter.format(value as number)}
                />
              }
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={entry.make}
                  fill={`var(--chart-${Math.min(index + 1, 6)})`}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </Card.Content>
      <Card.Footer>
        <Typography.TextSm className="text-default-500">
          Includes BEV, PHEV, and hybrid registrations combined.
        </Typography.TextSm>
      </Card.Footer>
    </Card>
  );
}
