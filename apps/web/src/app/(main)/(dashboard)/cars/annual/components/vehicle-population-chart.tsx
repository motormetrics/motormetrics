"use client";

import { Card, Text } from "@heroui/react";
import { BarChart } from "@heroui-pro/react";
import {
  FUEL_GROUP_COLORS,
  FUEL_GROUP_MAP,
  FUEL_GROUPS,
} from "@web/app/(main)/(dashboard)/cars/annual/constants";
import { useEffectiveYear } from "@web/app/(main)/(dashboard)/cars/annual/hooks/use-effective-year";
import { searchParams } from "@web/app/(main)/(dashboard)/cars/annual/search-params";
import { useQueryStates } from "nuqs";
import { useMemo } from "react";

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

  const handleBarClick = async (_: unknown, index: number) => {
    const entry = stackedData[index];
    if (entry) {
      await setSearchParams({ year: Number(entry.year) });
    }
  };

  return (
    <Card>
      <Card.Header className="flex flex-col items-start gap-2">
        <Text type="h4">Vehicle Population by Fuel Type</Text>
        <Text type="body-sm" color="muted">
          {numberFormatter.format(selectedYearTotal)} vehicles on the road in{" "}
          {effectiveYear}
        </Text>
      </Card.Header>
      <Card.Content>
        <div className="flex flex-col gap-4">
          <BarChart data={stackedData} height={400}>
            <BarChart.Grid strokeDasharray="3 3" strokeOpacity={0.15} />
            <BarChart.XAxis
              dataKey="year"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <BarChart.YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value: number) => numberFormatter.format(value)}
              width={80}
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
            {FUEL_GROUPS.map((group) => (
              <BarChart.Bar
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
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
            {FUEL_GROUPS.map((group) => (
              <div key={group} className="flex items-center gap-2">
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: FUEL_GROUP_COLORS[group] }}
                />
                <span className="text-muted text-xs">{group}</span>
              </div>
            ))}
          </div>
        </div>
      </Card.Content>
      <Card.Footer>
        <Text type="body-sm" color="muted">
          Click on a bar to select a year. Hybrid includes Petrol-Electric,
          Plug-In, and Diesel-Electric vehicles.
        </Text>
      </Card.Footer>
    </Card>
  );
}
