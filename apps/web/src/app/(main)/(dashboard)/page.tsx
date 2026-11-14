import { Typography } from "@heroui/react";
import {
  loadMakeRows,
  summariseLeaders,
} from "@web/app/(main)/(dashboard)/cars/makes/components/make-rows";
import {
  FuelMixFigure,
  RoadFigure,
  TopMakesFigure,
} from "@web/app/(main)/(dashboard)/components/car-figures";
import {
  CoePremiumsFigure,
  PqpFigure,
} from "@web/app/(main)/(dashboard)/components/coe-figures";
import { buildHomeFaqs } from "@web/app/(main)/(dashboard)/components/faq-data";
import {
  MarketHero,
  MarketKeyNumbers,
} from "@web/app/(main)/(dashboard)/components/market-head";
import { MarketLinks } from "@web/app/(main)/(dashboard)/components/market-links";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import { Hairline, OverviewPage } from "@web/components/shared/overview";
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

      <OverviewPage className="gap-10 max-md:gap-7">
        {/* Direction D's head: eyebrow, title, the Category A range hero,
            lead and source, with the key numbers beside it once the page is
            wide and under it before then. Everything on this page reads
            cached data only, so it is all part of the static shell and no
            section needs a Suspense boundary. */}
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
                  Singapore car market
                </Typography.Paragraph>
                <Typography.Heading level={1}>
                  Market overview
                </Typography.Heading>
              </div>
              <SectionErrorBoundary title="Headline figures unavailable">
                <MarketHero />
              </SectionErrorBoundary>
              <div>
                <SharePill title="Market overview" />
              </div>
            </div>
            <SectionErrorBoundary title="Key numbers unavailable">
              <MarketKeyNumbers />
            </SectionErrorBoundary>
          </div>
        </div>

        {/* COE and PQP lead the car figures, as the navigation does. */}
        <SectionErrorBoundary title="COE premiums unavailable">
          <CoePremiumsFigure />
        </SectionErrorBoundary>

        <Hairline />

        <SectionErrorBoundary title="PQP rates unavailable">
          <PqpFigure />
        </SectionErrorBoundary>

        <Hairline />

        <SectionErrorBoundary title="Fuel types unavailable">
          <FuelMixFigure />
        </SectionErrorBoundary>

        <Hairline />

        <SectionErrorBoundary title="Top makes unavailable">
          <TopMakesFigure />
        </SectionErrorBoundary>

        <Hairline />

        <SectionErrorBoundary title="Vehicle figures unavailable">
          <RoadFigure />
        </SectionErrorBoundary>

        <MarketLinks />

        <HomeFaq />
      </OverviewPage>
    </>
  );
}
