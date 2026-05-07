"use client";

import { Card, Chip, cn, Link } from "@heroui/react";
import { BarChart } from "@heroui-pro/react";

import { formatNumber, slugify } from "@motormetrics/utils";
import Typography from "@web/components/typography";
import { useMemo } from "react";

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
  const { chartData, topThree } = useMemo(() => {
    const chartData = makes.map((item, index) => ({
      name: item.make,
      value: item.count,
      percentage: total > 0 ? (item.count / total) * 100 : 0,
      fill: `var(--chart-${index + 1})`,
    }));

    const topThree = chartData.slice(0, 3);

    return { chartData, topThree };
  }, [makes, total]);

  if (!makes || makes.length === 0) {
    return (
      <Card className="border border-border bg-surface shadow-none">
        <Card.Header className="flex flex-col items-start gap-2">
          <Typography.H4>Top Makes</Typography.H4>
          <Typography.TextSm>No make data available</Typography.TextSm>
        </Card.Header>
        <Card.Content>
          <div className="flex h-52 items-center justify-center rounded-xl bg-surface-secondary">
            <Typography.TextSm>No data available</Typography.TextSm>
          </div>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card className="border border-border bg-surface shadow-none">
      <Card.Header className="flex flex-col items-start gap-2">
        <Typography.H4>Top Makes - {title}</Typography.H4>
        <Typography.TextSm>{description}</Typography.TextSm>
      </Card.Header>
      <Card.Content>
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap gap-2">
            {topThree.map((item, index) => (
              <Link key={item.name} href={`/cars/makes/${slugify(item.name)}`}>
                <Chip
                  className={cn(
                    "cursor-pointer",
                    index === 0 ? "bg-accent text-accent-foreground" : null,
                  )}
                  size="sm"
                  variant="soft"
                >
                  #{index + 1} {item.name}
                </Chip>
              </Link>
            ))}
          </div>

          <BarChart data={chartData} height={300} layout="vertical">
            <BarChart.Grid
              className="stroke-border"
              horizontal={false}
              strokeDasharray="3 3"
            />
            <BarChart.XAxis
              axisLine={false}
              tickFormatter={formatNumber}
              tickLine={false}
              type="number"
            />
            <BarChart.YAxis
              axisLine={false}
              dataKey="name"
              tickLine={false}
              type="category"
            />
            <BarChart.Tooltip
              content={<BarChart.TooltipContent />}
              cursor={{ fill: "var(--muted)", opacity: 0.2 }}
            />
            <BarChart.Bar
              dataKey="value"
              fill="var(--chart-1)"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </div>
      </Card.Content>
    </Card>
  );
}
