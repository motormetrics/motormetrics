"use client";

import { KPI, KPIGroup, NumberValue } from "@heroui-pro/react";

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
  const trend = yoyChange > 0 ? "up" : yoyChange < 0 ? "down" : "neutral";

  return (
    <KPIGroup>
      <KPI>
        <KPI.Header>
          <KPI.Title>Total Cars</KPI.Title>
        </KPI.Header>
        <KPI.Content>
          <KPI.Value
            className="text-4xl text-accent"
            locale="en-SG"
            maximumFractionDigits={0}
            value={grandTotal}
          />
          {previousYearTotal && previousYearTotal.total > 0 && (
            <KPI.Trend trend={trend} variant="primary">
              <NumberValue
                maximumFractionDigits={1}
                signDisplay="exceptZero"
                style="percent"
                value={yoyPercentage / 100}
              />
            </KPI.Trend>
          )}
        </KPI.Content>
      </KPI>

      <KPIGroup.Separator />

      <KPI>
        <KPI.Header>
          <KPI.Title>Top Make</KPI.Title>
        </KPI.Header>
        <KPI.Content>
          <span className="font-semibold text-4xl">{topMake?.make ?? "—"}</span>
        </KPI.Content>
        {topMake && (
          <KPI.Footer>
            <Typography.TextSm className="text-muted">
              <KPI.Value
                className="font-normal text-sm"
                locale="en-SG"
                maximumFractionDigits={0}
                value={topMake.total}
              />{" "}
              cars (
              <NumberValue
                locale="en-SG"
                maximumFractionDigits={0}
                value={totalMakes}
              />{" "}
              makes total)
            </Typography.TextSm>
          </KPI.Footer>
        )}
      </KPI>

      <KPIGroup.Separator />

      <KPI>
        <KPI.Header>
          <KPI.Title>Top 5 Concentration</KPI.Title>
        </KPI.Header>
        <KPI.Content>
          <KPI.Value
            className="text-4xl"
            maximumFractionDigits={1}
            style="percent"
            value={top5Share / 100}
          />
        </KPI.Content>
        <KPI.Footer>
          <Typography.TextSm className="text-muted">
            <KPI.Value
              className="font-normal text-sm"
              locale="en-SG"
              maximumFractionDigits={0}
              value={top5Total}
            />{" "}
            of{" "}
            <KPI.Value
              className="font-normal text-sm"
              locale="en-SG"
              maximumFractionDigits={0}
              value={grandTotal}
            />{" "}
            cars
          </Typography.TextSm>
        </KPI.Footer>
      </KPI>
    </KPIGroup>
  );
}
