"use client";

import { Card, Typography } from "@heroui/react";
import { LineChart } from "@heroui-pro/react/line-chart";

interface YearTotal {
  year: number;
  total: number;
}

interface RegistrationTrendProps {
  data: YearTotal[];
}

export function RegistrationTrend({ data }: RegistrationTrendProps) {
  const chartData: Record<string, string | number>[] = data.map((item) => ({
    ...item,
  }));

  return (
    <Card>
      <Card.Header className="flex flex-col items-start gap-2">
        <Typography.Heading level={4}>
          Yearly Registration Trend
        </Typography.Heading>
        <Typography.Paragraph color="muted" size="sm">
          Historical vehicle registration data from {data[0]?.year} to{" "}
          {data[data.length - 1]?.year}
        </Typography.Paragraph>
      </Card.Header>
      <Card.Content className="pt-2">
        <LineChart data={chartData} height={300} width="100%">
          <LineChart.Grid vertical={false} strokeDasharray="3 3" />
          <LineChart.XAxis dataKey="year" />
          <LineChart.YAxis dataKey="total" type="number" />
          <LineChart.Tooltip
            cursor={false}
            content={<LineChart.TooltipContent indicator="line" />}
          />
          <LineChart.Line
            dataKey="total"
            name="Total"
            fill="var(--chart-1)"
            stroke="var(--chart-1)"
          />
        </LineChart>
      </Card.Content>
    </Card>
  );
}
