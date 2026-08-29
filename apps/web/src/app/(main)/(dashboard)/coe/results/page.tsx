import { ResultsReport } from "@web/app/(main)/(dashboard)/coe/results/components/results-report";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import { PageHead } from "@web/components/shared/page-head";
import { Report } from "@web/components/shared/report";
import { SkeletonCard } from "@web/components/shared/skeleton";
import { StructuredData } from "@web/components/structured-data";
import { SITE_TITLE, SITE_URL } from "@web/config";
import { SOCIAL_HANDLE } from "@web/config/socials";
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

export default function COEResultsPage({ searchParams }: PageProps) {
  return (
    <Report>
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

      <PageHead
        description="Closing premiums for every category in every exercise, with the quota and bids behind each result."
        title="COE bidding results"
      />

      <SectionErrorBoundary title="COE results unavailable">
        <Suspense fallback={<SkeletonCard className="h-[900px] w-full" />}>
          <ResultsReport searchParams={searchParams} />
        </Suspense>
      </SectionErrorBoundary>
    </Report>
  );
}
