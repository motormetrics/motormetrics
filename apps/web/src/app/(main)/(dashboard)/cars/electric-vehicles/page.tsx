import { Skeleton } from "@heroui/react";
import { AdoptionByMonth } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/adoption-by-month";
import { ElectrifiedTotal } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/electrified-total";
import { EvFleetPanel } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/ev-fleet-panel";
import { EvLeaderboard } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/ev-leaderboard";
import { EvShareHero } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/ev-share-hero";
import { RegistrationTrend } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/registration-trend";
import { TopMakesRail } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/top-makes-rail";
import { loadSearchParams } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/search-params";
import { AnimatedGrid } from "@web/app/(main)/(dashboard)/components/animated-grid";
import { AnimatedSection } from "@web/app/(main)/(dashboard)/components/animated-section";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import { Bento, RAIL_CLASS } from "@web/components/shared/bento";
import { EmptyState } from "@web/components/shared/empty-state";
import { MonthSelector } from "@web/components/shared/month-selector";
import { PageHead } from "@web/components/shared/page-head";
import { StructuredData } from "@web/components/structured-data";
import { SITE_TITLE, SITE_URL } from "@web/config";
import {
  generateBreadcrumbSchema,
  generateDatasetSchema,
} from "@web/lib/metadata";
import { getEvMarketShare } from "@web/queries/cars";
import { fetchMonthsForCars, getMonthOrLatest } from "@web/utils/dates/months";
import { Zap } from "lucide-react";
import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import type { WebPage, WithContext } from "schema-dts";

export const metadata: Metadata = {
  title: "Electric Vehicles in Singapore",
  description:
    "Track Singapore's electric vehicle adoption with BEV, PHEV, and hybrid registration trends, market share analysis, and top EV makes.",
  openGraph: {
    title: "Electric Vehicles - Singapore EV Trends",
    description:
      "Explore BEV, PHEV, and hybrid adoption trends, market share, and brand rankings in Singapore.",
    type: "website",
  },
  alternates: {
    canonical: "/cars/electric-vehicles",
  },
};

const structuredData: WithContext<WebPage> = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Electric Vehicles",
  description:
    "Singapore electric vehicle adoption trends including BEV, PHEV, and hybrid registrations, market share analysis, and top EV makes",
  url: `${SITE_URL}/cars/electric-vehicles`,
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

export default function ElectricVehiclesPage({ searchParams }: PageProps) {
  return (
    <>
      <StructuredData data={structuredData} />
      <StructuredData
        data={{
          "@context": "https://schema.org",
          ...generateDatasetSchema("electric-vehicles"),
        }}
      />
      <StructuredData
        data={{
          "@context": "https://schema.org",
          ...generateBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Cars", path: "/cars" },
            { name: "Electric Vehicles", path: "/cars/electric-vehicles" },
          ]),
        }}
      />

      <PageHead
        controls={
          <Suspense fallback={<Skeleton className="h-12 w-48 rounded-full" />}>
            <MonthControl searchParams={searchParams} />
          </Suspense>
        }
        title="Electric vehicles"
      />

      <Suspense
        fallback={
          <Bento>
            <CardSkeleton className="h-[520px]" />
            <CardSkeleton className="h-[520px]" />
            <CardSkeleton className="h-[520px]" />
          </Bento>
        }
      >
        <EvBento searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function MonthControl({ searchParams }: PageProps) {
  const { month: requestedMonth } = await loadSearchParams(searchParams);
  const [months, { month, wasAdjusted }] = await Promise.all([
    fetchMonthsForCars(),
    getMonthOrLatest(requestedMonth, "cars"),
  ]);

  if (months.length === 0) {
    return null;
  }

  return (
    <MonthSelector
      latestMonth={month}
      months={months}
      wasAdjusted={wasAdjusted}
    />
  );
}

async function EvBento({ searchParams }: PageProps) {
  const {
    month: requestedMonth,
    powertrain,
    range,
  } = await loadSearchParams(searchParams);
  const [{ month }, marketShare] = await Promise.all([
    getMonthOrLatest(requestedMonth, "cars"),
    getEvMarketShare(),
  ]);

  if (marketShare.length === 0) {
    return (
      <EmptyState
        description="Electric vehicle registration data is not available at the moment. Please check back later."
        icon={
          <div className="flex size-16 items-center justify-center rounded-2xl bg-default">
            <Zap className="size-8 text-muted" />
          </div>
        }
        showDefaultActions={false}
        title="No Data Available Yet"
      />
    );
  }

  return (
    <Bento>
      {/* Left column — the dark EV story over the electrified split */}
      <AnimatedGrid className="flex flex-col gap-6">
        <AnimatedSection>
          <SectionErrorBoundary title="EV share unavailable">
            <Suspense fallback={<CardSkeleton className="h-[520px]" />}>
              <EvShareHero month={month} />
            </Suspense>
          </SectionErrorBoundary>
        </AnimatedSection>
        <AnimatedSection>
          <SectionErrorBoundary title="Electrified total unavailable">
            <Suspense fallback={<CardSkeleton className="h-80" />}>
              <ElectrifiedTotal month={month} />
            </Suspense>
          </SectionErrorBoundary>
        </AnimatedSection>
      </AnimatedGrid>

      {/* Middle column */}
      <AnimatedGrid className="flex flex-col gap-6">
        <AnimatedSection>
          <SectionErrorBoundary title="Registration trend unavailable">
            <Suspense fallback={<CardSkeleton className="h-[520px]" />}>
              <RegistrationTrend
                month={month}
                powertrain={powertrain}
                range={range}
              />
            </Suspense>
          </SectionErrorBoundary>
        </AnimatedSection>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <AnimatedSection>
            <SectionErrorBoundary title="EV leaderboard unavailable">
              <Suspense fallback={<CardSkeleton className="h-[420px]" />}>
                <EvLeaderboard month={month} />
              </Suspense>
            </SectionErrorBoundary>
          </AnimatedSection>
          <AnimatedSection>
            <SectionErrorBoundary title="Monthly adoption unavailable">
              <Suspense fallback={<CardSkeleton className="h-[420px]" />}>
                <AdoptionByMonth month={month} />
              </Suspense>
            </SectionErrorBoundary>
          </AnimatedSection>
        </div>
      </AnimatedGrid>

      {/* Right rail — warm sand well: make ranking over the dark fleet panel */}
      <AnimatedGrid className={RAIL_CLASS}>
        <AnimatedSection>
          <SectionErrorBoundary title="Make ranking unavailable">
            <Suspense fallback={<CardSkeleton className="h-96" />}>
              <TopMakesRail month={month} />
            </Suspense>
          </SectionErrorBoundary>
        </AnimatedSection>
        <AnimatedSection>
          <SectionErrorBoundary title="EV fleet unavailable">
            <Suspense fallback={<CardSkeleton className="h-96" />}>
              <EvFleetPanel />
            </Suspense>
          </SectionErrorBoundary>
        </AnimatedSection>
      </AnimatedGrid>
    </Bento>
  );
}
