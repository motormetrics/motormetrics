import { KPIGroup } from "@heroui-pro/react";
import { formatDateToMonthYear } from "@motormetrics/utils";
import { MetricCard } from "@web/components/shared/metric-card";
import { SkeletonMetricCard } from "@web/components/shared/skeleton";
import { StructuredData } from "@web/components/structured-data";
import { SITE_TITLE, SITE_URL } from "@web/config";
import {
  generateBreadcrumbSchema,
  generateDatasetSchema,
} from "@web/lib/metadata";
import { getTopTypes } from "@web/queries/cars/market-insights";
import {
  getCarsComparison,
  getCarsData,
} from "@web/queries/cars/monthly-registrations";
import { formatVehicleType } from "@web/utils/formatting/format-vehicle-type";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { WebPage, WithContext } from "schema-dts";

interface MetricCardsSectionProps {
  month: string;
}

async function MetricCardsContent({ month }: MetricCardsSectionProps) {
  const [cars, comparison, topTypes] = await Promise.all([
    getCarsData(month),
    getCarsComparison(month),
    getTopTypes(month),
  ]);

  if (!cars) {
    return notFound();
  }

  const formattedMonth = formatDateToMonthYear(month);

  const title = `${formattedMonth} Car Registrations`;
  const description = `Discover ${formattedMonth} car registrations in Singapore. See detailed stats by fuel type, vehicle type, and top brands.`;
  const structuredData: WithContext<WebPage> = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url: `${SITE_URL}/cars/registrations`,
    publisher: {
      "@type": "Organization",
      name: SITE_TITLE,
      url: SITE_URL,
    },
  };

  return (
    <>
      <StructuredData data={structuredData} />
      <StructuredData
        data={{
          "@context": "https://schema.org",
          ...generateDatasetSchema("registrations"),
        }}
      />
      <StructuredData
        data={{
          "@context": "https://schema.org",
          ...generateBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Cars", path: "/cars" },
            { name: "Registrations", path: "/cars/registrations" },
          ]),
        }}
      />
      <KPIGroup>
        <MetricCard
          title="Total Registrations"
          value={cars.total}
          current={cars.total}
          previousMonth={comparison.previousMonth.total}
        />
        <KPIGroup.Separator />
        <MetricCard
          title={`Top Fuel Type: ${topTypes.topFuelType.name}`}
          value={topTypes.topFuelType.total}
          current={topTypes.topFuelType.total}
          previousMonth={
            comparison.previousMonth.fuelType.find(
              (fuelType) => fuelType.label === topTypes.topFuelType.name,
            )?.count ?? 0
          }
        />
        <KPIGroup.Separator />
        <MetricCard
          title={`Top Vehicle Type: ${formatVehicleType(topTypes.topVehicleType.name)}`}
          value={topTypes.topVehicleType.total}
          current={topTypes.topVehicleType.total}
          previousMonth={
            comparison.previousMonth.vehicleType.find(
              (vehicleType) =>
                vehicleType.label === topTypes.topVehicleType.name,
            )?.count ?? 0
          }
        />
      </KPIGroup>
    </>
  );
}

function MetricCardsSkeleton() {
  return (
    <KPIGroup>
      <SkeletonMetricCard />
      <KPIGroup.Separator />
      <SkeletonMetricCard />
      <KPIGroup.Separator />
      <SkeletonMetricCard />
    </KPIGroup>
  );
}

export function MetricCardsSection({ month }: MetricCardsSectionProps) {
  return (
    <Suspense fallback={<MetricCardsSkeleton />}>
      <MetricCardsContent month={month} />
    </Suspense>
  );
}
