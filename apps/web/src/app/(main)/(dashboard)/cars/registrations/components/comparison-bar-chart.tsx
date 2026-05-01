"use client";

import { Card } from "@heroui/react";
import { BarChart } from "@heroui-pro/react";

import { formatDateToMonthYear } from "@motormetrics/utils";
import Typography from "@web/components/typography";
import type { Registration } from "@web/types/cars";
import { formatNumber } from "@web/utils/charts";

interface ComparisonBarChartProps {
  monthA: Registration;
  monthB: Registration;
  type: "fuelType" | "vehicleType";
  title: string;
  description?: string;
}

export function ComparisonBarChart({
  monthA,
  monthB,
  type,
  title,
  description,
}: ComparisonBarChartProps) {
  const allCategories = Array.from(
    new Set([
      ...monthA[type].map((item) => item.name),
      ...monthB[type].map((item) => item.name),
    ]),
  );

  const chartData = allCategories.map((name) => ({
    name,
    monthA: monthA[type].find((item) => item.name === name)?.count ?? 0,
    monthB: monthB[type].find((item) => item.name === name)?.count ?? 0,
  }));

  const labelA = formatDateToMonthYear(monthA.month);
  const labelB = formatDateToMonthYear(monthB.month);

  const height = Math.max(200, allCategories.length * 56);

  return (
    <Card>
      <Card.Header className="flex flex-col items-start gap-2">
        <Typography.H4>{title}</Typography.H4>
        {description && <Typography.TextSm>{description}</Typography.TextSm>}
      </Card.Header>
      <Card.Content>
        <div className="flex flex-col gap-4">
          <BarChart data={chartData} height={height} layout="vertical">
            <BarChart.Grid
              horizontal={false}
              strokeDasharray="3 3"
              className="stroke-border"
            />
            <BarChart.XAxis
              type="number"
              tickFormatter={formatNumber}
              tickLine={false}
              axisLine={false}
            />
            <BarChart.YAxis
              type="category"
              dataKey="name"
              tickLine={false}
              axisLine={false}
              width={110}
            />
            <BarChart.Tooltip
              cursor={{ fill: "var(--muted)", opacity: 0.2 }}
              content={<BarChart.TooltipContent />}
            />
            <BarChart.Bar
              dataKey="monthA"
              name={labelA}
              fill="var(--chart-1)"
              radius={[0, 4, 4, 0]}
            />
            <BarChart.Bar
              dataKey="monthB"
              name={labelB}
              fill="var(--chart-3)"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
            {[
              { color: "var(--chart-1)", label: labelA },
              { color: "var(--chart-3)", label: labelB },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-muted text-xs">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </Card.Content>
    </Card>
  );
}
