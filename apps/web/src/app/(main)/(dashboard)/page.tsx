import { Card, Skeleton } from "@heroui/react";
import { AnimatedGrid } from "@web/app/(main)/(dashboard)/components/animated-grid";
import { AnimatedSection } from "@web/app/(main)/(dashboard)/components/animated-section";
import {
  TopMakesSection,
  YearlyChart,
} from "@web/app/(main)/(dashboard)/components/charts-section";
import { CoeSection } from "@web/app/(main)/(dashboard)/components/coe-section";
import { MarketOverview } from "@web/app/(main)/(dashboard)/components/market-overview";
import { MonthlyChangeSummary } from "@web/app/(main)/(dashboard)/components/monthly-change-summary";
import { PostsSection } from "@web/app/(main)/(dashboard)/components/posts-section";
import { SummaryCard } from "@web/app/(main)/(dashboard)/components/summary-card";
import { WelcomeSection } from "@web/app/(main)/(dashboard)/components/welcome-section";
import { StructuredData } from "@web/components/structured-data";
import { LOGO_URL, SITE_TITLE, SITE_URL } from "@web/config";
import { SOCIAL_URLS } from "@web/config/socials";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Singapore Car Registration & COE Trends | Latest Statistics",
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
    title: "Singapore Car Registration & COE Trends",
    description:
      "Track Singapore car registration trends and COE bidding results with interactive charts and latest market insights.",
    type: "website",
    siteName: SITE_TITLE,
  },
  twitter: {
    card: "summary_large_image",
    title: "Singapore Car Registration & COE Trends",
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

function SummaryCardSkeleton() {
  return (
    <Card className="border-2 border-accent">
      <Card.Content>
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-12 w-12 rounded-2xl" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
        <Skeleton className="h-4 w-32 rounded-lg" />
        <Skeleton className="mt-2 h-10 w-28 rounded-lg" />
        <Skeleton className="mt-4 h-6 w-40 rounded-full" />
      </Card.Content>
    </Card>
  );
}

function MarketOverviewSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-6 w-36 rounded-lg" />
      <div className="grid grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-2xl bg-default p-4">
            <Skeleton className="h-4 w-16 rounded-lg" />
            <Skeleton className="mt-2 h-7 w-20 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

function MonthlyChangeSummarySkeleton() {
  return (
    <Card className="border-2 border-accent">
      <Card.Content>
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-12 w-12 rounded-2xl" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
        <Skeleton className="h-4 w-32 rounded-lg" />
        <Skeleton className="mt-2 h-10 w-28 rounded-lg" />
        <Skeleton className="mt-4 h-6 w-40 rounded-full" />
      </Card.Content>
    </Card>
  );
}

const HomePage = () => {
  return (
    <>
      <StructuredData data={webSiteSchema} />
      <StructuredData data={organisationSchema} />
      <section className="flex flex-col gap-8">
        {/* Bento Grid */}
        <AnimatedGrid className="grid grid-cols-12 gap-4">
          {/* Row 1: Welcome + Summary Cards */}
          <AnimatedSection className="col-span-12 lg:col-span-4">
            <WelcomeSection />
          </AnimatedSection>
          <AnimatedSection className="col-span-12 lg:col-span-4">
            <Suspense fallback={<SummaryCardSkeleton />}>
              <SummaryCard />
            </Suspense>
          </AnimatedSection>
          <AnimatedSection className="col-span-12 lg:col-span-4">
            <Suspense fallback={<MonthlyChangeSummarySkeleton />}>
              <MonthlyChangeSummary />
            </Suspense>
          </AnimatedSection>

          {/* Row 2: COE Results */}
          <AnimatedSection className="col-span-12">
            <CoeSection />
          </AnimatedSection>

          {/* Row 3: Top Makes + Posts */}
          <AnimatedSection className="col-span-12 md:col-span-6 lg:col-span-4">
            <TopMakesSection />
          </AnimatedSection>
          <AnimatedSection className="col-span-12 md:col-span-6 lg:col-span-8">
            <PostsSection />
          </AnimatedSection>

          {/* Row 4: Yearly Chart + Market Overview */}
          <AnimatedSection className="col-span-12 md:col-span-6 lg:col-span-4">
            <YearlyChart />
          </AnimatedSection>
          <AnimatedSection className="col-span-12 lg:col-span-8">
            <Suspense fallback={<MarketOverviewSkeleton />}>
              <MarketOverview />
            </Suspense>
          </AnimatedSection>
        </AnimatedGrid>
      </section>
    </>
  );
};

export default HomePage;
