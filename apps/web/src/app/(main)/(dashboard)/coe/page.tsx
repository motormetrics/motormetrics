import { Skeleton } from "@heroui/react";
import { AllCategories } from "@web/app/(main)/(dashboard)/coe/components/all-categories";
import { BiddingCalendar } from "@web/app/(main)/(dashboard)/coe/components/bidding-calendar";
import {
  formatExercise,
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
import { EyebrowValue, PageEyebrow } from "@web/components/shared/page-eyebrow";
import { StructuredData } from "@web/components/structured-data";
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

/** Names the exercise the whole page is reporting on. */
async function LatestExerciseEyebrow() {
  const latest = groupByExercise(await getCoeResults()).at(-1);

  return latest ? <EyebrowValue>{formatExercise(latest)}</EyebrowValue> : null;
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
    <OverviewPage>
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
        <PageEyebrow
          control={
            <Suspense fallback={<Skeleton className="h-5 w-48 rounded-lg" />}>
              <LatestExerciseEyebrow />
            </Suspense>
          }
          section="Certificate of Entitlement"
          title="COE overview"
        />

        <OverviewGrid>
          <SectionErrorBoundary title="COE premium unavailable">
            <Suspense fallback={<SectionSkeleton className="h-[150px]" />}>
              <CoeHeadline searchParams={searchParams} />
            </Suspense>
          </SectionErrorBoundary>
          <SectionErrorBoundary title="Quota allocation unavailable">
            <Suspense fallback={<SectionSkeleton className="h-64" />}>
              <QuotaAllocation searchParams={searchParams} />
            </Suspense>
          </SectionErrorBoundary>
        </OverviewGrid>
      </div>

      <Hairline />

      <SectionErrorBoundary title="Premium history unavailable">
        <Suspense fallback={<SectionSkeleton className="h-[260px]" />}>
          <PremiumsByExercise searchParams={searchParams} />
        </Suspense>
      </SectionErrorBoundary>

      <Hairline />

      <SectionErrorBoundary title="Category breakdown unavailable">
        <Suspense fallback={<SectionSkeleton className="h-80" />}>
          <AllCategories searchParams={searchParams} />
        </Suspense>
      </SectionErrorBoundary>

      <Hairline />

      <OverviewGrid>
        <SectionErrorBoundary title="PQP rates unavailable">
          <Suspense fallback={<SectionSkeleton className="h-64" />}>
            <PqpCeiling />
          </Suspense>
        </SectionErrorBoundary>
        <SectionErrorBoundary title="Bidding calendar unavailable">
          <Suspense fallback={<SectionSkeleton className="h-48" />}>
            <BiddingCalendar />
          </Suspense>
        </SectionErrorBoundary>
      </OverviewGrid>
    </OverviewPage>
  );
}
