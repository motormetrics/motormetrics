import { Skeleton, Typography } from "@heroui/react";
import {
  COE_CATEGORIES,
  toCategoryKey,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import {
  LatestExerciseSub,
  PremiumsByYearRows,
  QuotaAndDemand,
  RecordHighRows,
  ResultsByExerciseRows,
  ResultsChartPanel,
  ResultsHeadline,
} from "@web/app/(main)/(dashboard)/coe/results/components/results-report";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import { OverviewPage } from "@web/components/shared/overview";
import { PageHead } from "@web/components/shared/page-head";
import { ReportNote, ReportSection } from "@web/components/shared/report";
import {
  ReportCell,
  ReportRow,
  ReportTable,
} from "@web/components/shared/report-table";
import { SkeletonChart } from "@web/components/shared/skeleton";
import { StructuredData } from "@web/components/structured-data";
import { SITE_TITLE, SITE_URL } from "@web/config";
import {
  generateBreadcrumbSchema,
  generateDatasetSchema,
} from "@web/lib/metadata";
import { baseOpenGraph, baseTwitter } from "@web/lib/metadata/social";
import type { Metadata } from "next";
import Link from "next/link";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import type { WebPage, WithContext } from "schema-dts";

interface PageProps {
  searchParams: Promise<SearchParams>;
}

const title = "COE Price History and Trends";
const description =
  "Singapore COE price history for Cat A to E: every bidding result, yearly averages and record highs, with 12-month, 5-year, 10-year and all-time charts.";

/**
 * Static: every label comes from `COE_CATEGORIES`, so the table's `<thead>`
 * renders into the shell and only the rows below it wait on the data.
 */
const EXERCISE_COLUMNS = [
  { label: "Exercise" },
  ...COE_CATEGORIES.map((category) => ({
    align: "end" as const,
    label: `Cat ${toCategoryKey(category)}`,
  })),
  { align: "end" as const, label: "Total bids" },
];

const YEAR_COLUMNS = [
  { label: "Year" },
  ...COE_CATEGORIES.map((category) => ({
    align: "end" as const,
    label: `Cat ${toCategoryKey(category)}`,
  })),
];

const RECORD_COLUMNS = [
  { label: "Cat", width: "64px" },
  { label: "Description" },
  { align: "end" as const, label: "Record premium" },
  { label: "Exercise" },
];

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

/**
 * Placeholder rows for a suspended table body. Built from `ReportRow` and
 * `ReportCell` rather than bare `<tr>`s so the fallback keeps the real row
 * height and the table does not jump when the data lands.
 */
function RowsSkeleton({ cells, rows }: { cells: number; rows: number }) {
  return Array.from({ length: rows }).map((_, rowIndex) => (
    <ReportRow
      // biome-ignore lint/suspicious/noArrayIndexKey: skeleton rows are static placeholders
      key={rowIndex}
    >
      {Array.from({ length: cells }).map((__, cellIndex) => (
        <ReportCell
          // biome-ignore lint/suspicious/noArrayIndexKey: skeleton cells are static placeholders
          key={cellIndex}
        >
          <Skeleton className="h-4 w-full" />
        </ReportCell>
      ))}
    </ReportRow>
  ));
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

      <ReportSection
        caption="Average closing premium across each year's exercises, with the year's high"
        title="COE prices by year"
      >
        <SectionErrorBoundary title="Yearly COE prices unavailable">
          <ReportTable columns={YEAR_COLUMNS}>
            <Suspense
              fallback={<RowsSkeleton cells={YEAR_COLUMNS.length} rows={8} />}
            >
              <PremiumsByYearRows />
            </Suspense>
          </ReportTable>
        </SectionErrorBoundary>
      </ReportSection>

      <ReportSection
        caption="The highest closing premium each category has reached"
        title="Record COE prices"
      >
        <SectionErrorBoundary title="Record COE prices unavailable">
          <ReportTable columns={RECORD_COLUMNS}>
            <Suspense
              fallback={
                <RowsSkeleton
                  cells={RECORD_COLUMNS.length}
                  rows={COE_CATEGORIES.length}
                />
              }
            >
              <RecordHighRows />
            </Suspense>
          </ReportTable>
        </SectionErrorBoundary>
      </ReportSection>

      <ReportSection
        caption="Closing premium per category · most recent first"
        title="Results by exercise"
      >
        <SectionErrorBoundary title="COE results unavailable">
          <ReportTable columns={EXERCISE_COLUMNS}>
            <Suspense
              fallback={
                <RowsSkeleton cells={EXERCISE_COLUMNS.length} rows={8} />
              }
            >
              <ResultsByExerciseRows searchParams={searchParams} />
            </Suspense>
          </ReportTable>
        </SectionErrorBoundary>
      </ReportSection>

      <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1fr_380px]">
        <SectionErrorBoundary title="Quota and demand unavailable">
          <Suspense fallback={<QuotaSkeleton />}>
            <QuotaAndDemand searchParams={searchParams} />
          </Suspense>
        </SectionErrorBoundary>

        <ReportNote title="How an exercise runs">
          <Typography.Paragraph>
            Bidding opens at 12pm on the first Monday and third Monday of each
            month and closes at 4pm on the third day. The premium is the lowest
            successful bid, so everyone who wins pays the same price.
          </Typography.Paragraph>
          <Typography.Paragraph>
            Quotas are set quarterly from deregistrations and the allowed growth
            in the vehicle population.
          </Typography.Paragraph>
          <Link
            className="font-bold text-accent-strong text-base"
            href="/coe/premiums"
          >
            Premium trends by category →
          </Link>
          <Link
            className="font-bold text-accent-strong text-base"
            href="/coe/pqp"
          >
            PQP renewal rates →
          </Link>
        </ReportNote>
      </div>
    </OverviewPage>
  );
}
