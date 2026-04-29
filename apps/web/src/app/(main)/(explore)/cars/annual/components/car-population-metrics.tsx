"use client";

import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { cn } from "@heroui/theme";
import { CARD_PADDING, RADIUS } from "@motormetrics/theme/spacing";
import { useEffectiveYear } from "@web/app/(main)/(explore)/cars/annual/hooks/use-effective-year";
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
      <Card className={cn(RADIUS.card, CARD_PADDING.standard)}>
        <CardHeader>
          <Typography.H4>Total Cars</Typography.H4>
        </CardHeader>
        <CardBody className="flex flex-col gap-2">
          <span className="font-semibold text-4xl text-primary tabular-nums">
            {numberFormatter.format(grandTotal)}
          </span>
          {previousYearTotal && previousYearTotal.total > 0 && (
            <Chip
              className="rounded-full"
              color={yoyChange >= 0 ? "success" : "danger"}
              size="sm"
              variant="flat"
            >
              {yoyChange >= 0 ? "+" : ""}
              {yoyPercentage.toFixed(1)}%
            </Chip>
          )}
        </CardBody>
      </Card>

      <Card className={cn(RADIUS.card, CARD_PADDING.standard)}>
        <CardHeader>
          <Typography.H4>Top Make</Typography.H4>
        </CardHeader>
        <CardBody className="flex flex-col gap-2">
          <span className="font-semibold text-4xl tabular-nums">
            {topMake?.make ?? "—"}
          </span>
          {topMake && (
            <Typography.TextSm className="text-default-500">
              {numberFormatter.format(topMake.total)} cars ({totalMakes} makes
              total)
            </Typography.TextSm>
          )}
        </CardBody>
      </Card>

      <Card className={cn(RADIUS.card, CARD_PADDING.standard)}>
        <CardHeader>
          <Typography.H4>Top 5 Concentration</Typography.H4>
        </CardHeader>
        <CardBody className="flex flex-col gap-2">
          <span className="font-semibold text-4xl tabular-nums">
            {top5Share.toFixed(1)}%
          </span>
          <Typography.TextSm className="text-default-500">
            {numberFormatter.format(top5Total)} of{" "}
            {numberFormatter.format(grandTotal)} cars
          </Typography.TextSm>
        </CardBody>
      </Card>
    </div>
  );
}
