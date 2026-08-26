import { Skeleton } from "@heroui/react";
import { CarsMonthPicker } from "@web/app/(main)/(dashboard)/cars/components/cars-month-picker";
import { DimensionPanel } from "@web/app/(main)/(dashboard)/cars/components/dimension-panel";
import { FuelMixCard } from "@web/app/(main)/(dashboard)/cars/components/fuel-mix-card";
import { MoversRail } from "@web/app/(main)/(dashboard)/cars/components/movers-rail";
import { PopulationPanel } from "@web/app/(main)/(dashboard)/cars/components/population-panel";
import { RegistrationsHero } from "@web/app/(main)/(dashboard)/cars/components/registrations-hero";
import { AnimatedGrid } from "@web/app/(main)/(dashboard)/components/animated-grid";
import { AnimatedSection } from "@web/app/(main)/(dashboard)/components/animated-section";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import { StructuredData } from "@web/components/structured-data";
import { Bento, RAIL_CLASS } from "@web/components/v2/bento";
import { PageHead } from "@web/components/v2/page-head";
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

function CardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-[var(--radius-card)] bg-surface p-7 shadow-surface ${className}`}
    >
      <div className="flex flex-col gap-4">
        <Skeleton className="h-4 w-32 rounded-lg" />
        <Skeleton className="h-12 w-40 rounded-lg" />
        <Skeleton className="h-6 w-44 rounded-full" />
      </div>
    </div>
  );
}

export default function CarsPage({ searchParams }: PageProps) {
  return (
    <>
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
          <Suspense fallback={<Skeleton className="h-11 w-44 rounded-full" />}>
            <CarsMonthPicker searchParams={searchParams} />
          </Suspense>
        }
        title="Cars"
      />

      <Bento>
        {/* Left column — the month's headline figure and its fuel split */}
        <AnimatedGrid className="flex flex-col gap-6">
          <AnimatedSection>
            <SectionErrorBoundary title="Registration summary unavailable">
              <Suspense fallback={<CardSkeleton className="h-[460px]" />}>
                <RegistrationsHero searchParams={searchParams} />
              </Suspense>
            </SectionErrorBoundary>
          </AnimatedSection>
          <AnimatedSection>
            <SectionErrorBoundary title="Fuel mix unavailable">
              <Suspense fallback={<CardSkeleton className="h-[430px]" />}>
                <FuelMixCard searchParams={searchParams} />
              </Suspense>
            </SectionErrorBoundary>
          </AnimatedSection>
        </AnimatedGrid>

        {/* Middle column — the searchable, sortable dimension table */}
        <AnimatedGrid className="flex flex-col gap-6">
          <AnimatedSection>
            <SectionErrorBoundary title="Registration breakdown unavailable">
              <Suspense fallback={<CardSkeleton className="h-[720px]" />}>
                <DimensionPanel searchParams={searchParams} />
              </Suspense>
            </SectionErrorBoundary>
          </AnimatedSection>
        </AnimatedGrid>

        {/* Right rail — warm sand well: movers over a dark population panel */}
        <AnimatedGrid className={RAIL_CLASS}>
          <AnimatedSection>
            <SectionErrorBoundary title="Movers unavailable">
              <Suspense fallback={<CardSkeleton className="h-96" />}>
                <MoversRail searchParams={searchParams} />
              </Suspense>
            </SectionErrorBoundary>
          </AnimatedSection>
          <AnimatedSection>
            <SectionErrorBoundary title="Vehicle population unavailable">
              <Suspense fallback={<CardSkeleton className="h-96" />}>
                <PopulationPanel />
              </Suspense>
            </SectionErrorBoundary>
          </AnimatedSection>
        </AnimatedGrid>
      </Bento>
    </>
  );
}
