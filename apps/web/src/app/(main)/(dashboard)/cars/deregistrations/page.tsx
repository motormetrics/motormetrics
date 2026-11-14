import { Skeleton, Typography } from "@heroui/react";
import {
  DeregistrationsHero,
  DeregistrationsKeyNumbers,
  DeregistrationsLead,
  ReportMonth,
} from "@web/app/(main)/(dashboard)/cars/deregistrations/components/deregistrations-head";
import { DeregistrationsReport } from "@web/app/(main)/(dashboard)/cars/deregistrations/components/deregistrations-report";
import { DEREGISTRATIONS_FAQS } from "@web/app/(main)/(dashboard)/cars/deregistrations/components/faq-data";
import { loadDeregistrationsReport } from "@web/app/(main)/(dashboard)/cars/deregistrations/components/report-data";
import { loadSearchParams } from "@web/app/(main)/(dashboard)/cars/deregistrations/search-params";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import { MonthMenu } from "@web/components/shared/month-menu";
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
  // Started once, awaited only by the parts that show figures.
  const report = loadDeregistrationsReport(searchParams);

  return (
    <OverviewPage className="gap-10 max-md:gap-7">
      <StructuredData data={structuredData} />
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

      {/* Direction D's head: eyebrow, title, range hero, lead, tools and
          source, with the key numbers beside it once the page is wide and
          under it before then. Only the figures wait on the selected month. */}
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
                Deregistrations ·{" "}
                <Suspense fallback=" ">
                  <ReportMonth report={report} />
                </Suspense>
              </Typography.Paragraph>
              <Typography.Heading level={1}>
                Vehicle deregistrations
              </Typography.Heading>
            </div>
            <SectionErrorBoundary title="Deregistrations summary unavailable">
              <DeregistrationsHero report={report} />
            </SectionErrorBoundary>
            <Typography.Paragraph className="max-w-prose tabular-nums">
              <Suspense fallback={<Skeleton className="h-12 w-full" />}>
                <DeregistrationsLead report={report} />
              </Suspense>
            </Typography.Paragraph>
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-muted text-xs">Month</span>
                <Suspense fallback={<Skeleton className="h-10 w-36" />}>
                  <DeregistrationsMonthPicker searchParams={searchParams} />
                </Suspense>
              </div>
              <SharePill title="Vehicle deregistrations" />
            </div>
            <Typography.Paragraph color="muted" size="sm">
              Source: LTA via DataMall. Scrapped or exported, by the COE
              category the quota returns to.
            </Typography.Paragraph>
          </div>
          <SectionErrorBoundary title="Key numbers unavailable">
            <DeregistrationsKeyNumbers report={report} />
          </SectionErrorBoundary>
        </div>
      </div>

      <Hairline />

      <SectionErrorBoundary title="Deregistrations unavailable">
        <Suspense
          fallback={
            <div className="flex flex-col gap-4">
              <Skeleton className="h-96 w-full" />
              <Skeleton className="h-96 w-full" />
            </div>
          }
        >
          <DeregistrationsReport searchParams={searchParams} />
        </Suspense>
      </SectionErrorBoundary>

      <Hairline />

      <StructuredData
        data={{
          "@context": "https://schema.org",
          ...generateFAQPageSchema([{ items: DEREGISTRATIONS_FAQS }]),
        }}
      />
      <PageFaq faqs={DEREGISTRATIONS_FAQS} />
    </OverviewPage>
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
