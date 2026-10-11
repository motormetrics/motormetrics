import { Skeleton } from "@heroui/react";
import { CarsMonthPicker } from "@web/app/(main)/(dashboard)/cars/components/cars-month-picker";
import { DimensionPanel } from "@web/app/(main)/(dashboard)/cars/components/dimension-panel";
import { FuelMix } from "@web/app/(main)/(dashboard)/cars/components/fuel-mix";
import { MoversRail } from "@web/app/(main)/(dashboard)/cars/components/movers-rail";
import { PopulationPanel } from "@web/app/(main)/(dashboard)/cars/components/population-panel";
import { RegistrationsHero } from "@web/app/(main)/(dashboard)/cars/components/registrations-hero";
import { resolveCarsMonth } from "@web/app/(main)/(dashboard)/cars/search-params";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import {
  Hairline,
  OverviewGrid,
  OverviewPage,
} from "@web/components/shared/overview";
import { PageHead } from "@web/components/shared/page-head";
import { StructuredData } from "@web/components/structured-data";
import { SITE_URL } from "@web/config";
import { generateDataCatalogSchema } from "@web/lib/metadata";
import { baseOpenGraph, baseTwitter } from "@web/lib/metadata/social";
import { formatMonthLabel } from "@web/utils/dates/format-month";
import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";

const title = "Singapore Car Registration Data";
const description =
  "Explore Singapore vehicle data including new registrations, deregistrations, makes, fuel types, vehicle types, and PARF calculator.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    ...baseOpenGraph,
    title,
    description,
    url: `${SITE_URL}/cars`,
  },
  twitter: {
    ...baseTwitter,
    title,
    description,
  },
  alternates: {
    canonical: "/cars",
  },
};

interface PageProps {
  searchParams: Promise<SearchParams>;
}

/** Names the month the page reports, and its source. */
async function CarsMonthSub({ searchParams }: PageProps) {
  const month = await resolveCarsMonth(searchParams);

  return (
    <>
      <span className="font-semibold text-foreground">
        {formatMonthLabel(month)}
      </span>{" "}
      · Source: LTA via DataMall
    </>
  );
}

export default function CarsPage({ searchParams }: PageProps) {
  return (
    <OverviewPage>
      <StructuredData
        data={{
          "@context": "https://schema.org",
          ...generateDataCatalogSchema(
            "Singapore Vehicle Data Catalogue",
            "Comprehensive collection of Singapore vehicle registration, deregistration, and population datasets sourced from the Land Transport Authority.",
            "/cars",
            ["registrations", "deregistrations", "annual", "electric-vehicles"],
          ),
        }}
      />

      <PageHead
        controls={
          <Suspense fallback={<Skeleton className="h-8 w-36" />}>
            <CarsMonthPicker searchParams={searchParams} />
          </Suspense>
        }
        eyebrow="Cars"
        sub={
          <Suspense fallback={<Skeleton className="h-5 w-56" />}>
            <CarsMonthSub searchParams={searchParams} />
          </Suspense>
        }
        title="New car registrations"
      />

      <div className="grid gap-10 lg:grid-cols-2 lg:items-end lg:gap-14">
        <SectionErrorBoundary title="Registration summary unavailable">
          <Suspense fallback={<Skeleton className="h-48 w-full" />}>
            <RegistrationsHero searchParams={searchParams} />
          </Suspense>
        </SectionErrorBoundary>
        <SectionErrorBoundary title="Fuel mix unavailable">
          <Suspense fallback={<Skeleton className="h-72 w-full" />}>
            <FuelMix searchParams={searchParams} />
          </Suspense>
        </SectionErrorBoundary>
      </div>

      <Hairline />

      {/* The searchable, sortable dimension table */}
      <SectionErrorBoundary title="Registration breakdown unavailable">
        <Suspense fallback={<Skeleton className="h-[640px] w-full" />}>
          <DimensionPanel searchParams={searchParams} />
        </Suspense>
      </SectionErrorBoundary>

      <Hairline />

      <OverviewGrid>
        <SectionErrorBoundary title="Movers unavailable">
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <MoversRail searchParams={searchParams} />
          </Suspense>
        </SectionErrorBoundary>
        <SectionErrorBoundary title="Vehicle population unavailable">
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <PopulationPanel />
          </Suspense>
        </SectionErrorBoundary>
      </OverviewGrid>
    </OverviewPage>
  );
}
