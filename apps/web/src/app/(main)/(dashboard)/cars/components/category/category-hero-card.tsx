import { KPI, KPIGroup } from "@heroui-pro/react";
import { formatDateToMonthYear } from "@motormetrics/utils";
import Typography from "@web/components/typography";
import { getRankingEmoji } from "@web/lib/cars/calculations";
import { Award, BarChart3, PieChart } from "lucide-react";

interface CategoryHeroCardProps {
  typeName: string;
  count: number;
  totalRegistrations: number;
  month: string;
  rank: number;
  totalCategories: number;
}

export function CategoryHeroCard({
  typeName,
  count,
  totalRegistrations,
  month,
  rank,
  totalCategories,
}: CategoryHeroCardProps) {
  const marketSharePercentage =
    totalRegistrations > 0 ? (count / totalRegistrations) * 100 : 0;
  const formattedMonth = formatDateToMonthYear(month);

  return (
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
            className="text-3xl text-accent"
            locale="en-SG"
            maximumFractionDigits={0}
            value={count}
          />
        </KPI.Content>
        <KPI.Footer>
          <Typography.TextSm>{formattedMonth}</Typography.TextSm>
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
            className="text-3xl text-foreground"
            maximumFractionDigits={1}
            style="percent"
            value={marketSharePercentage / 100}
          />
        </KPI.Content>
        <KPI.Footer>
          <Typography.TextSm>of all registrations</Typography.TextSm>
        </KPI.Footer>
      </KPI>

      <KPIGroup.Separator />

      <KPI>
        <KPI.Header>
          <KPI.Icon status="success">
            <Award />
          </KPI.Icon>
          <KPI.Title>Category Ranking</KPI.Title>
        </KPI.Header>
        <KPI.Content>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl">{getRankingEmoji(rank)}</span>
            <span className="font-bold text-3xl text-foreground">#{rank}</span>
          </div>
        </KPI.Content>
        <KPI.Footer>
          <Typography.TextSm>
            of {totalCategories}{" "}
            {typeName.toLowerCase().includes("fuel") ? "fuel" : ""} types
          </Typography.TextSm>
        </KPI.Footer>
      </KPI>
    </KPIGroup>
  );
}
