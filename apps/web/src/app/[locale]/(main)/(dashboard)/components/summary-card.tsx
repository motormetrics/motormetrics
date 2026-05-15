import { Button, Link } from "@heroui/react";
import { KPI, NumberValue } from "@heroui-pro/react";
import { getYearlyRegistrations } from "@web/queries/cars";
import { ArrowUpRight, BarChart3 } from "lucide-react";

export async function SummaryCard() {
  const yearlyData = await getYearlyRegistrations();
  const currentYear = yearlyData.at(-1);
  const previousYear = yearlyData.at(-2);

  const totalRegistrations = currentYear?.total ?? 0;
  const previousTotal = previousYear?.total ?? 0;
  const displayYear = currentYear?.year ?? "No data";
  const changeRatio =
    previousTotal > 0
      ? (totalRegistrations - previousTotal) / previousTotal
      : 0;
  const isPositive = totalRegistrations >= previousTotal;
  const trend = changeRatio > 0 ? "up" : changeRatio < 0 ? "down" : "neutral";

  return (
    <KPI className="border-2 border-accent">
      <KPI.Header>
        <div className="flex size-12 items-center justify-center rounded-2xl bg-accent/10">
          <BarChart3 className="size-6 text-accent" />
        </div>
        <Link className="ml-auto" href="/cars">
          <Button isIconOnly variant="tertiary">
            <ArrowUpRight className="size-6" />
          </Button>
        </Link>
      </KPI.Header>
      <KPI.Header>
        <KPI.Title>Total Registrations ({displayYear})</KPI.Title>
      </KPI.Header>
      <KPI.Content>
        <KPI.Value
          className="text-4xl text-accent"
          locale="en-SG"
          maximumFractionDigits={0}
          value={totalRegistrations}
        />
        <KPI.Trend trend={trend} variant="primary">
          <NumberValue
            maximumFractionDigits={1}
            signDisplay="exceptZero"
            style="percent"
            value={isPositive ? Math.abs(changeRatio) : -Math.abs(changeRatio)}
          />
        </KPI.Trend>
      </KPI.Content>
      <KPI.Footer>
        <span className="text-muted text-xs">vs previous year</span>
      </KPI.Footer>
    </KPI>
  );
}
