"use client";

import { Card, cn } from "@heroui/react";

import {
  CHART_CURSOR,
  CHART_GRID,
  CHART_HEIGHTS,
} from "@motormetrics/theme/charts";
import { CARD_PADDING, RADIUS } from "@motormetrics/theme/spacing";
import {
  FUEL_GROUP_COLORS,
  FUEL_GROUP_MAP,
  FUEL_GROUPS,
} from "@web/app/(main)/(explore)/cars/annual/constants";
import { useEffectiveYear } from "@web/app/(main)/(explore)/cars/annual/hooks/use-effective-year";
import { searchParams } from "@web/app/(main)/(explore)/cars/annual/search-params";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@web/components/charts/chart";
import Typography from "@web/components/typography";
import { useQueryStates } from "nuqs";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Legend, XAxis, YAxis } from "recharts";

interface RawData {
  year: string;
  fuelType: string;
  total: number;
}

interface VehiclePopulationChartProps {
  data: RawData[];
  availableYears: { year: string }[];
}

interface StackedEntry {
  year: string;
  Petrol: number;
  Diesel: number;
  Hybrid: number;
  Electric: number;
  CNG: number;
  Others: number;
  [key: string]: string | number;
}

export function VehiclePopulationChart({
  data,
  availableYears,
}: VehiclePopulationChartProps) {
  const [, setSearchParams] = useQueryStates(searchParams);
  const effectiveYear = useEffectiveYear(
    availableYears.map((item) => Number(item.year)),
  );

  const numberFormatter = new Intl.NumberFormat("en-SG");

  const stackedData = useMemo(() => {
    const yearMap = new Map<string, StackedEntry>();

    for (const record of data) {
      if (!yearMap.has(record.year)) {
        yearMap.set(record.year, {
          year: record.year,
          Petrol: 0,
          Diesel: 0,
          Hybrid: 0,
          Electric: 0,
          CNG: 0,
          Others: 0,
        });
      }

      const entry = yearMap.get(record.year);
      if (!entry) continue;
      const group = FUEL_GROUP_MAP[record.fuelType] ?? "Others";
      entry[group] = (entry[group] as number) + record.total;
    }

    return Array.from(yearMap.values()).sort((a, b) =>
      a.year.localeCompare(b.year),
    );
  }, [data]);

  const selectedYearTotal = useMemo(() => {
    const entry = stackedData.find(
      (item) => Number(item.year) === effectiveYear,
    );
    if (!entry) return 0;
    return FUEL_GROUPS.reduce(
      (sum, group) => sum + (entry[group] as number),
      0,
    );
  }, [stackedData, effectiveYear]);

  const chartConfig = Object.fromEntries(
    FUEL_GROUPS.map((group) => [
      group,
      { label: group, color: FUEL_GROUP_COLORS[group] },
    ]),
  );

  const handleBarClick = async (_: unknown, index: number) => {
    const entry = stackedData[index];
    if (entry) {
      await setSearchParams({ year: Number(entry.year) });
    }
  };

  return (
    <Card className={cn(RADIUS.card, CARD_PADDING.standard)}>
      <Card.Header className="flex flex-col items-start gap-2">
        <Typography.H4>Vehicle Population by Fuel Type</Typography.H4>
        <Typography.TextSm className="text-default-500">
          {numberFormatter.format(selectedYearTotal)} vehicles on the road in{" "}
          {effectiveYear}
        </Typography.TextSm>
      </Card.Header>
      <Card.Content>
        <ChartContainer
          config={chartConfig}
          className={cn(CHART_HEIGHTS.tall, "w-full")}
        >
          <BarChart data={stackedData}>
            <CartesianGrid {...CHART_GRID.default} />
            <XAxis
              dataKey="year"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => numberFormatter.format(value)}
              width={80}
            />
            <ChartTooltip
              cursor={CHART_CURSOR.highlight}
              content={
                <ChartTooltipContent
                  formatter={(value) => numberFormatter.format(value as number)}
                />
              }
            />
            <Legend />
            {FUEL_GROUPS.map((group) => (
              <Bar
                key={group}
                dataKey={group}
                stackId="fuel"
                fill={FUEL_GROUP_COLORS[group]}
                radius={
                  group === FUEL_GROUPS[FUEL_GROUPS.length - 1]
                    ? [4, 4, 0, 0]
                    : [0, 0, 0, 0]
                }
                onClick={handleBarClick}
                className="cursor-pointer"
              />
            ))}
          </BarChart>
        </ChartContainer>
      </Card.Content>
      <Card.Footer>
        <Typography.TextSm className="text-default-500">
          Click on a bar to select a year. Hybrid includes Petrol-Electric,
          Plug-In, and Diesel-Electric vehicles.
        </Typography.TextSm>
      </Card.Footer>
    </Card>
  );
}
