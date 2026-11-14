import { Skeleton, Typography } from "@heroui/react";
import { formatCurrency } from "@motormetrics/utils/format-currency";
import { formatMonth } from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import { buildPqpFaqs } from "@web/app/(main)/(dashboard)/coe/pqp/components/faq-data";
import {
  CategoryTabs,
  TermTabs,
} from "@web/app/(main)/(dashboard)/coe/pqp/components/pqp-filters";
import {
  LatestMonthEyebrow,
  PQPAnswer,
  PQPKeyNumbers,
  PQPLead,
  PQPSource,
} from "@web/app/(main)/(dashboard)/coe/pqp/components/pqp-headline";
import {
  PQPCalculator,
  PQPRates,
  PQPReport,
  PQPTrend,
} from "@web/app/(main)/(dashboard)/coe/pqp/components/pqp-report";
import {
  type PQPPageProps,
  SelectedLabel,
} from "@web/app/(main)/(dashboard)/coe/pqp/components/pqp-view";
import { PQP_CATEGORY_KEYS } from "@web/app/(main)/(dashboard)/coe/pqp/search-params";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import { Hairline, OverviewPage } from "@web/components/shared/overview";
import { PageFaq } from "@web/components/shared/page-faq";
import { SharePill } from "@web/components/shared/share-pill";
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

export default function PQPRatesPage({ searchParams }: PQPPageProps) {
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

      {/* Direction D's head: eyebrow, title, the category and term switches,
          the range hero, lead and source, with the key numbers beside it once
          the page is wide. The month and source are cached and stay in the
          static shell; only the parts that read the selection wait. */}
      <div className="@container">
        <div className="grid @7xl:grid-cols-2 @7xl:gap-16 gap-10">
          <div className="flex min-w-0 flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Typography.Paragraph
                className="uppercase"
                color="muted"
                size="xs"
                weight="semibold"
              >
                Certificate of Entitlement
                <LatestMonthEyebrow />
              </Typography.Paragraph>
              <Typography.Heading level={1}>PQP rates</Typography.Heading>
            </div>
            <div className="flex flex-wrap items-end gap-x-3.5 gap-y-2.5">
              <Suspense
                fallback={<Skeleton className="h-10 w-36 rounded-md" />}
              >
                <CategoryTabs categories={PQP_CATEGORY_KEYS} />
              </Suspense>
              <Suspense
                fallback={<Skeleton className="h-10 w-72 rounded-md" />}
              >
                <TermTabs />
              </Suspense>
              <SharePill title="PQP rates" />
            </div>
            <SectionErrorBoundary title="PQP unavailable">
              <Suspense
                fallback={<Skeleton className="h-44 w-full max-w-xl" />}
              >
                <PQPAnswer searchParams={searchParams} />
              </Suspense>
            </SectionErrorBoundary>
            <Suspense
              fallback={<Skeleton className="h-14 w-full max-w-prose" />}
            >
              <PQPLead searchParams={searchParams} />
            </Suspense>
            <PQPSource />
          </div>

          <aside aria-label="Key numbers" className="flex flex-col gap-3">
            <Typography.Paragraph
              className="uppercase"
              color="muted"
              size="xs"
              weight="semibold"
            >
              Key numbers ·{" "}
              <SelectedLabel part="both" searchParams={searchParams} />
            </Typography.Paragraph>
            <SectionErrorBoundary title="Key numbers unavailable">
              <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                <PQPKeyNumbers searchParams={searchParams} />
              </Suspense>
            </SectionErrorBoundary>
            <nav aria-label="On this page">
              <ul className="flex flex-wrap gap-x-5 gap-y-1.5">
                {JUMP_LINKS.map(({ href, label }) => (
                  <li key={href}>
                    <a
                      className="font-semibold text-accent-strong text-sm no-underline hover:text-accent-deep"
                      href={href}
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <Typography.Paragraph color="muted" size="xs">
              Source: LTA via DataMall.
            </Typography.Paragraph>
          </aside>
        </div>
      </div>

      <SectionErrorBoundary title="Renewal calculator unavailable">
        <PQPCalculator />
      </SectionErrorBoundary>
      <Hairline />
      <PQPTrend searchParams={searchParams} />
      <Hairline />
      <PQPRates searchParams={searchParams} />
      <Hairline />
      <SectionErrorBoundary title="PQP rates unavailable">
        <Suspense fallback={<Skeleton className="h-96 w-full" />}>
          <PQPReport searchParams={searchParams} />
        </Suspense>
      </SectionErrorBoundary>

      <Hairline />

      <PqpFaq />
    </OverviewPage>
  );
}
