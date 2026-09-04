import { Skeleton } from "@heroui/react";
import { loadSearchParams } from "@web/app/(main)/(dashboard)/cars/search-params";
import { CoeSection } from "@web/app/(main)/(dashboard)/components/coe-section";
import { DeregistrationsHeadline } from "@web/app/(main)/(dashboard)/components/deregistrations-headline";
import { EvCharging } from "@web/app/(main)/(dashboard)/components/ev-charging";
import { EvMomentum } from "@web/app/(main)/(dashboard)/components/ev-momentum";
import { FuelMix } from "@web/app/(main)/(dashboard)/components/fuel-mix";
import { RegistrationsHeadline } from "@web/app/(main)/(dashboard)/components/registrations-headline";
import { TopMakes } from "@web/app/(main)/(dashboard)/components/top-makes";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import { MonthMenu } from "@web/components/shared/month-menu";
import {
  Hairline,
  OverviewGrid,
  OverviewPage,
} from "@web/components/shared/overview";
import { PageEyebrow } from "@web/components/shared/page-eyebrow";
import { StructuredData } from "@web/components/structured-data";
import { LOGO_URL, SITE_TITLE, SITE_URL, SUPPORT_EMAIL } from "@web/config";
import { brandSameAs } from "@web/config/socials";
import { socialLinks } from "@web/flags";
import { fetchMonthsForCars, getMonthOrLatest } from "@web/utils/dates/months";
import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: { absolute: `${SITE_TITLE} (formerly SG Cars Trends)` },
  description:
    "Track Singapore car registration trends, COE bidding results, and automotive market insights. Latest data from Land Transport Authority (LTA) with interactive charts, EV and hybrid statistics, and AI-powered analysis.",
  keywords: [
    "Singapore car registration",
    "COE prices",
    "car trends Singapore",
    "vehicle statistics",
    "electric vehicles Singapore",
    "hybrid cars",
    "LTA data",
  ],
  openGraph: {
    title: `${SITE_TITLE} (formerly SG Cars Trends)`,
    description:
      "Track Singapore car registration trends and COE bidding results with interactive charts and latest market insights.",
    type: "website",
    siteName: SITE_TITLE,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_TITLE} (formerly SG Cars Trends)`,
    description:
      "Track Singapore car registration trends and COE bidding results with interactive charts.",
  },
  alternates: {
    canonical: "/",
  },
};

const webSiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_TITLE,
  url: SITE_URL,
  description:
    "Analysis of new car registration trends in Singapore. Insights on popular makes, fuel and vehicle types, COE bidding results, and market data.",
  publisher: {
    "@type": "Organization",
    name: SITE_TITLE,
    url: SITE_URL,
  },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/cars/makes?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
} as const;

async function OrganizationStructuredData() {
  const sameAs = brandSameAs(await socialLinks());

  return (
    <StructuredData
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: SITE_TITLE,
        url: SITE_URL,
        logo: LOGO_URL,
        description:
          "A platform for exploring Singapore car registration statistics, COE bidding results, and market data.",
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer support",
          email: SUPPORT_EMAIL,
          url: `${SITE_URL}/contact`,
        },
        address: { "@type": "PostalAddress", addressCountry: "SG" },
        ...(sameAs.length > 0 ? { sameAs } : {}),
      }}
    />
  );
}

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

/** A section-shaped placeholder: eyebrow, figure, then the chart area. */
function BlockSkeleton({ chartHeight }: { chartHeight: string }) {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-5 w-40 rounded-lg" />
      <Skeleton className="h-14 w-56 rounded-lg" />
      <Skeleton className="h-4 w-72 rounded-lg" />
      <Skeleton className={`w-full rounded-2xl ${chartHeight}`} />
    </div>
  );
}

export default function HomePage({ searchParams }: PageProps) {
  return (
    <>
      <StructuredData data={webSiteSchema} />
      <Suspense>
        <OrganizationStructuredData />
      </Suspense>

      <OverviewPage>
        <div className="flex flex-col gap-7">
          <PageEyebrow
            control={
              <Suspense
                fallback={<Skeleton className="h-6 w-36 rounded-full" />}
              >
                <MonthControl searchParams={searchParams} />
              </Suspense>
            }
            section="Singapore car market"
            title="Overview"
          />

          <OverviewGrid>
            <SectionErrorBoundary title="Registrations unavailable">
              <Suspense fallback={<BlockSkeleton chartHeight="h-[150px]" />}>
                <RegistrationsHeadline searchParams={searchParams} />
              </Suspense>
            </SectionErrorBoundary>
            <SectionErrorBoundary title="Deregistrations unavailable">
              <Suspense fallback={<BlockSkeleton chartHeight="h-[170px]" />}>
                <DeregistrationsHeadline searchParams={searchParams} />
              </Suspense>
            </SectionErrorBoundary>
          </OverviewGrid>
        </div>

        <Hairline />

        <SectionErrorBoundary title="COE premiums unavailable">
          <Suspense fallback={<BlockSkeleton chartHeight="h-[200px]" />}>
            <CoeSection searchParams={searchParams} />
          </Suspense>
        </SectionErrorBoundary>

        <Hairline />

        <OverviewGrid>
          <SectionErrorBoundary title="Top makes unavailable">
            <Suspense fallback={<BlockSkeleton chartHeight="h-[220px]" />}>
              <TopMakes searchParams={searchParams} />
            </Suspense>
          </SectionErrorBoundary>
          <SectionErrorBoundary title="Fuel mix unavailable">
            <Suspense fallback={<BlockSkeleton chartHeight="h-[172px]" />}>
              <FuelMix searchParams={searchParams} />
            </Suspense>
          </SectionErrorBoundary>
        </OverviewGrid>

        <Hairline />

        <OverviewGrid>
          <SectionErrorBoundary title="Electric momentum unavailable">
            <Suspense fallback={<BlockSkeleton chartHeight="h-[240px]" />}>
              <EvMomentum searchParams={searchParams} />
            </Suspense>
          </SectionErrorBoundary>
          <SectionErrorBoundary title="EV charging unavailable">
            <Suspense fallback={<BlockSkeleton chartHeight="h-[160px]" />}>
              <EvCharging />
            </Suspense>
          </SectionErrorBoundary>
        </OverviewGrid>
      </OverviewPage>
    </>
  );
}
