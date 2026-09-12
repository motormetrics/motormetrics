import { Skeleton, Typography } from "@heroui/react";
import {
  COE_CATEGORIES,
  toCategoryKey,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import {
  QuotaAndDemand,
  ResultsByExerciseRows,
  ResultsChartPanel,
  ResultsHeadline,
} from "@web/app/(main)/(dashboard)/coe/results/components/results-report";
import { SeriesFilter } from "@web/app/(main)/(dashboard)/coe/results/components/series-filter";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import { PageHead } from "@web/components/shared/page-head";
import {
  Report,
  ReportFilterBar,
  ReportNote,
  ReportSection,
} from "@web/components/shared/report";
import {
  ReportCell,
  ReportRow,
  ReportTable,
} from "@web/components/shared/report-table";
import { SkeletonChart } from "@web/components/shared/skeleton";
import { StructuredData } from "@web/components/structured-data";
import { SITE_TITLE, SITE_URL } from "@web/config";
import { SOCIAL_HANDLE } from "@web/config/socials";
import {
  generateBreadcrumbSchema,
  generateDatasetSchema,
} from "@web/lib/metadata";
import type { Metadata } from "next";
import Link from "next/link";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import type { WebPage, WithContext } from "schema-dts";

interface PageProps {
  searchParams: Promise<SearchParams>;
}

const title = "Historical COE Bidding Results";
const description =
  "Complete historical COE bidding results for Singapore. Explore trends, analyze price movements, and view detailed data for all vehicle categories.";

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

export function generateMetadata(): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/coe/results`,
      siteName: SITE_TITLE,
      locale: "en_SG",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      site: SOCIAL_HANDLE,
      creator: SOCIAL_HANDLE,
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

/** One pill per category, sized to the real `SeriesFilter` buttons. */
function PillsSkeleton() {
  return COE_CATEGORIES.map((category) => (
    <Skeleton className="h-10 w-36 rounded-full" key={category} />
  ));
}

/** Mirrors `ReportHeadline` — the label, the oversized figure, and the stat cells. */
function HeadlineSkeleton() {
  return (
    <div className="flex flex-wrap items-end gap-12">
      <div className="flex min-w-0 flex-col gap-2">
        <Skeleton className="h-6 w-72 rounded-lg" />
        <Skeleton className="h-16 w-56 rounded-lg lg:h-20" />
        <Skeleton className="h-5 w-80 rounded-lg" />
      </div>
      <div className="ml-auto grid w-full grid-cols-2 gap-x-6 gap-y-5 sm:flex sm:w-auto sm:flex-wrap sm:gap-0">
        {["cat-a", "cat-b", "cat-e", "quota"].map((key) => (
          <div
            className="flex flex-col gap-1.5 border-border sm:border-l sm:px-6"
            key={key}
          >
            <Skeleton className="h-5 w-28 rounded-lg" />
            <Skeleton className="h-7 w-24 rounded-lg" />
            <Skeleton className="h-4 w-32 rounded-lg" />
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
          <Skeleton className="h-4 w-full rounded-lg" />
        </ReportCell>
      ))}
    </ReportRow>
  ));
}

/** The quota section's heading and table, which are both data-derived. */
function QuotaSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-7 w-52 rounded-lg" />
      <Skeleton className="h-4 w-64 rounded-lg" />
      <Skeleton className="h-[280px] w-full rounded-lg" />
    </div>
  );
}

export default function COEResultsPage({ searchParams }: PageProps) {
  return (
    <Report>
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
        description="Closing premiums for every category in every exercise, with the quota and bids behind each result."
        title="COE bidding results"
      />

      {/* The bar's own furniture — the eyebrow, the hint, the rules — is static
          and prerenders. The pills themselves read URL data via `useQueryState`,
          so they need their own boundary or the prerender bails. On a client
          navigation the hook resolves straight from the router store, so this
          fallback is only ever seen on a cold load. */}
      <ReportFilterBar
        label="Series"
        trailing={
          <Typography.Paragraph color="muted" size="sm">
            Tap a category to add or remove it from the chart
          </Typography.Paragraph>
        }
      >
        <Suspense fallback={<PillsSkeleton />}>
          <SeriesFilter />
        </Suspense>
      </ReportFilterBar>

      <SectionErrorBoundary title="Latest exercise unavailable">
        <Suspense fallback={<HeadlineSkeleton />}>
          <ResultsHeadline searchParams={searchParams} />
        </Suspense>
      </SectionErrorBoundary>

      <div className="flex flex-col gap-3.5">
        <SectionErrorBoundary title="Premium chart unavailable">
          <Suspense fallback={<SkeletonChart />}>
            <ResultsChartPanel searchParams={searchParams} />
          </Suspense>
        </SectionErrorBoundary>
        <Typography.Paragraph color="muted" size="sm">
          Category D premiums sit an order of magnitude below the car categories
          — add it to the chart and the other lines flatten.
        </Typography.Paragraph>
      </div>

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
    </Report>
  );
}
