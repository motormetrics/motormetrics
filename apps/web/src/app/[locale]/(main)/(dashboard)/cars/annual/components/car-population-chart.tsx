"use client";

import { Card } from "@heroui/react";
import { BarChart } from "@heroui-pro/react";

import { useEffectiveYear } from "@web/app/[locale]/(main)/(dashboard)/cars/annual/hooks/use-effective-year";
import Typography from "@web/components/typography";
import { useMemo } from "react";

const TOP_N = 15;

interface MakeData {
  year: string;
  make: string;
  total: number;
}

interface CarPopulationChartProps {
  data: MakeData[];
  availableYears: { year: string }[];
}

export function CarPopulationChart({
  data,
  availableYears,
}: CarPopulationChartProps) {
  const effectiveYear = useEffectiveYear(
    availableYears.map((item) => Number(item.year)),
  );
  const numberFormatter = new Intl.NumberFormat("en-SG");

  const topMakes = useMemo(() => {
    return data
      .filter((item) => Number(item.year) === effectiveYear)
      .sort((a, b) => b.total - a.total)
      .map((item) => ({ ...item }))
      .slice(0, TOP_N);
  }, [data, effectiveYear]);

  return (
    <Card>
      <Card.Header className="flex flex-col items-start gap-2">
        <Typography.H4>
          Top {TOP_N} Makes ({effectiveYear})
        </Typography.H4>
        <Typography.TextSm className="text-muted">
          Car population by manufacturer
        </Typography.TextSm>
      </Card.Header>
      <Card.Content>
        <BarChart data={topMakes} height={500} layout="vertical">
          <BarChart.Grid
            strokeDasharray="3 3"
            strokeOpacity={0.15}
            vertical={true}
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
            width={120}
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
            dataKey="total"
            radius={[0, 4, 4, 0]}
            fill="var(--chart-1)"
          />
        </BarChart>
      </Card.Content>
      <Card.Footer>
        <Typography.TextSm className="text-muted">
          Showing top {TOP_N} makes by car population for {effectiveYear}.
        </Typography.TextSm>
      </Card.Footer>
    </Card>
  );
}
