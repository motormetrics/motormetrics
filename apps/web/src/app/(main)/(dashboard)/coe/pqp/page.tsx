import { Skeleton } from "@heroui/react";
import { formatCurrency } from "@motormetrics/utils/format-currency";
import { formatMonth } from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import { PQP_FAQS } from "@web/app/(main)/(dashboard)/coe/pqp/components/faq-data";
import { PQPReport } from "@web/app/(main)/(dashboard)/coe/pqp/components/pqp-report";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import { Hairline, OverviewPage } from "@web/components/shared/overview";
import { PageFaq } from "@web/components/shared/page-faq";
import { PageHead } from "@web/components/shared/page-head";
import { StructuredData } from "@web/components/structured-data";
import { SITE_TITLE, SITE_URL } from "@web/config";
import {
  generateBreadcrumbSchema,
  generateFAQPageSchema,
} from "@web/lib/metadata";
import { baseOpenGraph, baseTwitter } from "@web/lib/metadata/social";
import { getPQPOverview } from "@web/queries/coe";
import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";
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

/** Names the month whose published rates the page reports, and its source. */
async function LatestPQPSub() {
  const { latestMonth } = await getPQPOverview();

  return latestMonth ? (
    <>
      Prevailing quota premium for{" "}
      <span className="font-semibold text-foreground">
        {formatMonth(latestMonth)}
      </span>{" "}
      · Source: LTA via DataMall
    </>
  ) : null;
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default function PQPRatesPage({ searchParams }: PageProps) {
  return (
    <OverviewPage className="gap-10 max-md:gap-7">
      <StructuredData data={structuredData} />
      <StructuredData
        data={{
          "@context": "https://schema.org",
          ...generateBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "COE", path: "/coe" },
            { name: "PQP", path: "/coe/pqp" },
          ]),
        }}
      />

      <PageHead
        eyebrow="Certificate of Entitlement"
        sub={
          <Suspense fallback={<Skeleton className="h-5 w-72" />}>
            <LatestPQPSub />
          </Suspense>
        }
        title="PQP rates"
      />

      <SectionErrorBoundary title="PQP rates unavailable">
        <Suspense
          fallback={
            <div className="flex flex-col gap-4">
              <Skeleton className="h-96 w-full" />
              <Skeleton className="h-96 w-full" />
            </div>
          }
        >
          <PQPReport searchParams={searchParams} />
        </Suspense>
      </SectionErrorBoundary>

      <Hairline />

      <StructuredData
        data={{
          "@context": "https://schema.org",
          ...generateFAQPageSchema([{ items: PQP_FAQS }]),
        }}
      />
      <PageFaq faqs={PQP_FAQS} />
    </OverviewPage>
  );
}
