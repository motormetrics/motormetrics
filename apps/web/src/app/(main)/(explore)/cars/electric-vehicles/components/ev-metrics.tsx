import { Card, CardBody, CardHeader } from "@heroui/card";
import { cn } from "@heroui/theme";
import { CARD_PADDING, RADIUS } from "@motormetrics/theme/spacing";
import { formatDateToMonthYear } from "@motormetrics/utils";
import Typography from "@web/components/typography";
import type { EvLatestSummary } from "@web/queries/cars/electric-vehicles";

interface EvMetricsProps {
  summary: EvLatestSummary;
}

export function EvMetrics({ summary }: EvMetricsProps) {
  const numberFormatter = new Intl.NumberFormat("en-SG");

  const metrics = [
    {
      title: "Total EV Registrations",
      value: numberFormatter.format(summary.totalEv),
      description: formatDateToMonthYear(summary.month),
    },
    {
      title: "EV Market Share",
      value: `${summary.evSharePercent.toFixed(1)}%`,
      description: "of all new registrations",
    },
    {
      title: "BEV Count",
      value: numberFormatter.format(summary.bevCount),
      description: "Battery electric vehicles",
    },
    {
      title: "Top EV Make",
      value: summary.topMake,
      description: "Most registered EV brand",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <Card
          key={metric.title}
          className={cn(RADIUS.card, CARD_PADDING.standard)}
        >
          <CardHeader>
            <Typography.H4>{metric.title}</Typography.H4>
          </CardHeader>
          <CardBody className="flex flex-col gap-2">
            <span className="font-semibold text-4xl text-primary tabular-nums">
              {metric.value}
            </span>
            <Typography.TextSm className="text-default-500">
              {metric.description}
            </Typography.TextSm>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
