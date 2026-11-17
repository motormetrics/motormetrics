import { Skeleton } from "@heroui/react";
import { ShareByMonthCard } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/adoption-by-month";
import {
  EvAsOf,
  EvKpis,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/ev-kpis";
import { EvMakesCard } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/ev-leaderboard";
import { loadEvSelection } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/ev-report";
import { RegistrationTrendCard } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/registration-trend";
import { loadSearchParams } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/search-params";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import { MonthMenu } from "@web/components/shared/month-menu";
import { OverviewPage } from "@web/components/shared/overview";
import { PageToolbar } from "@web/components/shared/page-toolbar";
import { SharePill } from "@web/components/shared/share-pill";
import { StructuredData } from "@web/components/structured-data";
import { SITE_TITLE, SITE_URL } from "@web/config";
import { generateBreadcrumbSchema } from "@web/lib/metadata";
import { baseOpenGraph, baseTwitter } from "@web/lib/metadata/social";
import { fetchMonthsForCars, getMonthOrLatest } from "@web/utils/dates/months";
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

export default function ElectricVehiclesPage({ searchParams }: PageProps) {
  // Started once, awaited only by the parts that show figures.
  const selection = loadEvSelection(searchParams);

  return (
    <OverviewPage className="gap-8 max-md:gap-6">
      <StructuredData data={structuredData} />
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

      {/* The dashboard template: a toolbar, four KPI tiles, a chart pair and
          one table. The cards are in the static shell; only the parts that
          read the month, powertrain or range wait behind a boundary. */}
      <PageToolbar
        actions={
          <>
            <Suspense fallback={<Skeleton className="h-10 w-36" />}>
              <MonthControl searchParams={searchParams} />
            </Suspense>
            <SharePill title="Electric vehicles in Singapore" />
          </>
        }
        asOf={<EvAsOf />}
        title="Electric vehicles in Singapore"
      />

      <SectionErrorBoundary title="Key numbers unavailable">
        <Suspense fallback={<Skeleton className="h-36 w-full" />}>
          <EvKpis selection={selection} />
        </Suspense>
      </SectionErrorBoundary>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <SectionErrorBoundary title="Registration trend unavailable">
          <RegistrationTrendCard selection={selection} />
        </SectionErrorBoundary>
        <SectionErrorBoundary title="Battery-electric share unavailable">
          <ShareByMonthCard selection={selection} />
        </SectionErrorBoundary>
      </div>

      <SectionErrorBoundary title="EV makes unavailable">
        <EvMakesCard selection={selection} />
      </SectionErrorBoundary>
    </OverviewPage>
  );
}
