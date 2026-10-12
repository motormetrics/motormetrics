import { Skeleton } from "@heroui/react";
import { AdoptionByMonth } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/adoption-by-month";
import { ChargingSummary } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/charging-summary";
import { ElectrifiedTotal } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/electrified-total";
import { EvLeaderboard } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/ev-leaderboard";
import { EvShareHero } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/ev-share-hero";
import { ELECTRIC_VEHICLES_FAQS } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/faq-data";
import { RegistrationTrend } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/registration-trend";
import { VesBands } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/ves-bands";
import { loadSearchParams } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/search-params";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import { EmptyState } from "@web/components/shared/empty-state";
import { MonthMenu } from "@web/components/shared/month-menu";
import {
  Hairline,
  OverviewGrid,
  OverviewPage,
} from "@web/components/shared/overview";
import { PageFaq } from "@web/components/shared/page-faq";
import { PageHead } from "@web/components/shared/page-head";
import { StructuredData } from "@web/components/structured-data";
import { SITE_TITLE, SITE_URL } from "@web/config";
import {
  generateBreadcrumbSchema,
  generateDatasetSchema,
  generateFAQPageSchema,
} from "@web/lib/metadata";
import { baseOpenGraph, baseTwitter } from "@web/lib/metadata/social";
import { getEvMarketShare } from "@web/queries/cars";
import { formatMonthLabel } from "@web/utils/dates/format-month";
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
    ...baseOpenGraph,
    title: "Electric Vehicles - Singapore EV Trends",
    description:
      "Explore BEV, PHEV, and hybrid adoption trends, market share, and brand rankings in Singapore.",
    url: `${SITE_URL}/cars/electric-vehicles`,
  },
  twitter: {
    ...baseTwitter,
    title: "Electric Vehicles - Singapore EV Trends",
    description:
      "Explore BEV, PHEV, and hybrid adoption trends, market share, and brand rankings in Singapore.",
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

function HeadlineSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-5 w-56" />
      <Skeleton className="h-16 w-48" />
      <Skeleton className="h-5 w-72" />
      <Skeleton className="h-[150px] w-full" />
    </div>
  );
}

function SectionSkeleton({ className = "h-64" }: { className?: string }) {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-48" />
      <Skeleton className={`w-full ${className}`} />
    </div>
  );
}

export default function ElectricVehiclesPage({ searchParams }: PageProps) {
  return (
    <OverviewPage className="gap-10 max-md:gap-7">
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
          <Suspense fallback={<Skeleton className="h-8 w-36" />}>
            <MonthControl searchParams={searchParams} />
          </Suspense>
        }
        eyebrow="Electric vehicles"
        sub={
          <Suspense fallback={<Skeleton className="h-5 w-72" />}>
            <MonthSub searchParams={searchParams} />
          </Suspense>
        }
        title="Electric vehicles in Singapore"
      />

      <Suspense
        fallback={
          <OverviewGrid>
            <HeadlineSkeleton />
            <HeadlineSkeleton />
          </OverviewGrid>
        }
      >
        <EvOverview searchParams={searchParams} />
      </Suspense>

      <Hairline />

      <StructuredData
        data={{
          "@context": "https://schema.org",
          ...generateFAQPageSchema([{ items: ELECTRIC_VEHICLES_FAQS }]),
        }}
      />
      <PageFaq faqs={ELECTRIC_VEHICLES_FAQS} />
    </OverviewPage>
  );
}

/** "August 2026 registrations · Source: LTA via DataMall", under the title. */
async function MonthSub({ searchParams }: PageProps) {
  const { month: requestedMonth } = await loadSearchParams(searchParams);
  const { month } = await getMonthOrLatest(requestedMonth, "cars");

  return (
    <>
      <span className="font-semibold text-foreground">
        {formatMonthLabel(month)}
      </span>{" "}
      registrations · Source: LTA via DataMall
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
    <MonthMenu latestMonth={month} months={months} wasAdjusted={wasAdjusted} />
  );
}

async function EvOverview({ searchParams }: PageProps) {
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
    <>
      <OverviewGrid>
        <SectionErrorBoundary title="EV share unavailable">
          <Suspense fallback={<HeadlineSkeleton />}>
            <EvShareHero month={month} />
          </Suspense>
        </SectionErrorBoundary>
        <SectionErrorBoundary title="Electrified total unavailable">
          <Suspense fallback={<HeadlineSkeleton />}>
            <ElectrifiedTotal month={month} />
          </Suspense>
        </SectionErrorBoundary>
      </OverviewGrid>

      <Hairline />

      <SectionErrorBoundary title="Registration trend unavailable">
        <Suspense fallback={<SectionSkeleton className="h-[320px]" />}>
          <RegistrationTrend
            month={month}
            powertrain={powertrain}
            range={range}
          />
        </Suspense>
      </SectionErrorBoundary>

      <Hairline />

      <OverviewGrid>
        <SectionErrorBoundary title="EV leaderboard unavailable">
          <Suspense fallback={<SectionSkeleton className="h-80" />}>
            <EvLeaderboard month={month} />
          </Suspense>
        </SectionErrorBoundary>
        <SectionErrorBoundary title="Monthly adoption unavailable">
          <Suspense fallback={<SectionSkeleton className="h-56" />}>
            <AdoptionByMonth month={month} />
          </Suspense>
        </SectionErrorBoundary>
      </OverviewGrid>

      <Hairline />

      <OverviewGrid>
        <SectionErrorBoundary title="Charging network unavailable">
          <Suspense fallback={<SectionSkeleton className="h-40" />}>
            <ChargingSummary />
          </Suspense>
        </SectionErrorBoundary>
        <VesBands />
      </OverviewGrid>
    </>
  );
}
