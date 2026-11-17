import { Skeleton } from "@heroui/react";
import { formatCurrency } from "@motormetrics/utils/format-currency";
import { formatMonth } from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import {
  CategoryTabs,
  TermTabs,
} from "@web/app/(main)/(dashboard)/coe/pqp/components/pqp-filters";
import {
  PQPAsOf,
  PQPKpis,
} from "@web/app/(main)/(dashboard)/coe/pqp/components/pqp-kpis";
import {
  PQPCalculator,
  PQPMonths,
  PQPTrend,
} from "@web/app/(main)/(dashboard)/coe/pqp/components/pqp-report";
import type { PQPPageProps } from "@web/app/(main)/(dashboard)/coe/pqp/components/pqp-view";
import { PQP_CATEGORY_KEYS } from "@web/app/(main)/(dashboard)/coe/pqp/search-params";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import { OverviewPage, SectionLink } from "@web/components/shared/overview";
import { PageToolbar } from "@web/components/shared/page-toolbar";
import { SharePill } from "@web/components/shared/share-pill";
import { StructuredData } from "@web/components/structured-data";
import { SITE_TITLE, SITE_URL } from "@web/config";
import { generateBreadcrumbSchema } from "@web/lib/metadata";
import { baseOpenGraph, baseTwitter } from "@web/lib/metadata/social";
import { getPQPOverview } from "@web/queries/coe";
import type { Metadata } from "next";
import { Suspense } from "react";
import type { WebPage, WithContext } from "schema-dts";

const title = "Latest PQP Rates for COE Renewal";
const description =
  "Current PQP (Prevailing Quota Premium) rates for Cat A and Cat B COE renewal in Singapore, averaged over the last 3 months of COE prices.";

export async function generateMetadata(): Promise<Metadata> {
  const { latestMonth, categorySummaries } = await getPQPOverview();
  const categoryA = categorySummaries.find(
    (summary) => summary.category === "Category A",
  );
  const categoryB = categorySummaries.find(
    (summary) => summary.category === "Category B",
  );

  // The month's rates in the title and snippet answer a "pqp coe renewal"
  // search before the click, and change with every monthly publication.
  const hasRates =
    latestMonth !== null &&
    categoryA !== undefined &&
    categoryB !== undefined &&
    categoryA.pqpRate > 0 &&
    categoryB.pqpRate > 0;
  const metadataTitle = hasRates
    ? `COE PQP ${formatMonth(latestMonth, "short")}: Cat A ${formatCurrency(categoryA.pqpRate)}, Cat B ${formatCurrency(categoryB.pqpRate)}`
    : title;
  const metadataDescription = hasRates
    ? `${formatMonth(latestMonth)} PQP for COE renewal: Cat A ${formatCurrency(categoryA.pqpRate)}, Cat B ${formatCurrency(categoryB.pqpRate)}. 5-year renewal at 50% of PQP: Cat A ${formatCurrency(categoryA.pqpCost5Year)}, Cat B ${formatCurrency(categoryB.pqpCost5Year)}.`
    : description;

  return {
    title: metadataTitle,
    description: metadataDescription,
    openGraph: {
      ...baseOpenGraph,
      title: metadataTitle,
      description: metadataDescription,
      url: `${SITE_URL}/coe/pqp`,
    },
    twitter: {
      ...baseTwitter,
      title: metadataTitle,
      description: metadataDescription,
    },
    alternates: {
      canonical: "/coe/pqp",
    },
  };
}

const structuredData: WithContext<WebPage> = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: title,
  description,
  url: `${SITE_URL}/coe/pqp`,
  publisher: {
    "@type": "Organization",
    name: SITE_TITLE,
    url: SITE_URL,
  },
};

export default function PQPRatesPage({ searchParams }: PQPPageProps) {
  return (
    <OverviewPage className="gap-8 max-md:gap-6">
      <StructuredData data={structuredData} />
      <StructuredData
        data={{
          "@context": "https://schema.org",
          ...generateBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "COE", path: "/coe/results" },
            { name: "PQP", path: "/coe/pqp" },
          ]),
        }}
      />

      {/* The toolbar's month and the KPIs read only cached data, so they are
          in the static shell; the switches read the URL, so they wait. */}
      <PageToolbar
        actions={
          <>
            <Suspense fallback={<Skeleton className="h-10 w-36" />}>
              <CategoryTabs categories={PQP_CATEGORY_KEYS} />
            </Suspense>
            <Suspense fallback={<Skeleton className="h-10 w-72" />}>
              <TermTabs />
            </Suspense>
            <SharePill title="PQP rates" />
          </>
        }
        asOf={<PQPAsOf />}
        title="PQP rates"
      />

      <SectionErrorBoundary title="Key numbers unavailable">
        <PQPKpis />
      </SectionErrorBoundary>

      {/* The page's main tool. */}
      <SectionErrorBoundary title="Renewal calculator unavailable">
        <PQPCalculator />
      </SectionErrorBoundary>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <PQPTrend searchParams={searchParams} />
        <PQPMonths searchParams={searchParams} />
      </div>

      <nav aria-label="Related" className="flex flex-wrap gap-x-4 gap-y-2">
        <SectionLink className="ml-0" href="/coe/results">
          Premium trends
        </SectionLink>
        <SectionLink className="ml-0" href="/cars/parf">
          PARF rebate calculator
        </SectionLink>
      </nav>
    </OverviewPage>
  );
}
