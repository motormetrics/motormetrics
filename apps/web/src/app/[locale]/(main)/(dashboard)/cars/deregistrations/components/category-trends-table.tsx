"use client";

import { Card } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";

import Typography from "@web/components/typography";

interface CategorySparklineData {
  category: string;
  total: number;
  trend: { value: number }[];
  colour: string;
}

interface CategoryTrendsTableProps {
  data: CategorySparklineData[];
}

export function CategoryTrendsTable({ data }: CategoryTrendsTableProps) {
  return (
    <Card>
      <Card.Content>
        <Typography.Caption className="mb-3 font-medium uppercase tracking-wider">
          Category Trends (12 months)
        </Typography.Caption>
        <div className="flex flex-col gap-2">
          {data.map((cat) => {
            const firstValue = cat.trend[0]?.value ?? 0;
            const lastValue = cat.trend.at(-1)?.value ?? 0;
            const change = lastValue - firstValue;
            const isUp = change > 0;

            return (
              <div
                key={cat.category}
                className="grid grid-cols-12 items-center gap-2 rounded-lg bg-default px-3 py-2"
              >
                <div className="col-span-3 flex items-center gap-2">
                  <div
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: cat.colour }}
                  />
                  <span className="truncate text-sm">
                    {cat.category.replace(
                      "Vehicles Exempted From VQS",
                      "VQS Exempted",
                    )}
                  </span>
                </div>
                <div className="col-span-6">
                  <div className="flex h-6 items-end gap-px">
                    {cat.trend.map((point, i) => {
                      const max = Math.max(...cat.trend.map((p) => p.value));
                      const height = max > 0 ? (point.value / max) * 100 : 0;

                      return (
                        <div
                          key={`${cat.category}-${point.value}-${height}`}
                          className="flex-1 rounded-t-sm transition-all"
                          style={{
                            height: `${Math.max(height, 4)}%`,
                            backgroundColor: cat.colour,
                            opacity: 0.3 + (i / cat.trend.length) * 0.7,
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
                <div className="col-span-2 text-right font-medium text-sm">
                  <NumberValue
                    locale="en-SG"
                    maximumFractionDigits={0}
                    value={cat.total}
                  />
                </div>
                <div
                  className={`col-span-1 text-right text-xs ${isUp ? "text-danger" : "text-success"}`}
                >
                  {isUp ? "▲" : "▼"}{" "}
                  <NumberValue
                    locale="en-SG"
                    maximumFractionDigits={0}
                    value={Math.abs(change)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card.Content>
    </Card>
  );
}
