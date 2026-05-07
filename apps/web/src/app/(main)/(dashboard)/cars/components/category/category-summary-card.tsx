import { KPI, NumberValue } from "@heroui-pro/react";
import { BarChart3 } from "lucide-react";

interface CategorySummaryCardProps {
  total: number;
  previousTotal: number | null;
}

export function CategorySummaryCard({
  total,
  previousTotal,
}: CategorySummaryCardProps) {
  const hasComparison = previousTotal !== null && previousTotal > 0;
  const changeRatio = hasComparison
    ? (total - previousTotal) / previousTotal
    : 0;
  const isPositive = hasComparison ? total >= previousTotal : true;
  const trend = changeRatio > 0 ? "up" : changeRatio < 0 ? "down" : "neutral";

  return (
    <KPI className="col-span-12 border-2 border-accent lg:col-span-4">
      <KPI.Header>
        <div className="flex size-12 items-center justify-center rounded-2xl bg-accent/10">
          <BarChart3 className="size-6 text-accent" />
        </div>
      </KPI.Header>
      <KPI.Header>
        <KPI.Title>Total Registrations</KPI.Title>
      </KPI.Header>
      <KPI.Content>
        <KPI.Value
          className="text-4xl text-accent"
          locale="en-SG"
          maximumFractionDigits={0}
          value={total}
        />
        {hasComparison && (
          <KPI.Trend trend={trend} variant="primary">
            <NumberValue
              maximumFractionDigits={1}
              signDisplay="exceptZero"
              style="percent"
              value={
                isPositive ? Math.abs(changeRatio) : -Math.abs(changeRatio)
              }
            />
          </KPI.Trend>
        )}
      </KPI.Content>
      {hasComparison && (
        <KPI.Footer>
          <span className="text-muted text-xs">vs last month</span>
        </KPI.Footer>
      )}
    </KPI>
  );
}
