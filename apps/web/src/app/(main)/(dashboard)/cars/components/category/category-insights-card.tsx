import { Chip } from "@heroui/react";
import { KPI, KPIGroup, NumberValue } from "@heroui-pro/react";
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
    <section className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4 shadow-surface md:p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <Typography.H4>{title} Snapshot</Typography.H4>
          <Typography.TextSm>
            Registration mix for the latest available {formattedMonth} dataset.
          </Typography.TextSm>
        </div>
        <Chip className="w-fit" color="accent" size="sm" variant="soft">
          {formattedMonth}
        </Chip>
      </div>

      <KPIGroup className="max-md:flex-col max-md:[&_.kpi-group__separator]:h-px max-md:[&_.kpi-group__separator]:w-full">
        <KPI>
          <KPI.Header>
            <KPI.Icon status="success">
              <BarChart3 />
            </KPI.Icon>
            <KPI.Title>Total Registrations</KPI.Title>
          </KPI.Header>
          <KPI.Content>
            <KPI.Value
              className="text-3xl text-accent"
              locale="en-SG"
              maximumFractionDigits={0}
              value={total}
            />
            {hasComparison ? (
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
            <KPI.Title>Active {title}s</KPI.Title>
          </KPI.Header>
          <KPI.Content>
            <KPI.Value
              className="text-2xl text-foreground"
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
            <KPI.Title>Leading {title}</KPI.Title>
          </KPI.Header>
          <KPI.Content>
            <span className="font-semibold text-2xl text-foreground">
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
            <KPI.Title>Leader Share</KPI.Title>
          </KPI.Header>
          <KPI.Content>
            <KPI.Value
              className="text-2xl text-foreground"
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
    </section>
  );
}
