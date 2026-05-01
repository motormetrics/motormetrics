"use client";

import { Card, Chip } from "@heroui/react";

import { useEffectiveYear } from "@web/app/(main)/(dashboard)/cars/annual/hooks/use-effective-year";
import Typography from "@web/components/typography";
import { useMemo } from "react";

interface MakeData {
  year: string;
  make: string;
  total: number;
}

interface YearlyTotal {
  year: string;
  total: number;
}

interface CarPopulationMetricsProps {
  makeData: MakeData[];
  yearlyTotals: YearlyTotal[];
}

export function CarPopulationMetrics({
  makeData,
  yearlyTotals,
}: CarPopulationMetricsProps) {
  const effectiveYear = useEffectiveYear(
    yearlyTotals.map((item) => Number(item.year)),
  );
  const numberFormatter = new Intl.NumberFormat("en-SG");

  const currentYearMakes = useMemo(
    () =>
      makeData
        .filter((item) => Number(item.year) === effectiveYear)
        .sort((a, b) => b.total - a.total),
    [makeData, effectiveYear],
  );

  const totalMakes = currentYearMakes.length;
  const topMake = currentYearMakes[0];
  const grandTotal = currentYearMakes.reduce(
    (sum, item) => sum + item.total,
    0,
  );

  const top5Total = currentYearMakes
    .slice(0, 5)
    .reduce((sum, item) => sum + item.total, 0);
  const top5Share = grandTotal > 0 ? (top5Total / grandTotal) * 100 : 0;

  const currentYearTotal = yearlyTotals.find(
    (item) => Number(item.year) === effectiveYear,
  );
  const previousYearTotal = yearlyTotals.find(
    (item) => Number(item.year) === effectiveYear - 1,
  );
  const yoyChange =
    currentYearTotal && previousYearTotal
      ? currentYearTotal.total - previousYearTotal.total
      : 0;
  const yoyPercentage =
    previousYearTotal && previousYearTotal.total > 0
      ? (yoyChange / previousYearTotal.total) * 100
      : 0;

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <Card>
        <Card.Header>
          <Typography.H4>Total Cars</Typography.H4>
        </Card.Header>
        <Card.Content className="flex flex-col gap-2">
          <span className="font-semibold text-4xl text-accent tabular-nums">
            {numberFormatter.format(grandTotal)}
          </span>
          {previousYearTotal && previousYearTotal.total > 0 && (
            <Chip
              className="rounded-full"
              color={yoyChange >= 0 ? "success" : "danger"}
              size="sm"
              variant="primary"
            >
              {yoyChange >= 0 ? "+" : ""}
              {yoyPercentage.toFixed(1)}%
            </Chip>
          )}
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <Typography.H4>Top Make</Typography.H4>
        </Card.Header>
        <Card.Content className="flex flex-col gap-2">
          <span className="font-semibold text-4xl tabular-nums">
            {topMake?.make ?? "—"}
          </span>
          {topMake && (
            <Typography.TextSm className="text-muted">
              {numberFormatter.format(topMake.total)} cars ({totalMakes} makes
              total)
            </Typography.TextSm>
          )}
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <Typography.H4>Top 5 Concentration</Typography.H4>
        </Card.Header>
        <Card.Content className="flex flex-col gap-2">
          <span className="font-semibold text-4xl tabular-nums">
            {top5Share.toFixed(1)}%
          </span>
          <Typography.TextSm className="text-muted">
            {numberFormatter.format(top5Total)} of{" "}
            {numberFormatter.format(grandTotal)} cars
          </Typography.TextSm>
        </Card.Content>
      </Card>
    </div>
  );
}
