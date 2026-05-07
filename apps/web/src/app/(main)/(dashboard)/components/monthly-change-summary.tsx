import { Button, Link } from "@heroui/react";
import { KPI, NumberValue } from "@heroui-pro/react";
import { getCarsComparison, getCarsLatestMonth } from "@web/queries/cars";
import { ArrowUpRight, CalendarDays } from "lucide-react";

export async function MonthlyChangeSummary() {
  const latestMonth = await getCarsLatestMonth();

  if (!latestMonth) {
    return null;
  }

  const comparison = await getCarsComparison(latestMonth);
  const currentTotal = comparison.currentMonth.total;
  const previousTotal = comparison.previousMonth.total;

  const changeAmount = currentTotal - previousTotal;
  const changeRatio = previousTotal > 0 ? changeAmount / previousTotal : 0;
  const trend = changeRatio > 0 ? "up" : changeRatio < 0 ? "down" : "neutral";

  // Format the month for display (e.g., "2025-01" -> "Jan 2025")
  const [year, month] = latestMonth.split("-");
  const displayMonth = new Date(Number(year), Number(month) - 1).toLocaleString(
    "en-SG",
    { month: "short", year: "numeric" },
  );

  return (
    <KPI className="border-2 border-accent">
      <KPI.Header>
        <div className="flex size-12 items-center justify-center rounded-2xl bg-accent/10">
          <CalendarDays className="size-6 text-accent" />
        </div>
        <Link
          aria-label="View monthly car registration details"
          className="ml-auto"
          href={`/cars?month=${latestMonth}`}
        >
          <Button isIconOnly variant="tertiary">
            <ArrowUpRight className="size-6" />
          </Button>
        </Link>
      </KPI.Header>
      <KPI.Header>
        <KPI.Title>Monthly Change ({displayMonth})</KPI.Title>
      </KPI.Header>
      <KPI.Content>
        <KPI.Value
          className="text-4xl text-accent"
          maximumFractionDigits={1}
          signDisplay="exceptZero"
          style="percent"
          value={changeRatio}
        />
        <KPI.Trend trend={trend} variant="primary">
          <NumberValue
            locale="en-SG"
            maximumFractionDigits={0}
            signDisplay="exceptZero"
            value={changeAmount}
          />
        </KPI.Trend>
      </KPI.Content>
      <KPI.Footer>
        <span className="text-muted text-xs">vs previous month</span>
      </KPI.Footer>
    </KPI>
  );
}
