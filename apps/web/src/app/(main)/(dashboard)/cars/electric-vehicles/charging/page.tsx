import { Chip, Skeleton } from "@heroui/react";
import { EmptyState } from "@heroui-pro/react";
// import { AnimatedGrid } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/charging/components/animated-grid";
import { AnimatedSection } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/charging/components/animated-section";
// import { Bento } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/charging/components/bento";
// import { BusyHours } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/charging/components/busy-hours";
import { ChargingMap } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/charging/components/charging-map";
import {
  // ChargingIntro,
  ChargingQuestions,
  ChargingSource,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/charging/components/charging-overview";
import { DistrictSelect } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/charging/components/district-select";
// import { LiveStatus } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/charging/components/live-status";
import { PriceList } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/charging/components/price-list";
import { PriceSummary } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/charging/components/price-summary";
// import { RecentChanges } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/charging/components/recent-changes";
// import { UtilisationList } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/charging/components/utilisation-list";
import { loadSearchParams } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/charging/search-params";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import { PageHead } from "@web/components/shared/page-head";
import { StructuredData } from "@web/components/structured-data";
import { SITE_TITLE, SITE_URL } from "@web/config";
import { generateBreadcrumbSchema } from "@web/lib/metadata";
import { baseOpenGraph, baseTwitter } from "@web/lib/metadata/social";
import { getEvChargingSnapshot } from "@web/queries/ev-charging";
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

function CardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-4xl bg-surface p-7 shadow-surface ${className}`}>
      <div className="flex flex-col gap-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-12 w-40" />
        <Skeleton className="h-6 w-44" />
      </div>
    </div>
  );
}

export default function ChargingPage({ searchParams }: PageProps) {
  return (
    <>
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

      <PageHead
        badge={
          <Chip color="accent" size="lg" variant="soft">
            Beta
          </Chip>
        }
        controls={
          <Suspense fallback={<Skeleton className="h-12 w-56" />}>
            <DistrictControl searchParams={searchParams} />
          </Suspense>
        }
        sub={
          <Suspense fallback={<Skeleton className="h-4 w-80" />}>
            <ChargingSource />
          </Suspense>
        }
        title="EV charging prices"
      />

      {/* The price tiles below carry these figures now; the as-of line moved
          under the title.
      <Suspense fallback={<Skeleton className="h-16 max-w-prose" />}>
        <ChargingIntro />
      </Suspense>
      */}

      {/*
        The map runs edge to edge under the title, and the price content is
        pulled up over its lower half. `-mt-24 md:-mt-80` must match
        `MapOverlap` in charging-map-view.tsx, which pads the map's camera by
        the same amount. One wrapper with no gap, so the overlap is exact.
      */}
      <div className="flex flex-col">
        <AnimatedSection order={0}>
          <SectionErrorBoundary title="Charger map unavailable">
            <Suspense
              fallback={
                // Same bleed and heights as ChargingMap; see its comments.
                <Skeleton className="-mx-4 h-96 rounded-none sm:-mx-6 md:h-[640px] lg:-mx-9" />
              }
            >
              <ChargingMap searchParams={searchParams} />
            </Suspense>
          </SectionErrorBoundary>
        </AnimatedSection>

        <div className="relative z-10 -mt-24 flex flex-col gap-6 md:-mt-80">
          <PriceSummary searchParams={searchParams} />

          <Suspense fallback={<CardSkeleton className="h-96" />}>
            <ChargingBento searchParams={searchParams} />
          </Suspense>
        </div>
      </div>

      {/* Moved above, as the full-bleed map the price content overlaps.
      <AnimatedSection order={0}>
        <SectionErrorBoundary title="Charger map unavailable">
          <Suspense fallback={<CardSkeleton className="h-[600px]" />}>
            <ChargingMap />
          </Suspense>
        </SectionErrorBoundary>
      </AnimatedSection>
      */}

      <Suspense fallback={null}>
        <ChargingEmptyState />
      </Suspense>

      <Suspense fallback={null}>
        <ChargingQuestions />
      </Suspense>
    </>
  );
}

async function DistrictControl({ searchParams }: PageProps) {
  const { district } = await loadSearchParams(searchParams);
  return <DistrictSelect district={district} />;
}

/**
 * Explains an empty live feed. It has its own boundary so the snapshot it
 * awaits never holds back the cards: each one streams as soon as its own data
 * is ready.
 */
async function ChargingEmptyState() {
  const snapshot = await getEvChargingSnapshot();
  if (snapshot.records.length > 0) {
    return null;
  }

  return (
    <EmptyState className="rounded-3xl bg-default/50" size="lg">
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

// Replaced by the live chip on the map (`LiveChip` in live-status.tsx).
// async function LiveStatusCard({ searchParams }: PageProps) {
//   const { district } = await loadSearchParams(searchParams);
//   return <LiveStatus district={district} />;
// }

/**
 * The card grid. It awaits nothing itself: aggregating the cards' data here
 * would make the slowest read gate every card, so each card resolves search
 * params and its own query inside its own Suspense boundary.
 */
function ChargingBento({ searchParams }: PageProps) {
  // Prices lead: they are what search visitors come for. One ranked list with
  // shared AC/DC and sort switches replaces the separate cheapest and
  // most-expensive cards. Live status moved onto the map as a chip.
  return (
    <div className="flex flex-col gap-6">
      <AnimatedSection order={0}>
        <SectionErrorBoundary title="Charger prices unavailable">
          <PriceList searchParams={searchParams} />
        </SectionErrorBoundary>
      </AnimatedSection>
      {/* Replaced by the single list above.
      <AnimatedGrid className="flex flex-col gap-6">
        <AnimatedSection>
          <SectionErrorBoundary title="Cheapest chargers unavailable">
            <PriceList order="cheapest" searchParams={searchParams} />
          </SectionErrorBoundary>
        </AnimatedSection>
        <AnimatedSection>
          <SectionErrorBoundary title="Most expensive chargers unavailable">
            <PriceList order="priciest" searchParams={searchParams} />
          </SectionErrorBoundary>
        </AnimatedSection>
      </AnimatedGrid>
      */}

      {/* The live status card became the chip on the map (LiveChip).
      <AnimatedGrid className="flex flex-col gap-6">
        <AnimatedSection>
          <SectionErrorBoundary title="Live status unavailable">
            <Suspense fallback={<CardSkeleton className="h-80" />}>
              <LiveStatusCard searchParams={searchParams} />
            </Suspense>
          </SectionErrorBoundary>
        </AnimatedSection>
      */}
      {/* Paused with the charging history tables (events and hourly).
        <AnimatedSection>
          <SectionErrorBoundary title="Busy hours unavailable">
            <Suspense fallback={<CardSkeleton className="h-72" />}>
              <BusyHours />
            </Suspense>
          </SectionErrorBoundary>
        </AnimatedSection>
        <AnimatedSection>
          <SectionErrorBoundary title="Recent changes unavailable">
            <Suspense fallback={<CardSkeleton className="h-72" />}>
              <RecentChanges />
            </Suspense>
          </SectionErrorBoundary>
        </AnimatedSection>
        */}
      {/* </AnimatedGrid> */}

      {/* Paused with the hourly utilisation history.
      <AnimatedGrid className="flex flex-col gap-6">
        <AnimatedSection>
          <SectionErrorBoundary title="Busiest locations unavailable">
            <UtilisationList order="busiest" searchParams={searchParams} />
          </SectionErrorBoundary>
        </AnimatedSection>
        <AnimatedSection>
          <SectionErrorBoundary title="Quietest locations unavailable">
            <UtilisationList order="quietest" searchParams={searchParams} />
          </SectionErrorBoundary>
        </AnimatedSection>
      </AnimatedGrid>
      */}
    </div>
  );
}
