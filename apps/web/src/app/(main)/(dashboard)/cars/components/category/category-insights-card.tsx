import { Chip } from "@heroui/react";
import { formatDateToMonthYear } from "@motormetrics/utils";
import Typography from "@web/components/typography";
import { formatPercentage } from "@web/utils/charts";
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-4 rounded-2xl bg-default p-4">
          <div className="flex size-10 items-center justify-center rounded-xl bg-accent/10">
            <Layers className="size-5 text-accent" />
          </div>
          <div className="flex flex-col gap-2">
            <Typography.Caption>Active Categories</Typography.Caption>
            <p className="font-bold text-2xl text-foreground">
              {categoriesCount}
            </p>
            <Typography.TextSm>{title} types</Typography.TextSm>
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-2xl bg-default p-4">
          <div className="flex size-10 items-center justify-center rounded-xl bg-success/10">
            <Award className="size-5 text-success" />
          </div>
          <div className="flex flex-col gap-2">
            <Typography.Caption>Top Performer</Typography.Caption>
            <p className="font-bold text-2xl text-foreground">
              {topPerformer.name}
            </p>
            <Typography.TextSm>Leading category</Typography.TextSm>
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-2xl bg-default p-4">
          <div className="flex size-10 items-center justify-center rounded-xl bg-warning/10">
            <PieChart className="size-5 text-warning" />
          </div>
          <div className="flex flex-col gap-2">
            <Typography.Caption>Market Share</Typography.Caption>
            <p className="font-bold text-2xl text-foreground">
              {formatPercentage(topPerformer.percentage)}
            </p>
            <Typography.TextSm>{topPerformer.name}</Typography.TextSm>
          </div>
        </div>
      </div>
    </div>
  );
}
