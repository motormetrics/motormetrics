"use client";

import { Card, CardBody, CardHeader } from "@heroui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@motormetrics/ui/components/chart";
import Typography from "@web/components/typography";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";

interface TopMake {
  make: string;
  value: number;
}

interface TopMakesChartProps {
  topMakes: TopMake[];
  year: number;
}

export function TopMakesChart({ topMakes, year }: TopMakesChartProps) {
  const data = [...topMakes].sort((a, b) => b.value - a.value);
  const chartConfig = Object.fromEntries(
    data.map(({ make }, index) => [
      make,
      {
        label: make,
        color: `var(--chart-${index + 1})`,
      },
    ]),
  ) as ChartConfig;

  return (
    <Card className="rounded-2xl p-3">
      <CardHeader className="flex flex-col items-start gap-2 pb-4">
        <Typography.H4>
          Top {topMakes.length} Car Makes ({year})
        </Typography.H4>
        <Typography.TextSm className="text-default-600">
          Most popular vehicle brands by registration volume
        </Typography.TextSm>
      </CardHeader>
      <CardBody className="pt-2">
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart data={data} layout="vertical">
            <CartesianGrid
              horizontal={false}
              strokeDasharray="3 3"
              className="stroke-default-200"
            />
            <XAxis type="number" tickLine={false} axisLine={false} />
            <YAxis
              dataKey="make"
              type="category"
              tickLine={false}
              tickMargin={8}
              axisLine={false}
              hide
            />
            <ChartTooltip
              cursor={{ fill: "hsl(var(--muted))", opacity: 0.2 }}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Bar dataKey="value" radius={4}>
              {data.map((_, index) => (
                <Cell
                  key={
                    // biome-ignore lint/suspicious/noArrayIndexKey: Recharts Cell requires index-based keys
                    `cell-${index}`
                  }
                  fill={`var(--chart-${index + 1})`}
                />
              ))}
              <LabelList
                dataKey="make"
                position="insideLeft"
                offset={8}
                className="fill-background"
              />
              <LabelList
                dataKey="value"
                position="right"
                className="fill-foreground"
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardBody>
    </Card>
  );
}
