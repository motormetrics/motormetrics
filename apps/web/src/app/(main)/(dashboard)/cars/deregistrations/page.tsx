import { DeregistrationsReport } from "@web/app/(main)/(dashboard)/cars/deregistrations/components/deregistrations-report";
import { loadSearchParams } from "@web/app/(main)/(dashboard)/cars/deregistrations/search-params";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import { MonthSelector } from "@web/components/shared/month-selector";
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
import {
  fetchMonthsForDeregistrations,
  getMonthOrLatest,
} from "@web/utils/dates/months";
import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import type { WebPage, WithContext } from "schema-dts";

const title = "Vehicle Deregistrations Singapore";
const description =
  "Monthly vehicle deregistration statistics in Singapore under the Vehicle Quota System (VQS). Track deregistration trends by category.";

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export function generateMetadata(): Metadata {
  const canonical = "/cars/deregistrations";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${canonical}`,
      siteName: SITE_TITLE,
      locale: "en_SG",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      site: SOCIAL_HANDLE,
      creator: SOCIAL_HANDLE,
    },
    alternates: { canonical },
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
  url: `${SITE_URL}/cars/deregistrations`,
  publisher: {
    "@type": "Organization",
    name: SITE_TITLE,
    url: SITE_URL,
  },
};

export default function DeregistrationsPage({ searchParams }: PageProps) {
  return (
    <Report>
      <StructuredData data={structuredData} />
      <StructuredData
        data={{
          "@context": "https://schema.org",
          ...generateDatasetSchema("deregistrations"),
        }}
      />
      <StructuredData
        data={{
          "@context": "https://schema.org",
          ...generateBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Cars", path: "/cars" },
            { name: "Deregistrations", path: "/cars/deregistrations" },
          ]),
        }}
      />

      <PageHead
        controls={
          <Suspense fallback={<SkeletonCard className="h-10 w-40" />}>
            <DeregistrationsHeaderMeta searchParams={searchParams} />
          </Suspense>
        }
        description="Vehicles scrapped or exported each month, by the COE category their quota returns to."
        title="Vehicle deregistrations"
      />

      <SectionErrorBoundary title="Deregistrations unavailable">
        <Suspense fallback={<SkeletonCard className="h-[900px] w-full" />}>
          <DeregistrationsReport searchParams={searchParams} />
        </Suspense>
      </SectionErrorBoundary>
    </Report>
  );
}

async function DeregistrationsHeaderMeta({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { month: parsedMonth } = await loadSearchParams(searchParams);

  const [months, { wasAdjusted }] = await Promise.all([
    fetchMonthsForDeregistrations(),
    getMonthOrLatest(parsedMonth, "deregistrations"),
  ]);

  return (
    <MonthSelector
      latestMonth={months[0]}
      months={months}
      wasAdjusted={wasAdjusted}
    />
  );
}
