"use client";

import { Card, Text } from "@heroui/react";
import { BarChart } from "@heroui-pro/react";

interface TopMake {
  make: string;
  value: number;
}

interface TopMakesChartProps {
  topMakes: TopMake[];
  year: number;
}

export function TopMakesChart({ topMakes, year }: TopMakesChartProps) {
  const data: Record<string, string | number>[] = [...topMakes]
    .sort((a, b) => b.value - a.value)
    .map(({ make, value }) => ({ make, value }));

  return (
    <Card>
      <Card.Header className="flex flex-col items-start gap-2">
        <Text type="h4">
          Top {topMakes.length} Car Makes ({year})
        </Text>
        <Text type="body-sm" color="muted">
          Most popular vehicle brands by registration volume
        </Text>
      </Card.Header>
      <Card.Content className="pt-2">
        <BarChart data={data} height={300} width="100%" layout="vertical">
          <BarChart.Grid horizontal={false} strokeDasharray="3 3" />
          <BarChart.XAxis type="number" />
          <BarChart.YAxis
            dataKey="make"
            type="category"
            tickMargin={8}
            width={120}
          />
          <BarChart.Tooltip
            cursor={{ fill: "var(--muted)", opacity: 0.2 }}
            content={<BarChart.TooltipContent indicator="line" />}
          />
          <BarChart.Bar
            dataKey="value"
            fill="var(--chart-1)"
            label={{
              dataKey: "value",
              fill: "var(--foreground)",
              position: "right",
            }}
            name="Registrations"
            radius={4}
          />
        </BarChart>
      </Card.Content>
    </Card>
  );
}
