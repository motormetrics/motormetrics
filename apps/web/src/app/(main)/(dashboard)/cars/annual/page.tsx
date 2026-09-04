import { Skeleton } from "@heroui/react";
import { ClassesTable } from "@web/app/(main)/(dashboard)/cars/annual/components/classes-table";
import { ElectricFleet } from "@web/app/(main)/(dashboard)/cars/annual/components/electric-fleet";
import { FuelMixRing } from "@web/app/(main)/(dashboard)/cars/annual/components/fuel-mix-ring";
import { PopulationByYear } from "@web/app/(main)/(dashboard)/cars/annual/components/population-by-year";
import { PopulationHeadline } from "@web/app/(main)/(dashboard)/cars/annual/components/population-headline";
import {
  buildPopulationSeries,
  CARS,
  rankClasses,
} from "@web/app/(main)/(dashboard)/cars/annual/population-series";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import { EmptyState } from "@web/components/shared/empty-state";
import {
  Hairline,
  OverviewGrid,
  OverviewPage,
} from "@web/components/shared/overview";
import { EyebrowValue, PageEyebrow } from "@web/components/shared/page-eyebrow";
import { StructuredData } from "@web/components/structured-data";
import { SITE_TITLE, SITE_URL } from "@web/config";
import {
  generateBreadcrumbSchema,
  generateDatasetSchema,
} from "@web/lib/metadata";
import { getVehiclePopulationByCategoryAndFuelType } from "@web/queries/vehicle-population";
import { BarChart3 } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import type { WebPage, WithContext } from "schema-dts";

export const metadata: Metadata = {
  title: "Annual Vehicle Population Singapore",
  description:
    "Annual motor vehicle population in Singapore by vehicle type and fuel type. Track the growth of electric, hybrid, petrol, and diesel vehicles on Singapore roads.",
  openGraph: {
    title: "Annual Vehicle Population - Singapore",
    description:
      "Explore annual vehicle population trends in Singapore with interactive charts and key statistics.",
    type: "website",
  },
  alternates: {
    canonical: "/cars/annual",
  },
};

const structuredData: WithContext<WebPage> = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Annual Vehicle Population",
  description:
    "Motor vehicle population in Singapore by vehicle type and type of fuel used, with interactive charts and year-over-year analysis",
  url: `${SITE_URL}/cars/annual`,
  publisher: {
    "@type": "Organization",
    name: SITE_TITLE,
    url: SITE_URL,
  },
};

function PopulationSkeleton() {
  return (
    <>
      <OverviewGrid>
        <div className="flex flex-col gap-4">
          <Skeleton className="h-6 w-40 rounded-lg" />
          <Skeleton className="h-16 w-72 rounded-lg" />
          <Skeleton className="h-5 w-full max-w-md rounded-lg" />
          <Skeleton className="h-[150px] w-full rounded-lg" />
        </div>
        <div className="flex flex-col gap-4">
          <Skeleton className="h-6 w-24 rounded-lg" />
          <Skeleton className="h-5 w-40 rounded-lg" />
          <Skeleton className="size-[172px] rounded-full" />
        </div>
      </OverviewGrid>
      <Hairline />
      <Skeleton className="h-[320px] w-full rounded-lg" />
      <Hairline />
      <Skeleton className="h-[420px] w-full rounded-lg" />
    </>
  );
}

export default function AnnualPage() {
  return (
    <>
      <StructuredData data={structuredData} />
      <StructuredData
        data={{
          "@context": "https://schema.org",
          ...generateDatasetSchema("annual"),
        }}
      />
      <StructuredData
        data={{
          "@context": "https://schema.org",
          ...generateBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Cars", path: "/cars" },
            { name: "Vehicle Population", path: "/cars/annual" },
          ]),
        }}
      />

      <OverviewPage>
        <PageEyebrow
          control={<EyebrowValue>{CARS}</EyebrowValue>}
          section="Vehicle population"
          title="Annual vehicle population"
        />

        <SectionErrorBoundary title="Vehicle population unavailable">
          <Suspense fallback={<PopulationSkeleton />}>
            <PopulationSections />
          </Suspense>
        </SectionErrorBoundary>
      </OverviewPage>
    </>
  );
}

/**
 * One query feeds every section: the grid of year × class × fuel is small
 * enough to pivot once on the server and hand each block its slice.
 */
async function PopulationSections() {
  const rows = await getVehiclePopulationByCategoryAndFuelType();
  const data = buildPopulationSeries(
    rows.map((row) => ({
      fuelType: row.fuelType,
      name: row.category,
      total: row.total,
      year: row.year,
    })),
  );

  const cars = data?.entities.find((entity) => entity.name === CARS);

  if (!data || !cars) {
    return (
      <EmptyState
        description="Annual vehicle population data is not available at the moment. Please check back later."
        icon={
          <div className="flex size-16 items-center justify-center rounded-2xl bg-default">
            <BarChart3 className="size-8 text-muted" />
          </div>
        }
        showDefaultActions={false}
        title="No Data Available Yet"
      />
    );
  }

  return (
    <>
      <OverviewGrid>
        <PopulationHeadline
          entity={cars}
          previousYear={data.previousYear}
          year={data.year}
          years={data.years}
        />
        <FuelMixRing entity={cars} year={data.year} />
      </OverviewGrid>

      <Hairline />

      <PopulationByYear entity={cars} years={data.years} />

      <Hairline />

      <ClassesTable
        previousYear={data.previousYear}
        rows={rankClasses(data.entities)}
        year={data.year}
      />

      <Hairline />

      <OverviewGrid>
        <ElectricFleet entity={cars} years={data.years} />
      </OverviewGrid>
    </>
  );
}
