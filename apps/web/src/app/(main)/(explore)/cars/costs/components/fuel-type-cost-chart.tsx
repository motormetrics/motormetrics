"use client";

import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { cn } from "@heroui/theme";
import type { SelectCarCost } from "@motormetrics/database";
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
import { formatCurrency } from "@motormetrics/utils";
import {
  FUEL_TYPE_LABELS,
  FUEL_TYPE_ORDER,
} from "@web/app/(main)/(explore)/cars/costs/constants";
import Typography from "@web/components/typography";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";

interface FuelTypeCostChartProps {
  data: SelectCarCost[];
}

const chartConfig = {
  avgCost: { label: "Avg Selling Price (w/ COE)", color: "var(--chart-1)" },
};

export function FuelTypeCostChart({ data }: FuelTypeCostChartProps) {
  const grouped = new Map<string, number[]>();
  for (const item of data) {
    if (!item.fuelType || item.sellingPriceWithCoe === 0) continue;
    const costs = grouped.get(item.fuelType) ?? [];
    costs.push(item.sellingPriceWithCoe);
    grouped.set(item.fuelType, costs);
  }

  const chartData = FUEL_TYPE_ORDER.filter((fuelType) =>
    grouped.has(fuelType),
  ).map((fuelType) => {
    const costs = grouped.get(fuelType)!;
    const average = costs.reduce((sum, cost) => sum + cost, 0) / costs.length;
    return {
      fuelType: FUEL_TYPE_LABELS[fuelType] ?? fuelType,
      avgCost: Math.round(average),
    };
  });

  return (
    <Card className={cn(RADIUS.card, CARD_PADDING.standard)}>
      <CardHeader className="flex flex-col items-start gap-2">
        <Typography.H4>Avg Selling Price by Fuel Type</Typography.H4>
        <Typography.TextSm className="text-default-500">
          Average AD selling price (with COE) by fuel type
        </Typography.TextSm>
      </CardHeader>
      <CardBody>
        <ChartContainer
          config={chartConfig}
          className={cn(CHART_HEIGHTS.tall, "w-full")}
        >
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid {...CHART_GRID.default} horizontal={false} />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatCurrency(value)}
            />
            <YAxis
              type="category"
              dataKey="fuelType"
              tickLine={false}
              axisLine={false}
              width={160}
            />
            <ChartTooltip
              cursor={CHART_CURSOR.highlight}
              content={
                <ChartTooltipContent
                  formatter={(value) => formatCurrency(value as number)}
                />
              }
            />
            <Bar dataKey="avgCost" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={entry.fuelType}
                  fill={`var(--chart-${Math.min(index + 1, 6)})`}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardBody>
      <CardFooter>
        <Typography.TextSm className="text-default-500">
          Electric vehicles tend to have lower total costs due to VES rebates.
        </Typography.TextSm>
      </CardFooter>
    </Card>
  );
}
