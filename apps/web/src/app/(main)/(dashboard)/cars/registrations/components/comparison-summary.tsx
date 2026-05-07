"use client";

import { Card } from "@heroui/react";
import { KPI, KPIGroup, TrendChip } from "@heroui-pro/react";

import { formatDateToMonthYear } from "@motormetrics/utils";
import Typography from "@web/components/typography";
import type { Registration } from "@web/types/cars";
import { formatNumber, formatPercent } from "@web/utils/charts";

interface ComparisonSummaryProps {
  monthA: Registration;
  monthB: Registration;
}

export function ComparisonSummary({ monthA, monthB }: ComparisonSummaryProps) {
  const change =
    monthB.total > 0 ? (monthA.total - monthB.total) / monthB.total : 0;
  const diff = monthA.total - monthB.total;
  const isNeutral = monthB.total === 0 || change === 0;
  const isPositive = change > 0;
  const trend = isNeutral ? "neutral" : isPositive ? "up" : "down";

  return (
    <Card>
      <Card.Header className="flex flex-col items-start gap-2">
        <Typography.H4>Total Registrations</Typography.H4>
      </Card.Header>
      <Card.Content className="flex flex-col gap-4">
        <KPIGroup>
          <KPI>
            <KPI.Header>
              <KPI.Title>{formatDateToMonthYear(monthA.month)}</KPI.Title>
            </KPI.Header>
            <KPI.Content>
              <KPI.Value
                className="text-4xl text-accent"
                locale="en-SG"
                maximumFractionDigits={0}
                value={monthA.total}
              />
            </KPI.Content>
          </KPI>
          <KPIGroup.Separator />
          <KPI>
            <KPI.Header>
              <KPI.Title>{formatDateToMonthYear(monthB.month)}</KPI.Title>
            </KPI.Header>
            <KPI.Content>
              <KPI.Value
                className="text-4xl text-muted"
                locale="en-SG"
                maximumFractionDigits={0}
                value={monthB.total}
              />
            </KPI.Content>
          </KPI>
        </KPIGroup>
        <div className="flex items-center gap-2">
          <TrendChip trend={trend} variant="primary">
            {formatPercent(Math.abs(change), { maximumFractionDigits: 1 })}
          </TrendChip>
          <span className="text-muted text-sm">
            {diff >= 0 ? "+" : ""}
            {formatNumber(diff)} registrations
          </span>
        </div>
      </Card.Content>
    </Card>
  );
}
