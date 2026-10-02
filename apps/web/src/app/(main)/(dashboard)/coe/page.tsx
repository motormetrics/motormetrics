import { Skeleton } from "@heroui/react";
import { formatCurrency } from "@motormetrics/utils/format-currency";
import { AllCategories } from "@web/app/(main)/(dashboard)/coe/components/all-categories";
import {
  biddingOrdinal,
  formatExercise,
  formatMonth,
  groupByExercise,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import { CoeHeadline } from "@web/app/(main)/(dashboard)/coe/components/coe-headline";
import { PqpCeiling } from "@web/app/(main)/(dashboard)/coe/components/pqp-ceiling";
import { PremiumsByExercise } from "@web/app/(main)/(dashboard)/coe/components/premiums-by-exercise";
import { QuotaAllocation } from "@web/app/(main)/(dashboard)/coe/components/quota-allocation";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import {
  Hairline,
  OverviewGrid,
  OverviewPage,
} from "@web/components/shared/overview";
import { PageHead } from "@web/components/shared/page-head";
import { StructuredData } from "@web/components/structured-data";
import { SITE_URL } from "@web/config";
import { generateDataCatalogSchema } from "@web/lib/metadata";
import { baseOpenGraph, baseTwitter } from "@web/lib/metadata/social";
import { getCoeResults } from "@web/queries/coe";
import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";

export async function generateMetadata(): Promise<Metadata> {
  const latest = groupByExercise(await getCoeResults()).at(-1);
  const categoryA = latest?.results["Category A"]?.premium;
  const categoryB = latest?.results["Category B"]?.premium;

  // The latest premiums in the snippet answer a "latest COE results" search
  // before the click, and change with every exercise.
  const title = "Latest COE Results Singapore";
  const description =
    latest && categoryA !== undefined && categoryB !== undefined
      ? `${formatExercise(latest)}: Cat A ${formatCurrency(categoryA)}, Cat B ${formatCurrency(categoryB)}. Premiums, quota and bids for every COE category, and the next bidding date.`
      : "The latest COE bidding results in Singapore: premiums, quota and bids for every category, and the next bidding date.";

  return {
    title,
    description,
    openGraph: {
      ...baseOpenGraph,
      title,
      description,
      url: `${SITE_URL}/coe`,
    },
    twitter: {
      ...baseTwitter,
      title,
      description,
    },
    alternates: {
      canonical: "/coe",
    },
  };
}

/** Names the exercise the whole page is reporting on, and its source. */
async function LatestExerciseSub() {
  const latest = groupByExercise(await getCoeResults()).at(-1);

  return latest ? (
    <>
      Results of the{" "}
      <span className="font-semibold text-foreground">
        {biddingOrdinal(latest.biddingNo)} bidding, {formatMonth(latest.month)}
      </span>{" "}
      · Source: LTA via DataMall
    </>
  ) : null;
}

function SectionSkeleton({ className }: { className: string }) {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-4 w-32 rounded-lg" />
      <Skeleton className="h-12 w-56 rounded-lg" />
      <Skeleton className={`rounded-2xl ${className}`} />
    </div>
  );
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default function Page({ searchParams }: PageProps) {
  return (
    <OverviewPage className="gap-10 max-[720px]:gap-7">
      <StructuredData
        data={{
          "@context": "https://schema.org",
          ...generateDataCatalogSchema(
            "Singapore COE Data Catalogue",
            "Certificate of Entitlement bidding results, premium trends, and PQP rates for Singapore's vehicle quota system.",
            "/coe",
            ["coe-results", "coe-premiums", "coe-pqp"],
          ),
        }}
      />

      <div className="flex flex-col gap-7">
        <PageHead
          eyebrow="Certificate of Entitlement"
          sub={
            <Suspense fallback={<Skeleton className="h-5 w-72 rounded-lg" />}>
              <LatestExerciseSub />
            </Suspense>
          }
          title="Latest COE results"
        />

        <SectionErrorBoundary title="COE premium unavailable">
          <Suspense fallback={<SectionSkeleton className="h-[150px]" />}>
            <CoeHeadline searchParams={searchParams} />
          </Suspense>
        </SectionErrorBoundary>
      </div>

      <SectionErrorBoundary title="Category breakdown unavailable">
        <Suspense fallback={<SectionSkeleton className="h-80" />}>
          <AllCategories searchParams={searchParams} />
        </Suspense>
      </SectionErrorBoundary>

      <Hairline />

      <SectionErrorBoundary title="Premium history unavailable">
        <Suspense fallback={<SectionSkeleton className="h-[260px]" />}>
          <PremiumsByExercise searchParams={searchParams} />
        </Suspense>
      </SectionErrorBoundary>

      <Hairline />

      <OverviewGrid className="gap-10 max-[720px]:gap-9 lg:grid-cols-[1.2fr_1fr] lg:gap-x-16 min-[901px]:grid-cols-[1.2fr_1fr] min-[901px]:gap-x-16">
        <SectionErrorBoundary title="Quota allocation unavailable">
          <Suspense fallback={<SectionSkeleton className="h-64" />}>
            <QuotaAllocation searchParams={searchParams} />
          </Suspense>
        </SectionErrorBoundary>
        <SectionErrorBoundary title="PQP rates unavailable">
          <Suspense fallback={<SectionSkeleton className="h-64" />}>
            <PqpCeiling />
          </Suspense>
        </SectionErrorBoundary>
      </OverviewGrid>
    </OverviewPage>
  );
}
