import { Skeleton, Typography } from "@heroui/react";
import {
  formatExercise,
  groupByExercise,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import { PremiumsAllCategories } from "@web/app/(main)/(dashboard)/coe/premiums/components/premiums-all-categories";
import {
  PremiumsAnswer,
  PremiumsCategoryTabs,
  PremiumsKeyNumbers,
} from "@web/app/(main)/(dashboard)/coe/premiums/components/premiums-headline";
import { PremiumsHistory } from "@web/app/(main)/(dashboard)/coe/premiums/components/premiums-history";
import { PremiumsRange } from "@web/app/(main)/(dashboard)/coe/premiums/components/premiums-range";
import { PremiumsTrend } from "@web/app/(main)/(dashboard)/coe/premiums/components/premiums-trend";
import { buildResultsFaqs } from "@web/app/(main)/(dashboard)/coe/results/components/faq-data";
import { PeriodSelect } from "@web/app/(main)/(dashboard)/coe/results/components/period-select";
import { PremiumsByYear } from "@web/app/(main)/(dashboard)/coe/results/components/premiums-by-year";
import { QuotaAndDemand } from "@web/app/(main)/(dashboard)/coe/results/components/quota-and-demand";
import { RecordHighs } from "@web/app/(main)/(dashboard)/coe/results/components/record-highs";
import {
  ResultsByExercise,
  ResultsByExerciseCaption,
} from "@web/app/(main)/(dashboard)/coe/results/components/results-by-exercise";
import {
  ResultsChartCaption,
  ResultsChartLegend,
  ResultsChartPanel,
} from "@web/app/(main)/(dashboard)/coe/results/components/results-chart-panel";
import { ResultsSpan } from "@web/app/(main)/(dashboard)/coe/results/components/results-headline";
import { SeriesFilter } from "@web/app/(main)/(dashboard)/coe/results/components/series-filter";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import { MonthSelect } from "@web/components/shared/month-select";
import {
  Hairline,
  OverviewPage,
  SectionHead,
  SectionLink,
} from "@web/components/shared/overview";
import { PageFaq } from "@web/components/shared/page-faq";
import { FilterGroup, FiltersPanel } from "@web/components/shared/page-filters";
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
import { getCoeMonths, getCoeResults } from "@web/queries/coe";
import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import type { WebPage, WithContext } from "schema-dts";

interface PageProps {
  searchParams: Promise<SearchParams>;
}

const title = "COE Bidding Results History and Price Charts";
const description =
  "Singapore COE bidding results history for Cat A to E: every exercise, yearly averages and record highs, with 12-month, 5-year, 10-year and all-time charts.";

/** The questions and their FAQPage schema, with the records and averages quoted. */
async function ResultsFaq() {
  const faqs = buildResultsFaqs(groupByExercise(await getCoeResults()));

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

export async function generateMetadata(): Promise<Metadata> {
  const latest = groupByExercise(await getCoeResults()).at(-1);

  // Naming the latest exercise keeps the snippet current with every result.
  const pageDescription = latest
    ? `Latest: ${formatExercise(latest)}. COE bidding results history for Cat A to E, with yearly averages, record highs and price charts.`
    : description;

  return {
    title,
    description: pageDescription,
    openGraph: {
      ...baseOpenGraph,
      title,
      description: pageDescription,
      url: `${SITE_URL}/coe/results`,
    },
    twitter: {
      ...baseTwitter,
      title,
      description: pageDescription,
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

/** The month picker for the one-category sections. Its data is cached, but it reads the URL on the client. */
async function PremiumsMonthSelect() {
  const months = (await getCoeMonths()).map(({ month }) => month);

  return <MonthSelect latestMonth={months[0]} months={months} />;
}

export default function COEResultsPage({ searchParams }: PageProps) {
  const filters = (
    <FilterGroup label="Categories">
      <Suspense fallback={<Skeleton className="h-40 w-full" />}>
        <SeriesFilter />
      </Suspense>
    </FilterGroup>
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
            { name: "Results", path: "/coe/results" },
          ]),
        }}
      />

      {/* The head carries the title, the span of the data, the period and
          Share. The categories plotted narrow the page, so they sit in the
          right sidebar, with a "Filters" button in the head where the sidebar
          does not fit. */}
      <PageHead
        controls={
          <ScopeControl label="Period">
            <Suspense fallback={<Skeleton className="h-10 w-40" />}>
              <PeriodSelect />
            </Suspense>
          </ScopeControl>
        }
        filters={filters}
        sub={<ResultsSpan />}
        title="COE premium history"
      />

      <PageBody
        rail={
          <>
            <FiltersPanel>{filters}</FiltersPanel>
            <SectionErrorBoundary title="Record COE prices unavailable">
              <RecordHighs />
            </SectionErrorBoundary>
          </>
        }
      >
        {/* The plotted series and the period follow the URL, so only the
            caption, the legend and the chart wait; the title is in the
            shell. */}
        <section className="flex scroll-mt-4 flex-col gap-4" id="res-chart">
          <SectionHead
            caption={
              <Suspense fallback=" ">
                <ResultsChartCaption searchParams={searchParams} />
              </Suspense>
            }
            title="Premium trend"
          />
          <Suspense fallback={<Skeleton className="h-4 w-64" />}>
            <ResultsChartLegend searchParams={searchParams} />
          </Suspense>
          <SectionErrorBoundary title="Premium chart unavailable">
            <Suspense fallback={<Skeleton className="h-80 w-full" />}>
              <ResultsChartPanel searchParams={searchParams} />
            </Suspense>
          </SectionErrorBoundary>
        </section>

        <Hairline />

        <section className="flex scroll-mt-4 flex-col gap-4" id="res-years">
          <SectionErrorBoundary title="Yearly COE prices unavailable">
            <PremiumsByYear />
          </SectionErrorBoundary>
        </section>

        <Hairline />

        <section className="flex scroll-mt-4 flex-col gap-4" id="res-exercises">
          <SectionHead
            caption={
              <Suspense fallback=" ">
                <ResultsByExerciseCaption searchParams={searchParams} />
              </Suspense>
            }
            eyebrow="Results by exercise"
            title="Closing premium per category"
          />
          <SectionErrorBoundary title="COE results unavailable">
            <Suspense fallback={<Skeleton className="h-96 w-full" />}>
              <ResultsByExercise searchParams={searchParams} />
            </Suspense>
          </SectionErrorBoundary>
        </section>

        <Hairline />

        <div className="scroll-mt-4" id="res-quota">
          <SectionErrorBoundary title="Quota and demand unavailable">
            <QuotaAndDemand />
          </SectionErrorBoundary>
        </div>

        <Hairline />

        {/* Carried over from /coe/premiums: one category in detail, as of a
            chosen month. The month and the category drive every section in
            this block and nothing above it, so they sit in the block's own
            head rather than the page's. The chart's range stays with the
            chart. */}
        <section className="flex scroll-mt-4 flex-col gap-4" id="prem">
          <SectionHead
            caption="One category in detail: its premium, its range and its last exercises, as of the month chosen."
            title="Premiums by category"
            trailing={
              <>
                <Suspense fallback={<Skeleton className="h-10 w-40" />}>
                  <PremiumsMonthSelect />
                </Suspense>
                <Suspense fallback={<Skeleton className="h-10 w-80" />}>
                  <PremiumsCategoryTabs searchParams={searchParams} />
                </Suspense>
              </>
            }
          />
          <SectionErrorBoundary title="Premium unavailable">
            <Suspense fallback={<Skeleton className="h-44 w-full max-w-xl" />}>
              <PremiumsAnswer searchParams={searchParams} />
            </Suspense>
          </SectionErrorBoundary>
          <SectionErrorBoundary title="Key numbers unavailable">
            <Suspense fallback={<Skeleton className="h-24 w-full" />}>
              <PremiumsKeyNumbers searchParams={searchParams} />
            </Suspense>
          </SectionErrorBoundary>
        </section>
        <Hairline />
        <PremiumsTrend searchParams={searchParams} />
        <Hairline />
        <PremiumsAllCategories searchParams={searchParams} />
        <Hairline />
        <PremiumsHistory searchParams={searchParams} />
        <Hairline />
        <PremiumsRange searchParams={searchParams} />

        <Hairline />

        <section className="flex flex-col gap-4">
          <SectionHead
            eyebrow="Reading the numbers"
            title="How an exercise runs"
          />
          <Typography.Paragraph className="max-w-prose">
            Bidding opens at 12pm on the first Monday and third Monday of each
            month and closes at 4pm on the third day. The premium is the lowest
            successful bid, so everyone who wins pays the same price.
          </Typography.Paragraph>
          <Typography.Paragraph className="max-w-prose">
            Quotas are set quarterly from deregistrations and the allowed growth
            in the vehicle population.
          </Typography.Paragraph>
          <Typography.Paragraph className="max-w-prose">
            Renewing an existing COE uses the PQP instead: the three-month
            moving average of premiums in that category.
          </Typography.Paragraph>
          <div className="flex flex-col items-start gap-2">
            <SectionLink className="ml-0" href="/coe/pqp">
              PQP renewal rates
            </SectionLink>
          </div>
        </section>

        <Hairline />

        <ResultsFaq />
      </PageBody>

      <RelatedLinks
        links={[
          { href: "/coe", label: "Bidding results" },
          { href: "/coe/pqp", label: "PQP rates" },
          { href: "/learn/coe", label: "Guide: how COE bidding works" },
        ]}
      />
    </OverviewPage>
  );
}
