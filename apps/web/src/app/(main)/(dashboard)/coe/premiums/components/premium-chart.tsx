"use client";

import { Card, Label, ListBox, Select } from "@heroui/react";

import { formatDateToMonthYear } from "@motormetrics/utils";
import {
  type Period,
  periods,
} from "@web/app/(main)/(dashboard)/coe/search-params";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartTooltip,
  ChartTooltipContent,
} from "@web/components/charts/chart";
import {
  currencyTooltipFormatter,
  MonthXAxis,
  PriceYAxis,
} from "@web/components/charts/shared";
import Typography from "@web/components/typography";
import type { COEBiddingResult } from "@web/types";
import { CalendarIcon } from "lucide-react";
import {
  parseAsArrayOf,
  parseAsString,
  parseAsStringLiteral,
  useQueryState,
} from "nuqs";
import { useMemo } from "react";
import { CartesianGrid, Line, LineChart } from "recharts";

interface COEPremiumChartProps {
  data: COEBiddingResult[];
}

const PERIOD_LABELS: Record<Period, string> = {
  "12m": "Last 12 Months",
  "5y": "Last 5 Years",
  "10y": "Last 10 Years",
  ytd: "Year to Date",
  all: "All Time",
};

const defaultCategories = ["Category A", "Category B", "Category E"];

export function COEPremiumChart({ data }: COEPremiumChartProps) {
  const [period, setPeriod] = useQueryState(
    "period",
    parseAsStringLiteral(periods)
      .withDefault("12m")
      .withOptions({ shallow: false }),
  );
  const [categories] = useQueryState(
    "categories",
    parseAsArrayOf(parseAsString).withDefault(defaultCategories),
  );

  const filteredData = useMemo(() => {
    return data.map((item) =>
      Object.entries(item).reduce(
        (acc: Record<string, unknown>, [key, value]) => {
          if (
            key === "month" ||
            (key.startsWith("Category") && categories.includes(key))
          ) {
            acc[key] = value;
          }
          return acc;
        },
        {},
      ),
    );
  }, [categories, data]);

  const chartConfig: ChartConfig = {};

  const periodLabel = PERIOD_LABELS[period].toLowerCase();

  return (
    <Card>
      <Card.Header className="flex flex-col gap-2 border-b lg:flex-row lg:items-center lg:justify-between">
        <div className="grid flex-1 gap-1">
          <Typography.H4>Quota Premium ($)</Typography.H4>
          <Typography.TextSm>
            {`Showing ${periodLabel} of COE prices`}
          </Typography.TextSm>
        </div>
        <Select
          aria-label="Select time period"
          placeholder="Last 12 months"
          className="max-w-xs"
          value={period}
          onChange={(selected) => setPeriod(selected as Period)}
        >
          <Label className="sr-only">Select time period</Label>
          <Select.Trigger>
            <CalendarIcon className="size-4 text-muted" />
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {periods.map((p) => (
                <ListBox.Item key={p} id={p} textValue={PERIOD_LABELS[p]}>
                  {PERIOD_LABELS[p]}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
      </Card.Header>
      <Card.Content>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <LineChart
            data={filteredData}
            aria-label={`COE premium trends chart showing ${periodLabel} data for selected categories`}
          >
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              className="stroke-border"
            />
            <MonthXAxis tickFormatter={formatDateToMonthYear} />
            <PriceYAxis label="Quota Premium (S$)" hide />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="line"
                  labelFormatter={(label) =>
                    formatDateToMonthYear(String(label))
                  }
                  formatter={(value, name, _, index) =>
                    currencyTooltipFormatter({
                      value:
                        typeof value === "number"
                          ? value
                          : Number.parseFloat(String(value)),
                      name: name ?? "",
                      index: index ?? 0,
                    })
                  }
                />
              }
            />
            {categories.map((category, index) => (
              <Line
                key={category}
                dataKey={category}
                name={category}
                type="natural"
                stroke={`var(--chart-${index + 1})`}
                strokeWidth={2}
                dot={false}
              />
            ))}
            <ChartLegend />
          </LineChart>
        </ChartContainer>
      </Card.Content>
    </Card>
  );
}
