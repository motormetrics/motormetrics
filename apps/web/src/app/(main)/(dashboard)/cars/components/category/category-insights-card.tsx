import { Chip } from "@heroui/react";
import { KPI, KPIGroup } from "@heroui-pro/react";
import { formatDateToMonthYear } from "@motormetrics/utils";
import Typography from "@web/components/typography";
import { Award, BarChart3, Layers, PieChart } from "lucide-react";

interface CategoryInsightsCardProps {
  categoriesCount: number;
  previousTotal?: number | null;
  topPerformer: {
    name: string;
    percentage: number;
  };
  month: string;
  title: string;
  total?: number;
}

export function CategoryInsightsCard({
  categoriesCount,
  previousTotal,
  topPerformer,
  month,
  title,
  total = 0,
}: CategoryInsightsCardProps) {
  const formattedMonth = formatDateToMonthYear(month);
  const hasComparison = previousTotal != null && previousTotal > 0;
  const changeRatio = hasComparison
    ? (total - previousTotal) / previousTotal
    : 0;
  const isPositive = hasComparison ? total >= previousTotal : true;
  const trend = changeRatio > 0 ? "up" : changeRatio < 0 ? "down" : "neutral";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Typography.H4>Market Insights</Typography.H4>
        <Chip color="accent" size="sm">
          {formattedMonth}
        </Chip>
      </div>

      <KPIGroup>
        <KPI>
          <KPI.Header>
            <KPI.Icon status="success">
              <BarChart3 />
            </KPI.Icon>
            <KPI.Title>Total Registrations</KPI.Title>
          </KPI.Header>
          <KPI.Content>
            <KPI.Value
              className="text-4xl text-accent"
              locale="en-SG"
              maximumFractionDigits={0}
              value={total}
            />
            {hasComparison ? (
              <KPI.Trend trend={trend} variant="primary">
                {isPositive ? "+" : ""}
                {(Math.abs(changeRatio) * 100).toFixed(1)}%
              </KPI.Trend>
            ) : null}
          </KPI.Content>
          {hasComparison ? (
            <KPI.Footer>
              <span className="text-muted text-xs">vs last month</span>
            </KPI.Footer>
          ) : null}
        </KPI>

        <KPIGroup.Separator />

        <KPI>
          <KPI.Header>
            <KPI.Icon status="success">
              <Layers />
            </KPI.Icon>
            <KPI.Title>Active Categories</KPI.Title>
          </KPI.Header>
          <KPI.Content>
            <KPI.Value
              className="text-2xl"
              locale="en-SG"
              maximumFractionDigits={0}
              value={categoriesCount}
            />
          </KPI.Content>
          <KPI.Footer>
            <Typography.TextSm>{title} types</Typography.TextSm>
          </KPI.Footer>
        </KPI>

        <KPIGroup.Separator />

        <KPI>
          <KPI.Header>
            <KPI.Icon status="success">
              <Award />
            </KPI.Icon>
            <KPI.Title>Top Performer</KPI.Title>
          </KPI.Header>
          <KPI.Content>
            <span className="font-bold text-2xl text-foreground">
              {topPerformer.name}
            </span>
          </KPI.Content>
          <KPI.Footer>
            <Typography.TextSm>Leading category</Typography.TextSm>
          </KPI.Footer>
        </KPI>

        <KPIGroup.Separator />

        <KPI>
          <KPI.Header>
            <KPI.Icon status="warning">
              <PieChart />
            </KPI.Icon>
            <KPI.Title>Market Share</KPI.Title>
          </KPI.Header>
          <KPI.Content>
            <KPI.Value
              className="text-2xl"
              maximumFractionDigits={1}
              style="percent"
              value={topPerformer.percentage / 100}
            />
          </KPI.Content>
          <KPI.Footer>
            <Typography.TextSm>{topPerformer.name}</Typography.TextSm>
          </KPI.Footer>
        </KPI>
      </KPIGroup>
    </div>
  );
}
