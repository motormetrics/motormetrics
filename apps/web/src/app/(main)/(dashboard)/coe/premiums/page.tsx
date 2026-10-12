import { Skeleton } from "@heroui/react";
import { formatExercise } from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import { PREMIUMS_FAQS } from "@web/app/(main)/(dashboard)/coe/premiums/components/faq-data";
import { PremiumsReport } from "@web/app/(main)/(dashboard)/coe/premiums/components/premiums-report";
import { loadSearchParams } from "@web/app/(main)/(dashboard)/coe/premiums/search-params";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import { MonthSelector } from "@web/components/shared/month-selector";
import { Hairline, OverviewPage } from "@web/components/shared/overview";
import { PageFaq } from "@web/components/shared/page-faq";
import { PageHead } from "@web/components/shared/page-head";
import { SkeletonCard } from "@web/components/shared/skeleton";
import { StructuredData } from "@web/components/structured-data";
import { SITE_TITLE, SITE_URL } from "@web/config";
import { generateFAQPageSchema } from "@web/lib/metadata";
import { baseOpenGraph, baseTwitter } from "@web/lib/metadata/social";
import { getCoeMonths, getExercisePair } from "@web/queries/coe";
import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";

interface PageProps {
  searchParams: Promise<SearchParams>;
}

const title = "COE Premiums by Category";
const description =
  "COE premiums for each category, Cat A to Cat E: every exercise's closing premium, with the quota and bids behind it.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    ...baseOpenGraph,
    title,
    description,
    url: `${SITE_URL}/coe/premiums`,
  },
  twitter: {
    ...baseTwitter,
    title,
    description,
  },
  alternates: {
    canonical: "/coe/premiums",
  },
  authors: [{ name: SITE_TITLE, url: SITE_URL }],
  creator: SITE_TITLE,
  publisher: SITE_TITLE,
};

export default function COEPremiumsPage({ searchParams }: PageProps) {
  return (
    <OverviewPage className="gap-10 max-md:gap-7">
      <PageHead
        controls={
          <Suspense fallback={<SkeletonCard className="h-10 w-40" />}>
            <PremiumsHeaderMeta />
          </Suspense>
        }
        eyebrow="Certificate of Entitlement"
        sub={
          <Suspense fallback={<Skeleton className="h-5 w-80" />}>
            <ExerciseSub searchParams={searchParams} />
          </Suspense>
        }
        title="COE premiums by category"
      />

      <SectionErrorBoundary title="COE premiums unavailable">
        <Suspense fallback={<SkeletonCard className="h-[900px] w-full" />}>
          <PremiumsReport searchParams={searchParams} />
        </Suspense>
      </SectionErrorBoundary>

      <Hairline />

      <StructuredData
        data={{
          "@context": "https://schema.org",
          ...generateFAQPageSchema([{ items: PREMIUMS_FAQS }]),
        }}
      />
      <PageFaq faqs={PREMIUMS_FAQS} />
    </OverviewPage>
  );
}

async function PremiumsHeaderMeta() {
  const months = (await getCoeMonths()).map(({ month }) => month);

  return <MonthSelector latestMonth={months[0]} months={months} />;
}

/** Names the exercise the page reports, and its source. */
async function ExerciseSub({ searchParams }: PageProps) {
  const { month } = await loadSearchParams(searchParams);
  const { current } = await getExercisePair(month ?? undefined);

  return current ? (
    <>
      Results of the{" "}
      <span className="font-semibold text-foreground">
        {formatExercise(current)}
      </span>{" "}
      · Source: LTA via DataMall
    </>
  ) : null;
}
