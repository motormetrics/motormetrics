"use client";

import { KPI, KPIGroup, LineChart, Widget } from "@heroui-pro/react";
import { formatDateToMonthYear } from "@motormetrics/utils";
import { numberFormat } from "@ruchernchong/number-format";

import type { Pqp } from "@web/types/coe";
import { DataTable } from "./data-table.client";

type IndependentPqpCategory = keyof Pick<
  Pqp.Rates,
  "Category C" | "Category D"
>;

interface IndependentCategorySectionProps {
  category: IndependentPqpCategory;
  columns: Pqp.TableColumn[];
  summary: Pqp.CategorySummary | undefined;
  tableRows: Pqp.TableRow[];
  trendData: Pqp.TrendPoint[];
}

const categoryDetails: Record<
  IndependentPqpCategory,
  {
    color: string;
    description: string;
    title: string;
  }
> = {
  "Category C": {
    color: "var(--chart-3)",
    description:
      "Goods vehicles and buses move with fleet replacement cycles, so this renewal baseline is shown independently.",
    title: "Category C",
  },
  "Category D": {
    color: "var(--chart-4)",
    description:
      "Motorcycle COEs behave differently from both passenger cars and commercial fleets, so this renewal baseline is shown independently.",
    title: "Category D",
  },
};

const getDecision = (difference: number) => {
  if (difference > 0) {
    return {
      label: "Renewal cheaper",
      trend: "up" as const,
    };
  }

  if (difference < 0) {
    return {
      label: "Bidding cheaper",
      trend: "down" as const,
    };
  }

  return {
    label: "No clear gap",
    trend: "neutral" as const,
  };
};

export function IndependentCategorySection({
  category,
  columns,
  summary,
  tableRows,
  trendData,
}: IndependentCategorySectionProps) {
  const details = categoryDetails[category];

  if (!details || !summary) {
    return null;
  }

  const decision = getDecision(summary.difference);
  const pqpChange = summary.pqpRate - summary.coePremium;
  const chartData: Record<string, string | number>[] = trendData.map(
    (item) => ({
      ...item,
    }),
  );

  return (
    <Widget>
      <Widget.Header>
        <Widget.Title>{details.title}</Widget.Title>
        <Widget.Description>{details.description}</Widget.Description>
        <Widget.Legend>
          <Widget.LegendItem color={details.color}>
            {details.title}
          </Widget.LegendItem>
        </Widget.Legend>
      </Widget.Header>
      <Widget.Content className="flex flex-col gap-6">
        <KPIGroup>
          <KPI>
            <KPI.Header>
              <KPI.Title>PQP Rate</KPI.Title>
            </KPI.Header>
            <KPI.Content>
              <KPI.Value
                currency="SGD"
                locale="en-SG"
                maximumFractionDigits={0}
                style="currency"
                value={summary.pqpRate}
              />
            </KPI.Content>
          </KPI>
          <KPIGroup.Separator />
          <KPI>
            <KPI.Header>
              <KPI.Title>Latest Premium</KPI.Title>
            </KPI.Header>
            <KPI.Content>
              <KPI.Value
                currency="SGD"
                locale="en-SG"
                maximumFractionDigits={0}
                style="currency"
                value={summary.coePremium}
              />
            </KPI.Content>
          </KPI>
          <KPIGroup.Separator />
          <KPI>
            <KPI.Header>
              <KPI.Title>PQP vs Premium</KPI.Title>
              <KPI.Trend trend={decision.trend}>{decision.label}</KPI.Trend>
            </KPI.Header>
            <KPI.Content>
              <KPI.Value
                currency="SGD"
                locale="en-SG"
                maximumFractionDigits={0}
                style="currency"
                value={Math.abs(pqpChange)}
              />
            </KPI.Content>
          </KPI>
        </KPIGroup>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] xl:items-start">
          <LineChart data={chartData} height={300} width="100%">
            <LineChart.Grid vertical={false} strokeDasharray="3 3" />
            <LineChart.XAxis
              dataKey="month"
              tickFormatter={(value: string | number) =>
                formatDateToMonthYear(String(value))
              }
            />
            <LineChart.YAxis
              domain={[
                (dataMin: number) => Math.floor(dataMin / 10000) * 10000,
                (dataMax: number) => Math.ceil(dataMax / 10000) * 10000,
              ]}
              tickFormatter={numberFormat}
            />
            <LineChart.Tooltip
              cursor={false}
              content={<LineChart.TooltipContent />}
            />
            <LineChart.Line
              dataKey={category}
              name={details.title}
              stroke={details.color}
              strokeWidth={2}
              type="monotone"
            />
          </LineChart>
          <DataTable rows={tableRows} columns={columns} />
        </div>
      </Widget.Content>
    </Widget>
  );
}
