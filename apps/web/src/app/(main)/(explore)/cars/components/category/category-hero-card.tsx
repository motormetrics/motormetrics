import { Card } from "@heroui/react";
import { formatDateToMonthYear } from "@motormetrics/utils";
import { AnimatedNumber } from "@web/components/animated-number";
import Typography from "@web/components/typography";
import { getRankingEmoji } from "@web/lib/cars/calculations";
import { formatPercentage } from "@web/utils/charts";
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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card className="p-3">
        <Card.Content>
          <div className="flex flex-col gap-4">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
              <BarChart3 className="size-5 text-primary" />
            </div>
            <div className="flex flex-col gap-2">
              <Typography.Caption>Total Registrations</Typography.Caption>
              <p className="font-bold text-3xl text-primary tabular-nums">
                <AnimatedNumber value={count} />
              </p>
              <Typography.TextSm>{formattedMonth}</Typography.TextSm>
            </div>
          </div>
        </Card.Content>
      </Card>

      <Card className="p-3">
        <Card.Content>
          <div className="flex flex-col gap-4">
            <div className="flex size-10 items-center justify-center rounded-xl bg-warning/10">
              <PieChart className="size-5 text-warning" />
            </div>
            <div className="flex flex-col gap-2">
              <Typography.Caption>Market Share</Typography.Caption>
              <p className="font-bold text-3xl text-foreground">
                {formatPercentage(marketSharePercentage)}
              </p>
              <Typography.TextSm>of all registrations</Typography.TextSm>
            </div>
          </div>
        </Card.Content>
      </Card>

      <Card className="p-3">
        <Card.Content>
          <div className="flex flex-col gap-4">
            <div className="flex size-10 items-center justify-center rounded-xl bg-success/10">
              <Award className="size-5 text-success" />
            </div>
            <div className="flex flex-col gap-2">
              <Typography.Caption>Category Ranking</Typography.Caption>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl">{getRankingEmoji(rank)}</span>
                <p className="font-bold text-3xl text-foreground">#{rank}</p>
              </div>
              <Typography.TextSm>
                of {totalCategories}{" "}
                {typeName.toLowerCase().includes("fuel") ? "fuel" : ""} types
              </Typography.TextSm>
            </div>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
}
