import { Skeleton } from "@heroui/react";
import { CategoryMergerCallout } from "@web/app/(main)/(dashboard)/components/category-merger-callout";
import { HOME_FAQS } from "@web/app/(main)/(dashboard)/components/faq-data";
import { MarketLead } from "@web/app/(main)/(dashboard)/components/market-lead";
import { MarketTiles } from "@web/app/(main)/(dashboard)/components/market-tiles";
import { MarketTrend } from "@web/app/(main)/(dashboard)/components/market-trend";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import { Hairline, OverviewPage } from "@web/components/shared/overview";
import { PageFaq } from "@web/components/shared/page-faq";
import { PageHead } from "@web/components/shared/page-head";
import { StructuredData } from "@web/components/structured-data";
import { LOGO_URL, SITE_TITLE, SITE_URL, SUPPORT_EMAIL } from "@web/config";
import { BRAND_SOCIAL_PROFILE_URLS } from "@web/config/socials";
import { generateFAQPageSchema } from "@web/lib/metadata";
import { baseOpenGraph, baseTwitter } from "@web/lib/metadata/social";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: { absolute: `${SITE_TITLE} (formerly SG Cars Trends)` },
  description:
    "Track Singapore car registration trends, COE bidding results, and automotive market insights. Latest data from Land Transport Authority (LTA) with interactive charts, EV and hybrid statistics, and AI-powered analysis.",
  keywords: [
    "Singapore car registration",
    "COE prices",
    "car trends Singapore",
    "vehicle statistics",
    "electric vehicles Singapore",
    "hybrid cars",
    "LTA data",
  ],
  openGraph: {
    ...baseOpenGraph,
    title: `${SITE_TITLE} (formerly SG Cars Trends)`,
    description:
      "Track Singapore car registration trends and COE bidding results with interactive charts and latest market insights.",
    url: SITE_URL,
  },
  twitter: {
    ...baseTwitter,
    title: `${SITE_TITLE} (formerly SG Cars Trends)`,
    description:
      "Track Singapore car registration trends and COE bidding results with interactive charts.",
  },
  alternates: {
    canonical: "/",
  },
};

const webSiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_TITLE,
  url: SITE_URL,
  description:
    "Analysis of new car registration trends in Singapore. Insights on popular makes, fuel and vehicle types, COE bidding results, and market data.",
  publisher: {
    "@type": "Organization",
    name: SITE_TITLE,
    url: SITE_URL,
  },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/cars/makes?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
} as const;

function OrganizationStructuredData() {
  const sameAs = [...BRAND_SOCIAL_PROFILE_URLS];

  return (
    <StructuredData
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: SITE_TITLE,
        url: SITE_URL,
        logo: LOGO_URL,
        description:
          "A platform for exploring Singapore car registration statistics, COE bidding results, and market data.",
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer support",
          email: SUPPORT_EMAIL,
          url: `${SITE_URL}/contact`,
        },
        address: { "@type": "PostalAddress", addressCountry: "SG" },
        ...(sameAs.length > 0 ? { sameAs } : {}),
      }}
    />
  );
}

/** One placeholder per market tile, named so each has a stable key. */
const TILE_SKELETONS = [
  "make",
  "fuel",
  "pqp",
  "deregistrations",
  "ev-make",
  "charging",
];

export default function HomePage() {
  return (
    <>
      <StructuredData data={webSiteSchema} />
      <OrganizationStructuredData />

      <OverviewPage className="gap-10 max-md:gap-7">
        <CategoryMergerCallout />

        <div className="flex flex-col gap-7">
          {/* The lead band names each half's period, since COE and
              registrations run on different clocks; the sub only sources it. */}
          <PageHead
            eyebrow="Singapore car market"
            sub="Registrations and COE results · Source: LTA via DataMall"
            title="Market overview"
          />

          <SectionErrorBoundary title="Headline figures unavailable">
            <Suspense
              fallback={<Skeleton className="h-80 w-full rounded-4xl" />}
            >
              <MarketLead />
            </Suspense>
          </SectionErrorBoundary>
        </div>

        <SectionErrorBoundary title="Market figures unavailable">
          <Suspense
            fallback={
              <div className="flex flex-col gap-4">
                <Skeleton className="h-9 w-56" />
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4">
                  {TILE_SKELETONS.map((tile) => (
                    <Skeleton className="h-36 rounded-3xl" key={tile} />
                  ))}
                </div>
              </div>
            }
          >
            <MarketTiles />
          </Suspense>
        </SectionErrorBoundary>

        <Hairline />

        <SectionErrorBoundary title="Trends unavailable">
          <Suspense fallback={<Skeleton className="h-96 w-full rounded-4xl" />}>
            <MarketTrend />
          </Suspense>
        </SectionErrorBoundary>

        <Hairline />

        <StructuredData
          data={{
            "@context": "https://schema.org",
            ...generateFAQPageSchema([{ items: HOME_FAQS }]),
          }}
        />
        <PageFaq faqs={HOME_FAQS} />
      </OverviewPage>
    </>
  );
}
