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
import { MonthSelect } from "@web/components/shared/month-select";
import { Hairline, OverviewPage } from "@web/components/shared/overview";
import { PageFaq } from "@web/components/shared/page-faq";
import { PageHead } from "@web/components/shared/page-head";
import {
  PageBody,
  RelatedLinks,
  ScopeControl,
} from "@web/components/shared/page-layout";
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
    <OverviewPage className="gap-8 max-md:gap-6">
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

      {/* The head carries the title, the month and Share. The month sets
          what the whole page reports on, so its select sits in the head. */}
      <PageHead
        controls={
          <ScopeControl label="Month">
            <Suspense fallback={<Skeleton className="h-10 w-40" />}>
              <DeregistrationsMonthPicker searchParams={searchParams} />
            </Suspense>
          </ScopeControl>
        }
        sub={
          <Suspense fallback={<Skeleton className="h-5 w-32" />}>
            <ReportMonth report={report} />
          </Suspense>
        }
        title="Deregistrations"
      />

      {/* No filters on this page: the right sidebar holds key figures only. */}
      <PageBody
        rail={
          <SectionErrorBoundary title="Key numbers unavailable">
            <DeregistrationsKeyNumbers report={report} />
          </SectionErrorBoundary>
        }
      >
        <section className="flex flex-col gap-4">
          <SectionErrorBoundary title="Deregistrations summary unavailable">
            <DeregistrationsHero report={report} />
          </SectionErrorBoundary>
          <Typography.Paragraph className="max-w-prose tabular-nums">
            <Suspense fallback={<Skeleton className="h-12 w-full" />}>
              <DeregistrationsLead report={report} />
            </Suspense>
          </Typography.Paragraph>
          <Typography.Paragraph color="muted" size="sm">
            Source: LTA via DataMall. Scrapped or exported, by the COE category
            the quota returns to.
          </Typography.Paragraph>
        </section>

        <Hairline />

        <SectionErrorBoundary title="Deregistrations unavailable">
          <DeregistrationsReport report={report} />
        </SectionErrorBoundary>
      </PageBody>

      {/* Sections the artboard does not draw sit below the two columns, so
          that on a narrow screen the key figures come before them. */}
      <PageBody>
        <Hairline />

        <StructuredData
          data={{
            "@context": "https://schema.org",
            ...generateFAQPageSchema([{ items: DEREGISTRATIONS_FAQS }]),
          }}
        />
        <PageFaq faqs={DEREGISTRATIONS_FAQS} />
      </PageBody>

      <RelatedLinks
        links={[
          { href: "/cars", label: "New registrations" },
          { href: "/cars/annual", label: "Vehicle population" },
          { href: "/cars/parf", label: "PARF calculator" },
        ]}
      />
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
    <MonthSelect
      latestMonth={months[0]}
      months={months}
      wasAdjusted={wasAdjusted}
    />
  );
}
