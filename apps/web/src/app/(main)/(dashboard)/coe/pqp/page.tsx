import { Skeleton, Typography } from "@heroui/react";
import { formatCurrency } from "@motormetrics/utils/format-currency";
import { formatMonth } from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import { buildPqpFaqs } from "@web/app/(main)/(dashboard)/coe/pqp/components/faq-data";
import {
  CategoryTabs,
  TermTabs,
} from "@web/app/(main)/(dashboard)/coe/pqp/components/pqp-filters";
import {
  PQPAnswer,
  PQPKeyNumbers,
  PQPLead,
  PQPSource,
} from "@web/app/(main)/(dashboard)/coe/pqp/components/pqp-headline";
import {
  PQPCalculator,
  PQPCompare,
  PQPMonths,
  PQPRates,
  PQPTradeoffs,
  PQPTrend,
} from "@web/app/(main)/(dashboard)/coe/pqp/components/pqp-report";
import {
  type PQPPageProps,
  SelectedLabel,
} from "@web/app/(main)/(dashboard)/coe/pqp/components/pqp-view";
import { PQP_CATEGORY_KEYS } from "@web/app/(main)/(dashboard)/coe/pqp/search-params";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import { KeysAside } from "@web/components/shared/key-numbers";
import {
  Hairline,
  OverviewPage,
  SectionHead,
} from "@web/components/shared/overview";
import { PageFaq } from "@web/components/shared/page-faq";
import { FilterGroup, FiltersPanel } from "@web/components/shared/page-filters";
import { PageHead } from "@web/components/shared/page-head";
import { PageBody, RelatedLinks } from "@web/components/shared/page-layout";
import { StructuredData } from "@web/components/structured-data";
import { SITE_TITLE, SITE_URL } from "@web/config";
import {
  generateBreadcrumbSchema,
  generateFAQPageSchema,
} from "@web/lib/metadata";
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

/** The sections below the head, for the key numbers' "On this page" links. */
const JUMP_LINKS = [
  { href: "#renewal-calculator", label: "Renewal calculator" },
  { href: "#pqp-trend", label: "PQP by month" },
  { href: "#pqp-rates", label: "Rates by category" },
  { href: "#pqp-cmp", label: "PQP against the premium" },
  { href: "#pqp-months", label: "Month by month" },
  { href: "#pqp-notes", label: "Renewing versus bidding" },
];

/**
 * The questions and their FAQPage schema, with the month's rates quoted. It
 * reads only cached data, so it sits in the static shell without a boundary.
 */
async function PqpFaq() {
  const { latestMonth, categorySummaries } = await getPQPOverview();
  const categoryA = categorySummaries.find(
    (summary) => summary.category === "Category A",
  );
  const categoryB = categorySummaries.find(
    (summary) => summary.category === "Category B",
  );
  const faqs = buildPqpFaqs(
    latestMonth !== null &&
      categoryA !== undefined &&
      categoryB !== undefined &&
      categoryA.pqpRate > 0 &&
      categoryB.pqpRate > 0
      ? {
          month: formatMonth(latestMonth),
          categoryA: formatCurrency(categoryA.pqpRate),
          categoryB: formatCurrency(categoryB.pqpRate),
          categoryA5Year: formatCurrency(categoryA.pqpCost5Year),
          categoryB5Year: formatCurrency(categoryB.pqpCost5Year),
        }
      : undefined,
  );

  return (
    <>
      <StructuredData
        data={{
          "@context": "https://schema.org",
          ...generateFAQPageSchema([{ items: faqs }]),
        }}
      />
      <PageFaq faqs={faqs} />
    </>
  );
}

/** The month the rates were published for, under the title. */
async function LatestMonth() {
  const { latestMonth } = await getPQPOverview();
  return latestMonth ? formatMonth(latestMonth) : null;
}

export default function PQPRatesPage({ searchParams }: PQPPageProps) {
  const filters = (
    <>
      <FilterGroup label="Category">
        <Suspense fallback={<Skeleton className="h-10 w-36" />}>
          <CategoryTabs categories={PQP_CATEGORY_KEYS} />
        </Suspense>
      </FilterGroup>
      <FilterGroup label="Renewal term">
        <Suspense fallback={<Skeleton className="h-10 w-72" />}>
          <TermTabs />
        </Suspense>
      </FilterGroup>
    </>
  );

  return (
    <OverviewPage className="gap-8 max-md:gap-6">
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

      {/* The head carries the title, the month and Share. The category and
          term narrow the page, so they sit in the right sidebar, with a
          "Filters" button in the head where the sidebar does not fit. */}
      <PageHead
        filters={filters}
        sub={
          <Suspense fallback={<Skeleton className="h-5 w-32" />}>
            <LatestMonth />
          </Suspense>
        }
        title="PQP rates"
      />

      <PageBody
        rail={
          <>
            <FiltersPanel>{filters}</FiltersPanel>
            <KeysAside
              eyebrow={
                <>
                  Key numbers ·{" "}
                  <SelectedLabel part="both" searchParams={searchParams} />
                </>
              }
              jump={JUMP_LINKS}
              label="Key numbers"
              source="Source: LTA via DataMall."
            >
              <SectionErrorBoundary title="Key numbers unavailable">
                <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                  <PQPKeyNumbers searchParams={searchParams} />
                </Suspense>
              </SectionErrorBoundary>
            </KeysAside>
          </>
        }
      >
        <section className="flex flex-col gap-4">
          <SectionErrorBoundary title="PQP unavailable">
            <Suspense fallback={<Skeleton className="h-44 w-full max-w-xl" />}>
              <PQPAnswer searchParams={searchParams} />
            </Suspense>
          </SectionErrorBoundary>
          <Suspense fallback={<Skeleton className="h-14 w-full max-w-prose" />}>
            <PQPLead searchParams={searchParams} />
          </Suspense>
          <PQPSource />
        </section>
        <Hairline />
        <PQPTrend searchParams={searchParams} />
        <Hairline />
        <PQPMonths searchParams={searchParams} />
      </PageBody>

      {/* Sections the artboard does not draw sit below the two columns, so
          that on a narrow screen the key figures come before them. */}
      <PageBody>
        <Hairline />
        <PQPRates searchParams={searchParams} />
        <Hairline />
        <PQPCompare searchParams={searchParams} />
        <Hairline />
        <SectionErrorBoundary title="Renewal calculator unavailable">
          <PQPCalculator />
        </SectionErrorBoundary>
        <Hairline />

        <section className="flex max-w-prose flex-col gap-4">
          <SectionHead
            eyebrow="Reading the numbers"
            title="How the PQP is set"
          />
          <Typography.Paragraph>
            LTA averages the closing premiums in that category over the last
            three months, across both exercises, and publishes it as the rate
            for the coming month. It therefore lags the market rather than
            leading it.
          </Typography.Paragraph>
          <Typography.Paragraph>
            A 5-year renewal costs half the PQP, but the car cannot be renewed
            again after that term.
          </Typography.Paragraph>
        </section>

        <Hairline />
        <PQPTradeoffs />
        <Hairline />

        <PqpFaq />
      </PageBody>

      <RelatedLinks
        links={[
          { href: "/coe", label: "Bidding results" },
          { href: "/coe/results", label: "Premium history" },
          { href: "/cars/parf", label: "PARF calculator" },
          { href: "/learn/pqp", label: "Guide: what is PQP?" },
        ]}
      />
    </OverviewPage>
  );
}
