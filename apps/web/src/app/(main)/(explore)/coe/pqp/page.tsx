import { redis } from "@motormetrics/utils";
import { ComparisonMixedChart } from "@web/app/(main)/(explore)/coe/components/pqp/comparison-mixed-chart";
import { ComparisonSummaryCard } from "@web/app/(main)/(explore)/coe/components/pqp/comparison-summary-card";
import { DataTable } from "@web/app/(main)/(explore)/coe/components/pqp/data-table";
import { RenewalCalculator } from "@web/app/(main)/(explore)/coe/components/pqp/renewal-calculator";
import { TrendsChart } from "@web/app/(main)/(explore)/coe/components/pqp/trends-chart";
import { AnimatedSection } from "@web/app/(main)/(explore)/components/animated-section";
import { DashboardPageHeader } from "@web/components/dashboard-page-header";
import { DashboardPageMeta } from "@web/components/dashboard-page-meta";
import { DashboardPageTitle } from "@web/components/dashboard-page-title";
import { Infobox } from "@web/components/shared/infobox";
import { MonthSelector } from "@web/components/shared/month-selector";
import { PAGE_CONTEXTS } from "@web/components/shared/page-contexts";
import { StructuredData } from "@web/components/structured-data";
import { UnreleasedFeature } from "@web/components/unreleased-feature";
import { LAST_UPDATED_COE_KEY, SITE_TITLE, SITE_URL } from "@web/config";
import { SOCIAL_HANDLE } from "@web/config/socials";
import {
  generateBreadcrumbSchema,
  generateDatasetSchema,
} from "@web/lib/metadata";
import { getPQPOverview } from "@web/queries/coe";
import type { Pqp } from "@web/types/coe";
import { fetchMonthsForCOE, getMonthOrLatest } from "@web/utils/dates/months";
import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import type { WebPage, WithContext } from "schema-dts";
import { loadSearchParams } from "./search-params";

const title = "PQP Rates for COE Renewal";
const description =
  "Latest Prevailing Quota Premium (PQP) rates for COE renewal in Singapore. These rates show the average COE prices over the last 3 months.";
const images = `${SITE_URL}/opengraph-image.png`;

interface PageProps {
  searchParams: Promise<SearchParams>;
}

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

export default async function PQPRatesPage({
  searchParams: searchParamsPromise,
}: PageProps) {
  return (
    <div className="flex flex-col gap-4">
      <DashboardPageHeader
        title={
          <DashboardPageTitle
            title="PQP Rates"
            subtitle="Prevailing Quota Premium rates for COE renewal in Singapore."
          />
        }
        meta={
          <Suspense>
            <PQPRatesHeaderMeta searchParams={searchParamsPromise} />
          </Suspense>
        }
      />
      <Suspense>
        <PQPRatesContent searchParams={searchParamsPromise} />
      </Suspense>
    </div>
  );
}

async function PQPRatesHeaderMeta({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { month: parsedMonth } = await loadSearchParams(searchParamsPromise);
  const [months, lastUpdated] = await Promise.all([
    fetchMonthsForCOE(),
    redis.get<number>(LAST_UPDATED_COE_KEY),
  ]);
  const { wasAdjusted } = await getMonthOrLatest(parsedMonth, "coe");

  return (
    <DashboardPageMeta lastUpdated={lastUpdated}>
      <MonthSelector
        months={months}
        latestMonth={months[0]}
        wasAdjusted={wasAdjusted}
      />
    </DashboardPageMeta>
  );
}

async function PQPRatesContent({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const [overview, _lastUpdated, _months] = await Promise.all([
    getPQPOverview(),
    redis.get<number>(LAST_UPDATED_COE_KEY),
    fetchMonthsForCOE(),
  ]);

  const columns: Pqp.TableColumn[] = [
    { key: "month", label: "Month", sortable: true },
    { key: "Category A", label: "Category A" },
    { key: "Category B", label: "Category B" },
    { key: "Category C", label: "Category C" },
    { key: "Category D", label: "Category D" },
  ];

  const structuredData: WithContext<WebPage> = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url: `${SITE_URL}/coe/pqp`,
  };

  return (
    <>
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
      <AnimatedSection order={1}>
        <Infobox {...PAGE_CONTEXTS.pqp} />
      </AnimatedSection>

      <AnimatedSection order={2}>
        <Suspense>
          <ComparisonSummaryCard data={overview.comparison} />
        </Suspense>
      </AnimatedSection>

      <AnimatedSection order={3}>
        <Suspense>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <TrendsChart data={overview.trendData} />
            <ComparisonMixedChart data={overview.comparison} />
          </div>
        </Suspense>
      </AnimatedSection>

      <AnimatedSection order={4}>
        <Suspense>
          <DataTable rows={overview.tableRows} columns={columns} />
        </Suspense>
      </AnimatedSection>

      <AnimatedSection order={5}>
        <Suspense>
          <UnreleasedFeature>
            <RenewalCalculator data={overview.categorySummaries} />
          </UnreleasedFeature>
        </Suspense>
      </AnimatedSection>
    </>
  );
}
