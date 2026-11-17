import { slugify } from "@motormetrics/utils/slugify";
import { ComparisonLinks } from "@web/app/(main)/(dashboard)/cars/makes/compare/[pair]/components/comparison-links";
import { COMPARE_PAIRS } from "@web/app/(main)/(dashboard)/cars/makes/compare/[pair]/components/pairs";
import { ConcentrationCard } from "@web/app/(main)/(dashboard)/cars/makes/components/concentration-card";
import { FastestGrowing } from "@web/app/(main)/(dashboard)/cars/makes/components/fastest-growing";
import { MakesAsOf } from "@web/app/(main)/(dashboard)/cars/makes/components/makes-head";
import {
  MakesControls,
  MakesTableCard,
} from "@web/app/(main)/(dashboard)/cars/makes/components/makes-index";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import { OverviewPage } from "@web/components/shared/overview";
import { PageToolbar } from "@web/components/shared/page-toolbar";
import { SharePill } from "@web/components/shared/share-pill";
import { StructuredData } from "@web/components/structured-data";
import { SITE_TITLE, SITE_URL } from "@web/config";
import { generateItemListSchema } from "@web/lib/metadata";
import {
  baseOpenGraph,
  baseTwitter,
  makesCardImages,
} from "@web/lib/metadata/social";
import { getDistinctMakes } from "@web/queries/cars/filter-options";
import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";
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

/** Every make on record, including ones no longer sold, as an ItemList. */
async function MakesItemList() {
  const makes = await getDistinctMakes();

  return (
    <StructuredData
      data={{
        "@context": "https://schema.org",
        ...generateItemListSchema(
          "Car Makes in Singapore",
          makes.map(({ make }) => ({
            name: make,
            url: `${SITE_URL}/cars/makes/${slugify(make)}`,
          })),
        ),
      }}
    />
  );
}

export default function CarMakesPage({ searchParams }: PageProps) {
  return (
    <>
      <StructuredData data={structuredData} />
      <MakesItemList />

      {/* The dashboard template: toolbar, KPI tiles, a chart pair and one
          table. The KPIs read the year to date from cached data, so they are
          part of the static shell; the switches, the cards and the table
          follow the search params and wait behind their own boundaries. */}
      <OverviewPage className="gap-8 max-md:gap-6">
        <PageToolbar
          actions={
            <>
              <MakesControls searchParams={searchParams} />
              <SharePill title="Makes" />
            </>
          }
          asOf={<MakesAsOf />}
          title="Makes"
        />

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <SectionErrorBoundary title="Market concentration unavailable">
            <ConcentrationCard searchParams={searchParams} />
          </SectionErrorBoundary>
          <SectionErrorBoundary title="Movers unavailable">
            <FastestGrowing searchParams={searchParams} />
          </SectionErrorBoundary>
        </div>

        <SectionErrorBoundary title="Makes table unavailable">
          <MakesTableCard searchParams={searchParams} />
        </SectionErrorBoundary>

        <ComparisonLinks
          eyebrow="Compare"
          link={{ href: "/cars/makes/compare", label: "Compare any two makes" }}
          pairs={COMPARE_PAIRS}
          title="Popular comparisons"
        />
      </OverviewPage>
    </>
  );
}
