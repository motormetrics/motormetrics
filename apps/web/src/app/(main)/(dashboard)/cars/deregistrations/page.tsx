import { Skeleton } from "@heroui/react";
import { formatDateToMonthYear } from "@motormetrics/utils/format-date-to-month-year";
import { DeregistrationsReport } from "@web/app/(main)/(dashboard)/cars/deregistrations/components/deregistrations-report";
import { loadSearchParams } from "@web/app/(main)/(dashboard)/cars/deregistrations/search-params";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import { MonthMenu } from "@web/components/shared/month-menu";
import { OverviewPage } from "@web/components/shared/overview";
import { PageHead } from "@web/components/shared/page-head";
import { SkeletonCard } from "@web/components/shared/skeleton";
import { StructuredData } from "@web/components/structured-data";
import { SITE_TITLE, SITE_URL } from "@web/config";
import {
  generateBreadcrumbSchema,
  generateDatasetSchema,
} from "@web/lib/metadata";
import { baseOpenGraph, baseTwitter } from "@web/lib/metadata/social";
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

const canonical = "/cars/deregistrations";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    ...baseOpenGraph,
    title,
    description,
    url: `${SITE_URL}${canonical}`,
  },
  twitter: {
    ...baseTwitter,
    title,
    description,
  },
  alternates: { canonical },
  authors: [{ name: SITE_TITLE, url: SITE_URL }],
  creator: SITE_TITLE,
  publisher: SITE_TITLE,
};

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
    <OverviewPage className="gap-10 max-md:gap-7">
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
          <Suspense fallback={<Skeleton className="h-8 w-36" />}>
            <DeregistrationsMonthPicker searchParams={searchParams} />
          </Suspense>
        }
        eyebrow="Vehicle data"
        sub={
          <Suspense fallback={<Skeleton className="h-5 w-72" />}>
            <DeregistrationsMonthSub searchParams={searchParams} />
          </Suspense>
        }
        title="Vehicle deregistrations"
      />

      <SectionErrorBoundary title="Deregistrations unavailable">
        <Suspense fallback={<SkeletonCard className="h-[900px] w-full" />}>
          <DeregistrationsReport searchParams={searchParams} />
        </Suspense>
      </SectionErrorBoundary>
    </OverviewPage>
  );
}

/** Names the month the page reports, what it counts and its source. */
async function DeregistrationsMonthSub({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { month: parsedMonth } = await loadSearchParams(searchParams);
  const { month } = await getMonthOrLatest(parsedMonth, "deregistrations");

  return (
    <>
      <span className="font-semibold text-foreground">
        {formatDateToMonthYear(month)}
      </span>{" "}
      · scrapped or exported, by the COE category the quota returns to · Source:
      LTA via DataMall
    </>
  );
}

async function DeregistrationsMonthPicker({
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
    <MonthMenu
      latestMonth={months[0]}
      months={months}
      wasAdjusted={wasAdjusted}
    />
  );
}
