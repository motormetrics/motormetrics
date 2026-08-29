import { Skeleton } from "@heroui/react";
import { AnnualViewTabs } from "@web/app/(main)/(dashboard)/cars/annual/components/annual-view-tabs";
import { PopulationOverview } from "@web/app/(main)/(dashboard)/cars/annual/components/population-overview";
import {
  buildPopulationSeries,
  DIMENSION_LABELS,
  type PopulationRow,
} from "@web/app/(main)/(dashboard)/cars/annual/population-series";
import { loadSearchParams } from "@web/app/(main)/(dashboard)/cars/annual/search-params";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import { Bento } from "@web/components/shared/bento";
import { EmptyState } from "@web/components/shared/empty-state";
import { PageHead } from "@web/components/shared/page-head";
import { YearSelector } from "@web/components/shared/year-selector";
import { StructuredData } from "@web/components/structured-data";
import { SITE_TITLE, SITE_URL } from "@web/config";
import {
  generateBreadcrumbSchema,
  generateDatasetSchema,
} from "@web/lib/metadata";
import {
  getCarPopulationByMakeAndFuelType,
  getCarPopulationYears,
} from "@web/queries/car-population";
import {
  getVehiclePopulationByCategoryAndFuelType,
  getVehiclePopulationYears,
} from "@web/queries/vehicle-population";
import { BarChart3 } from "lucide-react";
import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import type { WebPage, WithContext } from "schema-dts";

export const metadata: Metadata = {
  title: "Annual Vehicle Population Singapore",
  description:
    "Annual motor vehicle population in Singapore by vehicle type, fuel type and car make. Track the growth of electric, hybrid, petrol, and diesel vehicles on Singapore roads.",
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
    "Motor vehicle population in Singapore by vehicle type and type of fuel used, and car population by make, with interactive charts and year-over-year analysis",
  url: `${SITE_URL}/cars/annual`,
  publisher: {
    "@type": "Organization",
    name: SITE_TITLE,
    url: SITE_URL,
  },
};

interface PageProps {
  searchParams: Promise<SearchParams>;
}

function CardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-4xl bg-surface p-7 shadow-surface ${className}`}>
      <div className="flex flex-col gap-4">
        <Skeleton className="h-4 w-32 rounded-lg" />
        <Skeleton className="h-12 w-40 rounded-lg" />
        <Skeleton className="h-6 w-44 rounded-full" />
      </div>
    </div>
  );
}

function OverviewSkeleton() {
  return (
    <Bento>
      <CardSkeleton className="h-[520px]" />
      <CardSkeleton className="h-[720px]" />
      <CardSkeleton className="h-[560px]" />
    </Bento>
  );
}

export default function AnnualPage({ searchParams }: PageProps) {
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

      <PageHead
        controls={
          <Suspense
            fallback={<Skeleton className="h-14 w-[19rem] rounded-full" />}
          >
            <AnnualViewTabs />
            <AnnualYearSelector searchParams={searchParams} />
          </Suspense>
        }
        title="Vehicle population"
      />

      <SectionErrorBoundary title="Vehicle population unavailable">
        <Suspense fallback={<OverviewSkeleton />}>
          <PopulationSection searchParams={searchParams} />
        </Suspense>
      </SectionErrorBoundary>
    </>
  );
}

/** Years on offer come from whichever dataset the view is reading. */
async function AnnualYearSelector({ searchParams }: PageProps) {
  const { year, view } = await loadSearchParams(searchParams);
  const availableYears =
    view === "make"
      ? await getCarPopulationYears()
      : await getVehiclePopulationYears();

  if (availableYears.length === 0) {
    return null;
  }

  const years = availableYears.map((entry) => Number(entry.year));
  const latestYear = years[0];

  return (
    <YearSelector
      latestYear={latestYear}
      wasAdjusted={!years.includes(year)}
      years={years}
    />
  );
}

/**
 * Both annual datasets are annual counts of the same shape — a year, an entity
 * and a fuel type — so the page flattens whichever the view selects into one
 * series and hands it to the same bento.
 */
async function PopulationSection({ searchParams }: PageProps) {
  const { view, year } = await loadSearchParams(searchParams);
  const labels = DIMENSION_LABELS[view];

  const rows: PopulationRow[] =
    view === "make"
      ? (await getCarPopulationByMakeAndFuelType()).map((row) => ({
          fuelType: row.fuelType,
          name: row.make,
          total: row.total,
          year: row.year,
        }))
      : (await getVehiclePopulationByCategoryAndFuelType()).map((row) => ({
          fuelType: row.fuelType,
          name: row.category,
          total: row.total,
          year: row.year,
        }));

  const data = buildPopulationSeries(rows, year, labels.overall);

  if (!data) {
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

  return <PopulationOverview data={data} labels={labels} />;
}
