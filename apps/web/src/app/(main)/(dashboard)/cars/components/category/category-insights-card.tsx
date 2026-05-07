import { Chip } from "@heroui/react";
import { KPI, KPIGroup } from "@heroui-pro/react";
import { formatDateToMonthYear } from "@motormetrics/utils";
import Typography from "@web/components/typography";
import { Award, Layers, PieChart } from "lucide-react";

interface CategoryInsightsCardProps {
  categoriesCount: number;
  topPerformer: {
    name: string;
    percentage: number;
  };
  month: string;
  title: string;
}

export function CategoryInsightsCard({
  categoriesCount,
  topPerformer,
  month,
  title,
}: CategoryInsightsCardProps) {
  const formattedMonth = formatDateToMonthYear(month);

  return (
    <div className="col-span-12 flex flex-col gap-6 rounded-3xl border border-border bg-white p-6 lg:col-span-8">
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
