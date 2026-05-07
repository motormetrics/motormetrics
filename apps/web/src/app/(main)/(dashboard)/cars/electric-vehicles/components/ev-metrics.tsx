import { KPI, KPIGroup } from "@heroui-pro/react";
import { formatDateToMonthYear } from "@motormetrics/utils";
import Typography from "@web/components/typography";
import type { EvLatestSummary } from "@web/queries/cars/electric-vehicles";
import { Fragment } from "react";

interface EvMetricsProps {
  summary: EvLatestSummary;
}

export function EvMetrics({ summary }: EvMetricsProps) {
  const metrics = [
    {
      title: "Total EV Registrations",
      value: summary.totalEv,
      description: formatDateToMonthYear(summary.month),
      format: "number" as const,
    },
    {
      title: "EV Market Share",
      value: summary.evSharePercent / 100,
      description: "of all new registrations",
      format: "percent" as const,
    },
    {
      title: "BEV Count",
      value: summary.bevCount,
      description: "Battery electric vehicles",
      format: "number" as const,
    },
  ];

  return (
    <KPIGroup>
      {metrics.map((metric) => (
        <Fragment key={metric.title}>
          <KPI>
            <KPI.Header>
              <KPI.Title>{metric.title}</KPI.Title>
            </KPI.Header>
            <KPI.Content>
              <KPI.Value
                className="text-4xl text-accent"
                locale="en-SG"
                maximumFractionDigits={metric.format === "percent" ? 1 : 0}
                style={metric.format === "percent" ? "percent" : "decimal"}
                value={metric.value}
              />
            </KPI.Content>
            <KPI.Footer>
              <Typography.TextSm className="text-muted">
                {metric.description}
              </Typography.TextSm>
            </KPI.Footer>
          </KPI>
          <KPIGroup.Separator />
        </Fragment>
      ))}
      <KPI>
        <KPI.Header>
          <KPI.Title>Top EV Make</KPI.Title>
        </KPI.Header>
        <KPI.Content>
          <span className="font-semibold text-4xl text-accent tabular-nums">
            {summary.topMake}
          </span>
        </KPI.Content>
        <KPI.Footer>
          <Typography.TextSm className="text-muted">
            Most registered EV brand
          </Typography.TextSm>
        </KPI.Footer>
      </KPI>
    </KPIGroup>
  );
}
