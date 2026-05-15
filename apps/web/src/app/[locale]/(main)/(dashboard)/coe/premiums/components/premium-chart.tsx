"use client";

import { Card, Label, ListBox, Select } from "@heroui/react";
import { ChartTooltip, LineChart, NumberValue } from "@heroui-pro/react";

import { formatDateToMonthYear } from "@motormetrics/utils";
import { numberFormat } from "@ruchernchong/number-format";
import {
  type Period,
  periods,
} from "@web/app/[locale]/(main)/(dashboard)/coe/search-params";
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
        (acc: Record<string, string | number>, [key, value]) => {
          if (
            (key === "month" ||
              (key.startsWith("Category") && categories.includes(key))) &&
            (typeof value === "string" || typeof value === "number")
          ) {
            acc[key] = value;
          }
          return acc;
        },
        {},
      ),
    );
  }, [categories, data]);

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
        <LineChart
          data={filteredData}
          height={300}
          width="100%"
          aria-label={`COE premium trends chart showing ${periodLabel} data for selected categories`}
        >
          <LineChart.Grid vertical={false} strokeDasharray="3 3" />
          <LineChart.XAxis
            dataKey="month"
            tickFormatter={formatDateToMonthYear}
          />
          <LineChart.YAxis
            domain={[
              (dataMin: number) => Math.floor(dataMin / 10000) * 10000,
              (dataMax: number) => Math.ceil(dataMax / 10000) * 10000,
            ]}
            tickFormatter={numberFormat}
            hide
          />
          <LineChart.Tooltip
            cursor={false}
            content={({ active, label, payload }) => {
              if (!active || !payload?.length) {
                return null;
              }

              return (
                <ChartTooltip indicator="line">
                  <ChartTooltip.Header>
                    {formatDateToMonthYear(String(label))}
                  </ChartTooltip.Header>
                  {payload.map((entry) => (
                    <ChartTooltip.Item key={String(entry.dataKey)}>
                      <ChartTooltip.Indicator
                        color={entry.color ?? entry.stroke}
                      />
                      <ChartTooltip.Label>{entry.name}</ChartTooltip.Label>
                      <ChartTooltip.Value>
                        <NumberValue
                          currency="SGD"
                          locale="en-SG"
                          maximumFractionDigits={0}
                          style="currency"
                          value={Number(entry.value)}
                        />
                      </ChartTooltip.Value>
                    </ChartTooltip.Item>
                  ))}
                </ChartTooltip>
              );
            }}
          />
          {categories.map((category, index) => (
            <LineChart.Line
              key={category}
              dataKey={category}
              name={category}
              type="natural"
              stroke={`var(--chart-${index + 1})`}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          {categories.map((category, index) => (
            <div key={category} className="flex items-center gap-1.5">
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: `var(--chart-${index + 1})` }}
              />
              <span className="text-muted text-xs">{category}</span>
            </div>
          ))}
        </div>
      </Card.Content>
    </Card>
  );
}
