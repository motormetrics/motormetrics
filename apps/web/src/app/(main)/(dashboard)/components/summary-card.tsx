import { Link, Tooltip } from "@heroui/react";
import { buttonVariants } from "@heroui/styles";
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
    <KPI>
      <KPI.Header>
        <div className="flex size-11 items-center justify-center rounded-xl bg-default text-accent">
          <BarChart3 className="size-6 text-accent" />
        </div>
        <Tooltip delay={300}>
          <Link
            aria-label="View car registration overview"
            className={buttonVariants({
              className: "ml-auto size-10",
              isIconOnly: true,
              variant: "tertiary",
            })}
            href="/cars"
          >
            <ArrowUpRight className="size-6" />
          </Link>
          <Tooltip.Content>View car registration overview</Tooltip.Content>
        </Tooltip>
      </KPI.Header>
      <KPI.Header>
        <KPI.Title>Total Registrations ({displayYear})</KPI.Title>
      </KPI.Header>
      <KPI.Content>
        <KPI.Value
          className="text-4xl tabular-nums"
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
