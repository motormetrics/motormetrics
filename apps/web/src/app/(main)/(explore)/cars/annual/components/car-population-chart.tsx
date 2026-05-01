"use client";

import { Card, cn } from "@heroui/react";

import { CHART_CURSOR, CHART_GRID } from "@motormetrics/theme/charts";
import { CARD_PADDING, RADIUS } from "@motormetrics/theme/spacing";
import { useEffectiveYear } from "@web/app/(main)/(explore)/cars/annual/hooks/use-effective-year";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@web/components/charts/chart";
import Typography from "@web/components/typography";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

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
      .slice(0, TOP_N);
  }, [data, effectiveYear]);

  const chartConfig = {
    total: { label: "Cars", color: "var(--chart-1)" },
  };

  return (
    <Card className={cn(RADIUS.card, CARD_PADDING.standard)}>
      <Card.Header className="flex flex-col items-start gap-2">
        <Typography.H4>
          Top {TOP_N} Makes ({effectiveYear})
        </Typography.H4>
        <Typography.TextSm className="text-default-500">
          Car population by manufacturer
        </Typography.TextSm>
      </Card.Header>
      <Card.Content>
        <ChartContainer config={chartConfig} className="h-[500px] w-full">
          <BarChart data={topMakes} layout="vertical">
            <CartesianGrid
              {...CHART_GRID.default}
              vertical={true}
              horizontal={false}
            />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => numberFormatter.format(value)}
            />
            <YAxis
              type="category"
              dataKey="make"
              tickLine={false}
              axisLine={false}
              width={120}
            />
            <ChartTooltip
              cursor={CHART_CURSOR.highlight}
              content={
                <ChartTooltipContent
                  formatter={(value) => numberFormatter.format(value as number)}
                />
              }
            />
            <Bar dataKey="total" radius={[0, 4, 4, 0]} fill="var(--chart-1)" />
          </BarChart>
        </ChartContainer>
      </Card.Content>
      <Card.Footer>
        <Typography.TextSm className="text-default-500">
          Showing top {TOP_N} makes by car population for {effectiveYear}.
        </Typography.TextSm>
      </Card.Footer>
    </Card>
  );
}
