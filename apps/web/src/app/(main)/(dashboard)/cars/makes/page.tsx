import { Skeleton, Typography } from "@heroui/react";
import { ComparisonLinks } from "@web/app/(main)/(dashboard)/cars/makes/compare/[pair]/components/comparison-links";
import { COMPARE_PAIRS } from "@web/app/(main)/(dashboard)/cars/makes/compare/[pair]/components/pairs";
import { buildMakesFaqs } from "@web/app/(main)/(dashboard)/cars/makes/components/faq-data";
import {
  loadMakeRows,
  periodLabel,
  summariseLeaders,
} from "@web/app/(main)/(dashboard)/cars/makes/components/make-rows";
import {
  MakesAnswer,
  MakesKeyNumbers,
} from "@web/app/(main)/(dashboard)/cars/makes/components/makes-answer";
import { MakesContentSection } from "@web/app/(main)/(dashboard)/cars/makes/components/makes-content-section";
import { RangeTabs } from "@web/app/(main)/(dashboard)/cars/makes/components/range-tabs";
import { loadSearchParams } from "@web/app/(main)/(dashboard)/cars/makes/search-params";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import { Hairline, OverviewPage } from "@web/components/shared/overview";
import { PageFaq } from "@web/components/shared/page-faq";
import { SharePill } from "@web/components/shared/share-pill";
import { StructuredData } from "@web/components/structured-data";
import { SITE_TITLE, SITE_URL } from "@web/config";
import { generateFAQPageSchema } from "@web/lib/metadata";
import { baseOpenGraph, baseTwitter } from "@web/lib/metadata/social";
import { getCarsLatestMonth } from "@web/queries/cars";
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

/** " · January to August 2026", the end of the eyebrow above the title. */
async function MakesPeriod({ searchParams }: PageProps) {
  const [{ range }, latestMonth] = await Promise.all([
    loadSearchParams(searchParams),
    getCarsLatestMonth(),
  ]);

  return latestMonth ? ` · ${periodLabel(latestMonth, range)}` : null;
}

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
  return (
    <OverviewPage className="gap-10 max-md:gap-7">
      {/* Direction D's head: one column that reads eyebrow, title, answer,
          source, then the switches, with the key numbers beside it once the
          page is wide and under it before then. */}
      <div className="@container">
        <div className="grid @7xl:grid-cols-3 @7xl:gap-16 gap-10">
          <div className="@7xl:col-span-2 flex min-w-0 flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Typography.Paragraph
                className="uppercase"
                color="muted"
                size="xs"
                weight="semibold"
              >
                Cars · Makes
                <Suspense fallback={null}>
                  <MakesPeriod searchParams={searchParams} />
                </Suspense>
              </Typography.Paragraph>
              <Typography.Heading level={1}>Makes</Typography.Heading>
            </div>
            <SectionErrorBoundary title="Leading make unavailable">
              <Suspense fallback={<Skeleton className="h-48 w-full" />}>
                <MakesAnswer searchParams={searchParams} />
              </Suspense>
            </SectionErrorBoundary>
            <Typography.Paragraph color="muted" size="sm">
              Source: LTA via DataMall.
            </Typography.Paragraph>
            <div className="flex min-w-0 max-w-full flex-wrap items-center gap-3">
              <Suspense fallback={<Skeleton className="h-8 w-72" />}>
                <RangeTabs searchParams={searchParams} />
              </Suspense>
              <SharePill title="Makes" />
            </div>
          </div>
          <SectionErrorBoundary title="Key numbers unavailable">
            <Suspense fallback={<Skeleton className="h-64 w-full" />}>
              <MakesKeyNumbers searchParams={searchParams} />
            </Suspense>
          </SectionErrorBoundary>
        </div>
      </div>
      <StructuredData data={structuredData} />
      <MakesContentSection searchParams={searchParams} />

      <Hairline />

      <Suspense fallback={null}>
        <ComparisonLinks
          eyebrow="Compare"
          link={{ href: "/cars/makes/compare", label: "Compare any two makes" }}
          pairs={COMPARE_PAIRS}
          title="Popular comparisons"
        />
      </Suspense>

      <Hairline />

      <Suspense fallback={null}>
        <MakesFaq />
      </Suspense>
    </OverviewPage>
  );
}
