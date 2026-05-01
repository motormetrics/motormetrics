import { Card } from "@heroui/react";
import type { SelectCarCost } from "@motormetrics/database";
import { formatCurrency } from "@motormetrics/utils";
import Typography from "@web/components/typography";

interface CostMetricsProps {
  data: SelectCarCost[];
}

export function CostMetrics({ data }: CostMetricsProps) {
  const quotedModels = data.filter((item) => item.sellingPriceWithCoe > 0);

  const sorted = quotedModels.toSorted(
    (a, b) => a.sellingPriceWithCoe - b.sellingPriceWithCoe,
  );

  const mid = Math.floor(sorted.length / 2);
  const median =
    sorted.length === 0
      ? 0
      : sorted.length % 2 !== 0
        ? sorted[mid].sellingPriceWithCoe
        : (sorted[mid - 1].sellingPriceWithCoe +
            sorted[mid].sellingPriceWithCoe) /
          2;

  const metrics = [
    {
      title: "Models Quoted",
      value: `${quotedModels.length} of ${data.length}`,
      description: "Models with AD selling prices",
    },
    {
      title: "Median Price",
      value: sorted.length > 0 ? formatCurrency(median) : "-",
      description: `Middle price point across ${sorted.length} models`,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {metrics.map((metric) => (
        <Card key={metric.title}>
          <Card.Header>
            <Typography.H4>{metric.title}</Typography.H4>
          </Card.Header>
          <Card.Content className="flex flex-col gap-2">
            <span className="font-bold text-4xl text-primary tabular-nums">
              {metric.value}
            </span>
            <Typography.TextSm className="text-default-500">
              {metric.description}
            </Typography.TextSm>
          </Card.Content>
        </Card>
      ))}
    </div>
  );
}
