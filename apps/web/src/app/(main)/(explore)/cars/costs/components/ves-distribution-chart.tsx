"use client";

import { Card, cn } from "@heroui/react";

import type { SelectCarCost } from "@motormetrics/database";
import { CHART_HEIGHTS } from "@motormetrics/theme/charts";
import { VES_BAND_ORDER } from "@web/app/(main)/(explore)/cars/costs/constants";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@web/components/charts/chart";
import Typography from "@web/components/typography";
import { Cell, Pie, PieChart } from "recharts";

interface VesDistributionChartProps {
  data: SelectCarCost[];
}

const VES_BAND_COLORS: Record<string, string> = {
  A: "var(--chart-1)",
  B: "var(--chart-2)",
  C1: "var(--chart-3)",
  C2: "var(--chart-4)",
  C3: "var(--chart-5)",
};

export function VesDistributionChart({ data }: VesDistributionChartProps) {
  const counts = new Map<string, number>();
  for (const item of data) {
    counts.set(item.vesBanding, (counts.get(item.vesBanding) ?? 0) + 1);
  }

  const chartData = VES_BAND_ORDER.filter((band) => counts.has(band)).map(
    (band) => ({
      name: `Band ${band}`,
      band,
      value: counts.get(band) ?? 0,
    }),
  );

  const chartConfig = Object.fromEntries(
    VES_BAND_ORDER.map((band) => [
      `Band ${band}`,
      { label: `Band ${band}`, color: VES_BAND_COLORS[band] },
    ]),
  );

  return (
    <Card>
      <Card.Header className="flex flex-col items-start gap-2">
        <Typography.H4>VES Band Distribution</Typography.H4>
        <Typography.TextSm className="text-default-500">
          Number of models per VES band
        </Typography.TextSm>
      </Card.Header>
      <Card.Content>
        <ChartContainer
          config={chartConfig}
          className={cn("mx-auto", CHART_HEIGHTS.standard)}
        >
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent formatter={(value) => `${value} models`} />
              }
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={80}
              outerRadius={140}
              paddingAngle={2}
              label={({ name, percent }) =>
                `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
              }
            >
              {chartData.map((entry) => (
                <Cell key={entry.band} fill={VES_BAND_COLORS[entry.band]} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </Card.Content>
    </Card>
  );
}
