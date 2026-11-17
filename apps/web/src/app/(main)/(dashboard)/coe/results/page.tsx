import { Skeleton } from "@heroui/react";
import {
  formatExercise,
  groupByExercise,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import { ResultsByExercise } from "@web/app/(main)/(dashboard)/coe/results/components/results-by-exercise";
import {
  ResultsChartCount,
  ResultsChartPanel,
} from "@web/app/(main)/(dashboard)/coe/results/components/results-chart-panel";
import {
  ResultsAsOf,
  ResultsKpis,
} from "@web/app/(main)/(dashboard)/coe/results/components/results-kpis";
import { SeriesFilter } from "@web/app/(main)/(dashboard)/coe/results/components/series-filter";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import { FigureCard } from "@web/components/shared/figure-card";
import { OverviewPage, SectionLink } from "@web/components/shared/overview";
import { PageToolbar } from "@web/components/shared/page-toolbar";
import { SharePill } from "@web/components/shared/share-pill";
import { StructuredData } from "@web/components/structured-data";
import { SITE_TITLE, SITE_URL } from "@web/config";
import { generateBreadcrumbSchema } from "@web/lib/metadata";
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
  "Singapore COE bidding results history for Cat A to E: the latest premiums, every exercise and price charts over 12 months, 5 years, 10 years and all time.";

export async function generateMetadata(): Promise<Metadata> {
  const latest = groupByExercise(await getCoeResults()).at(-1);

  // Naming the latest exercise keeps the snippet current with every result.
  const pageDescription = latest
    ? `Latest: ${formatExercise(latest)}. COE bidding results history for Cat A to E, with every exercise and price charts.`
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
    <OverviewPage className="gap-8 max-md:gap-6">
      <StructuredData data={structuredData} />
      <StructuredData
        data={{
          "@context": "https://schema.org",
          ...generateBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "COE", path: "/coe/results" },
            { name: "Results", path: "/coe/results" },
          ]),
        }}
      />

      {/* The toolbar and KPIs describe the latest exercise from cached data,
          whatever the URL selects, so they are in the static shell. */}
      <PageToolbar
        actions={<SharePill title="COE bidding results history" />}
        asOf={<ResultsAsOf />}
        title="COE bidding results history"
      />

      <SectionErrorBoundary title="Key numbers unavailable">
        <ResultsKpis />
      </SectionErrorBoundary>

      {/* The plotted series and the period follow the URL, so only the
          description, the toggles and the chart wait. */}
      <SectionErrorBoundary title="Premium chart unavailable">
        <FigureCard
          description={
            <Suspense fallback="Closing premium per exercise">
              <ResultsChartCount searchParams={searchParams} />
            </Suspense>
          }
          title="Closing premium by category"
          trailing={
            <Suspense fallback={<Skeleton className="h-8 w-80 max-w-full" />}>
              <SeriesFilter />
            </Suspense>
          }
        >
          <Suspense fallback={<Skeleton className="h-80 w-full" />}>
            <ResultsChartPanel searchParams={searchParams} />
          </Suspense>
        </FigureCard>
      </SectionErrorBoundary>

      <SectionErrorBoundary title="COE results unavailable">
        <FigureCard
          description="Closing premium per category, latest first"
          title="Results by exercise"
        >
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <ResultsByExercise searchParams={searchParams} />
          </Suspense>
        </FigureCard>
      </SectionErrorBoundary>

      <nav aria-label="Related">
        <SectionLink className="ml-0" href="/coe/pqp">
          PQP renewal rates
        </SectionLink>
      </nav>
    </OverviewPage>
  );
}
