import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Link } from "@heroui/link";
import { AnimatedNumber } from "@web/components/animated-number";
import { getCarsComparison, getCarsLatestMonth } from "@web/queries/cars";
import {
  ArrowUpRight,
  CalendarDays,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

export async function MonthlyChangeSummary() {
  const latestMonth = await getCarsLatestMonth();

  if (!latestMonth) {
    return null;
  }

  const comparison = await getCarsComparison(latestMonth);
  const currentTotal = comparison.currentMonth.total;
  const previousTotal = comparison.previousMonth.total;

  const changeAmount = currentTotal - previousTotal;
  const changePercent =
    previousTotal > 0
      ? ((changeAmount / previousTotal) * 100).toFixed(1)
      : "0.0";
  const isPositive = changeAmount >= 0;

  // Format the month for display (e.g., "2025-01" -> "Jan 2025")
  const [year, month] = latestMonth.split("-");
  const displayMonth = new Date(Number(year), Number(month) - 1).toLocaleString(
    "en-SG",
    { month: "short", year: "numeric" },
  );

  return (
    <Card className="border-2 border-primary" radius="lg">
      <CardBody className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10">
            <CalendarDays className="size-6 text-primary" />
          </div>
          <Link
            href={`/cars?month=${latestMonth}`}
            aria-label="View monthly car registration details"
          >
            <Button isIconOnly variant="flat" radius="full" tabIndex={-1}>
              <ArrowUpRight className="size-6" />
            </Button>
          </Link>
        </div>
        <p className="text-default-500 text-sm">
          Monthly Change ({displayMonth})
        </p>
        <p className="mt-1 font-bold text-4xl text-primary tabular-nums">
          {isPositive ? "+" : ""}
          <AnimatedNumber value={Number(changePercent)} />%
        </p>
        <div className="mt-4 flex items-center gap-2">
          <Chip
            variant="flat"
            color={isPositive ? "success" : "danger"}
            size="sm"
            startContent={
              isPositive ? (
                <TrendingUp className="size-4" />
              ) : (
                <TrendingDown className="size-4" />
              )
            }
          >
            {isPositive ? "+" : ""}
            {changeAmount.toLocaleString()}
          </Chip>
          <span className="text-default-500 text-xs">vs previous month</span>
        </div>
      </CardBody>
    </Card>
  );
}
