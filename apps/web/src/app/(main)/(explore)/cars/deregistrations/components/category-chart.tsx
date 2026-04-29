"use client";

import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import type { SelectDeregistration } from "@motormetrics/database";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@motormetrics/ui/components/chart";
import { formatDateToMonthYear } from "@motormetrics/utils";
import {
  type CategoryWithPercentage,
  toPercentageDistribution,
} from "@web/app/(main)/(explore)/cars/deregistrations/components/constants";
import { deregistrationsSearchParams } from "@web/app/(main)/(explore)/cars/deregistrations/search-params";
import Typography from "@web/components/typography";
import { formatNumber, formatPercentage } from "@web/utils/charts";
import { useQueryStates } from "nuqs";
import type React from "react";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";

interface CategoryChartProps {
  data: SelectDeregistration[];
  months: string[];
}

interface MonthOption {
  key: string;
  label: string;
}

export function CategoryChart({ data, months }: CategoryChartProps) {
  const [{ month, category }, setSearchParams] = useQueryStates(
    deregistrationsSearchParams,
  );

  const currentMonth = month ?? months[0];

  // Compute category breakdown client-side based on selected month
  const categoryBreakdownData = useMemo(() => {
    const monthData = data.filter((record) => record.month === currentMonth);
    const grouped = monthData.reduce<Record<string, number>>((acc, record) => {
      acc[record.category] = (acc[record.category] ?? 0) + (record.number ?? 0);
      return acc;
    }, {});
    const categories = Object.entries(grouped).map(([cat, total]) => ({
      category: cat,
      total,
    }));
    return toPercentageDistribution(categories);
  }, [data, currentMonth]);

  const sortedData = [...categoryBreakdownData].sort(
    (a, b) => b.total - a.total,
  );
  const selectedCategory = sortedData.find(
    (item) => item.category === category,
  );
  const totalDeregistrations = categoryBreakdownData.reduce(
    (sum, item) => sum + item.total,
    0,
  );
  const monthOptions: MonthOption[] = months.map((item) => ({
    key: item,
    label: formatDateToMonthYear(item),
  }));

  const chartConfig = {
    total: { label: "Deregistrations", color: "hsl(var(--heroui-primary))" },
  } as const;

  const handleBarClick = async (entry: CategoryWithPercentage) => {
    await setSearchParams({ category: entry.category });
  };

  const handleMonthChange = async (key: React.Key | null) => {
    if (key) {
      await setSearchParams({ month: String(key) });
    }
  };

  return (
    <Card className="rounded-2xl p-3">
      <CardHeader className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-col gap-1">
          <Typography.H3>Deregistrations by Category</Typography.H3>
          {selectedCategory ? (
            <Typography.Text className="text-default-500">
              {formatNumber(selectedCategory.total)} deregistrations in{" "}
              {selectedCategory.category} (
              {formatPercentage(selectedCategory.percentage)})
            </Typography.Text>
          ) : (
            <Typography.Text className="text-default-500">
              {formatNumber(totalDeregistrations)} total deregistrations for{" "}
              {formatDateToMonthYear(currentMonth)}
            </Typography.Text>
          )}
        </div>
        <Autocomplete
          label="Month"
          variant="bordered"
          className="max-w-xs"
          selectedKey={currentMonth}
          onSelectionChange={handleMonthChange}
          defaultItems={monthOptions}
        >
          {(item: MonthOption) => (
            <AutocompleteItem key={item.key}>{item.label}</AutocompleteItem>
          )}
        </Autocomplete>
      </CardHeader>
      <CardBody>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <BarChart data={sortedData} layout="vertical">
            <defs>
              <linearGradient id="selectedGradient" x1="0" y1="0" x2="1" y2="0">
                <stop
                  offset="0%"
                  stopColor="hsl(var(--heroui-primary) / 0.4)"
                />
                <stop offset="100%" stopColor="hsl(var(--heroui-primary))" />
              </linearGradient>
            </defs>
            <CartesianGrid
              horizontal={false}
              strokeDasharray="3 3"
              className="stroke-default-200"
            />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tickFormatter={formatNumber}
              tick={{ fill: "hsl(var(--heroui-default-500))" }}
            />
            <YAxis
              type="category"
              dataKey="category"
              tickLine={false}
              axisLine={false}
              width={180}
              tick={{ fill: "hsl(var(--heroui-default-600))" }}
              tickFormatter={(value: string) =>
                value.replace("Vehicles Exempted From VQS", "VQS Exempted")
              }
            />
            <ChartTooltip
              cursor={{ fill: "hsl(var(--muted))", opacity: 0.2 }}
              content={
                <ChartTooltipContent
                  formatter={(value, _name, item) => {
                    const percentage = (item.payload as CategoryWithPercentage)
                      .percentage;
                    return `${formatNumber(value as number)} (${formatPercentage(percentage)})`;
                  }}
                />
              }
            />
            <Bar
              dataKey="total"
              radius={[0, 4, 4, 0]}
              onClick={(_, index) => handleBarClick(sortedData[index])}
              className="cursor-pointer"
            >
              {sortedData.map((entry) => (
                <Cell
                  key={entry.category}
                  fill={
                    category === entry.category
                      ? "url(#selectedGradient)"
                      : entry.colour
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardBody>
      <CardFooter>
        <Typography.TextSm className="text-default-500">
          Click on a bar to select a category, or use the dropdown above to
          change the month
        </Typography.TextSm>
      </CardFooter>
    </Card>
  );
}
