import { Skeleton } from "@heroui/react";
import { ComparisonLinks } from "@web/app/(main)/(dashboard)/cars/makes/compare/[pair]/components/comparison-links";
import { COMPARE_PAIRS } from "@web/app/(main)/(dashboard)/cars/makes/compare/[pair]/components/pairs";
import { buildMakesFaqs } from "@web/app/(main)/(dashboard)/cars/makes/components/faq-data";
import {
  loadMakeRows,
  summariseLeaders,
} from "@web/app/(main)/(dashboard)/cars/makes/components/make-rows";
import {
  MakesContentSection,
  MakesSecondarySection,
} from "@web/app/(main)/(dashboard)/cars/makes/components/makes-content-section";
import {
  FuelTypeRadios,
  PeriodSwitch,
} from "@web/app/(main)/(dashboard)/cars/makes/components/makes-filters";
import {
  MakesKeyNumbers,
  MakesPeriod,
} from "@web/app/(main)/(dashboard)/cars/makes/components/makes-head";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import { Hairline, OverviewPage } from "@web/components/shared/overview";
import { PageFaq } from "@web/components/shared/page-faq";
import { FilterGroup, FiltersPanel } from "@web/components/shared/page-filters";
import { PageHead } from "@web/components/shared/page-head";
import {
  PageBody,
  RelatedLinks,
  ScopeControl,
} from "@web/components/shared/page-layout";
import { StructuredData } from "@web/components/structured-data";
import { SITE_TITLE, SITE_URL } from "@web/config";
import { generateFAQPageSchema } from "@web/lib/metadata";
import {
  baseOpenGraph,
  baseTwitter,
  makesCardImages,
} from "@web/lib/metadata/social";
import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import type { WebPage, WithContext } from "schema-dts";

const title = "Car Makes in Singapore";
const description =
  "Comprehensive overview of car makes in Singapore. Explore popular brands, discover all available manufacturers, and view registration trends and market statistics.";

const structuredData: WithContext<WebPage> = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Makes",
  description,
  url: `${SITE_URL}/cars/makes`,
  publisher: {
    "@type": "Organization",
    name: SITE_TITLE,
    url: SITE_URL,
  },
};

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    ...baseOpenGraph,
    images: makesCardImages,
    title,
    description,
    url: `${SITE_URL}/cars/makes`,
  },
  twitter: {
    ...baseTwitter,
    title,
    description,
  },
  alternates: {
    canonical: "/cars/makes",
  },
};

/**
 * The questions and their FAQPage schema. Quotes the year-to-date leaders
 * whatever range is selected, so it reads no search params.
 */
async function MakesFaq() {
  const { latestMonth, rows } = await loadMakeRows("ytd", null);
  const faqs = buildMakesFaqs(summariseLeaders(rows, latestMonth, "ytd"));

  return (
    <>
      <StructuredData
        data={{
          "@context": "https://schema.org",
          ...generateFAQPageSchema([{ items: faqs }]),
        }}
      />
      <PageFaq faqs={faqs} />
    </>
  );
}

export default function CarMakesPage({ searchParams }: PageProps) {
  const filters = (
    <FilterGroup label="Fuel type">
      <Suspense fallback={<Skeleton className="h-40 w-full" />}>
        <FuelTypeRadios />
      </Suspense>
    </FilterGroup>
  );

  return (
    <OverviewPage className="gap-8 max-md:gap-6">
      <StructuredData data={structuredData} />

      {/* The head carries the title, the period and Share. The period sets
          what the whole page reports on, so it sits in the head; the fuel
          type narrows the page, so it sits in the right sidebar, with a
          "Filters" button in the head where the sidebar does not fit. */}
      <PageHead
        controls={
          <ScopeControl label="Period">
            <Suspense fallback={<Skeleton className="h-10 w-80 max-w-full" />}>
              <PeriodSwitch />
            </Suspense>
          </ScopeControl>
        }
        filters={filters}
        sub={
          <Suspense fallback={<Skeleton className="h-5 w-48" />}>
            <MakesPeriod searchParams={searchParams} />
          </Suspense>
        }
        title="Makes"
      />

      <PageBody
        rail={
          <>
            <FiltersPanel>{filters}</FiltersPanel>
            <SectionErrorBoundary title="Key numbers unavailable">
              <MakesKeyNumbers />
            </SectionErrorBoundary>
          </>
        }
      >
        <MakesContentSection searchParams={searchParams} />
      </PageBody>

      {/* Sections the artboard does not draw sit below the two columns, so
          that on a narrow screen the key figures come before them. */}
      <PageBody>
        <Hairline />

        <MakesSecondarySection searchParams={searchParams} />

        <Hairline />

        <ComparisonLinks
          eyebrow="Compare"
          link={{ href: "/cars/makes/compare", label: "Compare any two makes" }}
          pairs={COMPARE_PAIRS}
          title="Popular comparisons"
        />

        <Hairline />

        <MakesFaq />
      </PageBody>

      <RelatedLinks
        links={[
          { href: "/cars", label: "New registrations" },
          { href: "/cars/electric-vehicles", label: "Electric vehicles" },
          { href: "/cars/annual", label: "Vehicle population" },
        ]}
      />
    </OverviewPage>
  );
}
