import { Typography } from "@heroui/react";
import {
  loadMakeRows,
  summariseLeaders,
} from "@web/app/(main)/(dashboard)/cars/makes/components/make-rows";
import {
  FuelMixCard,
  TopMakesCard,
} from "@web/app/(main)/(dashboard)/components/car-figures";
import { CoePremiumsCard } from "@web/app/(main)/(dashboard)/components/coe-figures";
import { buildHomeFaqs } from "@web/app/(main)/(dashboard)/components/faq-data";
import {
  MarketAsOf,
  MarketKpis,
} from "@web/app/(main)/(dashboard)/components/market-head";
import { MarketLinks } from "@web/app/(main)/(dashboard)/components/market-links";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import { OverviewPage } from "@web/components/shared/overview";
import { PageFaq } from "@web/components/shared/page-faq";
import { SharePill } from "@web/components/shared/share-pill";
import { StructuredData } from "@web/components/structured-data";
import { LOGO_URL, SITE_TITLE, SITE_URL, SUPPORT_EMAIL } from "@web/config";
import { BRAND_SOCIAL_PROFILE_URLS } from "@web/config/socials";
import { generateFAQPageSchema } from "@web/lib/metadata";
import { baseOpenGraph, baseTwitter } from "@web/lib/metadata/social";
import type { Metadata } from "next";

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

/** The questions and their FAQPage schema, with the leading makes quoted. */
async function HomeFaq() {
  const { latestMonth, rows } = await loadMakeRows("ytd", null);
  const faqs = buildHomeFaqs(summariseLeaders(rows, latestMonth, "ytd"));

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

export default function HomePage() {
  return (
    <>
      <StructuredData data={webSiteSchema} />
      <OrganizationStructuredData />

      {/* The dashboard template's shape: a toolbar, four KPI tiles, a chart
          pair and one table. Everything reads cached data only, so it is all
          part of the static shell and no section needs a Suspense boundary. */}
      <OverviewPage className="gap-8 max-md:gap-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-2">
            <Typography.Heading level={1}>Market overview</Typography.Heading>
            <Typography.Paragraph color="muted" size="sm">
              <MarketAsOf />
            </Typography.Paragraph>
          </div>
          <SharePill title="Market overview" />
        </div>

        <SectionErrorBoundary title="Key numbers unavailable">
          <MarketKpis />
        </SectionErrorBoundary>

        {/* COE leads the car figures, as the navigation does. */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <SectionErrorBoundary title="COE premiums unavailable">
            <CoePremiumsCard />
          </SectionErrorBoundary>
          <SectionErrorBoundary title="Fuel types unavailable">
            <FuelMixCard />
          </SectionErrorBoundary>
        </div>

        <SectionErrorBoundary title="Top makes unavailable">
          <TopMakesCard />
        </SectionErrorBoundary>

        <MarketLinks />

        <HomeFaq />
      </OverviewPage>
    </>
  );
}
