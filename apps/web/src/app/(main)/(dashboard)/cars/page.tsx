import { Skeleton } from "@heroui/react";
import { CarsMonthPicker } from "@web/app/(main)/(dashboard)/cars/components/cars-month-picker";
import { DimensionPanel } from "@web/app/(main)/(dashboard)/cars/components/dimension-panel";
import { FuelMix } from "@web/app/(main)/(dashboard)/cars/components/fuel-mix";
import { MoversRail } from "@web/app/(main)/(dashboard)/cars/components/movers-rail";
import { PopulationPanel } from "@web/app/(main)/(dashboard)/cars/components/population-panel";
import { RegistrationsHero } from "@web/app/(main)/(dashboard)/cars/components/registrations-hero";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import {
  Hairline,
  OverviewGrid,
  OverviewPage,
} from "@web/components/shared/overview";
import { PageEyebrow } from "@web/components/shared/page-eyebrow";
import { StructuredData } from "@web/components/structured-data";
import { SITE_TITLE, SITE_URL } from "@web/config";
import { SOCIAL_HANDLE } from "@web/config/socials";
import { generateDataCatalogSchema } from "@web/lib/metadata";
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
    title,
    description,
    url: `${SITE_URL}/cars`,
    siteName: SITE_TITLE,
    locale: "en_SG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    site: SOCIAL_HANDLE,
    creator: SOCIAL_HANDLE,
  },
  alternates: {
    canonical: "/cars",
  },
};

interface PageProps {
  searchParams: Promise<SearchParams>;
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

      {/* Headline — the eyebrow, the month's figure and its fuel split */}
      <div className="flex flex-col gap-7">
        <PageEyebrow
          control={
            <Suspense fallback={<Skeleton className="h-6 w-36 rounded-full" />}>
              <CarsMonthPicker searchParams={searchParams} />
            </Suspense>
          }
          section="Cars"
          title="Cars"
        />

        <OverviewGrid>
          <SectionErrorBoundary title="Registration summary unavailable">
            <Suspense
              fallback={<Skeleton className="h-72 w-full rounded-lg" />}
            >
              <RegistrationsHero searchParams={searchParams} />
            </Suspense>
          </SectionErrorBoundary>
          <SectionErrorBoundary title="Fuel mix unavailable">
            <Suspense
              fallback={<Skeleton className="h-72 w-full rounded-lg" />}
            >
              <FuelMix searchParams={searchParams} />
            </Suspense>
          </SectionErrorBoundary>
        </OverviewGrid>
      </div>

      <Hairline />

      {/* The searchable, sortable dimension table */}
      <SectionErrorBoundary title="Registration breakdown unavailable">
        <Suspense
          fallback={<Skeleton className="h-[640px] w-full rounded-lg" />}
        >
          <DimensionPanel searchParams={searchParams} />
        </Suspense>
      </SectionErrorBoundary>

      <Hairline />

      <OverviewGrid>
        <SectionErrorBoundary title="Movers unavailable">
          <Suspense fallback={<Skeleton className="h-96 w-full rounded-lg" />}>
            <MoversRail searchParams={searchParams} />
          </Suspense>
        </SectionErrorBoundary>
        <SectionErrorBoundary title="Vehicle population unavailable">
          <Suspense fallback={<Skeleton className="h-96 w-full rounded-lg" />}>
            <PopulationPanel />
          </Suspense>
        </SectionErrorBoundary>
      </OverviewGrid>
    </OverviewPage>
  );
}
