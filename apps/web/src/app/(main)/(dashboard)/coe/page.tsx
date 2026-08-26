import { Skeleton } from "@heroui/react";
import { AllCategoriesCard } from "@web/app/(main)/(dashboard)/coe/components/all-categories-card";
import { BiddingCalendarPanel } from "@web/app/(main)/(dashboard)/coe/components/bidding-calendar-panel";
import { RangeTabs } from "@web/app/(main)/(dashboard)/coe/components/coe-controls";
import {
  formatExercise,
  groupByExercise,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import { CoeHeroCard } from "@web/app/(main)/(dashboard)/coe/components/coe-hero-card";
import { PqpCeilingRail } from "@web/app/(main)/(dashboard)/coe/components/pqp-ceiling-rail";
import { PremiumsByExerciseCard } from "@web/app/(main)/(dashboard)/coe/components/premiums-by-exercise-card";
import { QuotaAllocationCard } from "@web/app/(main)/(dashboard)/coe/components/quota-allocation-card";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import { StructuredData } from "@web/components/structured-data";
import { Bento, BentoColumn, Rail } from "@web/components/v2/bento";
import { PageHead } from "@web/components/v2/page-head";
import { SITE_TITLE, SITE_URL } from "@web/config";
import { SOCIAL_HANDLE } from "@web/config/socials";
import { generateDataCatalogSchema } from "@web/lib/metadata";
import { getCoeResults } from "@web/queries/coe";
import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";

const title = "COE Bidding Results Singapore";
const description =
  "Certificate of Entitlement (COE) data for Singapore. View premiums, historical results, and PQP rates.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: `${SITE_URL}/coe`,
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
    canonical: "/coe",
  },
};

function CardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-[var(--radius-card)] bg-surface p-7 shadow-surface ${className}`}
    >
      <div className="flex flex-col gap-4">
        <Skeleton className="h-4 w-32 rounded-lg" />
        <Skeleton className="h-12 w-40 rounded-lg" />
        <Skeleton className="h-6 w-44 rounded-full" />
      </div>
    </div>
  );
}

/** Names the exercise the whole page is reporting on. */
async function LatestExerciseEyebrow() {
  const latest = groupByExercise(await getCoeResults()).at(-1);

  return (
    <>
      Certificate of Entitlement
      {latest ? <>&ensp;·&ensp;{formatExercise(latest)}</> : null}
    </>
  );
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default function Page({ searchParams }: PageProps) {
  return (
    <>
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

      <PageHead
        controls={
          <Suspense fallback={<Skeleton className="h-14 w-80 rounded-full" />}>
            <RangeTabs />
          </Suspense>
        }
        title="COE overview"
      />

      <Bento>
        {/* Left column — the selected category, then how the quota is split */}
        <BentoColumn>
          <SectionErrorBoundary title="COE premium unavailable">
            <Suspense fallback={<CardSkeleton className="h-[520px]" />}>
              <CoeHeroCard searchParams={searchParams} />
            </Suspense>
          </SectionErrorBoundary>
          <SectionErrorBoundary title="Quota allocation unavailable">
            <Suspense fallback={<CardSkeleton className="h-[420px]" />}>
              <QuotaAllocationCard searchParams={searchParams} />
            </Suspense>
          </SectionErrorBoundary>
        </BentoColumn>

        {/* Middle column — the history, then every category side by side */}
        <BentoColumn>
          <SectionErrorBoundary title="Premium history unavailable">
            <Suspense fallback={<CardSkeleton className="h-[440px]" />}>
              <PremiumsByExerciseCard searchParams={searchParams} />
            </Suspense>
          </SectionErrorBoundary>
          <SectionErrorBoundary title="Category breakdown unavailable">
            <Suspense fallback={<CardSkeleton className="h-[480px]" />}>
              <AllCategoriesCard searchParams={searchParams} />
            </Suspense>
          </SectionErrorBoundary>
        </BentoColumn>

        {/* Right rail — renewal rates over the dark calendar panel */}
        <Rail>
          <SectionErrorBoundary title="PQP rates unavailable">
            <Suspense fallback={<CardSkeleton className="h-96" />}>
              <PqpCeilingRail />
            </Suspense>
          </SectionErrorBoundary>
          <SectionErrorBoundary title="Bidding calendar unavailable">
            <Suspense fallback={<CardSkeleton className="h-72" />}>
              <BiddingCalendarPanel />
            </Suspense>
          </SectionErrorBoundary>
        </Rail>
      </Bento>
    </>
  );
}
