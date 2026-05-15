"use client";

import { Card } from "@heroui/react";
import { PieChart } from "@heroui-pro/react";

import {
  FUEL_GROUP_COLORS,
  FUEL_GROUP_MAP,
  FUEL_GROUPS,
} from "@web/app/[locale]/(main)/(dashboard)/cars/annual/constants";
import { useEffectiveYear } from "@web/app/[locale]/(main)/(dashboard)/cars/annual/hooks/use-effective-year";
import Typography from "@web/components/typography";
import { useMemo } from "react";

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

  return (
    <Card>
      <Card.Header className="flex flex-col items-start gap-2">
        <Typography.H4>Fuel Type Mix ({effectiveYear})</Typography.H4>
        <Typography.TextSm className="text-muted">
          Distribution of vehicles by fuel type
        </Typography.TextSm>
      </Card.Header>
      <Card.Content>
        <PieChart className="mx-auto" height={300}>
          <PieChart.Tooltip
            content={
              <PieChart.TooltipContent
                valueFormatter={(value) =>
                  numberFormatter.format(value as number)
                }
              />
            }
          />
          <PieChart.Pie
            data={groupedData}
            dataKey="value"
            nameKey="name"
            innerRadius={80}
            outerRadius={140}
            paddingAngle={2}
            label={({ name, percent }) =>
              `${name ?? ""} ${((percent ?? 0) * 100).toFixed(1)}%`
            }
          >
            {groupedData.map((entry) => (
              <PieChart.Cell
                key={entry.name}
                fill={FUEL_GROUP_COLORS[entry.name]}
              />
            ))}
          </PieChart.Pie>
        </PieChart>
      </Card.Content>
    </Card>
  );
}
