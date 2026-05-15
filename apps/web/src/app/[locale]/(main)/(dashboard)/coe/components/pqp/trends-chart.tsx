"use client";

import { Card } from "@heroui/react";
import { LineChart } from "@heroui-pro/react";

import { formatDateToMonthYear } from "@motormetrics/utils";
import { numberFormat } from "@ruchernchong/number-format";
import Typography from "@web/components/typography";
import type { Pqp } from "@web/types/coe";

interface TrendsChartProps {
  data: Pqp.TrendPoint[];
}

export function TrendsChart({ data }: TrendsChartProps) {
  const chartData: Record<string, string | number>[] = data.map((item) => ({
    ...item,
  }));

  return (
    <Card>
      <Card.Header>
        <div className="flex flex-col gap-1">
          <Typography.H4>PQP Trends</Typography.H4>
          <Typography.TextSm className="text-muted">
            Historical Prevailing Quota Premium rates across all COE categories
          </Typography.TextSm>
        </div>
      </Card.Header>
      <Card.Content>
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
            dataKey="Category A"
            name="Category A"
            type="monotone"
            stroke="var(--chart-1)"
            strokeWidth={2}
          />
          <LineChart.Line
            dataKey="Category B"
            name="Category B"
            type="monotone"
            stroke="var(--chart-2)"
            strokeWidth={2}
          />
        </LineChart>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          {[
            { color: "var(--chart-1)", label: "Category A" },
            { color: "var(--chart-2)", label: "Category B" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-muted text-xs">{item.label}</span>
            </div>
          ))}
        </div>
      </Card.Content>
      <Card.Footer>
        <p className="text-muted text-sm">
          Historical PQP rates (3-month average COE prices) used for COE
          renewals across categories.
        </p>
      </Card.Footer>
    </Card>
  );
}
