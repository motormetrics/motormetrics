"use client";

import { KPI, KPIGroup, NumberValue } from "@heroui-pro/react";

import { useEffectiveYear } from "@web/app/(main)/(dashboard)/cars/annual/hooks/use-effective-year";
import Typography from "@web/components/typography";
import { useMemo } from "react";

interface YearlyTotal {
  year: string;
  total: number;
}

interface FuelTypeData {
  year: string;
  fuelType: string;
  total: number;
}

interface VehiclePopulationMetricsProps {
  yearlyTotals: YearlyTotal[];
  fuelTypeData: FuelTypeData[];
}

export function VehiclePopulationMetrics({
  yearlyTotals,
  fuelTypeData,
}: VehiclePopulationMetricsProps) {
  const effectiveYear = useEffectiveYear(
    yearlyTotals.map((item) => Number(item.year)),
  );
  const currentYearData = yearlyTotals.find(
    (item) => Number(item.year) === effectiveYear,
  );
  const previousYearData = yearlyTotals.find(
    (item) => Number(item.year) === effectiveYear - 1,
  );

  const totalFleet = currentYearData?.total ?? 0;
  const previousTotal = previousYearData?.total ?? 0;
  const yoyChange = totalFleet - previousTotal;
  const yoyPercentage =
    previousTotal > 0 ? (yoyChange / previousTotal) * 100 : 0;
  const trend = yoyChange > 0 ? "up" : yoyChange < 0 ? "down" : "neutral";

  const electricTotal = useMemo(() => {
    return fuelTypeData
      .filter(
        (item) =>
          Number(item.year) === effectiveYear && item.fuelType === "Electric",
      )
      .reduce((sum, item) => sum + item.total, 0);
  }, [fuelTypeData, effectiveYear]);

  const evShare = totalFleet > 0 ? (electricTotal / totalFleet) * 100 : 0;

  return (
    <KPIGroup>
      <KPI>
        <KPI.Header>
          <KPI.Title>Total Fleet Size</KPI.Title>
        </KPI.Header>
        <KPI.Content>
          <KPI.Value
            className="text-4xl text-accent"
            locale="en-SG"
            maximumFractionDigits={0}
            value={totalFleet}
          />
        </KPI.Content>
      </KPI>

      <KPIGroup.Separator />

      <KPI>
        <KPI.Header>
          <KPI.Title>Year-on-Year Change</KPI.Title>
        </KPI.Header>
        <KPI.Content>
          <KPI.Value
            className="text-4xl"
            locale="en-SG"
            maximumFractionDigits={0}
            signDisplay="exceptZero"
            value={yoyChange}
          />
          {previousTotal > 0 && (
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
          <KPI.Title>EV Share</KPI.Title>
        </KPI.Header>
        <KPI.Content>
          <KPI.Value
            className="text-4xl"
            maximumFractionDigits={1}
            style="percent"
            value={evShare / 100}
          />
        </KPI.Content>
        <KPI.Footer>
          <Typography.TextSm className="text-muted">
            <KPI.Value
              className="font-normal text-sm"
              locale="en-SG"
              maximumFractionDigits={0}
              value={electricTotal}
            />{" "}
            electric vehicles
          </Typography.TextSm>
        </KPI.Footer>
      </KPI>
    </KPIGroup>
  );
}
