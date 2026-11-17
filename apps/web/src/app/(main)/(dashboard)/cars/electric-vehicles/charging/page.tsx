import { Skeleton } from "@heroui/react";
import { EmptyState } from "@heroui-pro/react";
import {
  ChargingAsOf,
  ChargingKpis,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/charging/components/charging-kpis";
import { ChargingMap } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/charging/components/charging-map";
import { DistrictSelect } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/charging/components/district-select";
import { PriceList } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/charging/components/price-list";
import { getChargingStats } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/charging/components/price-stats";
import { loadSearchParams } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/charging/search-params";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import { OverviewPage } from "@web/components/shared/overview";
import { PageToolbar } from "@web/components/shared/page-toolbar";
import { SharePill } from "@web/components/shared/share-pill";
import { StructuredData } from "@web/components/structured-data";
import { SITE_TITLE, SITE_URL } from "@web/config";
import { generateBreadcrumbSchema } from "@web/lib/metadata";
import { baseOpenGraph, baseTwitter } from "@web/lib/metadata/social";
import { PlugZap } from "lucide-react";
import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import type { WebPage, WithContext } from "schema-dts";

export const metadata: Metadata = {
  title: "Singapore EV Charging Prices and Availability",
  description:
    "Compare public EV charging prices across Singapore: the cheapest and most expensive rates per kWh, with live charger availability by district.",
  openGraph: {
    ...baseOpenGraph,
    title: "EV Charging - Live Singapore Charger Stats",
    description:
      "Charging prices and live availability for Singapore's public EV chargers.",
    url: `${SITE_URL}/cars/electric-vehicles/charging`,
  },
  twitter: {
    ...baseTwitter,
    title: "EV Charging - Live Singapore Charger Stats",
    description:
      "Charging prices and live availability for Singapore's public EV chargers.",
  },
  alternates: {
    canonical: "/cars/electric-vehicles/charging",
  },
};

const structuredData: WithContext<WebPage> = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "EV Charging",
  description:
    "Public EV charging prices and live charger availability across Singapore",
  url: `${SITE_URL}/cars/electric-vehicles/charging`,
  publisher: {
    "@type": "Organization",
    name: SITE_TITLE,
    url: SITE_URL,
  },
};

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default function ChargingPage({ searchParams }: PageProps) {
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
            { name: "Charging", path: "/cars/electric-vehicles/charging" },
          ]),
        }}
      />

      {/* The dashboard template: a toolbar, four KPI tiles, the map and one
          table. The feed is hourly, so the toolbar gives the snapshot's age
          rather than calling it live. */}
      <PageToolbar
        actions={
          <>
            <Suspense fallback={<Skeleton className="h-10 w-56" />}>
              <DistrictControl searchParams={searchParams} />
            </Suspense>
            <SharePill title="EV charging prices" />
          </>
        }
        asOf={<ChargingAsOf />}
        title="EV charging prices"
      />

      <Suspense fallback={null}>
        <ChargingEmptyState />
      </Suspense>

      <SectionErrorBoundary title="Key numbers unavailable">
        <Suspense fallback={<Skeleton className="h-36 w-full" />}>
          <ChargingKpis searchParams={searchParams} />
        </Suspense>
      </SectionErrorBoundary>

      <SectionErrorBoundary title="Charger map unavailable">
        {/* The view reads the district and site with nuqs hooks. */}
        <Suspense fallback={<Skeleton className="aspect-video w-full" />}>
          <ChargingMap />
        </Suspense>
      </SectionErrorBoundary>

      <SectionErrorBoundary title="Charger prices unavailable">
        <PriceList searchParams={searchParams} />
      </SectionErrorBoundary>
    </OverviewPage>
  );
}

async function DistrictControl({ searchParams }: PageProps) {
  const { district } = await loadSearchParams(searchParams);
  return <DistrictSelect district={district} />;
}

/**
 * Explains an empty live feed. It has its own boundary so the snapshot it
 * awaits never holds back the rest of the page.
 */
async function ChargingEmptyState() {
  const { stats } = await getChargingStats();
  if (stats) {
    return null;
  }

  return (
    <EmptyState size="lg">
      <EmptyState.Header>
        <EmptyState.Media variant="icon">
          <PlugZap />
        </EmptyState.Media>
        <EmptyState.Title>No Live Data Available</EmptyState.Title>
        <EmptyState.Description className="max-w-sm">
          Live charger availability is not available at the moment. Please check
          back later.
        </EmptyState.Description>
      </EmptyState.Header>
    </EmptyState>
  );
}
