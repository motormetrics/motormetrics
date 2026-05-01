"use client";

import { Card } from "@heroui/react";
import { BarChart } from "@heroui-pro/react";

import type { SelectCarCost } from "@motormetrics/database";
import { formatCurrency } from "@motormetrics/utils";
import {
  FUEL_TYPE_LABELS,
  FUEL_TYPE_ORDER,
} from "@web/app/(main)/(dashboard)/cars/costs/constants";
import Typography from "@web/components/typography";

interface FuelTypeCostChartProps {
  data: SelectCarCost[];
}

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
    const costs = grouped.get(fuelType) ?? [];
    const average = costs.reduce((sum, cost) => sum + cost, 0) / costs.length;
    return {
      fuelType: FUEL_TYPE_LABELS[fuelType] ?? fuelType,
      avgCost: Math.round(average),
    };
  });

  return (
    <Card>
      <Card.Header className="flex flex-col items-start gap-2">
        <Typography.H4>Avg Selling Price by Fuel Type</Typography.H4>
        <Typography.TextSm className="text-muted">
          Average AD selling price (with COE) by fuel type
        </Typography.TextSm>
      </Card.Header>
      <Card.Content>
        <BarChart data={chartData} height={400} layout="vertical">
          <BarChart.Grid
            strokeDasharray="3 3"
            strokeOpacity={0.15}
            horizontal={false}
          />
          <BarChart.XAxis
            type="number"
            tickLine={false}
            axisLine={false}
            tickFormatter={(value: number) => formatCurrency(value)}
          />
          <BarChart.YAxis
            type="category"
            dataKey="fuelType"
            tickLine={false}
            axisLine={false}
            width={160}
          />
          <BarChart.Tooltip
            cursor={{ fill: "var(--muted)", opacity: 0.2 }}
            content={
              <BarChart.TooltipContent
                valueFormatter={(value) => formatCurrency(value as number)}
              />
            }
          />
          <BarChart.Bar
            dataKey="avgCost"
            fill="var(--chart-1)"
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </Card.Content>
      <Card.Footer>
        <Typography.TextSm className="text-muted">
          Electric vehicles tend to have lower total costs due to VES rebates.
        </Typography.TextSm>
      </Card.Footer>
    </Card>
  );
}
