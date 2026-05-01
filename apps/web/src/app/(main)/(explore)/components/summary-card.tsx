import { Button, Card, Chip, Link } from "@heroui/react";
import { AnimatedNumber } from "@web/components/animated-number";
import { getYearlyRegistrations } from "@web/queries/cars";
import {
  ArrowUpRight,
  BarChart3,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

export async function SummaryCard() {
  const yearlyData = await getYearlyRegistrations();
  const currentYear = yearlyData.at(-1);
  const previousYear = yearlyData.at(-2);

  const totalRegistrations = currentYear?.total ?? 0;
  const previousTotal = previousYear?.total ?? 0;
  const displayYear = currentYear?.year ?? "No data";
  const changePercent =
    previousTotal > 0
      ? (((totalRegistrations - previousTotal) / previousTotal) * 100).toFixed(
          1,
        )
      : "0.0";
  const isPositive = totalRegistrations >= previousTotal;

  return (
    <Card className="border-2 border-primary">
      <Card.Content>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10">
            <BarChart3 className="size-6 text-primary" />
          </div>
          <Link href="/cars">
            <Button isIconOnly variant="tertiary">
              <ArrowUpRight className="size-6" />
            </Button>
          </Link>
        </div>
        <p className="text-default-500 text-sm">
          Total Registrations ({displayYear})
        </p>
        <p className="mt-1 font-bold text-4xl text-primary tabular-nums">
          <AnimatedNumber value={totalRegistrations} />
        </p>
        <div className="mt-4 flex items-center gap-2">
          <Chip
            variant="soft"
            color={isPositive ? "success" : "danger"}
            size="sm"
          >
            {isPositive ? (
              <TrendingUp className="size-4" />
            ) : (
              <TrendingDown className="size-4" />
            )}
            {isPositive ? "+" : ""}
            {changePercent}%
          </Chip>
          <span className="text-default-500 text-xs">vs previous year</span>
        </div>
      </Card.Content>
    </Card>
  );
}
