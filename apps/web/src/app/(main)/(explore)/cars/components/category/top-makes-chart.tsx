"use client";

import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@motormetrics/ui/components/chart";
import { slugify } from "@motormetrics/utils";
import Typography from "@web/components/typography";
import { getRankingEmoji } from "@web/lib/cars/calculations";
import { formatNumber } from "@web/utils/charts";
import Link from "next/link";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";

interface Make {
  make: string;
  count: number;
}

interface TopMakesChartProps {
  makes: Make[];
  total: number;
  title: string;
  description?: string;
}

export function TopMakesChart({
  makes,
  total,
  title,
  description = "Most popular brands in this category",
}: TopMakesChartProps) {
  const { chartData, chartConfig, topThree } = useMemo(() => {
    const chartData = makes.map((item, index) => ({
      name: item.make,
      value: item.count,
      percentage: total > 0 ? (item.count / total) * 100 : 0,
      fill: `var(--chart-${index + 1})`,
    }));

    const chartConfig = Object.fromEntries([
      ["value", { label: "Registrations", color: "var(--chart-1)" }],
      ...makes.map((item, index) => [
        item.make,
        { label: item.make, color: `var(--chart-${index + 1})` },
      ]),
    ]);

    const topThree = chartData.slice(0, 3);

    return { chartData, chartConfig, topThree };
  }, [makes, total]);

  if (!makes || makes.length === 0) {
    return (
      <Card className="rounded-2xl p-3">
        <CardHeader className="flex flex-col items-start gap-2">
          <Typography.H4>Top Makes</Typography.H4>
          <Typography.TextSm>No make data available</Typography.TextSm>
        </CardHeader>
        <CardBody>
          <div className="flex h-60 items-center justify-center rounded-lg bg-default-100">
            <p className="text-default-500">No data available</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl p-3">
      <CardHeader className="flex flex-col items-start gap-2">
        <Typography.H4>Top Makes - {title}</Typography.H4>
        <Typography.TextSm>{description}</Typography.TextSm>
      </CardHeader>
      <CardBody>
        <div className="flex flex-col gap-6">
          {/* Top 3 Ranking Chips */}
          <div className="flex gap-2">
            {topThree.map((item, index) => {
              return (
                <Link
                  key={item.name}
                  href={`/cars/makes/${slugify(item.name)}`}
                >
                  <Chip
                    startContent={<span>{getRankingEmoji(index + 1)}</span>}
                    className="cursor-pointer first-of-type:bg-primary first-of-type:text-primary-foreground"
                  >
                    {item.name}
                  </Chip>
                </Link>
              );
            })}
          </div>

          {/* Horizontal Bar Chart */}
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid
                horizontal={false}
                strokeDasharray="3 3"
                className="stroke-default-200"
              />
              <XAxis
                type="number"
                tickFormatter={formatNumber}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip
                cursor={{ fill: "hsl(var(--muted))", opacity: 0.2 }}
                content={<ChartTooltipContent />}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {chartData.map((entry) => {
                  return <Cell key={`cell-${entry.name}`} fill={entry.fill} />;
                })}
              </Bar>
            </BarChart>
          </ChartContainer>
        </div>
      </CardBody>
    </Card>
  );
}
