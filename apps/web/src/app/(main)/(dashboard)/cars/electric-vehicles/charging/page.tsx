import { Skeleton } from "@heroui/react";
import { DistrictSelect } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/charging/components/district-select";
import { LiveStatus } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/charging/components/live-status";
import { PriceList } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/charging/components/price-list";
import { loadSearchParams } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/charging/search-params";
import { AnimatedGrid } from "@web/app/(main)/(dashboard)/components/animated-grid";
import { AnimatedSection } from "@web/app/(main)/(dashboard)/components/animated-section";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import { Bento } from "@web/components/shared/bento";
import { EmptyState } from "@web/components/shared/empty-state";
import { PageHead } from "@web/components/shared/page-head";
import { StructuredData } from "@web/components/structured-data";
import { SITE_TITLE, SITE_URL } from "@web/config";
import { generateBreadcrumbSchema } from "@web/lib/metadata";
import { getEvChargingSnapshot } from "@web/queries/ev-charging";
import { PlugZap } from "lucide-react";
import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import type { WebPage, WithContext } from "schema-dts";

export const metadata: Metadata = {
  title: "EV Charging in Singapore",
  description:
    "Live public EV charger availability across Singapore, with the cheapest and most expensive AC and DC charging rates by district.",
  openGraph: {
    title: "EV Charging - Live Singapore Charger Stats",
    description:
      "Live availability and prices for Singapore's public EV chargers.",
    type: "website",
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
    "Live public EV charger availability and prices across Singapore",
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
        <Skeleton className="h-4 w-32 rounded-lg" />
        <Skeleton className="h-12 w-40 rounded-lg" />
        <Skeleton className="h-6 w-44 rounded-full" />
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
        controls={
          <Suspense fallback={<Skeleton className="h-12 w-56 rounded-full" />}>
            <DistrictControl searchParams={searchParams} />
          </Suspense>
        }
        title="EV charging"
      />

      <Suspense
        fallback={
          <Bento>
            <CardSkeleton className="h-80" />
            <CardSkeleton className="h-[520px]" />
            <CardSkeleton className="h-[520px]" />
          </Bento>
        }
      >
        <ChargingBento searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function DistrictControl({ searchParams }: PageProps) {
  const { district } = await loadSearchParams(searchParams);
  return <DistrictSelect district={district} />;
}

async function ChargingBento({ searchParams }: PageProps) {
  const [{ district, power }, snapshot] = await Promise.all([
    loadSearchParams(searchParams),
    getEvChargingSnapshot(),
  ]);

  if (snapshot.records.length === 0) {
    return (
      <EmptyState
        description="Live charger availability is not available at the moment. Please check back later."
        icon={
          <div className="flex size-16 items-center justify-center rounded-2xl bg-default">
            <PlugZap className="size-8 text-muted" />
          </div>
        }
        showDefaultActions={false}
        title="No Live Data Available"
      />
    );
  }

  return (
    <Bento>
      <AnimatedGrid className="flex flex-col gap-6">
        <AnimatedSection>
          <SectionErrorBoundary title="Live status unavailable">
            <Suspense fallback={<CardSkeleton className="h-80" />}>
              <LiveStatus district={district} />
            </Suspense>
          </SectionErrorBoundary>
        </AnimatedSection>
      </AnimatedGrid>

      <AnimatedGrid className="flex flex-col gap-6">
        <AnimatedSection>
          <SectionErrorBoundary title="Cheapest chargers unavailable">
            <Suspense fallback={<CardSkeleton className="h-[520px]" />}>
              <PriceList district={district} order="cheapest" power={power} />
            </Suspense>
          </SectionErrorBoundary>
        </AnimatedSection>
      </AnimatedGrid>

      <AnimatedGrid className="flex flex-col gap-6">
        <AnimatedSection>
          <SectionErrorBoundary title="Most expensive chargers unavailable">
            <Suspense fallback={<CardSkeleton className="h-[520px]" />}>
              <PriceList district={district} order="priciest" power={power} />
            </Suspense>
          </SectionErrorBoundary>
        </AnimatedSection>
      </AnimatedGrid>
    </Bento>
  );
}
