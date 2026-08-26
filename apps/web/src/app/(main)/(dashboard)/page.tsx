import { Skeleton } from "@heroui/react";
import { AnimatedGrid } from "@web/app/(main)/(dashboard)/components/animated-grid";
import { AnimatedSection } from "@web/app/(main)/(dashboard)/components/animated-section";
import {
  TopMakesSection,
  YearlyChart,
} from "@web/app/(main)/(dashboard)/components/charts-section";
import { CoeSection } from "@web/app/(main)/(dashboard)/components/coe-section";
import { EvMomentum } from "@web/app/(main)/(dashboard)/components/ev-momentum";
import { MarketOverview } from "@web/app/(main)/(dashboard)/components/market-overview";
import { PqpRail } from "@web/app/(main)/(dashboard)/components/pqp-rail";
// TODO: Not present in the Overview v2 comp. Restore if the dashboard should
// keep a monthly-change KPI and a recent-posts block alongside the v2 layout.
// import { MonthlyChangeSummary } from "@web/app/(main)/(dashboard)/components/monthly-change-summary";
// import { PostsSection } from "@web/app/(main)/(dashboard)/components/posts-section";
import { SummaryCard } from "@web/app/(main)/(dashboard)/components/summary-card";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import { Bento, RAIL_CLASS } from "@web/components/shared/bento";
import { PageHead } from "@web/components/shared/page-head";
import { StructuredData } from "@web/components/structured-data";
import { LOGO_URL, SITE_TITLE, SITE_URL } from "@web/config";
import { SOCIAL_URLS } from "@web/config/socials";
import type { Metadata } from "next";
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

const organisationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_TITLE,
  url: SITE_URL,
  logo: LOGO_URL,
  description:
    "A platform for exploring Singapore car registration statistics, COE bidding results, and market data.",
  sameAs: [SOCIAL_URLS.instagram, SOCIAL_URLS.telegram, SOCIAL_URLS.github],
} as const;

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

const HomePage = () => {
  return (
    <>
      <StructuredData data={webSiteSchema} />
      <StructuredData data={organisationSchema} />

      <PageHead title="Overview" />

      <Bento>
        {/* Left column */}
        <AnimatedGrid className="flex flex-col gap-6">
          <AnimatedSection>
            <SectionErrorBoundary title="Registration summary unavailable">
              <Suspense fallback={<CardSkeleton className="h-[420px]" />}>
                <SummaryCard />
              </Suspense>
            </SectionErrorBoundary>
          </AnimatedSection>
          <AnimatedSection>
            <SectionErrorBoundary title="Yearly chart unavailable">
              <YearlyChart />
            </SectionErrorBoundary>
          </AnimatedSection>
        </AnimatedGrid>

        {/* Middle column */}
        <AnimatedGrid className="flex flex-col gap-6">
          <AnimatedSection>
            <SectionErrorBoundary title="COE results unavailable">
              <CoeSection />
            </SectionErrorBoundary>
          </AnimatedSection>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <AnimatedSection>
              <SectionErrorBoundary title="Top makes unavailable">
                <TopMakesSection />
              </SectionErrorBoundary>
            </AnimatedSection>
            <AnimatedSection>
              <SectionErrorBoundary title="Market overview unavailable">
                <Suspense fallback={<CardSkeleton className="h-[430px]" />}>
                  <MarketOverview />
                </Suspense>
              </SectionErrorBoundary>
            </AnimatedSection>
          </div>
        </AnimatedGrid>

        {/* Right rail — warm sand well: PQP rates over a dark EV panel */}
        <AnimatedGrid className={RAIL_CLASS}>
          <AnimatedSection>
            <SectionErrorBoundary title="PQP rates unavailable">
              <Suspense fallback={<CardSkeleton className="h-96" />}>
                <PqpRail />
              </Suspense>
            </SectionErrorBoundary>
          </AnimatedSection>
          <AnimatedSection>
            <SectionErrorBoundary title="Electric momentum unavailable">
              <Suspense fallback={<CardSkeleton className="h-96" />}>
                <EvMomentum />
              </Suspense>
            </SectionErrorBoundary>
          </AnimatedSection>
        </AnimatedGrid>

        {/* TODO: Neither block appears in Overview v2. Commented out rather than
            deleted so they can be restored if the dashboard should diverge from
            the comp.
        <AnimatedSection>
          <SectionErrorBoundary title="Monthly change unavailable">
            <Suspense fallback={<CardSkeleton className="h-40" />}>
              <MonthlyChangeSummary />
            </Suspense>
          </SectionErrorBoundary>
        </AnimatedSection>
        <AnimatedSection>
          <SectionErrorBoundary title="Recent posts unavailable">
            <PostsSection />
          </SectionErrorBoundary>
        </AnimatedSection>
        */}
      </Bento>
    </>
  );
};

export default HomePage;
