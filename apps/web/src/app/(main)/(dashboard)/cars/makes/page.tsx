import { Skeleton } from "@heroui/react";
import { ComparisonLinks } from "@web/app/(main)/(dashboard)/cars/makes/compare/[pair]/components/comparison-links";
import { COMPARE_PAIRS } from "@web/app/(main)/(dashboard)/cars/makes/compare/[pair]/components/pairs";
import { buildMakesFaqs } from "@web/app/(main)/(dashboard)/cars/makes/components/faq-data";
import {
  loadMakeRows,
  periodLabel,
  summariseLeaders,
} from "@web/app/(main)/(dashboard)/cars/makes/components/make-rows";
import { MakesContentSection } from "@web/app/(main)/(dashboard)/cars/makes/components/makes-content-section";
import { RangeTabs } from "@web/app/(main)/(dashboard)/cars/makes/components/range-tabs";
import { loadSearchParams } from "@web/app/(main)/(dashboard)/cars/makes/search-params";
import { Hairline, OverviewPage } from "@web/components/shared/overview";
import { PageFaq } from "@web/components/shared/page-faq";
import { PageHead } from "@web/components/shared/page-head";
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

/** "January to August 2026 · Source: LTA via DataMall", under the title. */
async function MakesPeriodSub({ searchParams }: PageProps) {
  const [{ range }, latestMonth] = await Promise.all([
    loadSearchParams(searchParams),
    getCarsLatestMonth(),
  ]);

  return (
    <>
      {latestMonth ? (
        <>
          <span className="font-semibold text-foreground">
            {periodLabel(latestMonth, range)}
          </span>{" "}
          ·{" "}
        </>
      ) : null}
      Source: LTA via DataMall
    </>
  );
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
      <PageHead
        controls={
          <Suspense fallback={<Skeleton className="h-8 w-72" />}>
            <RangeTabs />
          </Suspense>
        }
        eyebrow="Cars · Makes"
        sub={
          <Suspense fallback={<Skeleton className="h-5 w-64" />}>
            <MakesPeriodSub searchParams={searchParams} />
          </Suspense>
        }
        title="Makes"
      />
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
