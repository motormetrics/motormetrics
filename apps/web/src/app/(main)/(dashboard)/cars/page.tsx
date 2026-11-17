import { Skeleton } from "@heroui/react";
import { CarsMonthPicker } from "@web/app/(main)/(dashboard)/cars/components/cars-month-picker";
import { DimensionPanel } from "@web/app/(main)/(dashboard)/cars/components/dimension-panel";
import {
  CarsAsOf,
  CarsKpis,
  CarsYearOnYearCard,
} from "@web/app/(main)/(dashboard)/cars/components/overview-figures";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import { OverviewPage } from "@web/components/shared/overview";
import { PageToolbar } from "@web/components/shared/page-toolbar";
import { SharePill } from "@web/components/shared/share-pill";
import { SITE_URL } from "@web/config";
import { baseOpenGraph, baseTwitter } from "@web/lib/metadata/social";
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

export default function CarsPage({ searchParams }: PageProps) {
  return (
    // The dashboard template: a toolbar, four KPI tiles, one chart and the
    // dimension table. The title and "LTA data to" line read cached data and
    // sit in the static shell; everything that follows `?month=` or
    // `?dimension=` streams in behind its own boundary.
    <OverviewPage className="gap-8 max-md:gap-6">
      <PageToolbar
        actions={
          <>
            <Suspense fallback={<Skeleton className="h-10 w-36" />}>
              <CarsMonthPicker searchParams={searchParams} />
            </Suspense>
            <SharePill title="New car registrations" />
          </>
        }
        asOf={<CarsAsOf />}
        title="New car registrations"
      />

      <SectionErrorBoundary title="Key numbers unavailable">
        <Suspense fallback={<Skeleton className="h-40 w-full rounded-3xl" />}>
          <CarsKpis searchParams={searchParams} />
        </Suspense>
      </SectionErrorBoundary>

      <SectionErrorBoundary title="Registration trend unavailable">
        <Suspense fallback={<Skeleton className="h-96 w-full rounded-3xl" />}>
          <CarsYearOnYearCard searchParams={searchParams} />
        </Suspense>
      </SectionErrorBoundary>

      {/* The make, vehicle type and fuel type breakdown; the old fuel-type
          and vehicle-type pages redirect to its `?dimension=` tabs. */}
      <SectionErrorBoundary title="Registration breakdown unavailable">
        <Suspense fallback={<Skeleton className="h-96 w-full rounded-3xl" />}>
          <DimensionPanel searchParams={searchParams} />
        </Suspense>
      </SectionErrorBoundary>
    </OverviewPage>
  );
}
