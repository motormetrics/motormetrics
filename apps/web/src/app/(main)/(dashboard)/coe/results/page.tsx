import { Skeleton, Typography } from "@heroui/react";
import {
  LatestExerciseSub,
  PremiumsByYear,
  QuotaAndDemand,
  RecordHighs,
  ResultsByExercise,
  ResultsChartPanel,
  ResultsHeadline,
} from "@web/app/(main)/(dashboard)/coe/results/components/results-report";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import {
  Hairline,
  OverviewPage,
  SectionHead,
  SectionLink,
  SourceNote,
} from "@web/components/shared/overview";
import { PageHead } from "@web/components/shared/page-head";
import { SkeletonCard, SkeletonChart } from "@web/components/shared/skeleton";
import { StructuredData } from "@web/components/structured-data";
import { SITE_TITLE, SITE_URL } from "@web/config";
import {
  generateBreadcrumbSchema,
  generateDatasetSchema,
} from "@web/lib/metadata";
import { baseOpenGraph, baseTwitter } from "@web/lib/metadata/social";
import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import type { WebPage, WithContext } from "schema-dts";

interface PageProps {
  searchParams: Promise<SearchParams>;
}

const title = "COE Price History and Trends";
const description =
  "Singapore COE price history for Cat A to E: every bidding result, yearly averages and record highs, with 12-month, 5-year, 10-year and all-time charts.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    ...baseOpenGraph,
    title,
    description,
    url: `${SITE_URL}/coe/results`,
  },
  twitter: {
    ...baseTwitter,
    title,
    description,
  },
  alternates: {
    canonical: "/coe/results",
  },
  authors: [{ name: SITE_TITLE, url: SITE_URL }],
  creator: SITE_TITLE,
  publisher: SITE_TITLE,
};

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

/** The chart section's head, toggles and plot. */
function ChartSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-7 w-72" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-8 w-80 sm:ml-auto" />
      </div>
      <SkeletonChart />
    </div>
  );
}

/** Mirrors `ResultsHeadline`: the figure on the left, the 2×2 stat grid. */
function HeadlineSkeleton() {
  return (
    <div className="grid gap-5 lg:grid-cols-2 lg:items-end lg:gap-14">
      <div className="flex flex-col gap-3">
        <Skeleton className="h-6 w-56" />
        <Skeleton className="h-14 w-48" />
        <Skeleton className="h-5 w-72" />
      </div>
      <div className="grid grid-cols-2 gap-px">
        {["cat-a", "cat-b", "cat-e", "quota"].map((key) => (
          <div className="flex flex-col gap-1.5 py-3.5" key={key}>
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-4 w-36" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** The quota section's heading and table, which are both data-derived. */
function QuotaSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-7 w-52" />
      <Skeleton className="h-4 w-64" />
      <Skeleton className="h-[280px] w-full" />
    </div>
  );
}

export default function COEResultsPage({ searchParams }: PageProps) {
  return (
    <OverviewPage className="gap-10 max-md:gap-7">
      <StructuredData data={structuredData} />
      <StructuredData
        data={{
          "@context": "https://schema.org",
          ...generateDatasetSchema("coe-results"),
        }}
      />
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

      <PageHead
        eyebrow="Certificate of Entitlement"
        sub={
          <Suspense fallback={<Skeleton className="h-5 w-80" />}>
            <LatestExerciseSub searchParams={searchParams} />
          </Suspense>
        }
        title="COE price history and trends"
      />

      <SectionErrorBoundary title="Latest exercise unavailable">
        <Suspense fallback={<HeadlineSkeleton />}>
          <ResultsHeadline searchParams={searchParams} />
        </Suspense>
      </SectionErrorBoundary>

      <SectionErrorBoundary title="Premium chart unavailable">
        <Suspense fallback={<ChartSkeleton />}>
          <ResultsChartPanel searchParams={searchParams} />
        </Suspense>
      </SectionErrorBoundary>

      <Hairline />

      <section className="flex flex-col gap-4">
        <SectionHead
          caption="Most recent first · change against the previous exercise"
          eyebrow="Results by exercise"
          title="Closing premium per category"
        />
        <SectionErrorBoundary title="COE results unavailable">
          <Suspense fallback={<SkeletonCard className="h-96 w-full" />}>
            <ResultsByExercise searchParams={searchParams} />
          </Suspense>
        </SectionErrorBoundary>
      </section>

      <Hairline />

      <section className="flex flex-col gap-4">
        <SectionHead
          caption="Mean of each year's exercises, with the year's high · the current year is year to date"
          eyebrow="By year"
          title="Average closing premium"
        />
        <SectionErrorBoundary title="Yearly COE prices unavailable">
          <Suspense fallback={<SkeletonCard className="h-96 w-full" />}>
            <PremiumsByYear />
          </Suspense>
        </SectionErrorBoundary>
      </section>

      <Hairline />

      <section className="flex flex-col gap-4">
        <SectionHead
          caption="Every exercise on record"
          eyebrow="Records"
          title="Highest closing premium by category"
        />
        <SectionErrorBoundary title="Record COE prices unavailable">
          <Suspense fallback={<SkeletonCard className="h-72 w-full" />}>
            <RecordHighs />
          </Suspense>
        </SectionErrorBoundary>
        <SourceNote>
          Quota premium at the close of the exercise in which each record was
          set.
        </SourceNote>
      </section>

      <Hairline />

      <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="min-w-0 lg:col-span-7">
          <SectionErrorBoundary title="Quota and demand unavailable">
            <Suspense fallback={<QuotaSkeleton />}>
              <QuotaAndDemand searchParams={searchParams} />
            </Suspense>
          </SectionErrorBoundary>
        </div>

        <section className="flex min-w-0 flex-col gap-4 lg:col-span-5">
          <SectionHead
            eyebrow="Reading the numbers"
            title="How an exercise runs"
          />
          <Typography.Paragraph className="text-muted-strong">
            Bidding opens at 12pm on the first Monday and third Monday of each
            month and closes at 4pm on the third day. The premium is the lowest
            successful bid, so everyone who wins pays the same price.
          </Typography.Paragraph>
          <Typography.Paragraph className="text-muted-strong">
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
      </div>
    </OverviewPage>
  );
}
