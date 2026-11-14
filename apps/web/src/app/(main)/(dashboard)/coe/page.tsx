import { Typography } from "@heroui/react";
import { formatCurrency } from "@motormetrics/utils/format-currency";
import { AllCategories } from "@web/app/(main)/(dashboard)/coe/components/all-categories";
import {
  formatExercise,
  groupByExercise,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import {
  CoeExerciseName,
  CoeHero,
  CoeKeyNumbers,
} from "@web/app/(main)/(dashboard)/coe/components/coe-head";
import { COE_FAQS } from "@web/app/(main)/(dashboard)/coe/components/faq-data";
import { PqpCeiling } from "@web/app/(main)/(dashboard)/coe/components/pqp-ceiling";
import { PremiumsByExercise } from "@web/app/(main)/(dashboard)/coe/components/premiums-by-exercise";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import { Hairline, OverviewPage } from "@web/components/shared/overview";
import { PageFaq } from "@web/components/shared/page-faq";
import { SharePill } from "@web/components/shared/share-pill";
import { StructuredData } from "@web/components/structured-data";
import { SITE_URL } from "@web/config";
import { generateFAQPageSchema } from "@web/lib/metadata";
import { baseOpenGraph, baseTwitter } from "@web/lib/metadata/social";
import { getCoeResults } from "@web/queries/coe";
import type { Metadata } from "next";

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

export default function Page() {
  return (
    <OverviewPage className="gap-10 max-md:gap-7">
      {/* Direction D's head: eyebrow, title, range hero, lead and source,
          with the key numbers beside it once the page is wide and under it
          before then. Every figure is from cached data, so the head is in
          the static shell; only the category in the URL waits, inside each
          view's own boundary. */}
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
                <CoeExerciseName />
              </Typography.Paragraph>
              <Typography.Heading level={1}>
                Latest COE results
              </Typography.Heading>
            </div>
            <SectionErrorBoundary title="COE premium unavailable">
              <CoeHero />
            </SectionErrorBoundary>
            <div>
              <SharePill title="Latest COE results" />
            </div>
          </div>
          <SectionErrorBoundary title="Key numbers unavailable">
            <CoeKeyNumbers />
          </SectionErrorBoundary>
        </div>
      </div>

      <Hairline />

      <section
        aria-label="Bidding history"
        className="scroll-mt-4"
        id="coe-history"
      >
        <SectionErrorBoundary title="Premium history unavailable">
          <PremiumsByExercise />
        </SectionErrorBoundary>
      </section>

      <Hairline />

      <section
        aria-label="PQP renewal rates"
        className="scroll-mt-4"
        id="coe-pqp"
      >
        <SectionErrorBoundary title="PQP rates unavailable">
          <PqpCeiling />
        </SectionErrorBoundary>
      </section>

      <Hairline />

      <section aria-label="All categories" className="scroll-mt-4" id="coe-all">
        <SectionErrorBoundary title="Category breakdown unavailable">
          <AllCategories />
        </SectionErrorBoundary>
      </section>

      <Hairline />

      <StructuredData
        data={{
          "@context": "https://schema.org",
          ...generateFAQPageSchema([{ items: COE_FAQS }]),
        }}
      />
      <PageFaq faqs={COE_FAQS} />
    </OverviewPage>
  );
}
