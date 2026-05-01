import { Card } from "@heroui/react";
import { BiddingRoundCards } from "@web/app/(main)/(dashboard)/coe/premiums/components/bidding-round-cards";
import { COEPremiumChart } from "@web/app/(main)/(dashboard)/coe/premiums/components/premium-chart";
import { loadSearchParams } from "@web/app/(main)/(dashboard)/coe/search-params";
import { AnimatedSection } from "@web/app/(main)/(dashboard)/components/animated-section";
import { DashboardPageHeader } from "@web/components/dashboard-page-header";
import { DashboardPageMeta } from "@web/components/dashboard-page-meta";
import { DashboardPageTitle } from "@web/components/dashboard-page-title";
import { Infobox } from "@web/components/shared/infobox";
import { MonthSelector } from "@web/components/shared/month-selector";
import { PAGE_CONTEXTS } from "@web/components/shared/page-contexts";
import { SkeletonCard } from "@web/components/shared/skeleton";
import { StructuredData } from "@web/components/structured-data";
import { TrendTable } from "@web/components/tables/coe-results-table";
import Typography from "@web/components/typography";
import { SITE_TITLE, SITE_URL } from "@web/config";
import { SOCIAL_HANDLE } from "@web/config/socials";
import { loadResultsPageData } from "@web/lib/coe/page-data";
import {
  generateBreadcrumbSchema,
  generateDatasetSchema,
} from "@web/lib/metadata";
import { getLatestCoeResults } from "@web/queries/coe";
import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import type { WebPage, WithContext } from "schema-dts";

interface PageProps {
  searchParams: Promise<SearchParams>;
}

const title = "Historical COE Bidding Results";
const description =
  "Complete historical COE bidding results for Singapore. Explore trends, analyze price movements, and view detailed data for all vehicle categories.";

export async function generateMetadata(): Promise<Metadata> {
  const results = await getLatestCoeResults();
  const categories = results.reduce<Record<string, number>>(
    (category, current) => {
      category[current.vehicleClass] = current.premium;
      return category;
    },
    {},
  );

  const images = `/api/og/coe?title=COE Results&subtitle=Historical Data&biddingNo=2&categoryA=${categories["Category A"]}&categoryB=${categories["Category B"]}&categoryC=${categories["Category C"]}&categoryD=${categories["Category D"]}&categoryE=${categories["Category E"]}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/coe/results`,
      siteName: SITE_TITLE,
      locale: "en_SG",
      type: "website",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      site: SOCIAL_HANDLE,
      creator: SOCIAL_HANDLE,
      images,
    },
    alternates: {
      canonical: "/coe/results",
    },
    authors: [{ name: SITE_TITLE, url: SITE_URL }],
    creator: SITE_TITLE,
    publisher: SITE_TITLE,
  };
}

export default function COEResultsPage({ searchParams }: PageProps) {
  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeader
        title={
          <DashboardPageTitle
            title="COE Results"
            subtitle="Historical COE bidding results by category and month."
          />
        }
        meta={
          <Suspense fallback={<SkeletonCard className="h-10 w-40" />}>
            <COEResultsHeaderMeta searchParams={searchParams} />
          </Suspense>
        }
      />
      <Suspense fallback={<SkeletonCard className="h-[840px] w-full" />}>
        <COEResultsContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function COEResultsHeaderMeta({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { period, month } = await loadSearchParams(searchParamsPromise);
  const { lastUpdated, months } = await loadResultsPageData(
    period,
    month ?? undefined,
  );

  return (
    <DashboardPageMeta lastUpdated={lastUpdated}>
      <MonthSelector months={months} latestMonth={months[0]} />
    </DashboardPageMeta>
  );
}

async function COEResultsContent({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { period, month } = await loadSearchParams(searchParamsPromise);
  const { coeResults, chartData, biddingMonth, firstRound, secondRound } =
    await loadResultsPageData(period, month ?? undefined);

  const structuredData: WithContext<WebPage> = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url: `${SITE_URL}/coe/results`,
    publisher: {
      "@type": "Organization",
      name: SITE_TITLE,
      url: SITE_URL,
    },
  };

  return (
    <>
      <StructuredData data={structuredData} />
      <StructuredData
        data={{
          "@context": "https://schema.org",
          ...generateDatasetSchema("coe-results"),
        }}
      />
      <StructuredData
        data={{
          "@context": "https://schema.org",
          ...generateBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "COE", path: "/coe" },
            { name: "Results", path: "/coe/results" },
          ]),
        }}
      />
      <AnimatedSection order={1}>
        <Infobox {...PAGE_CONTEXTS.coe} />
      </AnimatedSection>

      {/* Bidding Rounds for Current Month */}
      {firstRound.length > 0 && (
        <AnimatedSection order={2}>
          <Suspense fallback={<SkeletonCard className="h-[280px] w-full" />}>
            <BiddingRoundCards
              month={biddingMonth}
              firstRound={firstRound}
              secondRound={secondRound}
            />
          </Suspense>
        </AnimatedSection>
      )}

      {/* Premium Chart - Full Width */}
      <AnimatedSection order={3}>
        <Suspense fallback={<SkeletonCard className="h-[420px] w-full" />}>
          <COEPremiumChart data={chartData} />
        </Suspense>
      </AnimatedSection>

      {/* Historical Data Table - Full Width */}
      <AnimatedSection order={4}>
        <Card>
          <Card.Header className="flex flex-col items-start gap-2">
            <Typography.H4>Historical Data</Typography.H4>
            <Typography.TextSm>
              Complete list of historical COE prices
            </Typography.TextSm>
          </Card.Header>
          <Card.Content>
            <Suspense fallback={<SkeletonCard className="h-[420px] w-full" />}>
              <TrendTable coeResults={coeResults} />
            </Suspense>
          </Card.Content>
        </Card>
      </AnimatedSection>
    </>
  );
}
