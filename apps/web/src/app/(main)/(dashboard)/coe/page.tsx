import { formatCurrency } from "@motormetrics/utils/format-currency";
import { AllCategories } from "@web/app/(main)/(dashboard)/coe/components/all-categories";
import {
  CategoryFilter,
  CategoryFilterView,
  RangeFilter,
  RangeFilterView,
} from "@web/app/(main)/(dashboard)/coe/components/coe-controls";
import {
  formatExercise,
  groupByExercise,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import {
  CoeExerciseName,
  CoeRenewalKeys,
  CoeSource,
  CoeYearAverageKeys,
} from "@web/app/(main)/(dashboard)/coe/components/coe-head";
import { COE_FAQS } from "@web/app/(main)/(dashboard)/coe/components/faq-data";
import { PqpCeiling } from "@web/app/(main)/(dashboard)/coe/components/pqp-ceiling";
import {
  CategoryCards,
  ClosingPremiums,
  PremiumsByExercise,
} from "@web/app/(main)/(dashboard)/coe/components/premiums-by-exercise";
import { coeOverviewSearchParams } from "@web/app/(main)/(dashboard)/coe/components/search-params";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import {
  Hairline,
  OverviewPage,
  SectionHead,
} from "@web/components/shared/overview";
import { PageFaq } from "@web/components/shared/page-faq";
import { FilterGroup, FiltersPanel } from "@web/components/shared/page-filters";
import { PageHead } from "@web/components/shared/page-head";
import { PageBody, RelatedLinks } from "@web/components/shared/page-layout";
import { StructuredData } from "@web/components/structured-data";
import { SITE_URL } from "@web/config";
import { generateFAQPageSchema } from "@web/lib/metadata";
import { baseOpenGraph, baseTwitter } from "@web/lib/metadata/social";
import { getCoeResults } from "@web/queries/coe";
import type { Metadata } from "next";
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

export default function Page() {
  // Each control reads the URL on the client, so its fallback draws the
  // default selection and the filters stay in the static shell.
  const filters = (
    <>
      <FilterGroup label="Category">
        <Suspense
          fallback={
            <CategoryFilterView
              selected={coeOverviewSearchParams.category.defaultValue}
            />
          }
        >
          <CategoryFilter />
        </Suspense>
      </FilterGroup>
      <FilterGroup label="Exercises shown">
        <Suspense
          fallback={
            <RangeFilterView
              selected={coeOverviewSearchParams.range.defaultValue}
            />
          }
        >
          <RangeFilter />
        </Suspense>
      </FilterGroup>
    </>
  );

  return (
    <OverviewPage className="gap-8 max-md:gap-6">
      {/* The head carries the title, the exercise and Share. The category and
          the number of exercises narrow the page, so they sit in the right
          sidebar, with a "Filters" button in the head where the sidebar does
          not fit. Every figure is from cached data, so the page is in the
          static shell; only the selection in the URL waits, inside each
          view's own boundary. */}
      <PageHead
        filters={filters}
        sub={<CoeExerciseName />}
        title="COE bidding results"
      />

      <PageBody
        rail={
          <>
            <FiltersPanel>{filters}</FiltersPanel>
            <SectionErrorBoundary title="PQP rates unavailable">
              <CoeRenewalKeys />
            </SectionErrorBoundary>
            <SectionErrorBoundary title="Average premium unavailable">
              <CoeYearAverageKeys />
            </SectionErrorBoundary>
          </>
        }
      >
        <section className="flex flex-col gap-4" id="coe-premiums">
          <SectionHead caption={<CoeExerciseName />} title="COE premiums" />
          <SectionErrorBoundary title="COE premiums unavailable">
            <CategoryCards />
          </SectionErrorBoundary>
          <CoeSource />
        </section>

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
          aria-label="Closing premiums"
          className="scroll-mt-4"
          id="coe-closing"
        >
          <SectionErrorBoundary title="Closing premiums unavailable">
            <ClosingPremiums />
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

        <section
          aria-label="All categories"
          className="scroll-mt-4"
          id="coe-all"
        >
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
      </PageBody>

      <RelatedLinks
        links={[
          { href: "/coe/results", label: "Premium history" },
          { href: "/coe/pqp", label: "PQP rates" },
          { href: "/learn/coe", label: "Guide: how COE bidding works" },
        ]}
      />
    </OverviewPage>
  );
}
