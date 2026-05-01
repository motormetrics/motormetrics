"use client";

import { Card, Chip } from "@heroui/react";

import { formatDateToMonthYear } from "@motormetrics/utils";
import { AnimatedNumber } from "@web/components/animated-number";
import Typography from "@web/components/typography";
import type { Registration } from "@web/types/cars";
import { formatNumber, formatPercent } from "@web/utils/charts";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

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

  return (
    <Card>
      <Card.Header className="flex flex-col items-start gap-2">
        <Typography.H4>Total Registrations</Typography.H4>
      </Card.Header>
      <Card.Content className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <Typography.TextSm>
              {formatDateToMonthYear(monthA.month)}
            </Typography.TextSm>
            <div className="font-semibold text-4xl text-primary tabular-nums">
              <AnimatedNumber value={monthA.total} />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <Typography.TextSm>
              {formatDateToMonthYear(monthB.month)}
            </Typography.TextSm>
            <div className="font-semibold text-4xl text-default-500 tabular-nums">
              <AnimatedNumber value={monthB.total} />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Chip
            variant="soft"
            color={isNeutral ? "default" : isPositive ? "success" : "danger"}
          >
            {isNeutral ? null : isPositive ? (
              <ArrowUpRight className="size-4" />
            ) : (
              <ArrowDownRight className="size-4" />
            )}
            {formatPercent(Math.abs(change), { maximumFractionDigits: 1 })}
          </Chip>
          <span className="text-default-500 text-sm">
            {diff >= 0 ? "+" : ""}
            {formatNumber(diff)} registrations
          </span>
        </div>
      </Card.Content>
    </Card>
  );
}
