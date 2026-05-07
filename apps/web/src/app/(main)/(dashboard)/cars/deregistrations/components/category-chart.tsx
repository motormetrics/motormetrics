"use client";

import { Card, ComboBox, Input, Label, ListBox } from "@heroui/react";
import { BarChart, ChartTooltip, NumberValue } from "@heroui-pro/react";

import type { SelectDeregistration } from "@motormetrics/database";
import { formatDateToMonthYear, formatNumber } from "@motormetrics/utils";
import {
  type CategoryWithPercentage,
  toPercentageDistribution,
} from "@web/app/(main)/(dashboard)/cars/deregistrations/components/constants";
import { deregistrationsSearchParams } from "@web/app/(main)/(dashboard)/cars/deregistrations/search-params";
import Typography from "@web/components/typography";
import { useQueryStates } from "nuqs";
import type React from "react";
import { useMemo } from "react";

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
  const chartData = sortedData.map((item) => ({ ...item }));
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

  const handleBarClick = async (entry: CategoryWithPercentage) => {
    await setSearchParams({ category: entry.category });
  };

  const handleMonthChange = async (key: React.Key | null) => {
    if (key) {
      await setSearchParams({ month: String(key) });
    }
  };

  return (
    <Card>
      <Card.Header className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-col gap-1">
          <Typography.H3>Deregistrations by Category</Typography.H3>
          {selectedCategory ? (
            <Typography.Text className="text-muted">
              <NumberValue
                locale="en-SG"
                maximumFractionDigits={0}
                value={selectedCategory.total}
              />{" "}
              deregistrations in {selectedCategory.category} (
              <NumberValue
                maximumFractionDigits={1}
                style="percent"
                value={selectedCategory.percentage / 100}
              />
              )
            </Typography.Text>
          ) : (
            <Typography.Text className="text-muted">
              <NumberValue
                locale="en-SG"
                maximumFractionDigits={0}
                value={totalDeregistrations}
              />{" "}
              total deregistrations for {formatDateToMonthYear(currentMonth)}
            </Typography.Text>
          )}
        </div>
        <ComboBox
          className="max-w-xs"
          selectedKey={currentMonth}
          onSelectionChange={handleMonthChange}
        >
          <Label>Month</Label>
          <ComboBox.InputGroup>
            <Input placeholder="Month" />
            <ComboBox.Trigger />
          </ComboBox.InputGroup>
          <ComboBox.Popover>
            <ListBox>
              {monthOptions.map((item) => (
                <ListBox.Item
                  key={item.key}
                  id={item.key}
                  textValue={item.label}
                >
                  {item.label}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </ComboBox.Popover>
        </ComboBox>
      </Card.Header>
      <Card.Content>
        <BarChart data={chartData} height={400} layout="vertical">
          <defs>
            <linearGradient id="selectedGradient" x1="0" y1="0" x2="1" y2="0">
              <stop
                offset="0%"
                stopColor="color-mix(in srgb, var(--accent) 40%, transparent)"
              />
              <stop offset="100%" stopColor="var(--accent)" />
            </linearGradient>
          </defs>
          <BarChart.Grid
            horizontal={false}
            strokeDasharray="3 3"
            className="stroke-border"
          />
          <BarChart.XAxis
            type="number"
            tickLine={false}
            axisLine={false}
            tickFormatter={formatNumber}
            tick={{ fill: "var(--muted)" }}
          />
          <BarChart.YAxis
            type="category"
            dataKey="category"
            tickLine={false}
            axisLine={false}
            width={180}
            tick={{ fill: "var(--muted)" }}
            tickFormatter={(value: string) =>
              value.replace("Vehicles Exempted From VQS", "VQS Exempted")
            }
          />
          <BarChart.Tooltip
            cursor={{ fill: "var(--muted)", opacity: 0.2 }}
            content={({ active, payload }) => {
              const entry = payload?.[0];
              if (!active || !entry) return null;
              const percentage = (entry.payload as CategoryWithPercentage)
                .percentage;

              return (
                <ChartTooltip>
                  <ChartTooltip.Item>
                    <ChartTooltip.Indicator color={entry.payload.colour} />
                    <ChartTooltip.Label>{entry.name}</ChartTooltip.Label>
                    <ChartTooltip.Value>
                      <NumberValue
                        locale="en-SG"
                        maximumFractionDigits={0}
                        value={entry.value as number}
                      />{" "}
                      (
                      <NumberValue
                        maximumFractionDigits={1}
                        style="percent"
                        value={percentage / 100}
                      />
                      )
                    </ChartTooltip.Value>
                  </ChartTooltip.Item>
                </ChartTooltip>
              );
            }}
          />
          <BarChart.Bar
            dataKey="total"
            fill="var(--chart-1)"
            radius={[0, 4, 4, 0]}
            onClick={(_: unknown, index: number) =>
              handleBarClick(sortedData[index])
            }
            className="cursor-pointer"
          />
        </BarChart>
      </Card.Content>
      <Card.Footer>
        <Typography.TextSm className="text-muted">
          Click on a bar to select a category, or use the dropdown above to
          change the month
        </Typography.TextSm>
      </Card.Footer>
    </Card>
  );
}
