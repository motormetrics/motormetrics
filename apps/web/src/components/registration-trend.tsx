"use client";

import { Card, CardBody, CardHeader } from "@heroui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@motormetrics/ui/components/chart";
import Typography from "@web/components/typography";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

interface YearTotal {
  year: number;
  total: number;
}

interface RegistrationTrendProps {
  data: YearTotal[];
}

export function RegistrationTrend({ data }: RegistrationTrendProps) {
  const chartConfig = {
    total: {
      label: "Total",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;

  return (
    <Card className="rounded-2xl p-3">
      <CardHeader className="flex flex-col items-start gap-2 pb-4">
        <Typography.H4>Yearly Registration Trend</Typography.H4>
        <Typography.TextSm className="text-default-600">
          Historical vehicle registration data from {data[0]?.year} to{" "}
          {data[data.length - 1]?.year}
        </Typography.TextSm>
      </CardHeader>
      <CardBody className="pt-2">
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <LineChart accessibilityLayer data={data}>
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              className="stroke-default-200"
            />
            <XAxis dataKey="year" tickLine={false} axisLine={false} />
            <YAxis
              dataKey="total"
              type="number"
              tickLine={false}
              axisLine={false}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Line
              dataKey="total"
              fill="var(--chart-1)"
              stroke="var(--chart-1)"
            />
          </LineChart>
        </ChartContainer>
      </CardBody>
    </Card>
  );
}
