"use client";

import { Card } from "@heroui/react";
import { BarChart } from "@heroui-pro/react";
import Typography from "@web/components/typography";
import type { EvTopMake } from "@web/queries/cars/electric-vehicles";

interface TopMakesChartProps {
  data: EvTopMake[];
  month: string;
}

export function TopMakesChart({ data, month }: TopMakesChartProps) {
  const numberFormatter = new Intl.NumberFormat("en-SG");
  const chartData = data.map((item) => ({ ...item }));

  return (
    <Card>
      <Card.Header className="flex flex-col items-start gap-2">
        <Typography.H4>Top EV Makes</Typography.H4>
        <Typography.TextSm className="text-muted">
          Top 10 electrified vehicle makes for {month}
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
            tickFormatter={(value: number) => numberFormatter.format(value)}
          />
          <BarChart.YAxis
            type="category"
            dataKey="make"
            tickLine={false}
            axisLine={false}
            width={100}
          />
          <BarChart.Tooltip
            cursor={{ fill: "var(--muted)", opacity: 0.2 }}
            content={
              <BarChart.TooltipContent
                valueFormatter={(value) =>
                  numberFormatter.format(value as number)
                }
              />
            }
          />
          <BarChart.Bar
            dataKey="count"
            fill="var(--chart-1)"
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </Card.Content>
      <Card.Footer>
        <Typography.TextSm className="text-muted">
          Includes BEV, PHEV, and hybrid registrations combined.
        </Typography.TextSm>
      </Card.Footer>
    </Card>
  );
}
