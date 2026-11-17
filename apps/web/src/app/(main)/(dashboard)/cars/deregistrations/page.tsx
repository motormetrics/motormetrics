import { Skeleton } from "@heroui/react";
import {
  Categories,
  CategoriesPeriod,
  DeregistrationsAsOf,
  DeregistrationsKpis,
  ReportMonth,
  TrendChart,
} from "@web/app/(main)/(dashboard)/cars/deregistrations/components/deregistrations-report";
import {
  loadDeregistrationsReport,
  SERIES_MONTHS,
} from "@web/app/(main)/(dashboard)/cars/deregistrations/components/report-data";
import { loadSearchParams } from "@web/app/(main)/(dashboard)/cars/deregistrations/search-params";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import { FigureCard } from "@web/components/shared/figure-card";
import { MonthMenu } from "@web/components/shared/month-menu";
import { OverviewPage, SectionLink } from "@web/components/shared/overview";
import { PageToolbar } from "@web/components/shared/page-toolbar";
import { SharePill } from "@web/components/shared/share-pill";
import { StructuredData } from "@web/components/structured-data";
import { SITE_TITLE, SITE_URL } from "@web/config";
import { generateBreadcrumbSchema } from "@web/lib/metadata";
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

      {/* The dashboard template: a toolbar, four KPI tiles, the stacked
          chart and the category table. Titles and labels are in the static
          shell; only the figures wait on the selected month. */}
      <PageToolbar
        actions={
          <>
            <Suspense fallback={<Skeleton className="h-10 w-36" />}>
              <DeregistrationsMonthPicker searchParams={searchParams} />
            </Suspense>
            <SharePill title="Vehicle deregistrations" />
          </>
        }
        asOf={<DeregistrationsAsOf />}
        title="Vehicle deregistrations"
      />

      <SectionErrorBoundary title="Key numbers unavailable">
        <Suspense fallback={<Skeleton className="h-40 w-full rounded-3xl" />}>
          <DeregistrationsKpis report={report} />
        </Suspense>
      </SectionErrorBoundary>

      <FigureCard
        description={
          <>
            {SERIES_MONTHS} months to{" "}
            <Suspense fallback=" ">
              <ReportMonth report={report} />
            </Suspense>
            , by the COE category each vehicle held
          </>
        }
        title="Deregistrations by month"
      >
        <SectionErrorBoundary title="Deregistration trend unavailable">
          <Suspense fallback={<Skeleton className="h-72 w-full" />}>
            <TrendChart report={report} />
          </Suspense>
        </SectionErrorBoundary>
      </FigureCard>

      <FigureCard
        description={
          <Suspense fallback=" ">
            <CategoriesPeriod report={report} />
          </Suspense>
        }
        title="By category"
      >
        <SectionErrorBoundary title="Categories unavailable">
          <Suspense fallback={<Skeleton className="h-72 w-full" />}>
            <Categories report={report} />
          </Suspense>
        </SectionErrorBoundary>
      </FigureCard>

      <nav
        aria-label="Related figures"
        className="flex flex-wrap items-center gap-x-6 gap-y-2"
      >
        <SectionLink className="ml-0" href="/coe/results">
          COE bidding results
        </SectionLink>
        <SectionLink className="ml-0" href="/cars/registrations">
          New registrations
        </SectionLink>
      </nav>
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
