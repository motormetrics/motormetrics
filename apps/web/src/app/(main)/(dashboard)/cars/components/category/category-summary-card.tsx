import { Card, Chip } from "@heroui/react";
import { AnimatedNumber } from "@web/components/animated-number";
import { BarChart3, TrendingDown, TrendingUp } from "lucide-react";

interface CategorySummaryCardProps {
  total: number;
  previousTotal: number | null;
}

export function CategorySummaryCard({
  total,
  previousTotal,
}: CategorySummaryCardProps) {
  const hasComparison = previousTotal !== null && previousTotal > 0;
  const changePercent = hasComparison
    ? (((total - previousTotal) / previousTotal) * 100).toFixed(1)
    : "0.0";
  const isPositive = hasComparison ? total >= previousTotal : true;

  return (
    <Card className="col-span-12 border-2 border-accent lg:col-span-4">
      <Card.Content>
        <div className="flex flex-col gap-4">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-accent/10">
            <BarChart3 className="size-6 text-accent" />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-muted text-sm">Total Registrations</p>
            <p className="font-bold text-4xl text-accent tabular-nums">
              <AnimatedNumber value={total} />
            </p>
          </div>
          {hasComparison && (
            <div className="flex items-center gap-2">
              <Chip
                color={isPositive ? "success" : "danger"}
                variant="primary"
                size="sm"
              >
                {isPositive ? (
                  <TrendingUp className="size-3" />
                ) : (
                  <TrendingDown className="size-3" />
                )}
                {isPositive ? "+" : ""}
                {changePercent}%
              </Chip>
              <span className="text-muted text-xs">vs last month</span>
            </div>
          )}
        </div>
      </Card.Content>
    </Card>
  );
}
