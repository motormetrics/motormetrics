import { KPI, KPIGroup } from "@heroui-pro/react";
import type { SelectCarCost } from "@motormetrics/database";
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

  return (
    <KPIGroup>
      <KPI>
        <KPI.Header>
          <KPI.Title>Models Quoted</KPI.Title>
        </KPI.Header>
        <KPI.Content>
          <div className="flex items-baseline gap-2">
            <KPI.Value
              className="text-4xl text-accent"
              locale="en-SG"
              maximumFractionDigits={0}
              value={quotedModels.length}
            />
            <span className="text-muted text-sm">of {data.length}</span>
          </div>
        </KPI.Content>
        <KPI.Footer>
          <Typography.TextSm className="text-muted">
            Models with AD selling prices
          </Typography.TextSm>
        </KPI.Footer>
      </KPI>
      <KPIGroup.Separator />
      <KPI>
        <KPI.Header>
          <KPI.Title>Median Price</KPI.Title>
        </KPI.Header>
        <KPI.Content>
          {sorted.length > 0 ? (
            <KPI.Value
              className="text-4xl text-accent"
              currency="SGD"
              locale="en-SG"
              maximumFractionDigits={0}
              style="currency"
              value={median}
            />
          ) : (
            <span className="font-bold text-4xl text-accent tabular-nums">
              -
            </span>
          )}
        </KPI.Content>
        <KPI.Footer>
          <Typography.TextSm className="text-muted">
            Middle price point across {sorted.length} models
          </Typography.TextSm>
        </KPI.Footer>
      </KPI>
    </KPIGroup>
  );
}
