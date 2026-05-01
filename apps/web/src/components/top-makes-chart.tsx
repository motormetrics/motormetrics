"use client";

import { Card } from "@heroui/react";
import { BarChart } from "@heroui-pro/react";

import Typography from "@web/components/typography";

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
        <Typography.H4>
          Top {topMakes.length} Car Makes ({year})
        </Typography.H4>
        <Typography.TextSm className="text-muted">
          Most popular vehicle brands by registration volume
        </Typography.TextSm>
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
