import { PQPReport } from "@web/app/(main)/(dashboard)/coe/pqp/components/pqp-report";
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
import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import type { WebPage, WithContext } from "schema-dts";

const title = "PQP Rates for COE Renewal";
const description =
  "Latest Prevailing Quota Premium (PQP) rates for COE renewal in Singapore. These rates show the average COE prices over the last 3 months.";
const images = `${SITE_URL}/opengraph-image.png`;

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: `${SITE_URL}/coe/pqp`,
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
    canonical: "/coe/pqp",
  },
};

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

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default function PQPRatesPage({ searchParams }: PageProps) {
  return (
    <Report>
      <StructuredData data={structuredData} />
      <StructuredData
        data={{
          "@context": "https://schema.org",
          ...generateDatasetSchema("coe-pqp"),
        }}
      />
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
        description="What it costs to renew a COE instead of bidding for one, category by category."
        title="PQP rates"
      />

      <SectionErrorBoundary title="PQP rates unavailable">
        <Suspense fallback={<SkeletonCard className="h-[900px] w-full" />}>
          <PQPReport searchParams={searchParams} />
        </Suspense>
      </SectionErrorBoundary>
    </Report>
  );
}
