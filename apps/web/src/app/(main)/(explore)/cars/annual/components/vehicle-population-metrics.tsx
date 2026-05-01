"use client";

import { Card, Chip } from "@heroui/react";

import { useEffectiveYear } from "@web/app/(main)/(explore)/cars/annual/hooks/use-effective-year";
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
  const numberFormatter = new Intl.NumberFormat("en-SG");

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
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <Card>
        <Card.Header>
          <Typography.H4>Total Fleet Size</Typography.H4>
        </Card.Header>
        <Card.Content>
          <span className="font-semibold text-4xl text-primary tabular-nums">
            {numberFormatter.format(totalFleet)}
          </span>
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <Typography.H4>Year-on-Year Change</Typography.H4>
        </Card.Header>
        <Card.Content className="flex flex-col gap-2">
          <span className="font-semibold text-4xl tabular-nums">
            {yoyChange >= 0 ? "+" : ""}
            {numberFormatter.format(yoyChange)}
          </span>
          {previousTotal > 0 && (
            <Chip
              className="rounded-full"
              color={yoyChange >= 0 ? "success" : "danger"}
              size="sm"
              variant="soft"
            >
              {yoyChange >= 0 ? "+" : ""}
              {yoyPercentage.toFixed(1)}%
            </Chip>
          )}
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <Typography.H4>EV Share</Typography.H4>
        </Card.Header>
        <Card.Content className="flex flex-col gap-2">
          <span className="font-semibold text-4xl tabular-nums">
            {evShare.toFixed(1)}%
          </span>
          <Typography.TextSm className="text-default-500">
            {numberFormatter.format(electricTotal)} electric vehicles
          </Typography.TextSm>
        </Card.Content>
      </Card>
    </div>
  );
}
