"use client";

import { Card, cn } from "@heroui/react";

import { CHART_HEIGHTS } from "@motormetrics/theme/charts";
import { CARD_PADDING, RADIUS } from "@motormetrics/theme/spacing";
import {
  FUEL_GROUP_COLORS,
  FUEL_GROUP_MAP,
  FUEL_GROUPS,
} from "@web/app/(main)/(explore)/cars/annual/constants";
import { useEffectiveYear } from "@web/app/(main)/(explore)/cars/annual/hooks/use-effective-year";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@web/components/charts/chart";
import Typography from "@web/components/typography";
import { useMemo } from "react";
import { Cell, Pie, PieChart } from "recharts";

interface FuelTypeData {
  year: string;
  fuelType: string;
  total: number;
}

interface FuelTypeBreakdownProps {
  data: FuelTypeData[];
}

export function FuelTypeBreakdown({ data }: FuelTypeBreakdownProps) {
  const availableYears = useMemo(
    () =>
      [...new Set(data.map((item) => Number(item.year)))].sort((a, b) => b - a),
    [data],
  );
  const effectiveYear = useEffectiveYear(availableYears);
  const numberFormatter = new Intl.NumberFormat("en-SG");

  const groupedData = useMemo(() => {
    const yearData = data.filter((item) => Number(item.year) === effectiveYear);
    const groups = new Map<string, number>();

    for (const record of yearData) {
      const group = FUEL_GROUP_MAP[record.fuelType] ?? "Others";
      groups.set(group, (groups.get(group) ?? 0) + record.total);
    }

    const total = Array.from(groups.values()).reduce(
      (sum, val) => sum + val,
      0,
    );

    return FUEL_GROUPS.filter((group) => (groups.get(group) ?? 0) > 0).map(
      (group) => ({
        name: group,
        value: groups.get(group) ?? 0,
        percentage: total > 0 ? ((groups.get(group) ?? 0) / total) * 100 : 0,
      }),
    );
  }, [data, effectiveYear]);

  const chartConfig = Object.fromEntries(
    FUEL_GROUPS.map((group) => [
      group,
      { label: group, color: FUEL_GROUP_COLORS[group] },
    ]),
  );

  return (
    <Card className={cn(RADIUS.card, CARD_PADDING.standard)}>
      <Card.Header className="flex flex-col items-start gap-2">
        <Typography.H4>Fuel Type Mix ({effectiveYear})</Typography.H4>
        <Typography.TextSm className="text-default-500">
          Distribution of vehicles by fuel type
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
                <ChartTooltipContent
                  formatter={(value) => numberFormatter.format(value as number)}
                />
              }
            />
            <Pie
              data={groupedData}
              dataKey="value"
              nameKey="name"
              innerRadius={80}
              outerRadius={140}
              paddingAngle={2}
              label={({ name, percent }) =>
                `${name} ${((percent ?? 0) * 100).toFixed(1)}%`
              }
            >
              {groupedData.map((entry) => (
                <Cell key={entry.name} fill={FUEL_GROUP_COLORS[entry.name]} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </Card.Content>
    </Card>
  );
}
