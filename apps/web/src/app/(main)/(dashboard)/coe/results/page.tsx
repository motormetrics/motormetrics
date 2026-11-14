import { Skeleton, Typography } from "@heroui/react";
import {
  formatExercise,
  groupByExercise,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import { buildResultsFaqs } from "@web/app/(main)/(dashboard)/coe/results/components/faq-data";
import { PremiumsByYear } from "@web/app/(main)/(dashboard)/coe/results/components/premiums-by-year";
import { QuotaAndDemand } from "@web/app/(main)/(dashboard)/coe/results/components/quota-and-demand";
import { RecordHighs } from "@web/app/(main)/(dashboard)/coe/results/components/record-highs";
import {
  ResultsByExercise,
  ResultsByExerciseCaption,
} from "@web/app/(main)/(dashboard)/coe/results/components/results-by-exercise";
import {
  ResultsChartCaption,
  ResultsChartCount,
  ResultsChartPanel,
} from "@web/app/(main)/(dashboard)/coe/results/components/results-chart-panel";
import {
  ResultsExerciseName,
  ResultsHero,
  ResultsKeyNumbers,
} from "@web/app/(main)/(dashboard)/coe/results/components/results-headline";
import { SeriesFilter } from "@web/app/(main)/(dashboard)/coe/results/components/series-filter";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import {
  Hairline,
  OverviewPage,
  SectionHead,
  SectionLink,
} from "@web/components/shared/overview";
import { PageFaq } from "@web/components/shared/page-faq";
import { SharePill } from "@web/components/shared/share-pill";
import { StructuredData } from "@web/components/structured-data";
import { SITE_TITLE, SITE_URL } from "@web/config";
import {
  generateBreadcrumbSchema,
  generateFAQPageSchema,
} from "@web/lib/metadata";
import { baseOpenGraph, baseTwitter } from "@web/lib/metadata/social";
import { getCoeResults } from "@web/queries/coe";
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

export default function COEResultsPage({ searchParams }: PageProps) {
  return (
    <OverviewPage className="gap-10 max-md:gap-7">
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

      {/* Direction D's head, with the key numbers beside it once the page is
          wide. It describes the latest exercise from cached data, whatever
          period the page shows, so it is in the static shell. */}
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
                <ResultsExerciseName />
              </Typography.Paragraph>
              <Typography.Heading level={1}>
                COE bidding results history
              </Typography.Heading>
            </div>
            <SectionErrorBoundary title="Latest exercise unavailable">
              <ResultsHero />
            </SectionErrorBoundary>
            <div>
              <SharePill title="COE bidding results history" />
            </div>
          </div>
          <SectionErrorBoundary title="Key numbers unavailable">
            <ResultsKeyNumbers />
          </SectionErrorBoundary>
        </div>
      </div>

      <Hairline />

      {/* The plotted series and the period follow the URL, so only the
          caption, the toggles and the chart wait; the title is in the shell. */}
      <section className="flex scroll-mt-4 flex-col gap-4" id="res-chart">
        <SectionHead
          caption={
            <Suspense fallback=" ">
              <ResultsChartCaption searchParams={searchParams} />
            </Suspense>
          }
          eyebrow={
            <>
              Figure 1
              <Suspense fallback={null}>
                <ResultsChartCount searchParams={searchParams} />
              </Suspense>
            </>
          }
          title="Closing premium by category"
          trailing={
            <Suspense fallback={<Skeleton className="h-8 w-80" />}>
              <SeriesFilter />
            </Suspense>
          }
        />
        <SectionErrorBoundary title="Premium chart unavailable">
          <Suspense fallback={<Skeleton className="h-80 w-full" />}>
            <ResultsChartPanel searchParams={searchParams} />
          </Suspense>
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
          eyebrow="Figure 2 · Results by exercise"
          title="Closing premium per category"
        />
        <SectionErrorBoundary title="COE results unavailable">
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <ResultsByExercise searchParams={searchParams} />
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

      <section className="scroll-mt-4" id="res-records">
        <SectionErrorBoundary title="Record COE prices unavailable">
          <RecordHighs />
        </SectionErrorBoundary>
      </section>

      <Hairline />

      <div className="scroll-mt-4" id="res-quota">
        <SectionErrorBoundary title="Quota and demand unavailable">
          <QuotaAndDemand />
        </SectionErrorBoundary>
      </div>

      <Hairline />

      <section className="flex flex-col gap-4">
        <SectionHead
          eyebrow="Reading the numbers"
          title="How an exercise runs"
        />
        <Typography.Paragraph className="max-w-prose text-muted-strong">
          Bidding opens at 12pm on the first Monday and third Monday of each
          month and closes at 4pm on the third day. The premium is the lowest
          successful bid, so everyone who wins pays the same price.
        </Typography.Paragraph>
        <Typography.Paragraph className="max-w-prose text-muted-strong">
          Quotas are set quarterly from deregistrations and the allowed growth
          in the vehicle population.
        </Typography.Paragraph>
        <div className="flex flex-col items-start gap-2">
          <SectionLink className="ml-0" href="/coe/premiums">
            Premium trends by category
          </SectionLink>
          <SectionLink className="ml-0" href="/coe/pqp">
            PQP renewal rates
          </SectionLink>
        </div>
      </section>

      <Hairline />

      <ResultsFaq />
    </OverviewPage>
  );
}
