import { Card, Link } from "@heroui/react";
import { KPI, KPIGroup } from "@heroui-pro/react";
import type { CarLogo } from "@logos/types";
import type { SelectCar } from "@motormetrics/database";
import { slugify } from "@motormetrics/utils";
import { CoeComparisonChart } from "@web/app/[locale]/(main)/(dashboard)/cars/components/makes/coe-comparison-chart";
import { MakeTrendChart } from "@web/app/[locale]/(main)/(dashboard)/cars/components/makes/make-trend-chart";
import { TypeBreakdownChart } from "@web/app/[locale]/(main)/(dashboard)/cars/components/makes/type-breakdown-chart";
import { EmptyState } from "@web/components/shared/empty-state";
import { columns } from "@web/components/tables/columns/cars-make-columns";
import { DataTable } from "@web/components/tables/data-table";
import Typography from "@web/components/typography";
import type { MakeCoeComparisonData } from "@web/queries/cars/makes/coe-comparison";
import { Calendar, Car, TrendingUp } from "lucide-react";
import Image from "next/image";

interface MakeDetailProps {
  cars: {
    make: string;
    total: number;
    monthTotal: number;
    data: Partial<SelectCar>[];
    historicalData: { month: string; count: number }[];
    monthsTracked: number;
  } | null;
  coeComparison: MakeCoeComparisonData[];
  logo?: CarLogo | null;
  fuelTypeBreakdown?: { name: string; value: number }[];
  vehicleTypeBreakdown?: { name: string; value: number }[];
}

export function MakeDetail({
  cars,
  coeComparison,
  logo,
  fuelTypeBreakdown = [],
  vehicleTypeBreakdown = [],
}: MakeDetailProps) {
  if (!cars) {
    return <EmptyState />;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header with logo and make name */}
      <div className="flex items-center gap-4 border-border border-b pb-6">
        <div className="flex size-16 items-center justify-center">
          {logo?.url ? (
            <Image
              src={logo.url}
              alt={`${cars.make} logo`}
              width={48}
              height={48}
              className="object-contain"
            />
          ) : (
            <span className="flex size-full items-center justify-center rounded-full bg-accent font-semibold text-accent-foreground text-xl">
              {cars.make.charAt(0)}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <Typography.H2>{cars.make}</Typography.H2>
          <Typography.TextSm>Vehicle Registrations</Typography.TextSm>
        </div>
      </div>

      {/* Metric cards */}
      <KPIGroup>
        <KPI>
          <KPI.Header>
            <KPI.Icon status="success">
              <Car />
            </KPI.Icon>
            <KPI.Title>Total</KPI.Title>
          </KPI.Header>
          <KPI.Content>
            <KPI.Value
              className="text-accent text-xl"
              locale="en-SG"
              maximumFractionDigits={0}
              value={cars.total}
            />
          </KPI.Content>
        </KPI>
        <KPIGroup.Separator />
        <KPI>
          <KPI.Header>
            <KPI.Icon status="success">
              <TrendingUp />
            </KPI.Icon>
            <KPI.Title>This Month</KPI.Title>
          </KPI.Header>
          <KPI.Content>
            <KPI.Value
              className="text-xl"
              locale="en-SG"
              maximumFractionDigits={0}
              value={cars.monthTotal}
            />
          </KPI.Content>
        </KPI>
        <KPIGroup.Separator />
        <KPI>
          <KPI.Header>
            <KPI.Icon status="warning">
              <Calendar />
            </KPI.Icon>
            <KPI.Title>Tracked</KPI.Title>
          </KPI.Header>
          <KPI.Content>
            <div className="flex items-baseline gap-1">
              <KPI.Value
                className="text-xl"
                locale="en-SG"
                maximumFractionDigits={0}
                value={cars.monthsTracked}
              />
              <span className="font-normal text-muted text-sm">mo</span>
            </div>
          </KPI.Content>
        </KPI>
      </KPIGroup>

      {/* Historical Trend Chart */}
      <Card>
        <Card.Header className="flex flex-row items-baseline justify-between">
          <Typography.H4>Historical Trend</Typography.H4>
          <Typography.Caption>Past registrations</Typography.Caption>
        </Card.Header>
        <Card.Content>
          <MakeTrendChart data={cars.historicalData.toReversed()} />
        </Card.Content>
      </Card>

      {/* Fuel & Vehicle Type Breakdown Charts */}
      {(fuelTypeBreakdown.length > 0 || vehicleTypeBreakdown.length > 0) && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {fuelTypeBreakdown.length > 0 && (
            <div className="flex flex-col gap-3">
              <TypeBreakdownChart
                data={fuelTypeBreakdown}
                title="Fuel Type Breakdown"
                description="Registrations by fuel type"
              />
              <div className="flex flex-wrap gap-2 px-1">
                {fuelTypeBreakdown.map(({ name }) => (
                  <Link
                    key={name}
                    href={`/cars/fuel-types/${slugify(name)}`}
                    className="text-accent text-sm hover:underline"
                  >
                    {name}
                  </Link>
                ))}
              </div>
            </div>
          )}
          {vehicleTypeBreakdown.length > 0 && (
            <div className="flex flex-col gap-3">
              <TypeBreakdownChart
                data={vehicleTypeBreakdown}
                title="Vehicle Type Breakdown"
                description="Registrations by vehicle type"
              />
              <div className="flex flex-wrap gap-2 px-1">
                {vehicleTypeBreakdown.map(({ name }) => (
                  <Link
                    key={name}
                    href={`/cars/vehicle-types/${slugify(name)}`}
                    className="text-accent text-sm hover:underline"
                  >
                    {name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* COE Comparison Chart */}
      <Card>
        <Card.Header className="flex flex-col items-start gap-2">
          <Typography.H4>Registration vs COE Premium</Typography.H4>
        </Card.Header>
        <Card.Content className="flex flex-col gap-4">
          <CoeComparisonChart data={coeComparison} />
          <Typography.Caption>
            Bars show monthly registrations (left axis), lines show COE Category
            A and B premiums (right axis).
          </Typography.Caption>
        </Card.Content>
      </Card>

      {/* Summary Table */}
      <Card>
        <Card.Header className="flex flex-row items-baseline justify-between">
          <Typography.H4>Summary</Typography.H4>
          <Typography.Caption>Fuel & vehicle types by month</Typography.Caption>
        </Card.Header>
        <Card.Content className="p-0">
          <DataTable columns={columns} data={cars.data} />
        </Card.Content>
      </Card>
    </div>
  );
}
